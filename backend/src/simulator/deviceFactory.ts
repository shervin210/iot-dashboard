import type { Device } from "../types/domain.js";
import { randomFloat, randomInt, pickOne } from "../utils/random.js";

interface Building {
  id: string;
  name: string;
  // Rough bounding box so devices in the same building cluster on the map.
  lat: number;
  lng: number;
}

const BUILDINGS: Building[] = [
  { id: "BLD-01", name: "Azadi Tower Complex", lat: 35.6997, lng: 51.3381 },
  { id: "BLD-02", name: "Milad Tech Park", lat: 35.7448, lng: 51.3753 },
  { id: "BLD-03", name: "Vali-Asr Business Center", lat: 35.7219, lng: 51.4103 },
  { id: "BLD-04", name: "Tajrish Retail Plaza", lat: 35.8044, lng: 51.4326 },
  { id: "BLD-05", name: "Shahrak-e Gharb Offices", lat: 35.7595, lng: 51.3606 },
  { id: "BLD-06", name: "Ekbatan Residential Block", lat: 35.7050, lng: 51.2703 },
  { id: "BLD-07", name: "Niavaran Cultural Center", lat: 35.8103, lng: 51.4795 },
  { id: "BLD-08", name: "Pardis Innovation Hub", lat: 35.7300, lng: 51.6100 }
];

/** Builds the initial fleet of `count` gateways with stable ids and
 *  plausible starting telemetry, spread across a fixed set of buildings. */
export function generateInitialDevices(count: number): Device[] {
  const devices: Device[] = [];

  for (let i = 1; i <= count; i += 1) {
    const building = pickOne(BUILDINGS);
    const id = `GW-${1000 + i}`;

    devices.push({
      id,
      name: `Gateway ${1000 + i}`,
      buildingId: building.id,
      buildingName: building.name,
      status: "online",
      priority: "normal",
      battery: randomInt(60, 100),
      signalStrength: randomInt(55, 100),
      temperature: randomFloat(18, 26),
      acPower: true,
      hasFaults: false,
      urgentAlarm: false,
      lastSeen: new Date().toISOString(),
      latitude: building.lat + randomFloat(-0.01, 0.01, 4),
      longitude: building.lng + randomFloat(-0.01, 0.01, 4),
      version: 1
    });
  }

  return devices;
}
