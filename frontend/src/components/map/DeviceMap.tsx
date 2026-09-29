import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Device } from "../../types/domain.js";

interface DeviceMapProps {
  devices: Device[];
  selectedDeviceId: string | undefined;
  onSelectDevice: (id: string) => void;
}

function markerColorFor(device: Device): string {
  if (device.status === "offline") return "#94a3b8";
  if (device.priority === "urgent") return "#ef4444";
  if (device.priority === "warning") return "#f59e0b";
  return "#22c55e";
}

function buildIcon(color: string, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 18 : 14;
  return L.divIcon({
    className: "device-marker",
    html: `<span style="
      display:block;
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${color};
      border:2px solid ${isSelected ? "#0f172a" : "#ffffff"};
      box-shadow:0 0 0 2px rgba(0,0,0,0.15);
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const DEFAULT_CENTER: [number, number] = [35.7219, 51.4103];
export function DeviceMap({
  devices,
  selectedDeviceId,
  onSelectDevice,
}: DeviceMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const onSelectDeviceRef = useRef(onSelectDevice);
  onSelectDeviceRef.current = onSelectDevice;
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      scrollWheelZoom: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set<string>();

    for (const device of devices) {
      seen.add(device.id);
      const icon = buildIcon(
        markerColorFor(device),
        device.id === selectedDeviceId,
      );
      const existing = markersRef.current.get(device.id);

      if (existing) {
        existing.setLatLng([device.latitude, device.longitude]);
        existing.setIcon(icon);
      } else {
        const marker = L.marker([device.latitude, device.longitude], { icon })
          .addTo(map)
          .on("click", () => onSelectDeviceRef.current(device.id));
        markersRef.current.set(device.id, marker);
      }
    }

    for (const [id, marker] of markersRef.current.entries()) {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
  }, [devices, selectedDeviceId]);

  return (
    <div
      ref={containerRef}
      className="h-95 overflow-hidden rounded-md border border-border"
      role="application"
      aria-label="Device location map"
    />
  );
}
