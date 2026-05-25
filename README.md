# Maison Aurelle

> AI-Integrated Fashion E-Commerce Platform
> Built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Prisma

A premium fashion atelier inspired by Pakistani luxury brands, featuring an AI-driven recommendation engine, smart search with synonym expansion, customer behaviour analytics, and a full admin dashboard.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)

---

## Highlights

- **Server Components everywhere** — pages render on the server, hydrate the interactive bits
- **Hybrid AI engine** — collaborative + content-based + popularity scoring
- **Smart search** — synonym expansion (`wedding ↔ bridal`) + fuzzy typo tolerance
- **Server-side admin guard** — non-admins never receive admin HTML, no client-side route protection theatre
- **Session auth via JWT cookies** — using `jose` for edge compatibility
- **Framer Motion** for choreographed page entries and component transitions
- **Premium design system** — Cormorant Garamond + Inter, sophisticated neutrals, generous whitespace

## Quick Start

```bash
npm install
npm run db:push      # Create SQLite tables
npm run db:seed      # Populate sample products + accounts
npm run dev          # http://localhost:3000
```

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@maisonaurelle.pk | password123 |
| Customer | sara@example.com | password123 |
| Customer | fatima@example.com | password123 |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Database | SQLite (dev) / PostgreSQL (prod via Vercel + Neon) |
| ORM | Prisma 5 |
| Auth | Custom session-based with `jose` (JWT) + `bcryptjs` |
| State | Zustand (lightweight client store) |
| Validation | Zod |

## Project Structure

```
.
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Home
│   ├── shop/
│   │   ├── page.tsx            # Catalog (SSR)
│   │   ├── ShopClient.tsx      # Filters/sort (CSR)
│   │   └── [slug]/             # Product detail
│   ├── cart/, checkout/        # Bag flow
│   ├── login/, register/       # Auth (auto-redirect if signed in)
│   ├── admin/
│   │   ├── layout.tsx          # SERVER-SIDE GUARD
│   │   ├── page.tsx            # Dashboard with live stats
│   │   ├── AdminSidebar.tsx
│   │   └── AdminCharts.tsx
│   ├── about/, contact/        # Marketing pages
│   ├── api/                    # All API routes
│   │   ├── auth/{login,register,logout,me}/
│   │   ├── products/, products/[slug]/
│   │   ├── cart/, wishlist/, orders/
│   │   ├── recommendations/
│   │   ├── search/             # Smart search endpoint
│   │   ├── newsletter/, contact/
│   │   └── admin/{dashboard,orders}/
│   ├── globals.css             # Tailwind + design tokens
│   └── not-found.tsx
│
├── components/                 # Reusable UI
│   ├── Header.tsx              # With account dropdown + cart badge
│   ├── Footer.tsx              # Newsletter form integrated
│   ├── ProductCard.tsx
│   ├── Hero.tsx, AISection.tsx, StorySection.tsx, Features.tsx
│   ├── SectionHeader.tsx
│   ├── CollectionCard.tsx
│   └── Toast.tsx               # Global toast (Zustand-driven)
│
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # Session create/destroy/verify
│   ├── recommendations.ts      # AI engine (port of Python algorithms)
│   ├── store.ts                # Zustand store
│   ├── utils.ts                # cn(), formatPrice(), calculateTotals()
│   └── types.ts
│
├── prisma/
│   ├── schema.prisma           # 15 models
│   ├── seed.ts                 # Sample data
│   └── dev.db                  # SQLite (gitignored)
│
├── package.json
├── tailwind.config.ts          # Custom design tokens
├── tsconfig.json
├── next.config.js
└── README.md
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on `localhost:3000` |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run db:push` | Sync schema to database (no migration) |
| `npm run db:seed` | Reset & seed with sample data |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run lint` | ESLint check |

## AI Engine

[`lib/recommendations.ts`](./lib/recommendations.ts) implements a hybrid recommendation engine.

### Personal Recommendations
Builds a behavioural profile from the user's last 30 days of activity, then scores every product:

- **Category match** (strongest signal): +40 / +30 / +20 based on rank
- **Price proximity**: +15 if within user's typical range
- **Quality**: rating × 5, review count, featured boost
- **Recency**: +8 for products under 30 days old
- **Stock penalty**: × 0.5 for out-of-stock items

Activity weights: `view = 1`, `cart = 3`, `wishlist = 4`, `purchase = 10`

### Similar Products
Content-based filtering on the product detail page:
- Same category: +50
- Tag overlap: +15 per matching tag
- Price proximity: −1 per PKR 1,000 difference

### Frequently Bought Together
Collaborative filtering from real order history. Falls back to similar products if no co-purchase data exists.

### Smart Search
- **Synonym expansion**: `wedding ↔ bridal`, `summer ↔ lawn/cotton`, etc.
- **Multi-field scoring**: name (25), tags (20), category (15), description (8), exact phrase (100)
- **Quality boost** when matches found

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   ```
   DATABASE_URL=<postgres connection string>
   AUTH_SECRET=<random 32-character string>
   ```
4. Use [Neon](https://neon.tech) (free tier) for PostgreSQL — switch `provider = "postgresql"` in `prisma/schema.prisma` first
5. Deploy

The `postinstall` script runs `prisma generate` automatically.

## Database

Default development uses **SQLite** (zero config). For production, switch to **PostgreSQL**:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"   // change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then update `DATABASE_URL` in `.env` and run `npm run db:push`.

## Security

- Passwords hashed with **bcryptjs** (10 rounds)
- Sessions are signed JWTs in `httpOnly` cookies
- Admin routes guarded **on the server** in `app/admin/layout.tsx` — non-admin requests get a 307 redirect before any HTML is generated
- Zod validates every API input
- Prisma uses parameterized queries (no SQL injection surface)
- CSRF protection via `sameSite: 'lax'` cookies

## Development Notes

- `app/admin/page.tsx` is a **Server Component** — DB queries happen at request time, not in the browser
- The `/api/recommendations` route delegates to `lib/recommendations.ts` for personal/similar/trending/frequently-bought
- The `Toast` component is mounted on every page that needs it; messages dispatched via `useStore().showToast(message)`
- `Header.tsx` calls `/api/auth/me` and `/api/cart?count=true` once on mount to hydrate the session/cart state
- Animations use `whileInView` with `{ once: true }` so they don't replay on scroll

## License

MIT — Built as a portfolio project showcasing modern full-stack Next.js development.
