"""Hindi and Bangla labels for the Magic Box and the Subject Magic Console (world.py).

The game's font has no Devanagari or Bengali letters, so these few labels are drawn
here with Noto Sans (the same fonts build_hub.py uses) into labels/<lang>_<key>.png:
white letters with a dark rim, readable on any crystal colour.

Run:  python tools/make_labels.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_hub as bh  # noqa: E402

import pygame  # noqa: E402

OUT = os.path.join(bh.ROOT, "labels")
HI_DIGITS = "०१२३४५६७८९"
BN_DIGITS = "০১২৩৪৫৬৭৮৯"
LABELS = {
    "maths": ("गणित", "গণিত"),
    "evs": ("पर्यावरण अध्ययन", "পরিবেশ পরিচিতি"),
    "science": ("विज्ञान", "বিজ্ঞান"),
    "social": ("सामाजिक विज्ञान", "সমাজবিজ্ঞান"),
    "english": ("अंग्रेज़ी", "ইংরেজি"),
    "hindi": ("हिंदी वर्णमाला", "হিন্দি বর্ণমালা"),
    "bangla": ("बांग्ला वर्णमाला", "বাংলা বর্ণমালা"),
    "india": ("भारत का नक्शा", "ভারতের মানচিত্র"),
}
for n in range(1, 8):
  LABELS[f"class{n}"] = (f"कक्षा {HI_DIGITS[n]}", f"শ্রেণি {BN_DIGITS[n]}")
# (the Bengali font has no : , + = signs, so the Bangla lines use words)
# the "Getting ready for school" story before Maths Play (schoolday.py): one line per picture
SCHOOL = {
    "school_wake": ("सुप्रभात! सात बज गए।", "সুপ্রভাত! সাতটা বাজে।"),
    "school_pack": ("बस्ता लगाओ: 3 किताबें, 2 पेंसिल", "ব্যাগ গোছাও! ৩টি বই আর ২টি পেনসিল"),
    "school_ready": ("तैयार! 3 + 2 = 5 चीज़ें", "তৈরি! ৩ আর ২ মিলে ৫টি জিনিস"),
    "school_walk": ("माँ के साथ स्कूल चलें!", "মায়ের সঙ্গে স্কুলে চলো!"),
    "school_road": ("ज़ेबरा क्रॉसिंग: दाएँ, बाएँ, फिर दाएँ देखो", "জেব্রা ক্রসিং! ডানে বাঁয়ে আবার ডানে দেখো"),
    "school_class": ("कक्षा में स्वागत है! चलो गिनें!", "ক্লাসে স্বাগতম! চলো গুনি!"),
}


def render(font, text):
  ink = font.render(text, True, (255, 255, 255))
  rim = font.render(text, True, (30, 30, 60))
  pad = 4
  out = pygame.Surface((ink.get_width() + 2 * pad, ink.get_height() + 2 * pad), pygame.SRCALPHA)
  for dx in range(-3, 4):
    for dy in range(-3, 4):
      if dx * dx + dy * dy <= 10:
        out.blit(rim, (pad + dx, pad + dy))
  out.blit(ink, (pad, pad))
  box = out.get_bounding_rect()
  return out.subsurface(box.inflate(4, 4).clip(out.get_rect())).copy()


def main():
  pygame.init()
  os.makedirs(OUT, exist_ok=True)
  for key, (hi, bn) in LABELS.items():
    for lang, text, font in (("hi", hi, bh.deva_font(56)), ("bn", bn, bh.beng_font(56))):
      path = os.path.join(OUT, f"{lang}_{key}.png")
      pygame.image.save(render(font, text), path)
  # the language tabs (English | हिंदी | বাংলা) always name each language in its own letters
  pygame.image.save(render(bh.deva_font(56), "हिंदी"), os.path.join(OUT, "tab_hi.png"))
  pygame.image.save(render(bh.beng_font(56), "বাংলা"), os.path.join(OUT, "tab_bn.png"))
  for key, (hi, bn) in SCHOOL.items():
    for lang, text, font in (("hi", hi, bh.deva_font(44)), ("bn", bn, bh.beng_font(44))):
      pygame.image.save(render(font, text), os.path.join(OUT, f"{lang}_{key}.png"))
  print(len(LABELS) * 2 + 2 + len(SCHOOL) * 2, "labels in", OUT)


if __name__ == "__main__":
  main()
