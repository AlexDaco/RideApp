import Link from "next/link";
import { Bike, Map, Users, MessageCircle, Star, Shield, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Map,
    title: "Touren planen",
    description: "Plane Motorrad-Routen von A nach B quer durch die Schweiz mit interaktiver Karte.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Finde andere Biker, bewerte ihre Fahrkünste und vernetze dich mit Gleichgesinnten.",
  },
  {
    icon: MessageCircle,
    title: "Messaging",
    description: "Schreibe direkt mit anderen Fahrern und plane gemeinsame Ausfahrten.",
  },
  {
    icon: Star,
    title: "Bewertungen",
    description: "Bewerte und werde bewertet — Geschwindigkeit und Fahrsicherheit im Fokus.",
  },
] as const;

const STATS = [
  { icon: Zap, label: "Speed Rating", value: "Bewerte Geschwindigkeit" },
  { icon: Shield, label: "Safety Score", value: "Bewerte Fahrsicherheit" },
  { icon: Bike, label: "Rides", value: "Plane deine Touren" },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      <section className="relative overflow-hidden">
        <div className="speed-lines absolute inset-0 opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Bike className="w-16 h-16 text-moto-accent" />
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight">
              Ride<span className="text-moto-accent">App</span>
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-moto-muted max-w-2xl mx-auto">
              Die Motorrad-Community für die Schweiz. Plane Touren, triff Biker
              und zeig dein Können.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">
                Jetzt loslegen
              </Link>
              <Link href="/login" className="btn-secondary text-lg px-8 py-4">
                Anmelden
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card group hover:border-moto-accent/50 transition-all duration-300">
              <Icon className="w-10 h-10 text-moto-accent mb-4 group-hover:text-moto-orange transition-colors" />
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-moto-muted text-sm">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Dein Fahrer-Profil</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-moto-surface rounded-lg p-6">
                <Icon className="w-8 h-8 text-moto-gold mx-auto mb-3" />
                <p className="text-white font-semibold">{label}</p>
                <p className="text-moto-muted text-sm mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-moto-blue/30 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-moto-muted text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bike className="w-5 h-5 text-moto-accent" />
            <span className="font-semibold text-white">RideApp</span>
          </div>
          <p>Motorrad-Community Schweiz</p>
        </div>
      </footer>
    </div>
  );
}
