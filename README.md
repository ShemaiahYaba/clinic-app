# MTU-RapidCare

A cross-platform mobile emergency alert and rapid-response system for clinics and healthcare environments. Built with **Expo**, **React Native**, and **Supabase**, MTU-RapidCare enables real-time emergency reporting, device-to-device alerts, and push notifications across all registered clinic devices.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Install dependencies](#2-install-dependencies)
  - [3. Configure environment](#3-configure-environment)
  - [4. Set up the database](#4-set-up-the-database)
  - [5. Run the app](#5-run-the-app)
- [Database Schema](#database-schema)
- [Key Workflows](#key-workflows)
  - [Emergency Reporting](#emergency-reporting)
  - [Real-time Alerts](#real-time-alerts)
  - [Push Notifications](#push-notifications)
- [Building for Production](#building-for-production)
- [License](#license)
- [Author](#author)

---

## Features

| Feature | Description |
|---|---|
| **Emergency Reporting** | Report emergencies instantly from any registered device with location and message details |
| **Real-time Alerts** | Receive live emergency alerts via Supabase Realtime subscriptions |
| **Push Notifications** | Get push alerts via Expo Notifications even when the app is in the background |
| **Device Management** | Auto-register devices with unique names (`RapidCare-01`, `RapidCare-02`, ...) |
| **Alert History** | View, track, and resolve past emergencies |
| **Network Monitoring** | Visual indicator for device connectivity and system health |
| **Modern UI** | Portrait-optimized, accessible interface with dark/light mode support |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) 53 + [React Native](https://reactnative.dev) 0.79 |
| Language | TypeScript 5.8 |
| Navigation | [Expo Router](https://expo.github.io/router) (file-based routing) |
| Backend | [Supabase](https://supabase.com) (PostgreSQL + Realtime + Auth) |
| Push Notifications | [Expo Notifications](https://docs.expo.dev/push-notifications/overview/) + FCM (Android) |
| Forms | React Hook Form + Zod validation |
| Animations | React Native Reanimated 3 |
| Build & Deploy | [EAS Build](https://docs.expo.dev/build/introduction/) |

---

## Project Structure

```
MTU-RapidCare/
├── app/                        # Screens and routes (Expo Router)
│   ├── _layout.tsx             # Root layout (auth guard, global providers)
│   ├── index.tsx               # Entry point / splash redirect
│   ├── splash.tsx              # Animated splash screen
│   ├── emergency-report.tsx    # Emergency submission form
│   ├── emergency-details.tsx   # Alert detail view
│   └── (tabs)/                 # Bottom tab navigator
│       ├── _layout.tsx
│       ├── home.tsx            # Dashboard with active alerts
│       ├── emergencies.tsx     # Full alert history
│       └── profile.tsx         # Device info and settings
│
├── components/                 # Reusable UI components
│   ├── ui/                     # Low-level primitives (buttons, cards, ...)
│   ├── GlobalContext.tsx        # Global state provider (auth, device token)
│   ├── RefreshContext.tsx       # Pull-to-refresh coordination
│   ├── CustomSplashScreen.tsx
│   └── Logo.tsx
│
├── hooks/                      # Custom React hooks
│   ├── useEmergencyAlert.ts    # Alert trigger and state logic
│   ├── useRealtimeAlerts.ts    # Supabase Realtime subscription
│   ├── useNetworkStatus.ts     # Network connectivity monitor
│   ├── useColorScheme.ts       # Theme detection
│   └── useToast.ts             # Toast notification helper
│
├── services/                   # API and business logic
│   └── deviceService.ts        # Device registration and token management
│
├── lib/                        # External client configuration
│   ├── supabase.ts             # Supabase client (with AsyncStorage session)
│   └── fonts.ts                # Font loading helpers
│
├── types/                      # Shared TypeScript types
├── constants/                  # App-wide constants and theme tokens
├── utils/                      # Pure utility functions
├── supabase/
│   └── migrations/             # SQL migration files (apply in order)
├── assets/
│   ├── images/                 # Icons, splash, adaptive icon
│   └── sounds/                 # emergency_alert.wav
├── app.json                    # Expo config
├── eas.json                    # EAS Build profiles
└── package.json
```

---

## Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI** (for builds): `npm install -g eas-cli`
- A [Supabase](https://supabase.com) project (free tier works)
- A physical device or emulator for testing push notifications
  - Android: Google Play Services required for FCM
  - iOS: Requires a real device (simulators cannot receive push notifications)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd clinic-app/MTU-RapidCare
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the `MTU-RapidCare/` directory (never commit this file):

```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> **Where to find these values:** Supabase Dashboard → Project Settings → API

The `EXPO_PUBLIC_` prefix exposes these values to the Expo bundler at build time. The Supabase client in `lib/supabase.ts` reads them automatically.

### 4. Set up the database

Apply the SQL migrations from the Supabase Dashboard SQL Editor or with the Supabase CLI:

```bash
supabase db push
```

Or manually run the files in `supabase/migrations/` in chronological order.

After applying migrations, enable **Realtime** for the `alerts` table:

1. Supabase Dashboard → Database → Replication
2. Toggle on the `alerts` table

### 5. Run the app

```bash
# Start the Expo development server
npm start

# Run on a connected Android device or emulator
npm run android

# Run on iOS (macOS only)
npm run ios

# Run in browser (limited — push notifications not available)
npm run web
```

Scan the QR code with the [Expo Go](https://expo.dev/client) app, or use the `expo-dev-client` build for full native module support.

---

## Database Schema

### `devices` table

Stores every registered clinic device and its Expo push token.

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Auto-generated device ID |
| `expo_token` | TEXT UNIQUE | Expo push notification token |
| `device_name` | TEXT | Auto-generated label (`RapidCare-01`, ...) |
| `device_number` | SERIAL UNIQUE | Sequential number used to build the device name |
| `platform` | TEXT | `ios` or `android` |
| `created_at` | TIMESTAMPTZ | Registration timestamp |
| `updated_at` | TIMESTAMPTZ | Last updated (auto-maintained by trigger) |

### `alerts` table

Each row represents a single emergency event.

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Auto-generated alert ID |
| `sender_device_id` | UUID (FK → devices) | Device that triggered the alert |
| `message` | TEXT | Alert description |
| `location` | TEXT | Optional location details |
| `status` | TEXT | `active` or `resolved` |
| `extra_data` | JSONB | Arbitrary metadata |
| `created_at` | TIMESTAMPTZ | When the alert was created |
| `resolved_at` | TIMESTAMPTZ | When the alert was resolved (nullable) |

Row-Level Security (RLS) is enabled on both tables. The default policies allow all operations, which is appropriate for a closed clinic network. Tighten these policies before deploying to a production environment with untrusted users.

---

## Key Workflows

### Emergency Reporting

1. A user presses the emergency button on the **Home** tab or opens the **Emergency Report** screen.
2. The form (React Hook Form + Zod) captures the message, location, and emergency type.
3. On submit, `useEmergencyAlert` inserts a row into the `alerts` table via the Supabase client.
4. A Supabase Database Webhook or Edge Function fires to deliver push notifications to all other registered devices.

### Real-time Alerts

The `useRealtimeAlerts` hook maintains a live Supabase Realtime subscription:

```ts
supabase
  .channel('alerts')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, handler)
  .subscribe();
```

All active subscribers receive the new alert immediately, updating the UI and triggering an audio cue.

### Push Notifications

On first launch, `deviceService.ts` requests notification permissions, retrieves the Expo push token, and upserts the device record in the `devices` table. Background notifications are delivered via:

- **Android**: Firebase Cloud Messaging (FCM) — `google-services.json` must be present and the FCM server key uploaded to the Expo dashboard.
- **iOS**: Apple Push Notification service (APNs) — upload your `.p8` key in the Expo dashboard.

---

## Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
# APK for Android (internal testing / sideload)
eas build --platform android --profile preview

# AAB for Google Play submission
eas build --platform android --profile production

# iOS build (requires Apple Developer account)
eas build --platform ios --profile production
```

Build profiles are defined in `eas.json`.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## Author

Developed by **Shemaiah Yaba-Shiaka** and **HEXA**.
