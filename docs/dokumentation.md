# RideApp – Projektdokumentation

## 1. Projektübersicht

**RideApp** ist eine Webanwendung für Motorradfahrer in der Schweiz. Sie vereint Tourenplanung, Community-Features und Messaging in einer modernen, spielerischen Oberfläche.

### Zielgruppe

Motorradfahrer in der Schweiz, die:
- Touren von A nach B planen möchten
- Andere Fahrer kennenlernen und sich vernetzen wollen
- Feedback zu Geschwindigkeit und Fahrsicherheit geben und empfangen möchten

### Kernfunktionen

| Feature | Beschreibung |
|---------|-------------|
| **Registrierung/Login** | E-Mail, Benutzername und Passwort mit sicherer Hashing-Verschlüsselung |
| **Interaktive Karte** | Leaflet-basierte Karte der Schweiz mit Punkt-A-zu-B-Routenplanung |
| **Fahrer-Community** | Übersicht aller registrierten Fahrer mit Such- und Sortierfunktion |
| **Bewertungssystem** | Geschwindigkeits- und Sicherheitsbewertung (1–5 Sterne) für andere Fahrer |
| **Messaging** | Direktnachrichten zwischen Fahrern mit Echtzeit-Polling |
| **Profilverwaltung** | Eigenes Profil mit Motorrad-Info und Bio bearbeiten |

### Technologie-Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Next.js API Routes, NextAuth.js (JWT)
- **Datenbank:** SQLite via Prisma ORM
- **Karte:** Leaflet / OpenStreetMap
- **Deployment:** Docker + Kubernetes (lokal)

---

## 2. Planung & Vorgehen

### Vorgehensweise

Das Projekt wurde iterativ entwickelt, mit kleinen, fokussierten Commits, die jeweils ein Feature oder eine Verbesserung umfassen. Die Reihenfolge folgte einem Bottom-up-Ansatz:

1. **Projektsetup** – Next.js mit TypeScript und Tailwind initialisiert
2. **Datenmodell** – Prisma Schema mit User, Ride, Rating, Message definiert
3. **Authentifizierung** – NextAuth mit Credentials Provider und bcrypt
4. **Design-System** – Motorrad-inspiriertes Farbschema und UI-Komponenten
5. **Karte & Rides** – Leaflet-Integration mit Geocoding und Distanzberechnung
6. **Social Features** – Fahrer-Profile, Bewertungen, Suche und Sortierung
7. **Messaging** – Chat-Interface mit Konversationsliste und Echtzeit-Updates
8. **Kubernetes** – Dockerfile und k8s-Manifeste für lokales Deployment

### Projektstruktur

```
src/
├── app/
│   ├── (auth)/          # Login und Registrierung
│   ├── (app)/           # Geschützte Seiten (Map, Riders, Messages, Profile)
│   └── api/             # REST API Endpunkte
├── components/          # Wiederverwendbare UI-Komponenten
└── lib/                 # Hilfsfunktionen, DB, Auth, Validierung
k8s/                     # Kubernetes-Manifeste
prisma/                  # Datenbankschema und Migrationen
```

---

## 3. Funktionale Anteile

### Eingesetzte funktionale Konzepte

#### Reine Funktionen (Pure Functions)

Datei: `src/lib/functional.ts`

Alle Hilfsfunktionen sind rein – sie haben keine Seiteneffekte und liefern für gleiche Eingaben immer gleiche Ergebnisse:

```typescript
export const calculateAverage = (scores: readonly number[]): number =>
  scores.length === 0 ? 0 : scores.reduce((sum, s) => sum + s, 0) / scores.length;

export const haversineDistance = (lat1, lng1, lat2, lng2): number => { ... };

export const isWithinSwitzerland = (lat: number, lng: number): boolean =>
  lat >= 45.8 && lat <= 47.9 && lng >= 5.9 && lng <= 10.5;
```

**Warum dort?** Berechnungen wie Distanzen, Durchschnitte und Koordinatenprüfungen sind ideale Kandidaten für reine Funktionen – sie sind testbar, vorhersagbar und haben keine Abhängigkeiten.

#### Higher-Order Functions und Komposition

Datei: `src/lib/functional.ts`

```typescript
export const pipe = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T => fns.reduce((acc, fn) => fn(acc), value);

export const compose = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T => fns.reduceRight((acc, fn) => fn(acc), value);

export const clamp = (min: number, max: number) => (value: number): number =>
  Math.min(Math.max(value, min), max);
```

**Warum dort?** `pipe` und `compose` ermöglichen das Verketten von Transformationen ohne Zwischenvariablen. `clamp` ist eine curried function – sie gibt eine neue Funktion zurück, die den Wert begrenzt.

