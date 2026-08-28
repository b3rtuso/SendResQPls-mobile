# disaster-mobile

SendResQPls citizen emergency reporting app — Capacitor + Vite + React.

## Stack

- Vite + React + TypeScript
- Capacitor v8 (Android)
- Tailwind CSS v4
- shadcn/ui component primitives
- React Router, Axios, FCM Push Notifications

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

## Build for Web (Vercel live-reload)

```bash
npm run build
# Deploy dist/ to your Vercel project
# Update capacitor.config.ts server.url to your new Vercel URL
```

## Build Android APK

```bash
npm run build
npm run cap:sync       # syncs dist/ into android/
npm run cap:open       # opens Android Studio to build APK
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `https://your-api.com/api`) |

## Vercel Middleware

`middleware.ts` guards all `/mobile/*` routes — only allows the Capacitor APK
(identified by the `SendResQPls-App` User-Agent token set in `capacitor.config.ts`).
Browser visitors are redirected away.

## Important: Capacitor URL

After deploying to a new Vercel project, update `capacitor.config.ts`:

```ts
server: {
  url: 'https://YOUR-NEW-VERCEL-URL.vercel.app/mobile',
  ...
}
```

Then rebuild the APK.