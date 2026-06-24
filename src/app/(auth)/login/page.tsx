"use client";

import { Suspense, useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bike, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Ungültige E-Mail oder Passwort");
      return;
    }

    router.push("/map");
    router.refresh();
  };

  return (
    <div className="card accent-glow">
      <div className="text-center mb-8">
        <Bike className="w-12 h-12 text-moto-accent mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white">
          Willkommen zurück
        </h1>
        <p className="text-moto-muted mt-2">Melde dich bei RideApp an</p>
      </div>

      {justRegistered && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Registrierung erfolgreich! Du kannst dich jetzt anmelden.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-moto-muted pointer-events-none" />
          <input
            type="email"
            placeholder="E-Mail"
            value={form.email}
            onChange={updateField("email")}
            required
            className="input-field pl-12"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-moto-muted pointer-events-none" />
          <input
            type="password"
            placeholder="Passwort"
            value={form.password}
            onChange={updateField("password")}
            required
            className="input-field pl-12"
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
              Anmelden <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-moto-muted mt-6 text-sm">
        Noch kein Konto?{" "}
        <Link href="/register" className="text-moto-accent hover:text-moto-orange transition-colors">
          Jetzt registrieren
        </Link>
      </p>
    </div>
  );
}
