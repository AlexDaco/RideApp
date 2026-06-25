"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, Navigation, RotateCcw } from "lucide-react";
import { isWithinSwitzerland, formatDistance, haversineDistance } from "@/lib/functional";

interface MapPoint {
  lat: number;
  lng: number;
  address: string;
}

interface MapViewProps {
  onStartSelect: (point: MapPoint) => void;
  onEndSelect: (point: MapPoint) => void;
  start: MapPoint | null;
  end: MapPoint | null;
  onReset: () => void;
}

const SWITZERLAND_CENTER = { lat: 46.8182, lng: 8.2275 };
const SWITZERLAND_ZOOM = 8;

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=de`
    );
    const data = await res.json();
    return data.display_name?.split(",").slice(0, 3).join(",") ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

export default function MapView({ onStartSelect, onEndSelect, start, end, onReset }: MapViewProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [selectingStart, setSelectingStart] = useState(true);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [routeLine, setRouteLine] = useState<L.Polyline | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadLeaflet = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const container = document.getElementById("map");
      if (!container || (container as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;

      const mapInstance = L.map("map").setView(
        [SWITZERLAND_CENTER.lat, SWITZERLAND_CENTER.lng],
        SWITZERLAND_ZOOM
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapInstance);

      setMap(mapInstance);
    };

    loadLeaflet();

    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, []);

  const clearMarkers = useCallback(() => {
    markers.forEach((m) => m.remove());
    routeLine?.remove();
    setMarkers([]);
    setRouteLine(null);
  }, [markers, routeLine]);

  useEffect(() => {
    if (!map) return;

    const handleClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (!isWithinSwitzerland(lat, lng)) {
        alert("Bitte wähle einen Punkt in der Schweiz!");
        return;
      }

      const L = (await import("leaflet")).default;
      const address = await reverseGeocode(lat, lng);
      const point: MapPoint = { lat, lng, address };

      const createIcon = (color: string) =>
        L.divIcon({
          className: "custom-marker",
          html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

      if (selectingStart) {
        const marker = L.marker([lat, lng], { icon: createIcon("#22c55e") })
          .addTo(map)
          .bindPopup(`<b>Start:</b><br/>${address}`)
          .openPopup();
        setMarkers((prev) => [...prev, marker]);
        onStartSelect(point);
        setSelectingStart(false);
      } else {
        const marker = L.marker([lat, lng], { icon: createIcon("#e94560") })
          .addTo(map)
          .bindPopup(`<b>Ziel:</b><br/>${address}`)
          .openPopup();
        setMarkers((prev) => [...prev, marker]);
        onEndSelect(point);
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, selectingStart, onStartSelect, onEndSelect]);

  useEffect(() => {
    if (!map || !start || !end) return;

    const drawRoute = async () => {
      const L = (await import("leaflet")).default;
      routeLine?.remove();
      const line = L.polyline(
        [
          [start.lat, start.lng],
          [end.lat, end.lng],
        ],
        { color: "#e94560", weight: 4, dashArray: "10, 10", opacity: 0.8 }
      ).addTo(map);
      setRouteLine(line);
      map.fitBounds(line.getBounds(), { padding: [50, 50] });
    };

    drawRoute();
  }, [map, start, end]);

  const handleReset = () => {
    clearMarkers();
    setSelectingStart(true);
    onReset();
    map?.setView([SWITZERLAND_CENTER.lat, SWITZERLAND_CENTER.lng], SWITZERLAND_ZOOM);
  };

  const distance = start && end ? haversineDistance(start.lat, start.lng, end.lat, end.lng) : 0;

  return (
    <div className="relative h-full">
      <div id="map" className="w-full h-full rounded-xl" style={{ minHeight: "500px" }} />

      <div className="absolute top-4 left-4 z-[1000] card !p-4 max-w-xs">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-5 h-5 text-moto-accent" />
          <h3 className="font-semibold text-white text-sm">Ride planen</h3>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${start ? "bg-green-500" : "bg-moto-muted"}`} />
            <span className={start ? "text-white" : "text-moto-muted"}>
              {start ? start.address.slice(0, 40) : "Startpunkt wählen..."}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${end ? "bg-moto-accent" : "bg-moto-muted"}`} />
            <span className={end ? "text-white" : "text-moto-muted"}>
              {end ? end.address.slice(0, 40) : "Zielpunkt wählen..."}
            </span>
          </div>
        </div>

        {distance > 0 && (
          <div className="mt-3 pt-3 border-t border-moto-blue/30">
            <div className="flex items-center gap-2 text-moto-gold">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{formatDistance(distance)}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleReset}
          className="mt-3 flex items-center gap-2 text-moto-muted hover:text-moto-accent transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}
