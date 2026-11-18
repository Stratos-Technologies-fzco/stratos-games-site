"""pygame for the Android app (used via p4a.local_recipes in buildozer.spec).

python-for-android's own recipe is pygame 2.1.0 (2021), whose ready-made C
code does not compile against the Python it now builds for phones (3.14:
"longintrepr.h not found"). pygame 2.6.1 ships no ready-made C, so it is made
here first with a modern Cython (3.1.x: knows Python 3.14; 3.3 rejects
pygame 2.6.1) from its own small environment (~/dwd-cython, set up by
tools/build_android.sh). Buildozer itself needs the old Cython 0.29, which
would otherwise be picked up and fail.

pygame's Android build list (buildconfig/Setup.Android.SDL2.in) also leaves
the SIMD blitters out of the surface module, but on 64-bit phones pygame
turns on its NEON drawing path by itself and then needs them: without them
the app closed at once ("cannot locate symbol
alphablit_alpha_sse2_argb_surf_alpha"). They are added back to the Setup file.
"""

import os
import subprocess
from os.path import exists, join

from pythonforandroid.recipes.pygame import Pygame2Recipe
from pythonforandroid.toolchain import current_directory

CYTHON_PY = os.environ.get("DWD_CYTHON_PY",
                           join(os.path.expanduser("~"), "dwd-cython", "bin", "python"))
SIMD = "src_c/simd_blitters_sse2.c src_c/simd_blitters_avx2.c "


class Pygame261Recipe(Pygame2Recipe):
  version = "2.6.1"
  url = "https://github.com/pygame/pygame/archive/{version}.tar.gz"

  def prebuild_arch(self, arch):
    super().prebuild_arch(arch)          # writes the "Setup" build list
    with current_directory(self.get_build_dir(arch.arch)):
      with open("Setup", encoding="utf-8") as fh:
        setup = fh.read()
      if "simd_blitters_sse2.c" not in setup:
        setup = setup.replace("surface src_c/surface.c", "surface " + SIMD + "src_c/surface.c", 1)
        assert "simd_blitters_sse2.c" in setup, "pygame Setup: surface line not found"
        with open("Setup", "w", encoding="utf-8") as fh:
          fh.write(setup)
      if not exists(join("src_c", "_sdl2", "audio.c")):
        env = {k: v for k, v in os.environ.items() if k not in ("PYTHONPATH", "PYTHONHOME")}
        subprocess.run([CYTHON_PY, "setup.py", "cython_only"], check=True, env=env)


recipe = Pygame261Recipe()
