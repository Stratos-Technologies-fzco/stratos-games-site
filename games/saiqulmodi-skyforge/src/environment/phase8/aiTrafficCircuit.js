import * as THREE from 'three';

// AI traffic (phase 8): two airliners flying touch-and-go circuits at VOBL, in world coordinates.
// 09L/27R centreline x = 0, threshold 09L at z = +2000, landing towards -Z (east); 09R/27L at southX.
// Left-hand circuit for 09L (downwind to the north, -X), right-hand for 09R (to the south, +X).
// The path is a smooth closed curve: roll -> lift-off -> upwind -> crosswind -> downwind 1,500 ft above
// the field -> base -> 3 degree final -> touchdown. Speed 75 m/s in the air, slower on the runway.
function circuitPoints(cx, side) {
  const s = side; // -1 = north (left of 09L), +1 = south
  return [
    [0, 0, 1500], [0, 0, 300], [0, 60, -1000], [0, 230, -3600],
    [s * 1300, 380, -5300], [s * 2700, 460, -4200], [s * 2900, 460, 1000], [s * 2900, 460, 6500],
    [s * 1800, 430, 9000], [s * 400, 400, 10200], [0, 380, 9300], [0, 200, 5800], [0, 18, 2050], [0, 0, 1750]
  ].map(([x, y, z]) => new THREE.Vector3(cx + x, y, z));
}

export class AITrafficManager {
  // makeModel(): returns { mesh, groundHeight } for one airliner; southX: 09R/27L centreline x
  constructor(scene, makeModel, southX) {
    this.scene = scene;
    this.aircraftList = [];
    const configs = [
      { id: 'AIC-412', cx: 0, side: -1, u: 0.15 },
      { id: 'IGO-805', cx: southX, side: 1, u: 0.62 }
    ];
    for (const cfg of configs) {
      const { mesh, groundHeight } = makeModel();
      const curve = new THREE.CatmullRomCurve3(circuitPoints(cfg.cx, cfg.side), true, 'centripetal');
      const length = curve.getLength();
      this.scene.add(mesh);
      this.aircraftList.push({
        id: cfg.id, mesh, curve, length, groundHeight,
        u: cfg.u, position: new THREE.Vector3(), heading: 0, bank: 0
      });
    }
    this._tan = new THREE.Vector3();
    this._next = new THREE.Vector3();
    this._look = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._roll = new THREE.Quaternion();
    this._fwd = new THREE.Vector3(0, 0, -1);
  }

  update(deltaSec) {
    for (const ac of this.aircraftList) {
      const p = ac.curve.getPointAt(ac.u, ac.position);
      const speed = p.y < 5 ? 45 : 75; // slower on the runway
      ac.u = (ac.u + speed * deltaSec / ac.length) % 1;
      ac.curve.getTangentAt(ac.u, this._tan);
      ac.curve.getTangentAt((ac.u + 0.01) % 1, this._next);

      // Nose along the path; bank from the turn rate (left turn = left wing down)
      const turn = Math.atan2(this._tan.x * this._next.z - this._tan.z * this._next.x, this._tan.x * this._next.x + this._tan.z * this._next.z);
      ac.bank += (Math.max(-0.5, Math.min(0.5, -turn * 9)) - ac.bank) * Math.min(1, deltaSec * 2);
      if (p.y < 5) ac.bank = 0;
      ac.mesh.position.copy(p);
      ac.mesh.position.y = Math.max(p.y, 0) + ac.groundHeight;
      this._look.lookAt(new THREE.Vector3(), this._tan, new THREE.Vector3(0, 1, 0));
      this._q.setFromRotationMatrix(this._look); // -Z of the model along the tangent
      this._roll.setFromAxisAngle(this._fwd, ac.bank);
      ac.mesh.quaternion.copy(this._q).multiply(this._roll);
      ac.heading = (Math.atan2(-this._tan.z, -this._tan.x) * 180 / Math.PI + 360) % 360;
    }
    return this.aircraftList;
  }
}
