"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Bike, Save, List, MapPin } from "lucide-react";
import { formatDistance, haversineDistance } from "@/lib/functional";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface MapPoint {
  lat: number;
  lng: number;
  address: string;
}

interface Ride {
  id: string;
  title: string;
  startAddress: string;
  endAddress: string;
  distance: number | null;
  user: { username: string };
  createdAt: string;
}

export default function MapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [start, setStart] = useState<MapPoint | null>(null);
  const [end, setEnd] = useState<MapPoint | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [rides, setRides] = useState<Ride[]>([]);
  const [showRides, setShowRides] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/rides")
      .then((res) => res.json())
      .then((data) => setRides(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [status]);

  const handleReset = useCallback(() => {
    setStart(null);
    setEnd(null);
    setTitle("");
    setDescription("");
  }, []);

  const handleSaveRide = async () => {
    if (!start || !end || !title.trim()) return;
    setSaving(true);

    const distance = haversineDistance(start.lat, start.lng, end.lat, end.lng);

    const res = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
        startLat: start.lat,
        startLng: start.lng,
        startAddress: start.address,
        endLat: end.lat,
        endLng: end.lng,
        endAddress: end.address,
        distance,
      }),
    });

    if (res.ok) {
      const ride = await res.json();
      setRides((prev) => [ride, ...prev]);
      handleReset();
    }

    setSaving(false);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      <div className="flex-1 relative">
        <MapView
          start={start}
          end={end}
          onStartSelect={setStart}
          onEndSelect={setEnd}
          onReset={handleReset}
        />
      </div>

      <div className="w-full lg:w-96 bg-moto-dark border-t lg:border-t-0 lg:border-l border-moto-blue/30 p-4 overflow-y-auto">
        {start && end ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bike className="w-5 h-5 text-moto-accent" />
              Ride speichern
            </h2>

            <input
              type="text"
              placeholder="Titel der Tour"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />

            <textarea
              placeholder="Beschreibung (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field resize-none"
            />

            <div className="bg-moto-surface rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-moto-muted truncate">{start.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-moto-accent" />
                <span className="text-moto-muted truncate">{end.address}</span>
              </div>
              <div className="flex items-center gap-2 text-moto-gold">
                <MapPin className="w-4 h-4" />
                {formatDistance(haversineDistance(start.lat, start.lng, end.lat, end.lng))}
              </div>
            </div>

            <button
              onClick={handleSaveRide}
              disabled={saving || !title.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Ride speichern
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-moto-muted mx-auto mb-3" />
            <p className="text-moto-muted">
              Klicke auf die Karte, um Start- und Zielpunkt zu wählen
            </p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => setShowRides(!showRides)}
            className="flex items-center gap-2 text-moto-muted hover:text-white transition-colors w-full"
          >
            <List className="w-4 h-4" />
            <span className="text-sm font-medium">Letzte Rides ({rides.length})</span>
          </button>

          {showRides && (
            <div className="mt-3 space-y-2">
              {rides.map((ride) => (
                <div key={ride.id} className="bg-moto-surface rounded-lg p-3">
                  <p className="text-white text-sm font-medium">{ride.title}</p>
                  <p className="text-moto-muted text-xs mt-1">
                    {ride.user.username} • {ride.distance ? formatDistance(ride.distance) : "–"}
                  </p>
                  <p className="text-moto-muted text-xs truncate">
                    {ride.startAddress} → {ride.endAddress}
                  </p>
                </div>
              ))}
              {rides.length === 0 && (
                <p className="text-moto-muted text-sm text-center py-4">
                  Noch keine Rides vorhanden
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
