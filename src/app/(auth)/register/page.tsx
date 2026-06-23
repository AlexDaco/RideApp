"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bike, Mail, User, Lock, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registrierung fehlgeschlagen");
      return;
    }

    router.push("/login?registered=true");
  };

  return (
    <div className="card accent-glow">
      <div className="text-center mb-8">
        <Bike className="w-12 h-12 text-moto-accent mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white">
          Ride<span className="text-moto-accent">App</span> beitreten
        </h1>
        <p className="text-moto-muted mt-2">Werde Teil der Biker-Community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-moto-muted" />
          <input
            type="email"
            placeholder="E-Mail"
            value={form.email}
            onChange={updateField("email")}
            required
            className="input-field pl-11"
          />
        </div>

        <div className="relative">
          <User className="absolute left-3 top-3.5 w-5 h-5 text-moto-muted" />
          <input
            type="text"
            placeholder="Benutzername"
            value={form.username}
            onChange={updateField("username")}
            required
            className="input-field pl-11"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-moto-muted" />
          <input
            type="password"
            placeholder="Passwort (mind. 8 Zeichen)"
            value={form.password}
            onChange={updateField("password")}
            required
            minLength={8}
            className="input-field pl-11"
          />
        </div>

        {error && (
          <div className="bg-moto-accent/10 border border-moto-accent/30 rounded-lg p-3 text-moto-accent text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Registrieren <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-moto-muted mt-6 text-sm">
        Bereits registriert?{" "}
        <Link href="/login" className="text-moto-accent hover:text-moto-orange transition-colors">
          Jetzt anmelden
        </Link>
      </p>
    </div>
  );
}
