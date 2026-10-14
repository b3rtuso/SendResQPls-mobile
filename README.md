# SendResQPls — Mobile

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![Android](https://img.shields.io/badge/Android-SDK_29+-3DDC84?logo=android&logoColor=white&style=flat-square)

Citizen emergency reporting app for **MDRRMO Balayan**. Residents of Balayan, Batangas can use it to report emergencies, track response status in real time, and receive notifications when their report is updated.

---

## Features

| Feature | Description |
|---|---|
| **Registration & Verification** | Citizen sign-up with email verification |
| **Incident Reporting** | Photo capture, GPS location, and hazard type selection |
| **Real-Time Tracking** | Live updates on incident status |
| **Push Notifications** | Alerts when report status changes |
| **Offline Queue** | Reports are saved offline and sent automatically once reconnected |
| **Emergency Hotlines** | One-tap local emergency contacts |
| **Safety Tips** | Disaster preparedness guidance |
| **Incident History** | Past reports and their resolution status |
| **Profile Management** | Edit personal info and reset password |
| **Responsive Design** | Adapts to phones, tablets, and larger screens |

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| Native Shell | Capacitor 8 (Android) |

---

## Getting Started

**Prerequisites:** Node.js v20+, npm v10+, Android Studio, Java 17+, Android SDK 29+

```bash
npm install
npm run dev        # browser development (local network supported)
npm run build      # production web build
npm run cap:sync   # sync build into Android project
npm run cap:open   # open in Android Studio, then Run ▶
```

> Configuration values are provided by the project maintainers and must never be committed to version control.

---

## Android Permissions

| Permission | Reason |
|---|---|
| `CAMERA` | Capturing incident photos |
| `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` | Locating the incident |
| `POST_NOTIFICATIONS` | Receiving status alerts |
| `INTERNET` | Sending reports and receiving updates |

---

## Legal & Compliance

- **Terms and Conditions**: See [TERMS_AND_CONDITIONS.md](./TERMS_AND_CONDITIONS.md) (includes PD 1727 on false emergency reports)
- **Privacy Policy**: See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) (compliant with the Data Privacy Act of 2012, RA 10173)

---

## License

Developed for and operated by **MDRRMO Balayan**, Municipality of Balayan, Batangas, Philippines. All rights reserved.
