// Real-world placement for the Bengaluru scenery.
// World axes used by the sim: runway 09L/27R lies along Z, take-off on 09L flies towards -Z (east),
// so -Z = east, +Z = west, -X = north, +X = south, +Y = up. Origin = centre of runway 09L/27R.
// Coordinates are public lat/lon values (WGS84), accurate to a few hundred metres - enough for VFR references.

export const ORIGIN = { lat: 13.2071, lon: 77.7066 }; // VOBL north runway 09L/27R centre (approx.)
export const AIRPORT_ELEVATION_M = 915;               // VOBL field elevation; world y = 0

const M_PER_DEG_LAT = 110574;
const M_PER_DEG_LON = 111320 * Math.cos(ORIGIN.lat * Math.PI / 180); // ~108,400 m at 13.2 N

// lat/lon -> world { x, z } in metres
export function geoToWorld(lat, lon) {
  return {
    x: -(lat - ORIGIN.lat) * M_PER_DEG_LAT,
    z: -(lon - ORIGIN.lon) * M_PER_DEG_LON
  };
}

// world x, z -> { lat, lon }
export function worldToGeo(x, z) {
  return {
    lat: ORIGIN.lat - x / M_PER_DEG_LAT,
    lon: ORIGIN.lon - z / M_PER_DEG_LON
  };
}

// Real places (lat, lon, elevation AMSL in metres where it matters)
export const PLACES = {
  nandiHillsSummit: { lat: 13.3702, lon: 77.6835, elev: 1478 },
  skandagiriSummit: { lat: 13.4157, lon: 77.6853, elev: 1450 },
  terminal1: { lat: 13.1989, lon: 77.7085 },
  terminal2: { lat: 13.1996, lon: 77.7139 },
  atcTower: { lat: 13.2002, lon: 77.7043 },
  hangars: { lat: 13.2003, lon: 77.6905 },
  trumpetInterchange: { lat: 13.1830, lon: 77.6840 },
  hebbal: { lat: 13.0358, lon: 77.5970 },
  bengaluruCbd: { lat: 12.9750, lon: 77.6050 },
  manyataTechPark: { lat: 13.0450, lon: 77.6200 },
  yelahankaAfs: { lat: 13.1355, lon: 77.6060 },
  devanahalli: { lat: 13.2450, lon: 77.7120 }
};

// NH44 (Bellary Road / Airport Expressway): Bengaluru -> Hebbal -> Yelahanka -> Trumpet -> Devanahalli -> north
export const NH44_ROUTE = [
  [12.9900, 77.5900], [13.0358, 77.5970], [13.0800, 77.5980], [13.1150, 77.6060], [13.1450, 77.6280],
  [13.1700, 77.6560], [13.1830, 77.6840], [13.2150, 77.6960], [13.2450, 77.7050], [13.3000, 77.7120],
  [13.3700, 77.7230], [13.4300, 77.7270]
];

// Other roads of the local grid
export const ROADS = {
  airportAccess: [[13.1830, 77.6840], [13.1880, 77.6950], [13.1940, 77.7040], [13.1975, 77.7090]],
  devanahalliDoddaballapur: [[13.2450, 77.7050], [13.2550, 77.6600], [13.2700, 77.6000], [13.2955, 77.5375]],
  hennurBagalur: [[13.0400, 77.6400], [13.0900, 77.6550], [13.1350, 77.6680], [13.1700, 77.6800], [13.1830, 77.6840]]
};