#### map / filter / reduce

Datei: `src/lib/functional.ts` und diverse API-Routen

```typescript
// groupBy mit reduce – immutable Akkumulator
export const groupBy = <T>(items: readonly T[], keyFn: (item: T) => string) =>
  items.reduce<Record<string, T[]>>((groups, item) => {
    const key = keyFn(item);
    return { ...groups, [key]: [...(groups[key] ?? []), item] };
  }, {});

// sortBy – kopiert das Array statt es zu mutieren
export const sortBy = <T>(items: readonly T[], keyFn: (item: T) => number) =>
  [...items].sort((a, b) => keyFn(a) - keyFn(b));

// uniqueBy mit filter
export const uniqueBy = <T>(items: readonly T[], keyFn: (item: T) => string) =>
  items.filter((item, index, arr) =>
    arr.findIndex((other) => keyFn(other) === keyFn(item)) === index);
```

In den API-Routen (`src/app/api/riders/route.ts`):
```typescript
const riders = users.map((user) => ({
  ...user,
  avgSpeed: calculateAverage(user.ratingsReceived.map((r) => r.speedScore)),
  avgSafety: calculateAverage(user.ratingsReceived.map((r) => r.safetyScore)),
}));
```

**Warum dort?** Daten-Transformationen in API-Responses und Listen-Verarbeitungen profitieren stark von `map`, `filter` und `reduce`. Sie beschreiben *was* transformiert wird, nicht *wie*.

#### Lambdas (Arrow Functions)

Durchgängig im gesamten Projekt eingesetzt. Beispiel aus den Formularkomponenten:

```typescript
// Curried event handler – gibt eine Lambda zurück
const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
  setForm((prev) => ({ ...prev, [field]: e.target.value }));
```

**Warum dort?** React-Event-Handler und funktionale Transformationen lesen sich mit Arrow Functions natürlicher und kompakter.

#### Immutability

Konsequent eingehalten durch:
- `readonly` Arrays in Funktionssignaturen: `(scores: readonly number[])`
- Spread-Operator statt Mutation: `[...items].sort()`, `{ ...groups, [key]: value }`
- React State mit `setForm((prev) => ({ ...prev, [field]: value }))` statt direkter Mutation

**Warum?** Immutability verhindert unerwartete Seiteneffekte und macht den Datenfluss nachvollziehbar – besonders wichtig in React, wo State-Mutationen zu Rendering-Bugs führen.

#### Deklarative Datenstrukturen

```typescript
// Navbar – Navigation als Datenstruktur statt imperativer Logik
const NAV_ITEMS = [
  { href: "/map", label: "Karte", icon: Map },
  { href: "/riders", label: "Fahrer", icon: Users },
  { href: "/messages", label: "Nachrichten", icon: MessageCircle },
] as const;

// Features auf der Landing Page
const FEATURES = [
  { icon: Map, title: "Touren planen", description: "..." },
  // ...
] as const;
```

**Warum dort?** Deklarative Datenstrukturen trennen Daten von Darstellung. Neue Einträge erfordern nur eine Zeile, keine Logik-Änderung.

### Wo funktional, wo nicht?

| Bereich | Funktional? | Begründung |
|---------|-------------|------------|
| Hilfsfunktionen (`functional.ts`) | Ja | Reine Berechnungen ohne Seiteneffekte |
| Validierung (`validations.ts`) | Ja | Zod-Schemas sind deklarativ und komposierbar |
| API-Datenverarbeitung | Ja | `map`/`filter`/`reduce` für Transformationen |
| React-Komponenten | Teilweise | Komponenten sind Funktionen, nutzen aber Hooks (State = Seiteneffekt) |
| Datenbankzugriffe | Nein | Prisma-Queries sind inhärent seiteneffektbehaftet |
| Authentifizierung | Nein | Sessions und Cookies sind zustandsbehaftet |

---

## 4. Reflexion

### Was hat gut funktioniert?

- **Iterative Entwicklung:** Kleine Commits mit klarem Fokus machten den Fortschritt sichtbar und Fehler leicht lokalisierbar.
- **Next.js App Router:** Die Dateibasierte Routing-Struktur mit Route Groups `(auth)` und `(app)` hält den Code sauber organisiert.
- **Tailwind CSS:** Schnelles, konsistentes Styling direkt im JSX ohne separate CSS-Dateien.
- **Funktionale Hilfsfunktionen:** `calculateAverage`, `haversineDistance` etc. sind wiederverwendbar und testbar.
- **Zod-Validierung:** Deklarative Schemas validieren sowohl auf Client- als auch auf Server-Seite.

### Was war schwierig?

