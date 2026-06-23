"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Bike, Zap, Shield, MapPin, MessageCircle, Star, Send,
} from "lucide-react";
import StarRating from "@/components/StarRating";
import { formatDistance } from "@/lib/functional";

interface RiderProfile {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  motorcycle: string | null;
  createdAt: string;
  avgSpeed: number;
  avgSafety: number;
  ratingCount: number;
  rideCount: number;
  rides: Array<{
    id: string;
    title: string;
    startAddress: string;
    endAddress: string;
    distance: number | null;
    createdAt: string;
  }>;
  ratingsReceived: Array<{
    id: string;
    speedScore: number;
    safetyScore: number;
    comment: string | null;
    createdAt: string;
    fromUser: { id: string; username: string };
  }>;
}

export default function RiderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [speedScore, setSpeedScore] = useState(0);
  const [safetyScore, setSafetyScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch(`/api/riders/${id}`)
      .then((res) => res.json())
      .then((data) => { setRider(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmitRating = async () => {
    if (speedScore === 0 || safetyScore === 0) return;
    setSubmitting(true);

    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toUserId: id,
        speedScore,
        safetyScore,
        comment: comment.trim() || undefined,
      }),
    });

    if (res.ok) {
      setRatingSuccess(true);
      setSpeedScore(0);
      setSafetyScore(0);
      setComment("");
      const updated = await fetch(`/api/riders/${id}`).then((r) => r.json());
      setRider(updated);
    }

    setSubmitting(false);
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="text-center py-16">
        <p className="text-moto-muted">Fahrer nicht gefunden</p>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === rider.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/riders"
        className="flex items-center gap-2 text-moto-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
      </Link>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-moto-surface flex items-center justify-center text-moto-accent text-3xl font-bold shrink-0">
            {rider.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{rider.username}</h1>
              {!isOwnProfile && (
                <Link
                  href={`/messages?to=${rider.id}`}
                  className="btn-secondary text-sm !py-1.5 !px-3 flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" /> Nachricht
                </Link>
              )}
            </div>
            {rider.motorcycle && (
              <p className="text-moto-muted mt-1 flex items-center gap-2">
                <Bike className="w-4 h-4" /> {rider.motorcycle}
              </p>
            )}
            {rider.bio && <p className="text-moto-text mt-2">{rider.bio}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="bg-moto-surface rounded-lg p-3 text-center">
                <Zap className="w-5 h-5 text-moto-gold mx-auto mb-1" />
                <p className="text-white font-semibold">{rider.avgSpeed.toFixed(1)}</p>
                <p className="text-moto-muted text-xs">Speed</p>
              </div>
              <div className="bg-moto-surface rounded-lg p-3 text-center">
                <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-white font-semibold">{rider.avgSafety.toFixed(1)}</p>
                <p className="text-moto-muted text-xs">Safety</p>
              </div>
              <div className="bg-moto-surface rounded-lg p-3 text-center">
                <MapPin className="w-5 h-5 text-moto-accent mx-auto mb-1" />
                <p className="text-white font-semibold">{rider.rideCount}</p>
                <p className="text-moto-muted text-xs">Rides</p>
              </div>
              <div className="bg-moto-surface rounded-lg p-3 text-center">
                <Star className="w-5 h-5 text-moto-orange mx-auto mb-1" />
                <p className="text-white font-semibold">{rider.ratingCount}</p>
                <p className="text-moto-muted text-xs">Bewertungen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isOwnProfile && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-moto-gold" />
            {rider.username} bewerten
          </h2>

          {ratingSuccess && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 text-green-400 text-sm">
              Bewertung erfolgreich abgegeben!
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-moto-muted flex items-center gap-2">
                <Zap className="w-4 h-4" /> Geschwindigkeit
              </span>
              <StarRating value={speedScore} onChange={setSpeedScore} size="lg" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-moto-muted flex items-center gap-2">
                <Shield className="w-4 h-4" /> Fahrsicherheit
              </span>
              <StarRating value={safetyScore} onChange={setSafetyScore} size="lg" />
            </div>
            <textarea
              placeholder="Kommentar (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="input-field resize-none"
            />
            <button
              onClick={handleSubmitRating}
              disabled={submitting || speedScore === 0 || safetyScore === 0}
              className="btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Bewertung abgeben
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {rider.rides.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-moto-accent" />
            Rides
          </h2>
          <div className="space-y-3">
            {rider.rides.map((ride) => (
              <div key={ride.id} className="bg-moto-surface rounded-lg p-3">
                <p className="text-white font-medium">{ride.title}</p>
                <p className="text-moto-muted text-sm mt-1">
                  {ride.startAddress.split(",")[0]} → {ride.endAddress.split(",")[0]}
                  {ride.distance && ` • ${formatDistance(ride.distance)}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {rider.ratingsReceived.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-moto-gold" />
            Bewertungen
          </h2>
          <div className="space-y-3">
            {rider.ratingsReceived.map((rating) => (
              <div key={rating.id} className="bg-moto-surface rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/riders/${rating.fromUser.id}`}
                    className="text-moto-accent hover:text-moto-orange text-sm font-medium transition-colors"
                  >
                    {rating.fromUser.username}
                  </Link>
                  <div className="flex gap-3">
                    <span className="text-xs text-moto-muted flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {rating.speedScore}/5
                    </span>
                    <span className="text-xs text-moto-muted flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {rating.safetyScore}/5
                    </span>
                  </div>
                </div>
                {rating.comment && (
                  <p className="text-moto-text text-sm">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
