# Digify

A digital marketplace for independent makers. **Live demo:** https://digify-dusky.vercel.app

A digital goods marketplace built as coursework for the **E-commerce Technologies** course. Sells e-books, software, music, and templates from independent makers.

Built with Next.js 14 (App Router), TypeScript, Prisma, and Postgres. Designed to deploy to Vercel.

## Features

- **Three user roles** — Buyer, Seller, Administrator, each with a different experience
- **Real file storage** — sellers upload product files (up to 50 MB) and cover images directly to Vercel Blob; downloads are gated by an ownership check
- **Product catalogue** — browse, search by keyword, filter by category and type, sort by price/date
- **Cart & checkout** — add to cart (localStorage), one-click checkout creates an order
- **Buyer's library** — list of purchased products with secure download links
- **Reviews** — verified buyers (those who completed an order) can leave a 1–5 star rating with a comment
- **Seller dashboard** — list/edit/delete products, view sales stats, lifetime revenue
- **Moderation flow** — new and edited listings go to PENDING and require admin approval before going live
- **Admin panel** — overview dashboard, product moderation, user management (block/delete), order log
- **Authentication** — email + password with bcrypt hashing, JWT in httpOnly cookies

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | Postgres (via Vercel Postgres / Neon) |
| ORM | Prisma |
| File storage | Vercel Blob (server-side uploads, 4 MB max per file) |
| Auth | JWT in httpOnly cookies + bcryptjs |
| Validation | Zod |
| Styling | Tailwind CSS + custom CSS variables |
| Fonts | Fraunces (display), Inter Tight (body), JetBrains Mono |

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database and file storage

The fastest path is to use a free Neon database (the same backing service Vercel Postgres uses) plus a Vercel Blob store:

1. Sign up at [neon.tech](https://neon.tech) and create a project
2. Copy the connection string from the dashboard
3. Sign in to [vercel.com](https://vercel.com), create a project (you can link a placeholder repo for now), and create a Blob store under **Storage → Create Database → Blob**. Copy the `BLOB_READ_WRITE_TOKEN` from the `.env.local` snippet shown in the Vercel dashboard.
4. Copy `.env.example` to `.env` and paste in the values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
DIRECT_URL="postgresql://user:password@host/db?sslmode=require"
AUTH_SECRET="some-long-random-string"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxxx"
```

> **Note on local uploads:** Vercel Blob client uploads work in local dev because the browser uploads directly to Vercel's servers, not your local machine. Without a valid `BLOB_READ_WRITE_TOKEN`, uploads will fail but the rest of the app works fine.

### 3. Push schema and seed

```bash
npx prisma db push
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

After seeding, you can log in with:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@market.io` | `admin123` |
| Seller | `maria@market.io` | `seller123` |
| Seller | `devstudio@market.io` | `seller123` |
| Buyer | `ivan@market.io` | `buyer123` |

## Deploying to Vercel

### 1. Push the code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

### 2. Import the project on Vercel

- Go to [vercel.com/new](https://vercel.com/new) and import the repo
- Framework preset will auto-detect as **Next.js** — leave defaults

### 3. Create a Postgres database and a Blob store

In the project's **Storage** tab:
- **Create Database → Postgres (Neon).** Vercel auto-injects `DATABASE_URL` and `DIRECT_URL`.
- **Create Database → Blob.** Vercel auto-injects `BLOB_READ_WRITE_TOKEN`.

### 4. Add the auth secret

In the project's **Settings → Environment Variables**, add:

```
AUTH_SECRET = <a long random string>
```

Generate one with: `openssl rand -base64 32`

### 5. Deploy

The `build` script in `package.json` runs `prisma db push` automatically, so the schema is created on the first deploy. To seed the production database, run **once** locally with the production `DATABASE_URL`:

```bash
DATABASE_URL="<production url>" npm run db:seed
```

(Or simply register new users through the UI.)

## Project structure

```
prisma/
  schema.prisma          # Database schema (User, Product, Category, Order, Review)
  seed.ts                # Demo data
src/
  app/
    page.tsx             # Home (hero, featured, categories)
    products/            # Catalogue + product detail
    cart/                # Cart page
    orders/              # Buyer's library + order detail
    seller/              # Seller dashboard, new, edit
    admin/               # Admin dashboard, products, users, orders
    api/                 # All REST endpoints
    login/, register/    # Auth pages
    layout.tsx, globals.css
  components/            # Header, Footer, ProductCard, forms, action buttons
  lib/
    prisma.ts            # Prisma client singleton
    auth.ts              # JWT/bcrypt helpers, session cookie
    cart.ts              # localStorage cart helpers
    utils.ts             # slugify, formatPrice
```

## Roles and permissions matrix

| Action | Buyer | Seller | Admin |
|---|:---:|:---:|:---:|
| Browse approved products | ✓ | ✓ | ✓ |
| Add to cart, place order | ✓ | — | — |
| Review purchased products | ✓ | — | — |
| Create/edit/delete own products | — | ✓ | — |
| View own sales dashboard | — | ✓ | — |
| Approve/reject any product | — | — | ✓ |
| Block, unblock, delete users | — | — | ✓ |
| View all orders | — | — | ✓ |

## Notes

- Payments are mocked — checkout creates a `COMPLETED` order without charging anything. A real implementation would integrate Stripe or LiqPay here.
- Files are stored on Vercel Blob with random pathname suffixes, so URLs are unguessable. Downloads go through `/api/download/[id]` which checks ownership before streaming the file, so a buyer can't share their download link with a non-buyer.
- Files larger than 4.5 MB use **client uploads** (browser uploads directly to Vercel Blob with a one-time token from the server). Files up to 50 MB are supported out of the box; raise `MAX_FILE_SIZE` in `src/lib/blob.ts` to go higher.
- The cart lives in `localStorage` on the client. This is fine for a coursework demo and avoids a "guest cart" persistence problem.