- **Prisma v7 Kompatibilität:** Die neueste Prisma-Version (v7) hat die API grundlegend geändert – der Constructor erfordert jetzt zwingend Optionen. Das erforderte einen Downgrade auf v6.
- **Turbopack + Prisma:** Next.js 16 nutzt standardmässig Turbopack, was zunächst Probleme mit dem Prisma-Client-Import verursachte.
- **useSearchParams:** Next.js erfordert einen Suspense-Boundary um Komponenten mit `useSearchParams`, was bei der statischen Generierung zu Build-Fehlern führte.
- **Leaflet SSR:** Leaflet funktioniert nicht serverseitig – die Lösung war `dynamic()` Import mit `ssr: false`.
- **Icon-Alignment in Eingabefeldern:** Die Icons in den Textfeldern (E-Mail, Passwort, Suche, Motorrad) überlappten mit dem Platzhaltertext. Tailwind v4 `@apply` konnte das `padding-left` nicht zuverlässig generieren – weder `pl-12` als Utility-Override noch `pl-14` direkt im `@apply` wirkten. Die endgültige Lösung war, auf reines CSS umzusteigen: Eine eigene `.input-icon-field`-Klasse mit `padding-left: 3.25rem` direkt als CSS-Property statt über `@apply`. Zusammen mit `top-1/2 -translate-y-1/2` für vertikale Icon-Zentrierung und `pointer-events-none` auf den Icons ergibt sich ein sauberes Layout mit klarem Abstand.

### Was nehme ich mit?

- Funktionale Programmierung eignet sich hervorragend für Datenverarbeitungen und Utility-Funktionen.
- Bei UI-Logik (State, Events, Effects) stösst der rein funktionale Ansatz an Grenzen – Hooks sind ein pragmatischer Kompromiss.
- Kleine, fokussierte Commits erleichtern das Debugging und dokumentieren die Entstehungsgeschichte des Projekts.
- Kubernetes-Deployment erfordert Planung (Health Checks, Resource Limits, Secrets), ist aber mit Docker Desktop lokal gut testbar.

---

## 5. Anleitung

### Voraussetzungen

- Node.js 22+ (LTS)
- npm
- Docker Desktop (für Kubernetes)

### Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/AlexDaco/RideApp.git
cd RideApp

# Dependencies installieren (inkl. Prisma Generate)
npm install

# Datenbank initialisieren
npx prisma migrate dev

# Entwicklungsserver starten
npm run dev
```

Die App ist dann unter `http://localhost:3000` erreichbar.

### Kubernetes Deployment (lokal)

```powershell
# Docker Desktop mit aktiviertem Kubernetes erforderlich

# Deploy-Script ausführen
.\scripts\deploy-local.ps1
```

Die App ist dann unter `http://localhost:30000` erreichbar.

### Umgebungsvariablen

| Variable | Beschreibung | Standard |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite Datenbank-Pfad | `file:./dev.db` |
| `AUTH_SECRET` | NextAuth Session-Secret | (muss gesetzt werden) |
| `NEXTAUTH_URL` | App-URL für Auth-Callbacks | `http://localhost:3000` |

---

## 6. Quellen

### Bibliotheken & Frameworks

| Bibliothek | Version | Zweck |
|-----------|---------|-------|
| Next.js | 16.2 | React Full-Stack Framework |
| React | 19.2 | UI-Bibliothek |
| TypeScript | 5.x | Typsicherheit |
| Tailwind CSS | 4.x | Utility-first CSS |
| Prisma | 6.x | ORM / Datenbankzugriff |
| NextAuth.js | 5 beta | Authentifizierung |
| bcryptjs | 3.x | Passwort-Hashing |
| Zod | 4.x | Schema-Validierung |
| Leaflet | 1.9 | Interaktive Karten |
| react-leaflet | 5.x | React-Wrapper für Leaflet |
| Lucide React | 1.x | Icon-Bibliothek |
| socket.io | 4.x | WebSocket-Kommunikation |

### Externe APIs

- **OpenStreetMap** – Kartendaten und Tiles
- **Nominatim** – Reverse Geocoding (Koordinaten → Adresse)

### KI-Tools

- **Claude Code (Anthropic)** – Unterstützung bei der Code-Generierung, Architektur-Entscheidungen und Debugging. Alle generierten Codeabschnitte wurden überprüft, angepasst und in den Entwicklungsprozess integriert.

### Tutorials & Dokumentation

- Next.js App Router Dokumentation (nextjs.org/docs)
- Prisma ORM Dokumentation (prisma.io/docs)
- NextAuth.js v5 Dokumentation (authjs.dev)
- Tailwind CSS Dokumentation (tailwindcss.com)
- Leaflet Dokumentation (leafletjs.com)
