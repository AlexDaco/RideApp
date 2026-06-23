# RideApp – Motorrad-Community Schweiz

Eine Web-App für Motorradfahrer in der Schweiz. Plane Touren, bewerte Fahrer und vernetze dich mit der Biker-Community.

## Features

- **Registrierung & Login** – E-Mail, Benutzername, Passwort (bcrypt)
- **Interaktive Karte** – Routenplanung von A nach B in der Schweiz (Leaflet/OSM)
- **Fahrer-Community** – Profile mit Motorrad-Info, Suche und Sortierung
- **Bewertungssystem** – Geschwindigkeit & Fahrsicherheit (1–5 Sterne)
- **Messaging** – Direktnachrichten zwischen Fahrern
- **Kubernetes** – Lokales Deployment mit Docker & k8s

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Prisma (SQLite) · NextAuth.js · Leaflet · Zod

## Quickstart

```bash
git clone https://github.com/AlexDaco/RideApp.git
cd RideApp
npm install
npx prisma migrate dev
npm run dev
```

Öffne `http://localhost:3000`

## Kubernetes (lokal)

```powershell
.\scripts\deploy-local.ps1
```

Erreichbar unter `http://localhost:30000`

## Dokumentation

Siehe [docs/dokumentation.md](docs/dokumentation.md)
