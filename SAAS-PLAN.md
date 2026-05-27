# Pakistan Business OS — Multi-Industry SaaS Plan (A to Z)

> **Document version**: 2.0
> **Last updated**: 2026-05-26
> **Goal**: Build a multi-tenant, **multi-industry** Business OS for Pakistani SMBs — stock management + invoicing + free online store + AI — affordable to any small business across verticals (fashion, retail, wholesale, restaurant, pharmacy, salon, etc.).
> **Status**: Active commercial product roadmap. Not an FYP scope.

---

## Strategic Pivots Summary

This project evolved through 3 strategic pivots from its original FYP concept:

| Pivot | From | To | Reason |
|---|---|---|---|
| **1** | Single fashion e-commerce store (Maison Aurelle) | Multi-tenant fashion SaaS | Bigger market, recurring revenue |
| **2** | E-commerce-only platform | Business OS (stock + invoice + store) | Stronger value prop, less competition |
| **3** | Fashion-only | Multi-industry (any business type) | 70x TAM expansion |

**Maison Aurelle** is **retained as the fashion-vertical theme** — premium aesthetic preserved as ONE template among many industry-specific designs.

---

## Table of Contents

1. [Vision & Goals](#1-vision--goals)
2. [Industry Strategy & Multi-Vertical Approach](#2-industry-strategy--multi-vertical-approach)
3. [Current State Assessment](#3-current-state-assessment)
4. [Target Architecture](#4-target-architecture)
5. [Tech Stack Decisions](#5-tech-stack-decisions)
6. [Database Schema (Full)](#6-database-schema-full)
7. [Implementation Phases](#7-implementation-phases)
8. [Tenant Resolution Strategy](#8-tenant-resolution-strategy)
9. [Theme & Customization System](#9-theme--customization-system)
10. [Super Admin System](#10-super-admin-system)
11. [Stock Management Module](#11-stock-management-module)
12. [Billing & Subscription Plans](#12-billing--subscription-plans)
13. [Pricing Strategy](#13-pricing-strategy)
14. [Cost Breakdown](#14-cost-breakdown)
15. [Cost Control Strategy (Per-Tenant Economics)](#15-cost-control-strategy-per-tenant-economics)
16. [Timeline & Milestones](#16-timeline--milestones)
17. [Risks & Mitigations](#17-risks--mitigations)
18. [Security Checklist](#18-security-checklist)
19. [Launch Checklist](#19-launch-checklist)
20. [Post-Launch Roadmap](#20-post-launch-roadmap)
21. [Glossary](#21-glossary)

---

## 1. Vision & Goals

### Vision
**"Pakistan ka Operating System for Small Business"** — Pakistani SMBs (kisi bhi industry ke) ko aik affordable, modern, cloud-based platform jismein stock management, invoicing, customer ledger, aur free online store sab kuch built-in ho. **Tally + QuickBooks + Shopify ka modern, Pakistani-market-fit replacement.**

### What Makes This Different
- **Not just e-commerce**: Stock + invoice + customers + reports — yeh roz use hone wala tool hai, online store ek bonus feature hai
- **Industry-flexible**: Fashion ho ya hardware shop, restaurant ho ya pharmacy — same platform, industry-specific configuration
- **Pakistan-first**: FBR e-invoicing, JazzCash/EasyPaisa, COD, Urdu support — built-in, not afterthought
- **10x cheaper** than international competitors (Tally ₨5000+, QuickBooks ₨8400+) — Pakistani price sensitivity respected

### Primary Goals
- **Multi-tenant**: Aik codebase, multiple businesses across industries
- **Multi-industry**: Retail, wholesale, restaurant, pharmacy, salon, fashion, etc.
- **Industry-specific themes**: Har vertical ka apna design language (Maison Aurelle = fashion theme, plus 5+ others)
- **Industry-specific modules**: Optional add-ons activated based on business type (expiry tracking for pharmacy, menus for restaurants, etc.)
- **Affordable**: ₨0 free tier → ₨12,999 enterprise — Pakistani market pricing
- **Self-service**: 5-minute signup → live business OS with industry-relevant setup
- **AI built-in**: Recommendations, smart reorder suggestions, content generation
- **Pakistan-first features**: FBR e-invoicing, all local payment methods, Urdu/English UI

### Non-Goals (V1 ke liye nahi)
- Multi-currency (Pakistan-only initially, PKR-native)
- Mobile native apps (web-first, mobile-responsive PWA sufficient)
- Marketplace features (cross-tenant search/discovery)
- Manufacturing/MRP/BOM (V2+ scope)
- Full-blown enterprise ERP (HR, payroll, fixed assets — V2+ scope)
- Restaurant POS hardware integration (V1.5)
- Real estate / event management verticals (V2+)

---

## 2. Industry Strategy & Multi-Vertical Approach

### Strategic Direction
Platform is **industry-agnostic at core**, with **industry-specific modules and themes** layered on top. Tenant signup pe industry select karta hai → relevant features + theme automatically configured.

### Launch Verticals (V1 — First 3 Industries)

Phase 1 launch ke liye **3 industries** focus karna hai. Yeh teen technically similar hain (product + inventory + invoice driven), so same core modules cover karte hain — quick to ship:

| # | Industry | Why Picked First |
|---|---|---|
| **1** | **Fashion & Apparel** | Existing Maison Aurelle theme ready, premium design polish, demo content available |
| **2** | **General Retail** (electronics, gift shops, home goods, accessories, books) | Largest TAM in Pakistan, technically similar to fashion, neutral modern theme needed |
| **3** | **Wholesale & Distribution** | High-value B2B segment, sticky usage (daily invoices), less competition than retail |

**Why not restaurant/pharmacy/salon in V1?** Inhe **fundamentally different modules** chahiye (menus, expiry batches, appointments). V1.5 + V2 mein add karenge.

### Industry Roadmap

| Phase | Industries Added | Timeline |
|---|---|---|
| **V1 Launch** | Fashion, General Retail, Wholesale | Months 1-5 |
| **V1.5** | Restaurant/Cafe, Grocery/Kiryana | Months 6-9 |
| **V2** | Pharmacy, Salon/Spa, Beauty | Months 10-12 |
| **V2.5+** | Hardware/Auto Parts, Gym/Fitness, Services | Year 2 |
| **Future** | Manufacturing, Real Estate, Event Management | Year 2+ |

### Industry-Specific Themes (Each Vertical = Its Own Look)

Signup mein industry select karne pe theme auto-apply hota hai. Tenants customize kar sakte hain baad mein. **Maison Aurelle theme = Fashion vertical default** (preserved as-is from original design).

| Industry | Theme Name | Aesthetic | Status |
|---|---|---|---|
| **Fashion & Apparel** | **Maison Aurelle Classic** | Cream/charcoal/gold luxury, Cormorant Garamond + Inter + Italianno | ✅ Already built |
| **General Retail** | **Modern Retail** | Clean white/blue/grey, sans-serif (Inter), tech-product feel, generous whitespace | 🔨 To build |
| **Wholesale** | **Wholesale Pro** | Professional, table-heavy, data-dense, B2B blue/grey palette, no-frills | 🔨 To build |
| **Restaurant** (V1.5) | **Bistro** | Warm earth tones, food photography focused, menu-card aesthetic | Future |
| **Grocery** (V1.5) | **MarketFresh** | Bright, friendly, large product imagery, family-oriented | Future |
| **Pharmacy** (V2) | **MedCare** | Clean medical white/green, trust-focused, large text for older users | Future |
| **Salon** (V2) | **Glow** | Soft pastels, lifestyle imagery, appointment-focused | Future |

**For each theme**: Tenant can still customize colors, fonts, logo within tier limits (per [Section 9](#9-theme--customization-system)).

### Core vs Industry Modules

**Core Modules** (every tenant gets, all industries):
1. Multi-tenant account
2. User & staff management
3. Customer database + ledger
4. Product/inventory management
5. Invoice generator
6. Payments tracking
7. Reports & analytics
8. Settings & customization

**Industry Modules** (activated based on business type):

| Module | Activated For |
|---|---|
| **Online Store / E-commerce** | Fashion, Retail, Grocery, Restaurant (menu showcase). Optional toggle for all. |
| **Wholesale Pricing** (bulk discounts, MOQ, tiered pricing) | Wholesale, B2B retail |
| **Supplier & Purchase Orders** | All (more critical for wholesale/retail) |
| **Multi-Warehouse** | Wholesale, multi-location retail |
| **Menu & Recipes** | Restaurant only |
| **Table Management / KOT** | Restaurant only |
| **Batch & Expiry Tracking** | Pharmacy, grocery, beauty |
| **Appointments** | Salon, gym, service businesses |
| **Memberships / Recurring Billing** | Gym, salon, subscription businesses |
| **Serial Numbers** | Electronics, hardware, auto parts |

### Signup Flow with Industry Selection

```
Step 1: Account creation
   - Email, password, name, phone

Step 2: Business profile
   - Business name
   - Suggested slug → editable
   - Industry selection:
       🏪 Fashion / Boutique / Apparel
       🛒 General Retail (electronics, gift, home, books, etc.)
       📦 Wholesale / Distribution
       🍽️ Restaurant / Cafe (Coming soon — V1.5)
       💊 Pharmacy (Coming soon — V2)
       💇 Salon / Spa (Coming soon — V2)
       ❓ Other / Custom (uses General Retail base)

Step 3: Industry-specific quick setup
   - Fashion: Brand vibe (luxury/casual/streetwear), size system, sample products
   - Retail: Primary categories, sample products, payment methods
   - Wholesale: Customer types (B2B/B2C mix), price tiers, sample suppliers

Step 4: Plan selection (Free / Shop / Business / Enterprise)

Step 5: Onboarding tour
   - Industry-relevant feature highlights
   - First product creation walkthrough
   - First invoice walkthrough
   - Optional: enable online store
```

### Platform Brand Naming

> ⚠️ **DECISION PENDING**: "Maison Aurelle" naam fashion-specific hai aur multi-industry positioning ke saath conflict karta hai. Platform ke liye naya naam chahiye finalize before Phase 0.

**Maison Aurelle ka future role**: Platform ki **fashion-vertical theme** ke roop mein retain hogi. Sirf fashion industry tenants ke liye default theme.

**Recommended platform names** (in order of preference):

| Name | Pros | Cons |
|---|---|---|
| **DukaanOS** | Pakistani identity, "OS for shops", modern, memorable | Slightly tech-jargon |
| **Bahi.pk** | Traditional Urdu (ledger), .pk domain natural, trust factor | Less international scaling |
| **Karobaar** | Urdu for "business", professional, broad | Common word, domain availability risk |
| **Bizmate** | International appeal, friendly | Generic, no Pakistani identity |
| **Tijarat** | Arabic-Urdu (trade), professional B2B | Less consumer-friendly |

**Action**: Brand name finalize before Phase 0 (Postgres migration) starts. Domain registration ke saath linked decision hai.

### Schema Implications (Generic Product Architecture)

Multi-industry support ke liye **core Product schema generic banani parti hai**. Industry-specific fields nullable + custom fields via JSON:

```prisma
model Product {
  id          Int    @id @default(autoincrement())
  tenantId    Int
  name        String
  sku         String
  description String?

  // Generic units (works across industries)
  unit        String  @default("piece")    // piece | kg | meter | liter | dozen | box | bottle
  unitPrice   Float
  cost        Float?                        // for margin calculation

  // Generic variants (size/color for fashion, weight/grade for grocery, pack-size for wholesale)
  hasVariants Boolean @default(false)
  variants    ProductVariant[]

  // Industry-specific fields (nullable — only relevant industries fill these)
  expiryDate     DateTime?     // pharmacy, grocery
  batchNumber    String?       // pharmacy, industrial
  serialNumber   String?       // electronics, hardware
  weight         Float?        // grocery, jewellery
  brand          String?
  manufacturer   String?

  // Custom fields (tenant-defined, industry-specific)
  customFields   Json?         // {"size": "L", "color": "red"} OR {"voltage": "220V"} OR {"prescription": true}

  // Stock (float to support kg/meter/liter)
  stockQuantity     Float   @default(0)
  lowStockThreshold Float   @default(5)

  // E-commerce (optional — not all businesses sell online)
  showOnStore    Boolean   @default(false)
  storeImages    String[]
  // ... existing fields
}

model TenantBusinessConfig {
  id           Int     @id @default(autoincrement())
  tenantId     Int     @unique
  industry     String  // "fashion" | "retail" | "wholesale" | "restaurant" | etc.

  // Module toggles (industry default + tenant override)
  showInventory      Boolean @default(true)
  showInvoicing      Boolean @default(true)
  showOnlineStore    Boolean @default(true)
  showAppointments   Boolean @default(false)
  showRecipes        Boolean @default(false)
  showBatchExpiry    Boolean @default(false)
  showSerialNumbers  Boolean @default(false)
  showWholesalePricing Boolean @default(false)

  // Defaults per industry
  defaultUnit        String  @default("piece")
  supportedUnits     String  @default("piece,kg,meter,liter,box")

  // Tax setup (Pakistan default 17% GST)
  taxRate            Float   @default(17)
  taxName            String  @default("Sales Tax")
  hasGST             Boolean @default(true)
  hasWithholdingTax  Boolean @default(false)
}

model CustomField {
  id          Int     @id @default(autoincrement())
  tenantId    Int
  appliesTo   String  // "product" | "customer" | "invoice"
  fieldName   String
  fieldType   String  // "text" | "number" | "date" | "select" | "boolean"
  options     String? // JSON for select options
  isRequired  Boolean @default(false)
  sortOrder   Int     @default(0)
}
```

Full schema details in [Section 6: Database Schema](#6-database-schema-full).

### Marketing Pivot (Industry-Aware)

| Old (Fashion-only) | New (Multi-industry) |
|---|---|
| Instagram fashion influencers | YouTube Urdu tutorials, industry-specific WhatsApp groups |
| Boutique pages on Facebook | Trade associations (FPCCI, chambers), industry magazines |
| Fashion magazines | Industry-specific publications + trade shows |
| Style bloggers | "Excel chodo, smart business chalao" campaigns |
| Karachi/Lahore D2C focus | Tier 1 + Tier 2 cities (Faisalabad, Multan, Sialkot, Gujranwala) |

Per-industry campaigns:
- **Fashion**: Maison Aurelle showcase + premium aesthetic angle
- **Retail**: "Tally se 5x faster" angle, modern UI demos
- **Wholesale**: Customer ledger + route delivery features

Detailed marketing strategy in [Section 13: Pricing Strategy](#13-pricing-strategy).

### Competitive Positioning (Multi-Industry)

| Competitor | Their Focus | Our Edge |
|---|---|---|
| **Tally** | Accounting-heavy, ugly UI, ₨5000+/mo | Modern UI, cloud, ₨1499/mo, includes store |
| **QuickBooks Online** | Western SMB accounting, ₨8400+/mo | Pakistan-first features, 5x cheaper, multi-industry |
| **Zoho Books** | Accountant-focused, ₨3000+/mo | Shopkeeper-friendly UI, industry templates |
| **Vyapar (India)** | Similar model, India-only | Pakistan-specific (FBR, JazzCash, EasyPaisa) |
| **Shopify** | Pure e-commerce, ₨11000+/mo | All-in-one (not just store), 10x cheaper |
| **Daraz Hub** | Marketplace-only | Your own brand, own customers, all business mgmt |
| **Excel / Notebook** | Most common "competitor" | Automated, accurate, cloud, reports |

**Our unique position**: Pakistan's only **affordable, modern, multi-industry, cloud-based Business OS with free e-commerce included**.

---

## 3. Current State Assessment

### What Exists ✅
- Next.js 15 + React + TypeScript app
- Prisma ORM + SQLite database
- 15 models: User, Product, Category, Order, Cart, Wishlist, etc.
- JWT-based session auth (jose library)
- Admin dashboard with charts
- Gemini AI integration
- Product catalog with sizes/colors/badges
- Order management
- Reviews system
- Newsletter + contact forms
- Promo codes
- User activity tracking (for AI recommendations)
- Premium design system (cream/charcoal/gold, Cormorant/Inter/Italianno fonts)

### What's Missing for SaaS ❌
- Tenant model
- `tenantId` foreign keys on all data tables
- Tenant resolution (subdomain/path/custom domain)
- Tenant admin vs super admin role separation
- Theme configuration system
- Billing/subscription
- Feature gating per plan
- Tenant signup flow
- Multi-tenant aware file uploads
- Audit logging
- Production-grade database (SQLite → PostgreSQL)

### Critical Refactor Needed
- Every Prisma query needs `tenantId` filter (40+ API routes)
- Every uniqueness constraint needs to become per-tenant (`@@unique([tenantId, slug])`)
- Auth middleware needs tenant context
- Image storage path needs `tenants/{tenantId}/` prefix

---

## 4. Target Architecture

### High-Level Diagram

```
┌──────────────────────────────────────────────────────────┐
│  Customer Browser                                         │
│  ali.maisonaurelle.com  OR  alisboutique.com              │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Vercel Edge Network                                      │
│  - CDN, SSL, DDoS protection                              │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Next.js Middleware                                       │
│  - Resolve tenant from hostname/path                      │
│  - Inject tenantId into request context                   │
│  - Block inactive/suspended tenants                       │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Next.js App (Server Components + API Routes)             │
│  - All Prisma queries scoped by tenantId                  │
│  - Theme injected from DB into CSS variables              │
│  - Feature gates check plan + overrides                   │
└──────┬───────────────────────────────────┬───────────────┘
       │                                   │
       ▼                                   ▼
┌─────────────┐                  ┌──────────────────────┐
│ PostgreSQL  │                  │ Cloudflare R2        │
│ (Neon)      │                  │ (Image/file storage) │
│             │                  │ tenants/{id}/...     │
└─────────────┘                  └──────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  External Services                                        │
│  - Gemini API (AI recommendations)                        │
│  - Resend (transactional email)                           │
│  - Stripe (billing)                                       │
│  - JazzCash/EasyPaisa (Pakistan payments)                 │
└──────────────────────────────────────────────────────────┘
```

### Multi-Tenancy Model: **Shared Database, Shared Schema (Row-Level)**

Reason: Cheapest, simplest, scales to 1000s of tenants. Industry standard for early-stage SaaS.

**Isolation guarantee**: Every Prisma query MUST include `tenantId` filter — enforced by middleware + Prisma extensions.

---

## 5. Tech Stack Decisions

| Concern | Choice | Why |
|---|---|---|
| **Framework** | Next.js 15 (existing) | Already in use, App Router, SSR for SEO |
| **Database** | PostgreSQL via Neon | SQLite weak for concurrent writes, Neon has 0.5GB free tier + autoscale |
| **ORM** | Prisma (existing) | Already in use, easy migrations, type-safe |
| **Auth** | jose + JWT cookies (existing) | Already working, edge-compatible |
| **File Storage** | Cloudflare R2 | Free 10GB, S3-compatible, no egress fees |
| **Email** | Resend | 3k/mo free, modern DX |
| **AI** | Gemini API (existing) | Already integrated, free tier generous |
| **Payments (intl)** | Stripe | Standard, supports subscriptions |
| **Payments (PK)** | JazzCash + EasyPaisa | Local market requirement |
| **Hosting** | Vercel | Free Hobby tier, native Next.js |
| **DNS** | Cloudflare | Free, supports custom domains via SaaS feature |
| **Monitoring** | Vercel Analytics + Sentry free | Built-in + error tracking |
| **CI/CD** | Vercel auto-deploy from Git | Zero config |

---

## 6. Database Schema (Full)

### New Models

```prisma
// ============================================
// TENANT (the core SaaS entity)
// ============================================
model Tenant {
  id          Int      @id @default(autoincrement())
  slug        String   @unique               // "alis-boutique"
  name        String                         // "Ali's Boutique"
  ownerEmail  String
  ownerId     Int?                           // FK to User (tenant_admin)
  plan        String   @default("free")      // free | starter | pro | business
  isActive    Boolean  @default(true)
  isSuspended Boolean  @default(false)
  suspensionReason String?

  // Custom domain (Pro+)
  customDomain      String?  @unique
  customDomainVerified Boolean @default(false)

  // Super admin overrides (give features without plan upgrade)
  overrideCustomCSS         Boolean @default(false)
  overrideCustomDomain      Boolean @default(false)
  overrideAI                Boolean @default(false)
  overrideUnlimitedProducts Boolean @default(false)
  overrideNotes             String?
  overrideExpiresAt         DateTime?

  // Trial
  trialEndsAt   DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  theme       TenantTheme?
  settings    TenantSettings?
  subscription Subscription?
  users       User[]
  categories  Category[]
  products    Product[]
  orders      Order[]
  promoCodes  PromoCode[]
  newsletterSubscribers NewsletterSubscriber[]
  contactInquiries ContactInquiry[]
  auditLogs   AuditLog[]

  @@index([slug])
  @@index([customDomain])
  @@index([plan])
  @@index([isActive])
}

// ============================================
// TENANT THEME (visual customization)
// ============================================
model TenantTheme {
  id        Int    @id @default(autoincrement())
  tenantId  Int    @unique
  tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  presetName       String  @default("maison-classic")
                                       // "maison-classic" | "modern-minimal" | "bold-boutique" | "vintage" | "streetwear"

  // Colors
  primaryColor     String   @default("#1a1a1a")
  accentColor      String   @default("#c9a96e")
  backgroundColor  String   @default("#fdfaf5")
  textColor        String   @default("#2a2a2a")
  mutedColor       String   @default("#6b6b6b")

  // Typography
  headingFont      String   @default("Cormorant Garamond")
  bodyFont         String   @default("Inter")
  scriptFont       String   @default("Italianno")

  // Brand assets
  logoUrl          String?
  logoUrlDark      String?
  faviconUrl       String?
  ogImageUrl       String?

  // Custom CSS (Pro+)
  customCSS        String?

  updatedAt        DateTime @updatedAt
}

// ============================================
// TENANT SETTINGS (feature toggles, content)
// ============================================
model TenantSettings {
  id              Int     @id @default(autoincrement())
  tenantId        Int     @unique
  tenant          Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  // Store info
  storeName       String
  tagline         String?
  description     String?
  contactEmail    String?
  contactPhone    String?
  contactAddress  String?

  // Social media
  instagramUrl    String?
  facebookUrl     String?
  whatsappNumber  String?
  tiktokUrl       String?

  // Feature toggles
  enableReviews       Boolean @default(true)
  enableWishlist      Boolean @default(true)
  enableAI            Boolean @default(false)
  enableNewsletter    Boolean @default(true)
  enableGuestCheckout Boolean @default(true)

  // Layout
  productGridCols     Int     @default(3)    // 2, 3, 4
  showHeroVideo       Boolean @default(false)
  showFeaturedSection Boolean @default(true)

  // Hero content
  heroHeading     String?
  heroSubtext     String?
  heroImageUrl    String?
  heroVideoUrl    String?
  heroCtaText     String?
  heroCtaLink     String?

  // About / footer
  aboutText       String?
  footerText      String?

  // Shipping
  freeShippingThreshold Float   @default(5000)
  defaultShippingCost   Float   @default(250)
  shippingCountries     String  @default("Pakistan")

  // Currency
  currency        String  @default("PKR")
  currencySymbol  String  @default("₨")

  // SEO
  metaTitle       String?
  metaDescription String?
  metaKeywords    String?

  // Payments enabled
  enableStripe     Boolean @default(false)
  enableJazzCash   Boolean @default(false)
  enableEasypaisa  Boolean @default(false)
  enableCOD        Boolean @default(true)
  enableBankTransfer Boolean @default(true)

  updatedAt       DateTime @updatedAt
}

// ============================================
// SUBSCRIPTION (billing)
// ============================================
model Subscription {
  id                  Int      @id @default(autoincrement())
  tenantId            Int      @unique
  tenant              Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  plan                String   // free | starter | pro | business
  status              String   // active | past_due | canceled | trialing
  stripeCustomerId    String?  @unique
  stripeSubscriptionId String? @unique
  currentPeriodStart  DateTime?
  currentPeriodEnd    DateTime?
  cancelAtPeriodEnd   Boolean  @default(false)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ============================================
// AUDIT LOG (super admin actions)
// ============================================
model AuditLog {
  id            Int      @id @default(autoincrement())
  action        String   // PLAN_CHANGED | OVERRIDE_GRANTED | IMPERSONATE | TENANT_SUSPENDED | etc.
  performedBy   Int      // userId of super admin
  tenantId      Int?
  tenant        Tenant?  @relation(fields: [tenantId], references: [id])
  oldValue      String?  // JSON
  newValue      String?  // JSON
  reason        String?
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime @default(now())

  @@index([action])
  @@index([tenantId])
  @@index([performedBy])
  @@index([createdAt])
}

// ============================================
// STOCK MANAGEMENT (enhanced)
// ============================================
model StockMovement {
  id          Int      @id @default(autoincrement())
  tenantId    Int
  productId   Int
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  size        String?
  type        String   // "purchase" | "sale" | "return" | "adjustment" | "damage"
  quantity    Int      // positive = in, negative = out
  reason      String?
  reference   String?  // order#, PO#, etc.
  performedBy Int?
  createdAt   DateTime @default(now())

  @@index([tenantId, productId])
  @@index([type])
  @@index([createdAt])
}

model StockAlert {
  id            Int      @id @default(autoincrement())
  tenantId      Int
  productId     Int
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  size          String?
  threshold     Int      @default(5)
  isActive      Boolean  @default(true)
  lastNotified  DateTime?
  createdAt     DateTime @default(now())

  @@unique([tenantId, productId, size])
  @@index([tenantId])
}
```

### Modified Existing Models

Every existing model gets `tenantId` + relation + index. Examples:

```prisma
model User {
  id           Int      @id @default(autoincrement())
  tenantId     Int?                              // ← NEW (null for super admin)
  tenant       Tenant?  @relation(fields: [tenantId], references: [id])

  firstName    String
  lastName     String
  email        String                            // ← no longer @unique globally
  passwordHash String
  phone        String?
  role         String   @default("customer")     // customer | tenant_admin | super_admin
  // ... existing fields

  @@unique([tenantId, email])                    // ← unique per tenant
  @@index([tenantId])
  @@index([role])
}

model Product {
  id                Int      @id @default(autoincrement())
  tenantId          Int                                  // ← NEW
  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name              String
  slug              String                               // ← no longer @unique globally
  sku               String                               // ← no longer @unique globally
  // ... existing fields

  stockMovements    StockMovement[]                      // ← NEW
  stockAlerts       StockAlert[]                         // ← NEW

  @@unique([tenantId, slug])                             // ← per-tenant unique
  @@unique([tenantId, sku])
  @@index([tenantId])
  @@index([categoryId])
  @@index([slug])
}

model Order {
  id                Int      @id @default(autoincrement())
  tenantId          Int                                  // ← NEW
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  orderNumber       String                               // ← no longer @unique globally
  // ... existing fields

  @@unique([tenantId, orderNumber])                      // ← per-tenant
  @@index([tenantId])
  @@index([userId])
  @@index([status])
}
```

Same pattern applies to: Category, CartItem, WishlistItem, OrderItem, UserActivity, Review, NewsletterSubscriber, ContactInquiry, PromoCode, Address.

---

## 7. Implementation Phases

### Phase 0: Pre-Migration (Days 1-2)
**Goal**: Production-grade database before any SaaS work.

- [ ] Set up Neon PostgreSQL free account
- [ ] Update `prisma/schema.prisma` provider from `sqlite` to `postgresql`
- [ ] Update `DATABASE_URL` env var
- [ ] Run `prisma migrate dev --name init_postgres`
- [ ] Migrate existing seed data
- [ ] Verify all existing features still work
- [ ] Commit checkpoint: `feat: migrate sqlite → postgres`

### Phase 1: Multi-Tenant Foundation (Days 3-7)
**Goal**: Tenant model + tenantId on all tables.

- [ ] Add Tenant, TenantTheme, TenantSettings models
- [ ] Add `tenantId` to all 14 existing models
- [ ] Update all `@@unique` constraints to include `tenantId`
- [ ] Add indexes on `tenantId` everywhere
- [ ] Create migration: `prisma migrate dev --name add_multi_tenant`
- [ ] Seed: create 1 default tenant, assign all existing data to it
- [ ] Write Prisma client extension to auto-inject tenantId (or middleware approach)
- [ ] Update seed.ts to create demo tenants

### Phase 2: Tenant Resolution & Middleware (Days 8-10)
**Goal**: Request → tenant identification.

- [ ] Create `middleware.ts` that:
  - Parses hostname / path
  - Looks up tenant in DB (cached)
  - Sets `x-tenant-id` header
  - Blocks suspended tenants
- [ ] Create `lib/tenant.ts` helpers: `getTenant()`, `requireTenant()`
- [ ] Update `lib/auth.ts` to be tenant-aware
- [ ] Update all 40+ API routes to filter by tenant
- [ ] Add tenant context to all server components
- [ ] Test: spin up 2 demo tenants, verify isolation
- [ ] **CRITICAL**: write integration tests for cross-tenant data leak prevention

### Phase 3: Tenant Signup & Onboarding (Days 11-15)
**Goal**: New tenant can self-register, select industry, and get a working business setup.

- [ ] Build `/signup` multi-step flow:
  - Step 1: Email, password, name, phone
  - Step 2: Business name → slug suggestion
  - **Step 3: Industry selection (Fashion / Retail / Wholesale + "Coming soon" verticals)**
  - Step 4: Industry-specific quick setup (vibe questions, categories, sample data preferences)
  - Step 5: Plan selection (Free default)
  - Step 6: Welcome / industry-relevant walkthrough
- [ ] Create tenant + tenant_admin user + TenantBusinessConfig (industry-aware) + industry-default TenantTheme + TenantSettings
- [ ] **Apply industry-default theme automatically** based on selection
- [ ] **Enable industry-specific modules** per `TenantBusinessConfig`
- [ ] Send welcome email (Resend) with industry-relevant tips
- [ ] Seed industry-appropriate sample products (Fashion → 6 outfits, Retail → 6 mixed items, Wholesale → 6 bulk products with supplier)
- [ ] Redirect to `/{slug}/admin` with industry-relevant dashboard

### Phase 4: Tenant Admin Panel (Days 15-19)
**Goal**: Tenant owner manages their store.

- [ ] Restructure admin routes: `/admin/*` → `/{tenantSlug}/admin/*`
- [ ] Update admin layout to show tenant context
- [ ] Settings page (store info, contact, social)
- [ ] Products CRUD (already exists, scope to tenant)
- [ ] Orders management (already exists, scope to tenant)
- [ ] Stock management page (see Phase 7)
- [ ] Customers list (their store's users only)

### Phase 5: Multi-Industry Theme System (Days 20-27)
**Goal**: Industry-aware theme registry + tenant customization without code.

- [ ] **Build 3 V1 industry themes**:
  - Maison Aurelle Classic (Fashion — preserve current premium design as-is)
  - Modern Retail (General Retail — clean white/blue/grey)
  - Wholesale Pro (Wholesale — professional B2B, data-dense)
- [ ] CSS variable wiring in root layout
- [ ] Theme settings page:
  - Color pickers (primary, accent, background, text)
  - Font dropdowns
  - Logo upload (to R2)
  - Favicon upload
- [ ] Pre-built theme presets (5 themes):
  - Maison Classic (default)
  - Modern Minimal
  - Bold Boutique
  - Vintage
  - Streetwear
- [ ] "Apply Preset" button (sets all colors/fonts at once)
- [ ] Live preview iframe
- [ ] Custom CSS editor (Pro+ only, gated)
- [ ] Save and apply changes without page reload

### Phase 6: File Uploads (Days 26-27)
**Goal**: Tenant-scoped image storage.

- [ ] Set up Cloudflare R2 bucket
- [ ] Add R2 credentials to env
- [ ] Build upload API: `/api/upload`
  - Auth check
  - File validation (size, type)
  - Upload to `tenants/{tenantId}/...` prefix
  - Return public URL
- [ ] Replace any base64/local file logic with R2
- [ ] Update product image upload, logo upload, hero image upload

### Phase 7: Stock Management (Days 28-32)
**Goal**: Real inventory tracking.

- [ ] Add StockMovement + StockAlert models (already in schema)
- [ ] Stock page in admin:
  - Current stock per product/size (table view)
  - Stock movement history
  - Low stock alerts dashboard
  - Bulk stock adjustment
- [ ] Auto-create stock movement on order placed
- [ ] Auto-create stock movement on order cancelled
- [ ] Email alerts when product hits low-stock threshold (daily digest)
- [ ] Stock report export (CSV)
- [ ] "Out of stock" auto-hide product (optional setting)

### Phase 8: Super Admin Panel (Days 33-37)
**Goal**: SaaS owner controls everything.

- [ ] Super admin auth (separate role, IP whitelist optional)
- [ ] Routes: `/super-admin/*`
- [ ] Dashboard: tenant count, MRR, recent signups
- [ ] Tenants list:
  - Search, filter by plan/status
  - View tenant details
  - Suspend/unsuspend
  - Change plan manually
  - Grant overrides (checkboxes)
  - Add override notes + expiry
- [ ] "Login as tenant" (impersonation with banner)
- [ ] Audit logs viewer
- [ ] Global analytics (cross-tenant)

### Phase 9: Plans & Billing (Days 38-44)
**Goal**: Tenants can pay.

- [ ] Define plan limits in code (`lib/plans.ts`)
- [ ] Feature gating helpers (`canUseAI`, `maxProducts`, etc.)
- [ ] Plan selection in signup
- [ ] Billing page in tenant admin:
  - Current plan
  - Upgrade/downgrade
  - Invoices list
  - Update payment method
- [ ] Stripe integration:
  - Create products in Stripe dashboard
  - Customer portal embed
  - Webhook handler for subscription events
  - Update `Subscription` table on webhooks
- [ ] Trial period logic (14-day trial of Pro)
- [ ] Grace period for failed payments
- [ ] Downgrade enforcement (e.g., over product limit → can't add new, but existing stay)
- [ ] Email notifications: trial ending, payment failed, plan changed

### Phase 10: Custom Domains (Days 45-48)
**Goal**: Tenants on Pro+ can use their own domain.

- [ ] Custom domain settings page
- [ ] DNS verification flow (TXT record)
- [ ] Cloudflare SaaS API integration (or Vercel domains API)
- [ ] SSL provisioning
- [ ] Middleware update to resolve custom domain → tenant

### Phase 11: Marketing Site & Onboarding (Days 49-52)
**Goal**: Public-facing SaaS landing page.

- [ ] `/` route is now SaaS marketing (not a store)
- [ ] Landing page: hero, features, pricing, testimonials, FAQ
- [ ] Live demo link (preview tenant)
- [ ] Documentation pages
- [ ] "Start free trial" CTA → signup flow

### Phase 12: Polish, Testing, Launch (Days 53-60)
**Goal**: Production-ready.

- [ ] Cross-tenant security audit
- [ ] Load test with 50 demo tenants
- [ ] Sentry error tracking integration
- [ ] Analytics (Vercel Analytics + custom)
- [ ] Email templates polish
- [ ] Legal: ToS, Privacy Policy, Refund Policy
- [ ] Customer support flow (intercom-style chat OR email)
- [ ] Beta launch with 5-10 invited tenants
- [ ] Iterate based on feedback
- [ ] Public launch

---

## 8. Tenant Resolution Strategy

### Decision: **Subdomain + Custom Domain (no path-based)**

> **Note**: `PLATFORM_DOMAIN` placeholder used throughout — finalize when brand name is confirmed (e.g., `dukaanos.com`, `bahi.pk`, etc.). All example code below uses `platformdomain.com` — replace globally on brand selection.

**Default**: `{tenantSlug}.platformdomain.com`
**Pro+**: `customdomain.com` (with DNS verification)

### Reserved Subdomains (NOT available for tenants)
- System: `www`, `app`, `api`, `admin`, `super-admin`
- Marketing: `docs`, `blog`, `help`, `status`, `pricing`, `about`, `contact`
- Auth: `signup`, `login`, `register`, `auth`
- Common: `mail`, `cdn`, `dev`, `staging`, `test`, `beta`
- Brand reserved (whatever platform name chosen)

### Middleware Logic

```typescript
// middleware.ts
const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN!;  // e.g., "dukaanos.com"

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // 1. Super admin / marketing site
  if (hostname === PLATFORM_DOMAIN || hostname === `www.${PLATFORM_DOMAIN}`) {
    return NextResponse.next();
  }

  let tenant;

  // 2. Custom domain check (Pro+ tenants on their own domain)
  if (!hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
    tenant = await getTenantByCustomDomain(hostname);
  } else {
    // 3. Subdomain extraction
    const slug = hostname.replace(`.${PLATFORM_DOMAIN}`, '');
    if (RESERVED_SUBDOMAINS.includes(slug)) return NextResponse.next();
    tenant = await getTenantBySlug(slug);
  }

  if (!tenant) return NextResponse.rewrite(new URL('/tenant-not-found', request.url));
  if (tenant.isSuspended) return NextResponse.rewrite(new URL('/tenant-suspended', request.url));

  const response = NextResponse.next();
  response.headers.set('x-tenant-id', String(tenant.id));
  return response;
}
```

### Caching
- Tenant lookups cached in-memory (5 min TTL) + edge cache
- Invalidate on tenant update

---

## 9. Theme & Customization System

### Theme Tiers

| Tier | Plan | What They Can Do |
|---|---|---|
| **Basic** | Free | Use industry-default theme + change logo only |
| **Standard** | Shop | Industry themes + custom colors + logo + multiple presets |
| **Advanced** | Business | Standard + custom fonts + custom CSS + premium themes |
| **Enterprise** | Enterprise | Advanced + fully custom theme (we design + build) |

### Theme Strategy: **Industry-First, Customization-Second**

Sign-up pe industry select hone se **default theme automatically apply** ho jata hai. Tenant baad mein switch kar sakta hai (within their plan's options) ya customize kar sakta hai.

### Preset Themes by Industry

#### Fashion & Apparel Vertical (V1)
1. **Maison Aurelle Classic** ⭐ — cream/charcoal/gold luxury, Cormorant + Inter + Italianno (current design retained)
2. **Modern Minimal Fashion** — white/black sans-serif, lots of whitespace, editorial
3. **Bold Boutique** — vibrant colors, playful, rounded shapes
4. **Vintage Atelier** — warm earth tones, serif typography, ornate details
5. **Streetwear** — dark mode, neon accents, edgy typography

#### General Retail Vertical (V1)
1. **Modern Retail** ⭐ — clean white/blue/grey, Inter sans-serif, product-focused
2. **TechStore** — dark theme, blue accents, electronics-friendly
3. **HomeGoods** — warm beige/wood tones, lifestyle imagery
4. **GiftShop** — playful colors, soft rounded shapes

#### Wholesale Vertical (V1)
1. **Wholesale Pro** ⭐ — professional blue/grey, table-heavy, data-dense
2. **Trade Classic** — traditional Pakistani trader aesthetic, dense info
3. **B2B Modern** — minimal, fast, no decoration

#### Restaurant Vertical (V1.5 — Future)
1. **Bistro** ⭐ — warm earth tones, large food imagery
2. **Cafe Light** — clean, bright, casual
3. **Fine Dining** — dark elegant, gold accents

#### Grocery / Kiryana (V1.5 — Future)
1. **MarketFresh** ⭐ — bright green/orange, family-friendly
2. **Daily Mart** — clean, efficient, large category icons

#### Pharmacy (V2 — Future)
1. **MedCare** ⭐ — clean white/green, trust-focused, accessibility-first
2. **Health Plus** — soft blue, modern medical

#### Salon / Spa (V2 — Future)
1. **Glow** ⭐ — soft pastels, lifestyle imagery, appointment-focused
2. **Luxe Spa** — gold/cream luxury, wellness aesthetic

> ⭐ = Industry default (applied automatically on signup based on selected industry)

### Theme System Architecture

Each theme is a configuration object stored in DB — not separate code files:

```typescript
// lib/themes/registry.ts
export const THEME_PRESETS = {
  // Fashion
  'maison-aurelle-classic': {
    industry: 'fashion',
    isPremium: true,    // requires Shop+ plan
    colors: { primary: '#1a1a1a', accent: '#c9a96e', bg: '#fdfaf5', text: '#2a2a2a' },
    fonts: { heading: 'Cormorant Garamond', body: 'Inter', script: 'Italianno' },
    layout: { gridCols: 3, heroStyle: 'editorial' },
    components: { /* component-level config */ }
  },
  'modern-minimal-fashion': { /* ... */ },

  // Retail
  'modern-retail': {
    industry: 'retail',
    isPremium: false,    // free tier
    colors: { primary: '#1e40af', accent: '#3b82f6', bg: '#ffffff', text: '#111827' },
    fonts: { heading: 'Inter', body: 'Inter' },
    layout: { gridCols: 4, heroStyle: 'banner' },
  },

  // Wholesale
  'wholesale-pro': {
    industry: 'wholesale',
    isPremium: false,
    colors: { primary: '#0f172a', accent: '#3b82f6', bg: '#f8fafc', text: '#0f172a' },
    fonts: { heading: 'Inter', body: 'Inter' },
    layout: { gridCols: 'table', density: 'compact' },
  },
};

// Helper
export function getThemesForIndustry(industry: string, planTier: string) {
  return Object.entries(THEME_PRESETS)
    .filter(([, t]) =>
      (t.industry === industry || t.industry === 'universal') &&
      (planTier !== 'free' || !t.isPremium)
    );
}
```

### Switching Industries Later

Tenant ki industry baad mein change ho sakti hai (rare but possible — e.g., expansion to new vertical). Settings → Business Type → confirm warning → modules + theme adjust hote hain. Data preserved.

### CSS Variable Strategy

Root layout injects per-tenant variables:

```tsx
<html style={{
  '--color-primary': theme.primaryColor,
  '--color-accent':  theme.accentColor,
  '--color-bg':      theme.backgroundColor,
  '--color-text':    theme.textColor,
  '--font-heading':  `'${theme.headingFont}', serif`,
  '--font-body':     `'${theme.bodyFont}', sans-serif`,
}}>
```

All component styles use `var(--*)` — never hardcoded colors.

### Custom CSS Injection (Pro+)

```tsx
{theme.customCSS && tenant.plan === 'pro' && (
  <style dangerouslySetInnerHTML={{ __html: sanitize(theme.customCSS) }} />
)}
```

**Sanitization required**: strip `<script>`, `javascript:`, `@import` from external untrusted URLs.

---

## 10. Super Admin System

### Roles
- `super_admin` — SaaS owner(s), god mode
- `tenant_admin` — Store owner, manages their tenant only
- `customer` — End user shopping on a store

### Super Admin Capabilities

1. **Tenant Management**
   - View all tenants
   - Manually change plan
   - Suspend/unsuspend
   - Delete tenant (soft delete)

2. **Override System** (give plan features without upgrade)
   - Custom CSS access
   - Custom domain
   - AI features
   - Unlimited products
   - Each override has optional expiry

3. **Impersonation** ("Login as tenant")
   - Creates session for tenant admin
   - Banner visible at all times
   - Audit logged

4. **Audit Logs**
   - Read-only
   - All super admin actions tracked
   - IP, timestamp, before/after state

5. **Global Analytics**
   - MRR (monthly recurring revenue)
   - Tenant growth chart
   - Plan distribution
   - Churn rate

### Security
- Super admin creation only via CLI script (not via web)
- 2FA mandatory
- IP whitelist option
- Session shorter (1 day vs 7)

---

## 11. Stock Management Module

### Features

1. **Real-time stock per size**
   - Already have `ProductSize.stock`
   - Add visual indicators: in stock / low / out

2. **Stock movements log**
   - Every change tracked: purchase, sale, return, damage, adjustment
   - Audit trail per product/size

3. **Low stock alerts**
   - Configurable threshold per product (default: 5)
   - Daily email digest to tenant admin
   - In-app notification

4. **Auto-deduct on order**
   - When order placed → decrement stock
   - When order cancelled → increment back
   - Transaction-safe (Prisma `$transaction`)

5. **Stock reports**
   - Current stock levels (CSV export)
   - Stock movements report (date range)
   - Slow-moving inventory report

6. **Out-of-stock behavior**
   - Setting: hide product when out of stock
   - OR: show "out of stock" badge, disable add-to-cart

7. **Bulk operations**
   - Bulk stock update (CSV upload)
   - Bulk adjustment (e.g., after physical count)

### UI Mockup

```
┌────────────────────────────────────────────────────────┐
│ Stock Management                          [+ Bulk Edit] │
├────────────────────────────────────────────────────────┤
│ ⚠ 3 products low stock  |  🚫 1 out of stock           │
├────────────────────────────────────────────────────────┤
│ Product            Size   Stock   Threshold   Action   │
│ Silk Kameez        S      12      5           [Edit]   │
│ Silk Kameez        M      3 🟡    5           [Edit]   │
│ Silk Kameez        L      0 🔴    5           [Edit]   │
│ Cotton Lawn Suit   S      45      10          [Edit]   │
│ ...                                                     │
└────────────────────────────────────────────────────────┘
```

---

## 12. Billing & Subscription Plans

### Plans Defined

```typescript
// lib/plans.ts
export const PLANS = {
  free: {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    limits: {
      maxProducts: 25,
      maxOrdersPerMonth: 50,
      maxImagesPerProduct: 3,
      maxAdminUsers: 1,
    },
    features: {
      basicThemes: true,
      customColors: false,
      customFonts: false,
      customCSS: false,
      customDomain: false,
      ai: false,
      removeBranding: false,
      analytics: 'basic',
      support: 'community',
    },
  },
  starter: {
    name: "Starter",
    priceMonthly: 999,   // PKR
    priceYearly: 9990,
    limits: { maxProducts: 100, maxOrdersPerMonth: 500, maxImagesPerProduct: 5, maxAdminUsers: 1 },
    features: {
      basicThemes: true, customColors: true, customFonts: false, customCSS: false,
      customDomain: false, ai: false, removeBranding: false,
      analytics: 'basic', support: 'email',
    },
  },
  pro: {
    name: "Pro",
    priceMonthly: 2999,
    priceYearly: 29990,
    limits: { maxProducts: 1000, maxOrdersPerMonth: 5000, maxImagesPerProduct: 10, maxAdminUsers: 3 },
    features: {
      basicThemes: true, customColors: true, customFonts: true, customCSS: true,
      customDomain: true, ai: true, removeBranding: true,
      analytics: 'advanced', support: 'priority',
    },
  },
  business: {
    name: "Business",
    priceMonthly: 9999,
    priceYearly: 99990,
    limits: { maxProducts: Infinity, maxOrdersPerMonth: Infinity, maxImagesPerProduct: 20, maxAdminUsers: 10 },
    features: {
      basicThemes: true, customColors: true, customFonts: true, customCSS: true,
      customDomain: true, ai: true, removeBranding: true,
      analytics: 'advanced', support: 'dedicated',
      apiAccess: true,
      customTheme: true,
    },
  },
};
```

### Feature Gate Pattern

```typescript
// lib/can.ts
export function canUse(tenant: Tenant, feature: keyof PlanFeatures): boolean {
  // 1. Super admin override check
  if (feature === 'customCSS' && tenant.overrideCustomCSS) return true;
  if (feature === 'customDomain' && tenant.overrideCustomDomain) return true;
  if (feature === 'ai' && tenant.overrideAI) return true;

  // 2. Plan check
  return PLANS[tenant.plan].features[feature] === true;
}

export function getLimit(tenant: Tenant, limit: keyof PlanLimits): number {
  if (limit === 'maxProducts' && tenant.overrideUnlimitedProducts) return Infinity;
  return PLANS[tenant.plan].limits[limit];
}
```

### Stripe Integration

- Use Stripe Checkout (hosted) for simplicity
- Webhook events handled: `customer.subscription.created/updated/deleted`, `invoice.payment_succeeded/failed`
- Stripe Customer Portal for self-service (cancel, update card, view invoices)

---

## 13. Pricing Strategy

### Public Pricing (Pakistani market)

| Plan | Monthly | Yearly (Save 17%) |
|---|---|---|
| **Free** | ₨0 | ₨0 |
| **Starter** | ₨999 | ₨9,990 |
| **Pro** | ₨2,999 | ₨29,990 |
| **Business** | ₨9,999 | ₨99,990 |

### Free Tier Strategy
- **Generous enough to attract users**: 25 products is real, not toy
- **Limited enough to push upgrades**:
  - Maison Aurelle branding in footer ("Powered by Maison Aurelle")
  - Basic themes only
  - 50 orders/mo cap
- **No credit card required** for free

### Trial
- 14-day Pro trial available on signup (optional)
- Auto-downgrade to Free if no payment

### Annual Discount
- ~17% off (2 months free)
- Drives commitment, reduces churn, improves cash flow

### Concierge Services (additional revenue)
- Quick Setup: ₨5,000 one-time
- Full Branding: ₨15,000 one-time
- White-Glove Onboarding: ₨50,000 (includes 1 mo support)

---

## 14. Cost Breakdown

### Phase 1 (0-50 tenants): Free Tier

| Service | Cost |
|---|---|
| Vercel Hobby | $0 |
| Neon Postgres (0.5GB) | $0 |
| Cloudflare R2 (10GB) | $0 |
| Resend (3k emails/mo) | $0 |
| Gemini API (free tier) | $0 |
| Domain (.com) | $1/mo ($12/yr) |
| **Total** | **~$1/month (₨280)** |

### Phase 2 (50-500 tenants): Growing

| Service | Cost |
|---|---|
| Vercel Pro | $20 |
| Neon Pro | $19 |
| Cloudflare R2 (50GB) | $5 |
| Resend (50k emails) | $20 |
| Gemini API | $20 |
| Sentry | $26 |
| Domain | $1 |
| **Total** | **~$110/month (₨31,000)** |

### Phase 3 (500-5000 tenants): Scaling

| Service | Cost |
|---|---|
| Vercel Pro + usage | $80 |
| Neon Scale | $70 |
| Cloudflare R2 (500GB) | $25 |
| Resend (500k emails) | $80 |
| Gemini API | $100 |
| Sentry | $80 |
| Stripe fees | (passed to customer) |
| **Total** | **~$435/month (₨122,000)** |

### Revenue Projection at 500 tenants (mixed plans)
- 300 Free
- 100 Starter (₨999) = ₨99,900
- 70 Pro (₨2,999) = ₨209,930
- 30 Business (₨9,999) = ₨299,970
- **Monthly Revenue: ₨609,800 (~$2,180)**
- **Monthly Cost: ~$435**
- **Profit Margin: ~80%**

---

## 15. Cost Control Strategy (Per-Tenant Economics)

> **Goal**: Per-tenant cost kabhi ₨150/mo se ziyada nahi jaane dena. Free tenants ko sustainable rakhna. Heavy tenants se loss avoid karna.

### 14.1 Per-Tenant Cost at Different Scales

| Tenants | Total Monthly Cost | Per-Tenant Cost |
|---|---|---|
| 10 | $1 | ₨28 |
| 100 | $96 | ₨270 (worst point — "valley of death") |
| 500 | $211 | ₨118 |
| 2,000 | $734 | ₨103 |
| 10,000 | $2,615 | ₨73 |

**Key insight**: 100 tenants ke around per-tenant cost peak hoti hai — yahan paid tiers pe move karna parta hai but volume kam hota hai. Iske baad economy of scale kick karti hai.

### 14.2 Unit Economics by Plan

| Plan | Revenue | Cost | Margin | Strategy |
|---|---|---|---|---|
| **Free** | ₨0 | ₨62 | **-₨62 (LOSS)** | Limit to <70% of total tenants |
| **Starter** (₨999) | ₨999 | ₨150 | ₨849 (85%) | Sweet spot — push free→starter |
| **Pro** (₨2,999) | ₨2,999 | ₨400 | ₨2,599 (87%) | **Best margin tier** |
| **Business** (₨9,999) | ₨9,999 | ₨1,500 | ₨8,499 (85%) | Lower volume, higher cost |

### 14.3 Sustainability Target (Magic Numbers)

| Metric | Target |
|---|---|
| Free → Paid conversion rate | 5-10% |
| Free tenant ratio (max of total) | 70% |
| Avg revenue per tenant (ARPU) | ₨600+ |
| Cost per tenant (max) | ₨150 |
| Gross margin target | 80%+ |
| Monthly churn rate (max) | <5% |

**Profitability formula**:
```
At ₨600 ARPU + 7% free→paid conversion:
- Need 1,670 free tenants + 117 paying = 1,787 total
- Monthly revenue: ₨70,000
- Monthly cost: ₨20,000
- Net profit: ₨50,000/mo
- Timeline: 12-18 months achievable
```

### 14.4 The 5 Mandatory Cost Control Rules

These are **non-negotiable** — every implementation MUST enforce these.

#### Rule 1: Aggressive Free Tier Limits (Hard Caps)

```typescript
// lib/plans.ts — enforced at every relevant API
free: {
  maxProducts:           25,
  maxOrdersPerMonth:     50,
  maxImagesPerProduct:   3,
  maxImageSizeMB:        2,
  maxStorageMB:          100,    // hard cap
  maxEmailsPerMonth:     50,
  bandwidthLimitGB:      5,      // hard cap
  aiEnabled:             false,  // expensive
  customDomain:          false,  // DNS overhead
  apiCallsPerMinute:     60,
}
```

#### Rule 2: Auto-Suspend Inactive Free Tenants

Daily cron job:

```typescript
// 60 days inactive + zero orders → suspend
if (tenant.plan === "free" &&
    daysSinceLastLogin > 60 &&
    totalOrdersAllTime === 0) {
  await suspendTenant(tenant.id, "INACTIVE");
  await sendEmail(tenant.ownerEmail, "store_paused_inactivity");
}

// 90 days inactive → suspend even with past orders
if (tenant.plan === "free" && daysSinceLastLogin > 90) {
  await suspendTenant(tenant.id, "INACTIVE");
}

// 180 days → archive (move data to cold storage)
if (tenant.plan === "free" && daysSinceLastLogin > 180) {
  await archiveTenant(tenant.id);
}

// 365 days → soft delete (GDPR-compliant)
if (tenant.plan === "free" && daysSinceLastLogin > 365) {
  await deleteTenant(tenant.id);
}
```

#### Rule 3: Hard Rate Limiting Per Tenant

Middleware enforced — single tenant ko system ko crash nahi karne dena:

```typescript
const RATE_LIMITS = {
  free:     { apiCalls: 60,   uploads: 5,   aiCalls: 0   },
  starter:  { apiCalls: 300,  uploads: 30,  aiCalls: 0   },
  pro:      { apiCalls: 1000, uploads: 100, aiCalls: 50  },
  business: { apiCalls: 5000, uploads: 500, aiCalls: 500 },
};
// Per-minute limits, enforced via Upstash Redis (free tier)
```

#### Rule 4: Storage Quota Enforcement

Pre-upload check:

```typescript
const currentUsage = await calculateTenantStorage(tenantId);
const limit = getStorageLimit(tenant.plan);

if (currentUsage + newFileSize > limit) {
  throw new Error("STORAGE_LIMIT_EXCEEDED — Upgrade plan to upload more.");
}
```

Plus mandatory image compression:
- Upload pe auto-convert to WebP
- Quality 80%
- Max dimensions 2000×2000
- Strip EXIF metadata

#### Rule 5: AI Cost Quotas

Most volatile cost — strict control:

```typescript
const AI_QUOTAS = {
  free:     { perDay: 0,    perMonth: 0     },
  starter:  { perDay: 0,    perMonth: 0     },
  pro:      { perDay: 200,  perMonth: 5000  },
  business: { perDay: 2000, perMonth: 50000 },
};
```

**Pre-compute strategy**:
- AI recommendations nightly batch job, NOT on-demand
- Cache 24 hours minimum
- On cache miss → use static popularity fallback (free)

### 14.5 Heavy Tenant Protection

Aik viral store (50,000 orders/mo) Pro plan pe loss generate karega (~₨29k/mo). Protections:

```typescript
// Auto-detect over-usage
if (tenantMonthlyOrders > planLimit * 1.5) {
  await sendEmail("upgrade_recommended", {
    currentPlan: tenant.plan,
    suggestedPlan: nextTierPlan,
  });
}

// Hard cutoff at 200% of limit
if (tenantMonthlyOrders > planLimit * 2) {
  await disableNewOrders(tenant.id);  // existing orders process, new blocked
  await sendUrgent("plan_limit_exceeded_orders_paused");
}
```

**Fair Use Policy** (Terms of Service mein document):
- Plan limits hard-enforced
- Bandwidth abuse → throttle then suspend
- Storage abuse → upload blocked
- Email abuse → sending paused, reputation protected

### 14.6 Cost Per Order (Variable Cost)

| Component | Cost Per Order |
|---|---|
| Email confirmations (3 emails) | $0.001 |
| DB writes (order + items + stock movement) | $0.0005 |
| Bandwidth | $0.001 |
| **Total per order** | **~$0.003 (₨0.85)** |

1000 orders/mo cost = ~₨850. Bohot kam — orders profitable hain.

### 14.7 Storage Growth Mitigation (Silent Killer)

Yearly compounding:

| Year | Avg Storage/Tenant | Cost (500 tenants) |
|---|---|---|
| Year 1 | 75 MB | $1/mo |
| Year 2 | 200 MB | $4/mo |
| Year 3 | 500 MB | $10/mo |
| Year 5 | 2 GB | $40/mo |

**Mandatory cleanup jobs**:

```typescript
// Weekly: cleanup orphaned uploads
DELETE FROM files
WHERE uploadedAt < NOW() - INTERVAL '7 days'
  AND NOT EXISTS (SELECT 1 FROM products WHERE imageUrl = files.url);

// Monthly: archive old orders to cold storage
ARCHIVE orders WHERE createdAt < NOW() - INTERVAL '2 years';

// Quarterly: delete soft-deleted tenants > 90 days old
DELETE FROM tenants
WHERE deletedAt < NOW() - INTERVAL '90 days';
```

### 14.8 Caching Strategy (DB Cost Reduction)

Aggressive caching — target 80%+ cache hit rate:

| Resource | Cache TTL | Invalidation |
|---|---|---|
| Tenant lookup by slug | 5 min | On tenant update |
| Tenant theme | 1 hour | On theme save |
| Tenant settings | 5 min | On settings save |
| Product list (per category) | 1 min + ISR | On product update |
| Product detail | 5 min | On product update |
| Static pages | 1 hour + ISR | On content update |
| AI recommendations | 24 hours | On user activity surge |

**Tech**: Next.js built-in cache + Vercel Edge cache + (optional) Upstash Redis.

### 14.9 Monitoring & Alerts

Daily automated reports to super admin:

```
📊 Daily Cost Report — 2026-05-27

Top 10 Cost Tenants:
1. heavyseller.maison.com    ₨420 (Pro plan ₨2999 — OK)
2. viralstore.maison.com     ₨890 (Pro plan ₨2999 — 30% margin ⚠️)
3. spamtest.maison.com       ₨340 (Free plan — INVESTIGATE 🚨)
...

Free Tenant Activity:
- Total free: 234
- Active (last 30d): 89
- Inactive >60d: 145 → auto-suspend candidates

Resource Usage:
- DB: 7.2 GB / 10 GB (72%)
- R2: 45 GB / 100 GB (45%)
- Bandwidth: 78 GB / 100 GB (78%) ⚠️
- Emails: 2,150 / 3,000 (72%)
```

**Alert thresholds**:
- 80% of any limit → email warning
- 95% → urgent SMS/email
- 100% → auto-upgrade trigger OR throttle

### 14.10 Implementation Priority

Yeh rules **Phase 9 (Billing) ke saath** implement honi chahiye — billing without cost control = catastrophic loss risk.

Specifically:
- **Phase 9.1**: Plan limits in code (`lib/plans.ts`)
- **Phase 9.2**: Feature gates (`canUse()`, `getLimit()`)
- **Phase 9.3**: Rate limiting middleware
- **Phase 9.4**: Storage quota enforcement
- **Phase 9.5**: AI quota system
- **Phase 9.6**: Inactivity cleanup cron jobs
- **Phase 9.7**: Cost monitoring dashboard

### 14.11 Cost-Saving Tech Choices Already Made

| Choice | Why It Saves Money |
|---|---|
| **Cloudflare R2** | Zero egress fees (S3 charges $0.09/GB out) |
| **Neon serverless Postgres** | Autoscale to 0 — pay only when used |
| **Vercel Edge functions** | 50-100ms cold start vs AWS Lambda 500ms |
| **Resend transactional** | Better deliverability = less retries |
| **Gemini over OpenAI** | 5-10x cheaper for same quality |
| **Server Components** | Less JS = less bandwidth |
| **ISR caching** | Fewer DB hits per page view |
| **Cloudflare DNS** | Free, unlimited domains |

---

## 16. Timeline & Milestones

### Aggressive (full-time): 8 weeks
### Realistic (alongside FYP): 12-14 weeks

```
Week 1-2:    Phase 0 + 1 (DB migration + multi-tenant base)
Week 3:      Phase 2 (Tenant resolution + middleware)
Week 4:      Phase 3 (Signup + onboarding)
Week 5-6:    Phase 4 (Tenant admin panel)
Week 7-8:    Phase 5 (Theme system)
Week 9:      Phase 6 + 7 (File uploads + Stock mgmt)
Week 10:     Phase 8 (Super admin)
Week 11-12:  Phase 9 (Billing + Stripe)
Week 13:     Phase 10 + 11 (Custom domains + marketing site)
Week 14:     Phase 12 (Polish + launch)
```

### Milestones
- **M1** (Week 2): First demo tenant working end-to-end
- **M2** (Week 4): Public signup live (internal testing)
- **M3** (Week 8): Theme customization working
- **M4** (Week 12): First paid customer onboarded
- **M5** (Week 14): Public launch

---

## 17. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| **Cross-tenant data leak** | Critical | Medium | Mandatory tenantId in every query, integration tests, Prisma extensions |
| **Database growth on free tier** | High | High | Monitor Neon usage, upgrade before hitting limit |
| **Stripe webhook delays** | Medium | Low | Idempotent handlers, retry logic |
| **Custom CSS XSS** | High | Medium | Strict CSS sanitization, CSP headers |
| **Subdomain DNS issues** | High | Medium | Cloudflare for DNS, fallback to path-based |
| **AI cost spike** | Medium | Medium | Per-tenant AI rate limits, cache aggressively |
| **Tenant suspended customer's site goes down** | High | Low | Auto-renewal grace period (7 days), email warnings |
| **Image storage abuse** | Medium | Medium | Per-tenant storage quota, file type/size validation |
| **Super admin account compromise** | Critical | Low | 2FA, IP whitelist, audit logs, separate domain |
| **FYP deadline pressure** | High | High | Phase 1-4 minimum for FYP demo; rest post-submission |

---

## 18. Security Checklist

- [ ] All Prisma queries filtered by tenantId (no exceptions)
- [ ] CSRF tokens on all state-changing requests
- [ ] Rate limiting on auth + API endpoints (Upstash Redis free tier)
- [ ] Bcrypt for passwords (already done)
- [ ] HttpOnly + Secure + SameSite cookies (already done)
- [ ] Custom CSS sanitized via DOMPurify or similar
- [ ] File uploads: MIME type validation + magic byte check + size limit
- [ ] Image processing: strip EXIF data
- [ ] SQL injection: Prisma parameterizes everything (safe by default)
- [ ] XSS: React escapes by default, never use `dangerouslySetInnerHTML` without sanitize
- [ ] Subdomain takeover: validate custom domains carefully
- [ ] Webhook signature verification (Stripe, etc.)
- [ ] HTTPS only (Vercel enforces)
- [ ] Strong password requirements (min 8, uppercase, number)
- [ ] 2FA for tenant admin (TOTP) — Phase 2 enhancement
- [ ] 2FA mandatory for super admin
- [ ] Audit log all sensitive actions
- [ ] Regular dependency updates (Renovate or Dependabot)
- [ ] Secrets in env vars only, never in code

---

## 19. Launch Checklist

### Pre-Launch
- [ ] All Phase 1-9 features complete
- [ ] Security audit done
- [ ] Cross-tenant isolation tested
- [ ] Load test (50 concurrent tenants)
- [ ] Backup strategy verified (Neon point-in-time recovery)
- [ ] Monitoring set up (Sentry, Vercel Analytics)
- [ ] Email templates polished
- [ ] Legal docs published (ToS, Privacy, Refund)
- [ ] Pricing page live
- [ ] Demo store accessible
- [ ] Documentation written
- [ ] Support email set up
- [ ] FAQ section
- [ ] Social media accounts created
- [ ] Customer support process defined

### Beta Launch (5-10 invited tenants)
- [ ] Invite friends/family/network
- [ ] Free Pro overrides for beta users
- [ ] Daily check-ins for feedback
- [ ] Fast bug fix turnaround
- [ ] Iterate for 2-4 weeks

### Public Launch
- [ ] Product Hunt launch
- [ ] LinkedIn announcement
- [ ] Reach out to Pakistani fashion influencers
- [ ] Press release to local tech blogs
- [ ] Paid ads (small budget Instagram/Facebook)
- [ ] Referral program (give 1 mo free for each referral)

---

## 20. Post-Launch Roadmap

### V1.1 (Month 1-2 after launch)
- 2FA for tenant admins
- More theme presets (5 → 10)
- Improved analytics dashboard
- WhatsApp order notifications
- POS lite (manual orders by tenant admin)

### V1.5 (Month 3-4)
- Multi-staff per tenant (roles: admin, manager, staff)
- Inventory: variants beyond size (color, material)
- Bundle products
- Coupon scheduling
- Abandoned cart emails

### V2.0 (Month 6+)
- Mobile apps (React Native)
- Multi-currency
- Multi-language (Urdu)
- Marketplace mode (cross-tenant discovery)
- Subscription products
- Affiliate program
- Public API + webhooks
- Integrations: Mailchimp, Google Shopping, Meta Pixel

---

## 21. Glossary

- **Tenant**: A single business/store using the SaaS (e.g., "Ali's Boutique")
- **Tenant Admin**: The owner of a tenant — manages their own store
- **Super Admin**: SaaS platform owner (you) — manages all tenants
- **Multi-tenancy**: Architecture where one app serves multiple isolated tenants
- **Row-level tenancy**: Each row in DB has `tenantId`, queries filter by it
- **Override**: Super admin grants a paid feature to a tenant for free
- **Impersonation**: Super admin logs in as a tenant admin for support
- **Slug**: URL-safe identifier (e.g., "alis-boutique")
- **Preset**: A pre-built theme configuration tenants can apply with one click
- **Plan**: Subscription tier (free, starter, pro, business)
- **Concierge**: Paid service where SaaS owner manually sets up tenant

---

## Quick Reference: Where to Start Tomorrow

1. Read this doc end-to-end one more time
2. Approve / suggest changes
3. Run: `npx prisma init` (already done, but verify)
4. Sign up: Neon account (https://neon.tech)
5. Sign up: Cloudflare account (for R2 + DNS)
6. Buy domain (if not already): `maisonaurelle.com` or similar
7. Begin **Phase 0** — DB migration to Postgres

---

**End of Plan Document**

*Yeh document living document hai — jaise jaise build karte jayenge, updates karte rahenge.*
