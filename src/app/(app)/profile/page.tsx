"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User, Bike, Mail, Calendar, MapPin, Star, Save, CheckCircle,
} from "lucide-react";

interface Profile {
  id: string;
  email: string;
  username: string;
  bio: string | null;
  motorcycle: string | null;
  avatarUrl: string | null;
  createdAt: string;
  _count: { rides: number; ratingsReceived: number };
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState("");
  const [motorcycle, setMotorcycle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return setLoading(false);
        setProfile(data);
        setBio(data.bio ?? "");
        setMotorcycle(data.motorcycle ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: bio.trim() || undefined,
        motorcycle: motorcycle.trim() || undefined,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("de-CH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-moto-surface flex items-center justify-center text-moto-accent text-3xl font-bold">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
            <p className="text-moto-muted flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" /> {profile.email}
            </p>
            <p className="text-moto-muted flex items-center gap-2 text-sm">
              <Calendar className="w-3 h-3" /> Dabei seit {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-moto-surface rounded-lg p-4 text-center">
            <MapPin className="w-6 h-6 text-moto-accent mx-auto mb-1" />
            <p className="text-white text-xl font-bold">{profile._count.rides}</p>
            <p className="text-moto-muted text-sm">Rides</p>
          </div>
          <div className="bg-moto-surface rounded-lg p-4 text-center">
            <Star className="w-6 h-6 text-moto-gold mx-auto mb-1" />
            <p className="text-white text-xl font-bold">{profile._count.ratingsReceived}</p>
            <p className="text-moto-muted text-sm">Bewertungen</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-moto-accent" />
          Profil bearbeiten
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-moto-muted mb-1 block">Motorrad</label>
            <div className="relative">
              <Bike className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-moto-muted pointer-events-none" />
              <input
                type="text"
                placeholder="z.B. Yamaha MT-07"
                value={motorcycle}
                onChange={(e) => setMotorcycle(e.target.value)}
                className="input-icon-field"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-moto-muted mb-1 block">Über mich</label>
            <textarea
              placeholder="Erzähl etwas über dich und deine Touren..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="input-field resize-none"
            />
          </div>

          {saved && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Profil gespeichert!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Speichern
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
