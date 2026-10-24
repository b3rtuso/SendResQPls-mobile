# Project: SendResQPls-mobile Responsive Layout Overhaul

## Architecture
- **Framework & Tooling**: React 19, TypeScript, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), Capacitor Android.
- **Layout Model**:
  - Global Root Shell: `AuthenticatedMobileLayout` in `src/App.tsx` hosting `GlobalStatusSync`, `mobile-tab-view` `<Outlet />`, and `BottomNav`.
  - Fluid Edge-to-Edge Coverage: Background (`#F1F5F9` / `#FFFFFF`) and branded headers span 100% viewport width on all device form factors (375px to 1440px+).
  - Max-Width Content Containers: Inner content is constrained within `max-w-3xl` / `max-w-4xl mx-auto px-4 sm:px-6` to ensure optimal readability, thumb reach, and balanced aesthetics without letterboxing the entire viewport.
  - Stacking Context & Z-Index Hierarchy:
    - `200000`: `MobileToastProvider` (global emergency push alerts)
    - `100000`–`100005`: All Modals & Overlays (`LegalModal`, `ConfirmModal`, `LocationSuccessModal`, Location modal, Report Success overlay, Delivery Tracker)
    - `99999`: `BottomNav` (persistent edge-to-edge navigation bar)
    - `1`–`10`: In-page sticky headers, tabs, badges

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Fluid Shell Container | Eliminate 540px max-width from `.mobile-shell` & `.mobile-auth` in `App.css` and remove artificial tablet box-shadow | M1 | Survey / R1 (DONE) |
| 2 | Deduplicate Nested Shells | Remove redundant `.mobile-shell` wrappers from all child pages (`MobileHome`, `MobileReport`, `MobileHistory`, `MobileNotifications`, `MobileProfile`), replacing with semantic full-width containers | M1 | Survey / R1 (DONE) |
| 3 | Fluid Docked BottomNav | Remove 540px cap from `.bottom-nav`; span 100% width edge-to-edge; keep tabs centered inside `max-w-3xl` container | M1 | Survey / R1 & R3 (DONE) |
| 4 | Centered Toast Positioning | Simplify `MobileToastProvider` coordinates to standard responsive centering (`maxWidth: 520px`, centered) without 540px offset formula | M1 | Survey / R3 (DONE) |
| 5 | Branded Headers Edge-to-Edge | Allow top blue gradients in `MobileHome`, `MobileReport`, `MobileHistory`, `MobileNotifications` to span 100% width with inner `max-w-4xl` centering | M1 | Survey / R1 & R2 (DONE) |
| 6 | Hotlines 4-Column Adaptation | Adapt Emergency Hotlines from `grid-cols-2` to `sm:grid-cols-4` on tablet screens (>=640px) | M1 | Survey / R2 (DONE) |
| 7 | Safety Tips 2-Column Adaptation | Adapt Emergency Safety Tips from single-column vertical stack to `sm:grid-cols-2` on tablet screens | M1 | Survey / R2 (DONE) |
| 8 | Punchy Centered SOS Card | Maintain strong visual weight and centered focus (`max-w-xl mx-auto`) with responsive padding (`sm:p-8 md:p-10`) | M1 | Survey / R2 (DONE) |
| 9 | Incident Report 2-Column Split | Adapt `MobileReport` on tablets (`md:grid-cols-2`): viewfinder evidence on left, details & submit on right | M1 | Survey / R2 (DONE) |
| 10 | History 2-Column Grid | Adapt Report History feed from stretched full-width rows to `sm:grid-cols-2` balanced cards inside `max-w-4xl` | M1 | Survey / R2 (DONE) |
| 11 | Notifications 2-Column Grid | Adapt Notifications feed from stretched rows to `sm:grid-cols-2` balanced cards inside `max-w-4xl` | M1 | Survey / R2 (DONE) |
| 12 | Profile View Centering | Center Main Profile hero/menu within `max-w-2xl` and subpage forms within `max-w-2xl` / `max-w-3xl` | M1 | Survey / R2 (DONE) |
| 13 | Responsive Auth Card Layout | Center Login, Signup, Forgot Password cards (`max-w-md sm:max-w-lg mx-auto sm:my-10`) on tablets with edge-to-edge `#F1F5F9` backdrop | M1 | Survey / R2 (DONE) |
| 14 | Modal Z-Index Alignment | Fix Z-index in `MobileHome` location modal (`10000` -> `100000`) and `MobileReport` success overlay (`11000` -> `100000`) so `BottomNav` is properly layered beneath modal backdrops | M1 | Survey / R3 (DONE) |
| 15 | Modal & Overlay Fluid Bounds | Verify full-bleed backdrop coverage and centering for `LegalModal`, `ConfirmModal`, `LocationSuccessModal`, and `DeliveryTracker` across viewports | M1 | Survey / R3 (DONE) |
| 16 | Repository Mirroring | Mirror all changes to `C:\Users\Marriel\StudioProjects\SendResQPls-mobile` and verify 0 byte-level code diffs in `src/` | M2 | Survey / R4 |
| 17 | Multi-Viewport Build & Testing | Verify `npm run build` succeeds with 0 errors in both repositories and test layouts across 375px, 412px, 600-768px, 800-1024px, >1024px | M2 | Survey / R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Responsive Layout & Navigation Overhaul (R1, R2, R3) | `App.css`, `App.tsx`, `BottomNav.tsx`, `MobileToastProvider.tsx`, `MobileHome.tsx`, `MobileReport.tsx`, `MobileHistory.tsx`, `MobileNotifications.tsx`, `MobileProfile.tsx`, Auth screens | none | DONE |
| 2 | Repository Mirroring, Build Verification & Multi-Viewport Testing (R4) | Mirror to `StudioProjects`, dual `npm run build` verification, multi-viewport inspection (375px, 412px, 600-768px, 800-1024px, >1024px) | M1 | DONE |

