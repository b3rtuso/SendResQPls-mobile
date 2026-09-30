# SendResQPls — Mobile

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white&style=flat-square)
![Android](https://img.shields.io/badge/Android-SDK_29+-3DDC84?logo=android&logoColor=white&style=flat-square)

Citizen-facing emergency reporting app for **MDRRMO Balayan**. Built with React + Capacitor and shipped as a native Android APK, it lets residents of Balayan, Batangas report emergency incidents, track response status in real time, and receive push notifications when their report is updated.

---

## Overview

`SendResQPls-mobile` is the public-facing layer of the SendResQPls emergency response platform. Citizens open the app, log in (or register with email OTP), submit an incident with a photo and GPS pin, and receive live status updates as MDRRMO dispatchers coordinate the response. The underlying web layer is compiled with Vite and synced into a native Android shell via Capacitor.

---

## Features

| Feature | Description |
|---|---|
| **Registration & OTP** | Citizen sign-up with email OTP verification |
| **Incident Submission** | Photo capture, GPS location, hazard type selection |
| **Real-Time Status Tracking** | Server-Sent Events (SSE) stream for live incident updates |
| **Push Notifications** | Firebase FCM alerts when incident status changes |
| **Emergency Hotlines** | Directory of local emergency contact numbers |
| **Incident History** | View all past reports and their resolution status |
| **Profile Management** | Edit personal info and reset password |

---

## Tech Stack

### Core

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| Native Shell | Capacitor 8 (Android) |

### Key Packages

| Package | Purpose |
|---|---|
| `@capacitor/android` | Native Android integration |
| `@capacitor/push-notifications` | Firebase FCM integration |
| `@capacitor/splash-screen` | Splash screen control |
| `@capacitor/app` | App lifecycle events |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client for REST API |
| `@microsoft/fetch-event-source` | SSE stream for real-time updates |
| `lucide-react` / `react-icons` | Icon libraries |
| `@radix-ui/*` | Accessible UI primitives |
| `clsx` / `tailwind-merge` | Conditional class utilities |

---

## Prerequisites

### General

- [Node.js](https://nodejs.org/) **v20+**
- [npm](https://www.npmjs.com/) **v10+**

### Android Build

- [Android Studio](https://developer.android.com/studio) (Ladybug or later recommended)
- **Java 17+** (bundled with Android Studio or installed separately)
- **Android SDK 29+** (configure via Android Studio SDK Manager)
- A connected Android device or emulator (API level 29+)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/SendResQPls-mobile.git
cd SendResQPls-mobile

# 2. Install dependencies
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=https://your-backend-api-url.com
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the SendResQPls backend API |

> **Note:** All `VITE_` prefixed variables are inlined at build time by Vite and bundled into the app. Do **not** place secrets here.

---

## Running the App

### Web / Development Mode

Runs the app in the browser with hot-module replacement. Useful for rapid UI development.

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Android Build & Deployment

#### 1. Build the web layer

```bash
npm run build
```

This outputs the compiled web assets to `dist/`.

#### 2. Sync to Android

```bash
npm run cap:sync
```

Copies the `dist/` output into the Capacitor Android project and updates native dependencies.

#### 3. Open in Android Studio

```bash
npm run cap:open
```

This opens the `android/` project in Android Studio. From there:

1. Select your target device or emulator.
2. Click **Run ▶** to build and install the APK.

---

## NPM Scripts Reference

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server (browser) |
| `npm run build` | Production build to `dist/` |
| `npm run cap:sync` | Sync web build → Android project |
| `npm run cap:open` | Open Android project in Android Studio |

---

## Required Android Permissions

The following permissions are declared in `AndroidManifest.xml` and requested at runtime as needed:

| Permission | Reason |
|---|---|
| `CAMERA` | Capturing incident photos |
| `ACCESS_FINE_LOCATION` | Pinpointing GPS coordinates for incident location |
| `ACCESS_COARSE_LOCATION` | Fallback location (network-based) |
| `POST_NOTIFICATIONS` | Receiving Firebase push notification alerts |
| `INTERNET` | API communication, SSE stream, push services |

---

## Legal & Compliance

- **Terms and Conditions:** Outlines user responsibilities, zero tolerance for hoax/false emergency reports under PD 1727, auxiliary service disclaimers, and jurisdiction. See [TERMS_AND_CONDITIONS.md](./TERMS_AND_CONDITIONS.md).
- **Privacy Policy:** Complies with the Philippine Data Privacy Act of 2012 (RA 10173). Outlines data categories collected, life-safety dispatch purposes, strict non-commercial use, and user rights. See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md).

---

## License

This project is developed for and operated by **MDRRMO Balayan**, Municipality of Balayan, Batangas, Philippines. All rights reserved.
