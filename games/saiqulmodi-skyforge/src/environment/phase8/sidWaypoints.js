import * as THREE from 'three';

export class WaypointNavigator {
  constructor() {
    // VOBL Departure SIDs (Coordinates in meters relative to VOBL 09L threshold)
    this.routes = {
      OPAMO_1A: [
        { name: "DER09L", pos: new THREE.Vector3(4200, 150, 0),      minAlt: 100 },
        { name: "BL401",  pos: new THREE.Vector3(12000, 750, 2000),   minAlt: 600 },
        { name: "OPAMO",  pos: new THREE.Vector3(26000, 1800, 8000),  minAlt: 1500 },
        { name: "GUNIM",  pos: new THREE.Vector3(45000, 3600, 16000), minAlt: 3200 }
      ],
      ANKOX_1B: [
        { name: "DER09L", pos: new THREE.Vector3(4200, 150, 0),       minAlt: 100 },
        { name: "BL502",  pos: new THREE.Vector3(8000, 800, -6000),   minAlt: 700 },
        { name: "ANKOX",  pos: new THREE.Vector3(14000, 2200, -22000), minAlt: 1800 }
      ]
    };

    this.activeRoute = "OPAMO_1A";
    this.activeWptIndex = 0;
    this.captureRadiusMeters = 500;
  }

  getActiveWaypoint() {
    const route = this.routes[this.activeRoute];
    return route[this.activeWptIndex];
  }

  update(aircraftPos) {
    const route = this.routes[this.activeRoute];
    const currentWpt = route[this.activeWptIndex];

    const distToWpt = aircraftPos.distanceTo(currentWpt.pos);

    // Sequence to next waypoint on arrival
    if (distToWpt < this.captureRadiusMeters && this.activeWptIndex < route.length - 1) {
      this.activeWptIndex++;
    }

    const targetWpt = route[this.activeWptIndex];
    const delta = targetWpt.pos.clone().sub(aircraftPos);
    const bearingDeg = (THREE.MathUtils.radToDeg(Math.atan2(delta.x, delta.z)) + 360) % 360;

    return {
      activeRoute: this.activeRoute,
      waypointName: targetWpt.name,
      waypointIndex: this.activeWptIndex + 1,
      totalWaypoints: route.length,
      distanceKm: parseFloat((distToWpt / 1000).toFixed(1)),
      bearingDeg: Math.round(bearingDeg),
      requiredAlt: targetWpt.minAlt
    };
  }
}