## Interface Contracts
### Global Shell ↔ Child Pages
- `AuthenticatedMobileLayout` in `App.tsx` provides the root container `.mobile-shell`:
  `width: 100%; min-height: 100dvh; background: #F1F5F9; display: flex; flex-direction: column; overflow-x: clip;`
- Child pages rendered in `<Outlet />` MUST NOT declare `.mobile-shell`.
- Child pages render as `w-full flex-1 flex flex-col` and manage inner content readability via `max-w-3xl` or `max-w-4xl mx-auto w-full px-4 sm:px-6`.

### Navigation ↔ Viewport
- `BottomNav` docks at `position: fixed; bottom: 0; left: 0; right: 0; width: 100%; z-index: 99999;`
- Inner container `.bottom-nav-inner` has `max-width: 768px; margin: 0 auto; display: grid; grid-template-columns: repeat(5, 1fr); height: 100%;`

### Modals ↔ Stacking Order
- All modals and overlays have `z-index: 100000` or higher, ensuring they cleanly obscure `BottomNav` (`z-index: 99999`) when visible.
- Toasts render at `z-index: 200000`.

## Code Layout
- `src/App.css` — Global styles, `.mobile-shell`, `.mobile-auth`
- `src/App.tsx` — Main application router & `AuthenticatedMobileLayout`
- `src/components/BottomNav.tsx` — Persistent 5-tab docked bottom navigation
- `src/components/MobileToastProvider.tsx` — Push notification toast container
- `src/pages/mobile/MobileHome.tsx` — Home screen (hotlines, safety tips, SOS card)
- `src/pages/mobile/MobileReport.tsx` — Incident reporting (evidence capture, situation details)
- `src/pages/mobile/MobileHistory.tsx` — Citizen report history & delivery tracker
- `src/pages/mobile/MobileNotifications.tsx` — Incident response notifications
- `src/pages/mobile/MobileProfile.tsx` — User profile, settings, help & FAQs
- `src/pages/mobile/MobileLogin.tsx`, `MobileSignup.tsx`, `MobileForgotPassword.tsx`, `MobileResetPassword.tsx` — Authentication
