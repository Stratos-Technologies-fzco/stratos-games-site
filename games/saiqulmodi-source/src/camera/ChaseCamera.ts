// Chase camera: sits behind and above the jet, follows its turns with a smooth lag, banks with it,
// and widens the field of view a little on afterburner.
import { PerspectiveCamera, Quaternion, Vector3 } from 'three';

const BACK = 34; // m behind the jet
const ABOVE = 8; // m above it
const LOOK_AHEAD = 70; // m in front of the nose
const LAG = 5; // 1/s, how fast the camera catches up with the jet's turns
const UP_LAG = 3.5; // 1/s, how fast it follows the bank
const FOV = 65;
const FOV_AB = 74;

const _desired = new Vector3();
const _look = new Vector3();
const _nose = new Vector3();
const _up = new Vector3();

export class ChaseCamera {
  readonly camera: PerspectiveCamera;
  private offset = new Vector3(0, ABOVE, BACK);
  private up = new Vector3(0, 1, 0);
  private fov = FOV;

  constructor(aspect: number) {
    this.camera = new PerspectiveCamera(FOV, aspect, 1, 120000);
  }

  snap(pos: Vector3, quat: Quaternion): void {
    _nose.set(0, 0, -1).applyQuaternion(quat);
    _up.set(0, 1, 0).applyQuaternion(quat);
    this.offset.copy(_nose).multiplyScalar(-BACK).addScaledVector(_up, ABOVE);
    this.up.copy(_up);
    this.place(pos, _nose);
  }

  update(dt: number, pos: Vector3, quat: Quaternion, afterburner: boolean): void {
    _nose.set(0, 0, -1).applyQuaternion(quat);
    _up.set(0, 1, 0).applyQuaternion(quat);
    _desired.copy(_nose).multiplyScalar(-BACK).addScaledVector(_up, ABOVE);
    const k = 1 - Math.exp(-LAG * dt);
    this.offset.lerp(_desired, k);
    // keep the distance steady while the direction lags
    this.offset.setLength(Math.hypot(BACK, ABOVE));
    this.up.lerp(_up, 1 - Math.exp(-UP_LAG * dt)).normalize();

    const target = afterburner ? FOV_AB : FOV;
    this.fov += (target - this.fov) * (1 - Math.exp(-2.5 * dt));
    if (Math.abs(this.camera.fov - this.fov) > 0.01) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
    this.place(pos, _nose);
  }

  private place(pos: Vector3, nose: Vector3): void {
    this.camera.position.copy(pos).add(this.offset);
    _look.copy(pos).addScaledVector(nose, LOOK_AHEAD);
    this.camera.up.copy(this.up);
    this.camera.lookAt(_look);
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
