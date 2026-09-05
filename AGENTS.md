# BestieeCP (Control Panel) Guide

`BestieeCP` is the **Superadmin / Platform Operations Portal** for the Bestiee platform. It provides administrative tooling to monitor tenants, process financial settlements, oversee support tickets, configure AI parameters, and manage platform-wide announcements.

---

## 1. Tech Stack & Ports

- **Framework:** Next.js 16 (App Router) with React 19
- **Bundler:** Webpack (`next dev --webpack -p 3001`)
- **Port:** `3001`
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **State Management:** Zustand (`zustand`)
- **Data & Auth:** Convex Client (`convex` 1.34+), `@convex-dev/auth`
- **UI & Visualization:** Framer Motion, Recharts, React Icons, React Multi Date Picker
- **Package Manager:** `npm`

---

## 2. Key Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Run development server with Webpack on **port 3001** |
| `npm run build` | Next.js production build |
| `npm run start` | Run production build on port 3001 |
| `npm run lint` | Run ESLint |

---

## 3. Directory & Route Map

```text
src/
├── app/
│   ├── (dashboard)/            # Authenticated admin routes
│   │   ├── ai/                 # Global platform AI settings & prompt configuration
│   │   ├── announcements/      # Platform-wide tenant & user announcements
│   │   ├── financial/          # Merchant settlements, commission rates, payouts
│   │   ├── members/            # Internal operator access & roles
│   │   ├── support/            # Platform support ticket queues
│   │   ├── tenants/            # Tenant registry, onboarding, status toggles
│   │   ├── users/              # Global customer and business user accounts
│   │   └── profile/            # Operator profile settings
│   └── login/                  # Superadmin login with Convex Auth
├── components/                 # Reusable UI components & dialogs
├── hooks/                      # Custom React / Convex client hooks
└── store/                      # Zustand state slices
convex/
└── _generated/                 # READ-ONLY mirrored types from BestieeBackend
```

---

## 4. Invariants & Rules

1. **Read-Only Convex Directory:**
   `convex/_generated/` is synced automatically from `BestieeBackend`. **Never edit it here directly.** If new types or functions are required, modify `BestieeBackend` and run `npm run sync` there.
2. **Bundler Note:**
   `BestieeCP` uses Webpack mode (`--webpack`) for development compatibility with certain visualization and map libraries (Leaflet). Do not remove the `--webpack` flag in `package.json`.
3. **Admin Authorization Guard:**
   Every dashboard view must verify platform-operator permissions. Standard tenant owners or regular consumers must never access `BestieeCP` routes.
4. **Tailwind CSS v4:**
   Follow modern Tailwind v4 patterns (CSS-first configuration via `@import "tailwindcss";` in global stylesheet). Avoid legacy `tailwind.config.js` setups.
