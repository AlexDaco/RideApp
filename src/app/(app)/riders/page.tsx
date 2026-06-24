"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Bike, Zap, Shield, Search } from "lucide-react";
import StarRating from "@/components/StarRating";
import { sortBy } from "@/lib/functional";

interface Rider {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  motorcycle: string | null;
  rideCount: number;
  avgSpeed: number;
  avgSafety: number;
  ratingCount: number;
}

type SortOption = "name" | "speed" | "safety" | "rides";

const SORT_FNS: Record<SortOption, (r: Rider) => number> = {
  name: () => 0,
  speed: (r) => r.avgSpeed,
  safety: (r) => r.avgSafety,
  rides: (r) => r.rideCount,
};

export default function RidersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/riders")
      .then((res) => res.json())
      .then((data) => { setRiders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredRiders = riders
    .filter((r) => r.username.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === "name") return a.username.localeCompare(b.username);
      return sortBy([a, b], SORT_FNS[sortOption], true)[0] === a ? -1 : 1;
    });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-moto-accent" />
          <h1 className="text-2xl font-bold text-white">Fahrer-Community</h1>
        </div>
        <span className="text-moto-muted text-sm">{riders.length} Fahrer</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-moto-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Fahrer suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-icon-field"
          />
        </div>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="input-field w-full sm:w-48"
        >
          <option value="name">Name (A-Z)</option>
          <option value="speed">Schnellste</option>
          <option value="safety">Sicherste</option>
          <option value="rides">Meiste Rides</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRiders.map((rider) => (
          <Link key={rider.id} href={`/riders/${rider.id}`}>
            <div className="card hover:border-moto-accent/50 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-moto-surface flex items-center justify-center text-moto-accent text-xl font-bold">
                  {rider.username[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-semibold group-hover:text-moto-accent transition-colors">
                    {rider.username}
                  </h3>
                  {rider.motorcycle && (
                    <p className="text-moto-muted text-sm flex items-center gap-1">
                      <Bike className="w-3 h-3" /> {rider.motorcycle}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-moto-muted flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Speed
                  </span>
                  <StarRating value={rider.avgSpeed} readonly size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-moto-muted flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Safety
                  </span>
                  <StarRating value={rider.avgSafety} readonly size="sm" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-moto-blue/30 text-xs text-moto-muted">
                <span>{rider.rideCount} Rides</span>
                <span>{rider.ratingCount} Bewertungen</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredRiders.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-moto-muted mx-auto mb-3" />
          <p className="text-moto-muted">Keine Fahrer gefunden</p>
        </div>
      )}
    </div>
  );
}
