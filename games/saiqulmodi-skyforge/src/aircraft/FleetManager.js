import { createFighter } from './fighter.js';
import { buildCockpit } from './cockpitInterior.js';
import { setFlightProfile } from '../physics/aero.js';

// Registry of the 4 airframes. Each factory returns the common contract:
// { id, name, mesh, profile, cockpitOffset, chaseOffset, update(dt, flightState), dispose() }
const FACTORIES = {
  fighter: createFighter

};

export class FleetManager {
  // parent: the object the airframe mesh is added to (scene or a container that follows the physics)
  // layers: { exterior, cockpit } camera layers (exterior shows in chase view, cockpit in cockpit view)
  constructor({ parent, layers }) {
    this.parent = parent;
    this.layers = layers;
    this.active = null;   // current aircraft contract
    this.cockpit = null;  // its 3D cockpit
  }

  get ids() {
    return Object.keys(FACTORIES);
  }

  switchTo(id) {
    if (!FACTORIES[id]) throw new Error(`Unknown aircraft: ${id}`);
    const previous = this.active ? this.active.id : null;

    // Remove and free the old airframe and its cockpit
    if (this.active) {
      this.parent.remove(this.active.mesh);
      this.active.mesh.remove(this.cockpit.group);
      this.cockpit.dispose();
      this.active.dispose();
    }

    // Build the new airframe + cockpit at its own eye position
    const aircraft = FACTORIES[id]();
    aircraft.mesh.traverse((o) => o.layers.set(this.layers.exterior));
    const cockpit = buildCockpit(id, aircraft.cockpitOffset);
    cockpit.group.traverse((o) => o.layers.set(this.layers.cockpit));
    aircraft.mesh.add(cockpit.group);
    this.parent.add(aircraft.mesh);

    this.active = aircraft;
    this.cockpit = cockpit;
    setFlightProfile(aircraft.profile);

    window.dispatchEvent(new CustomEvent('aircraftchanged', {
      detail: { id, previous, name: aircraft.name, profile: aircraft.profile }
    }));
    return aircraft;
  }
}
