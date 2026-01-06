# Dashboard Admin - React/Next.js + Supabase

Modern admin dashboard for e-commerce management with real-time data, built with Next.js 16 and Supabase.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Add your Supabase credentials

# 3. Start development server
npm run dev
```

**URL:** http://localhost:3000

**Default Admin:** Check `ADMIN_CREDENTIALS.md`

---

## 📚 Documentation

- **📖 [DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete technical documentation
  - Architecture & tech stack
  - Database schema (15+ tables)
  - Component structure (18 screens)
  - Edge Functions (20 functions)
  - Setup & deployment guide

---

## ⚡ Tech Stack

```json
{
  "framework": "Next.js 16.1.1 (App Router)",
  "runtime": "React 19.2.3",
  "database": "Supabase (PostgreSQL 15+)",
  "styling": "Tailwind CSS v4",
  "components": "Radix UI + shadcn/ui",
  "state": "Zustand + React Query v5",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts 3.6.0"
}
```

---

## 📁 Project Structure

```
react-dashboard/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── page.tsx        # Dashboard home (KPIs + charts)
│   │   ├── products/       # Product management
│   │   ├── orders/         # Order management
│   │   ├── customers/      # Customer database
│   │   ├── coupons/        # Marketing  coupons
│   │   ├── campaigns/      # Email/SMS campaigns
│   │   ├── queries/        # Support queries
│   │   ├── vendors/        # Vendor management
│   │   └── ...             # 18 screens total
│   ├── login/              # Authentication
│   └── layout.tsx          # Root layout
│
├── components/             # Reusable UI components
│   ├── layout/             # Sidebar, app-bar
│   └── ui/                 # shadcn components (30+)
│
├── lib/                    # Core logic
│   ├── services/           # API service layers (22 files)
│   ├── hooks/              # Custom React hooks (11 files)
│   ├── contexts/           # Auth context
│   └── supabase.ts         # Supabase client
│
├── types/                  # TypeScript definitions (12 files)
│
└── DOCUMENTATION.md        # 500+ lines of technical docs

supabase/
├── migrations/             # Database schema versions (8 files)
└── functions/              # Edge Functions (20 functions)
```

---

## 🗄️ Database

**Setup:** See `supabase/SETUP_DATABASE.sql`

**Core Tables:**
- `products` + `product_variants` - Product catalog
- `orders` + `order_items` - Order management
- `customers` - Customer database
- `vendors` + `purchases` - Vendor/procurement
- `coupons` + `affiliates` + `campaigns` - Marketing
- `queries` + `tickets` - Support system
- `users` + `roles` + `permissions` - RBAC

**Total:** 15+ tables with RLS policies

---

## 🔐 Authentication

**Login:** Supabase Auth (email + password or OTP)

**Password Reset Flow:**
1. User requests reset → OTP sent via email (Resend)
2. User enters OTP → verified
3. User sets new password

**Protected Routes:** All `/dashboard/*` routes require auth

---

## 🎯 Features

### Dashboard Home
- 4 large KPI cards (Sales, Orders, Customers, Products)
- 4 compact mini-charts (sparklines, progress bar, pie chart)
- 2 main charts (Weekly Sales area chart, Daily Orders bar chart)
- Date picker + source filter

### Products
- Product table with search/filter
- Add/edit with variants
- Image upload (Supabase Storage)
- Stock tracking
- Excel export

### Orders
- Order list with status filter
- Order details dialog
- Edit status
- Print invoice

### Marketing
- **Coupons:** Discount management with usage tracking
- **Campaigns:** Email/SMS wizard with Resend integration
- **Affiliates:** Commission tracking with auto-calculation

### Support
- **Queries:** Customer support tickets
- **Tickets:** Advanced ticket system with conversation threading

### Vendor Management
- Vendor database
- Purchase order tracking
- Vendor ledger (transaction history)

---

## 🛠️ Development

### Environment Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # For admin operations

# Email (Required for campaigns/password reset)
RESEND_API_KEY=re_...

# Call Center (Optional)
EXOTEL_API_KEY=...
EXOTEL_API_TOKEN=...
```

### Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding a New Screen

1. Create page: `app/dashboard/new-screen/page.tsx`
2. Create service: `lib/services/new-screen.service.ts`
3. Create hook: `lib/hooks/use-new-screen.ts`
4. Create types: `types/new-screen.types.ts`
5. Update sidebar: `components/layout/sidebar.tsx`

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import to Vercel (vercel.com/new)
# 3. Add environment variables in Vercel dashboard
# 4. Deploy (auto-deploys on push)
```

### Database (Supabase)

```bash
# Install Supabase CLI
npm install supabase -g

# Link project
supabase link --project-ref [your-ref]

# Push migrations
supabase db push

# Deploy Edge Functions
cd supabase
supabase functions deploy --project-ref [your-ref]
```

**Migrations Order:** Run files in `supabase/migrations/` by timestamp

---

## 📊 Database Setup

See `supabase/SETUP_DATABASE.sql` for consolidated migrations.

**Quick setup:**
1. Create Supabase project
2. Run `SETUP_DATABASE.sql` in SQL Editor
3. Verify tables created
4. Deploy Edge Functions
5. Update `.env.local` with credentials

---

## 🔍 Troubleshooting

**Charts not showing data:**
- Check console for RPC errors
- Verify date has orders: `SELECT * FROM orders WHERE DATE(created_at) = '2025-12-23'`
- Run test queries: `supabase/test_dashboard_functions.sql`

**Edge Function timeout:**
- Check logs: `supabase functions logs <name>`
- Optimize queries (add indexes)

**RLS blocking data:**
- Verify user role: `SELECT role FROM users WHERE auth_id = '<id>'`
- Check policies: `SELECT * FROM pg_policies`

---

## 📖 Full Documentation

All details in **[DOCUMENTATION.md](./DOCUMENTATION.md)**:
- Complete architecture breakdown
- Database schema with ER diagrams
- Screen-by-screen component guide
- All 20 Edge Functions documented
- Security policies (RLS)
- Performance optimizations
- Architecture decisions

---

## 📝 License

Proprietary - All rights reserved

---

**Version:** 2.0.0  
**Last Updated:** January 5, 2026  
**Built with:** Next.js 16 + Supabase
