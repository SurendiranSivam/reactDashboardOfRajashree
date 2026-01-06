# React Dashboard - Complete Technical Documentation

**Project Type:** Admin Dashboard (B2B E-commerce Management System)  
**Tech Stack:** Next.js 16 (App Router) + Supabase + TypeScript + Tailwind CSS v4  
**Purpose:** Comprehensive management system for products, orders, customers, marketing, and support

---

## 📋 Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Database Schema & Data Flow](#2-database-schema--data-flow)
3. [Frontend Component Architecture](#3-frontend-component-architecture)
4. [Backend Logic (Supabase)](#4-backend-logic-supabase)
5. [Setup & Contribution Guide](#5-setup--contribution-guide)

---

## 1. High-Level Architecture

### 1.1 Tech Stack (Exact Versions)

#### Frontend
```json
{
  "next": "16.1.1",              // App Router (React Server Components + Client Components)
  "react": "19.2.3",             // Latest React with concurrent features
  "react-dom": "19.2.3",
  "typescript": "^5"             // Full type safety
}
```

#### UI & Styling
```json
{
  "tailwindcss": "^4",           // Latest Tailwind with container queries
  "@tailwindcss/postcss": "^4",
  "lucide-react": "^0.562.0",    // Icon library (1000+ icons)
  "class-variance-authority": "^0.7.1",  // Component variants
  "clsx": "^2.1.1",              // Conditional classnames
  "tailwind-merge": "^3.4.0"     // Merge Tailwind classes intelligently
}
```

#### Component Libraries
```json
{
  "@radix-ui/react-dialog": "^1.1.15",       // Modals/Dialogs
  "@radix-ui/react-dropdown-menu": "^2.1.16", // Dropdowns
  "@radix-ui/react-popover": "^1.1.15",       // Popovers
  "@radix-ui/react-select": "^2.2.6",         // Select inputs
  "@radix-ui/react-checkbox": "^1.3.3",       // Checkboxes
  "@radix-ui/react-scroll-area": "^1.2.10",   // Custom scrollbars
  "sonner": "^2.0.7"                          // Toast notifications
}
```

#### Data Management
```json
{
  "@supabase/supabase-js": "^2.89.0",      // Supabase client (PostgreSQL + Auth + Storage)
  "@tanstack/react-query": "^5.90.15",     // Server state management + caching
  "@tanstack/react-table": "^8.21.3",      // Powerful table component
  "zustand": "^5.0.9"                       // Client state management (lightweight)
}
```

#### Form Handling & Validation
```json
{
  "react-hook-form": "^7.69.0",    // Form state management
  "@hookform/resolvers": "^5.2.2", // Zod integration
  "zod": "^4.2.1"                   // Schema validation
}
```

#### Utilities
```json
{
  "date-fns": "^4.1.0",              // Date formatting/manipulation
  "recharts": "^3.6.0",              // Chart library (SVG-based)
  "react-day-picker": "^9.13.0",     // Date picker component
  "xlsx": "^0.18.5",                 // Excel export
  "resend": "^6.6.0"                 // Email sending (transactional)
}
```

#### Backend (Supabase)
```
- PostgreSQL 15+ (hosted by Supabase)
- Supabase Auth (JWT-based authentication)
- Supabase Edge Functions (Deno runtime)
- Row Level Security (RLS) for fine-grained permissions
```

---

### 1.2 Folder Structure

```
react-dashboard/
│
├── app/                          # Next.js 16 App Router
│   ├── api/                      # API Routes (Server-Side)
│   │   ├── feeds/                # RSS/XML product feeds
│   │   │   └── products/route.ts  # Google Shopping feed
│   │   └── upload/route.ts       # File upload endpoint
│   │
│   ├── dashboard/                # Main dashboard app (protected)
│   │   ├── layout.tsx            # Dashboard layout wrapper
│   │   ├── page.tsx              # Dashboard home (KPIs, charts)
│   │   │
│   │   ├── affiliates/page.tsx   # Affiliate management
│   │   ├── banners/page.tsx      # Banner management
│   │   ├── campaigns/page.tsx    # Email/SMS campaigns
│   │   ├── combos/page.tsx       # Product combo deals
│   │   ├── coupons/page.tsx      # Discount coupons
│   │   ├── customers/page.tsx    # Customer database
│   │   ├── orders/page.tsx       # Order management
│   │   ├── products/page.tsx     # Product catalog
│   │   ├── purchases/page.tsx    # Vendor purchases (inventory)
│   │   ├── queries/page.tsx      # Customer support queries
│   │   ├── returns/page.tsx      # Return/refund management
│   │   ├── role-management/page.tsx  # RBAC permissions
│   │   ├── shipments/page.tsx    # Shipment tracking
│   │   ├── tickets/page.tsx      # Support ticket system
│   │   ├── users/page.tsx        # Admin user management
│   │   │
│   │   └── vendors/              # Vendor management
│   │       ├── page.tsx          # Vendor list
│   │       └── [id]/page.tsx     # Vendor ledger (dynamic)
│   │
│   ├── login/page.tsx            # Login screen
│   ├── forgot-password/page.tsx  # Password reset init
│   ├── verify-otp/page.tsx       # OTP verification
│   ├── reset-password/page.tsx   # New password set
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Redirect to /dashboard
│
├── components/                   # Reusable UI components
│   ├── layout/                   # Layout components
│   │   ├── app-bar.tsx           # Top navigation bar
│   │   ├── sidebar.tsx           # Collapsible sidebar
│   │   └── user-menu.tsx         # User dropdown menu
│   │
│   ├── ui/                       # Shadcn UI components (customizable)
│   │   ├── button.tsx            # Button variants
│   │   ├── card.tsx              # Card container
│   │   ├── dialog.tsx            # Modal dialog
│   │   ├── input.tsx             # Text input
│   │   ├── select.tsx            # Select dropdown
│   │   ├── table.tsx             # Table components
│   │   └── ...                   # 20+ UI primitives
│   │
│   └── ...                       # Feature-specific components
│
├── lib/                          # Core application logic
│   ├── contexts/                 # React contexts
│   │   └── auth-context.tsx      # Authentication state
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-auth.ts           # Auth hook
│   │   ├── use-products.ts       # Product data fetching
│   │   ├── use-orders.ts         # Order data fetching
│   │   ├── use-returns.ts        # Returns hook
│   │   └── ...                   # 11 custom hooks total
│   │
│   ├── services/                 # API service layers (22 files)
│   │   ├── dashboard.service.ts  # Dashboard analytics
│   │   ├── products.service.ts   # Product CRUD
│   │   ├── orders.service.ts     # Order operations
│   │   ├── customers.service.ts  # Customer data
│   │   ├── marketing.service.ts  # Coupons/campaigns
│   │   └── ...                   # All business logic
│   │
│   ├── utils/                    # Utility functions
│   │   └── cn.ts                 # Class name merger
│   │
│   ├── supabase.ts               # Supabase client setup
│   ├── types.ts                  # Shared TypeScript types
│   └── providers.tsx             # App-wide providers
│
├── types/                        # TypeScript definitions (12 files)
│   ├── database.types.ts         # Supabase generated types
│   ├── product.types.ts          # Product interfaces
│   ├── order.types.ts            # Order interfaces
│   └── ...                       # Domain-specific types
│
├── public/                       # Static assets
│   ├── logo.svg                  # App logo
│   └── ...                       # Images, icons
│
├── supabase/                     # Backend (separate from react-dashboard/)
│   ├── migrations/               # Database schema versions
│   │   ├── 20260102000002_create_vendors_table.sql
│   │   ├── 20260103000001_vendor_ledger_migration.sql
│   │   ├── 20260103000002_queries_tickets_system.sql
│   │   ├── 20260104000001_call_center_system.sql
│   │   ├── 20260105000001_marketing_growth_system.sql
│   │   ├── 20260105000002_add_marketing_permissions.sql
│   │   └── 20260105000003_dashboard_analytics_functions.sql
│   │
│   └── functions/                # Supabase Edge Functions (Deno)
│       ├── create-product-with-variants/
│       ├── get-purchases/
│       ├── get-queries/
│       ├── get-tickets/
│       ├── send-campaign/
│       ├── validate-coupon/
│       └── ...                   # 20 Edge Functions total
│
├── .env.local                    # Environment variables (gitignored)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind customization
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies

```

**Folder Rules:**
- `app/` - ONLY page routes and layouts. No business logic here.
- `components/` - Pure UI components. Can be client or server components.
- `lib/services/` - ALL API calls and business logic go here.
- `lib/hooks/` - Custom React hooks that use services.
- `types/` - TypeScript interfaces shared across multiple files.

---

## 2. Database Schema & Data Flow

### 2.1 Core Tables (ER Diagram Text-Based)

#### 2.1.1 Products & Inventory

**`products`** (Main product catalog)
```sql
Column Name          | Type      | Constraints           | Purpose
---------------------|-----------|----------------------|---------------------------
product_id           | TEXT      | PRIMARY KEY          | Unique product identifier
product_name         | TEXT      | NOT NULL             | Display name
category             | TEXT      |                      | Product category
subcategory          | TEXT      |                      | Sub-classification
brand                | TEXT      |                      | Brand name
price                | NUMERIC   | NOT NULL, >= 0       | Base selling price
cost                 | NUMERIC   | >= 0                 | Cost price (for margin calc)
stock_quantity       | INTEGER   | DEFAULT 0            | Current stock level
min_stock_level      | INTEGER   | DEFAULT 0            | Reorder threshold
description          | TEXT      |                      | Product description
product_image_url    | TEXT      |                      | Main product image
is_active            | BOOLEAN   | DEFAULT true         | Visibility status
created_at           | TIMESTAMP | DEFAULT now()        | Creation timestamp
updated_at           | TIMESTAMP | DEFAULT now()        | Last update
```

**`product_variants`** (Size/color variations)
```sql
variant_id           | TEXT      | PRIMARY KEY          | Unique variant ID
product_id           | TEXT      | FK -> products       | Parent product
variant_type         | TEXT      |                       | Type (size/color/etc)
variant_value        | TEXT      |                      | Value (M/L/XL, Red/Blue)
price_adjustment     | NUMERIC   | DEFAULT 0            | Price difference from base
stock_quantity       | INTEGER   | DEFAULT 0            | Variant-specific stock
```

**`vendors`** (Supplier database)
```sql
vendor_id            | TEXT      | PRIMARY KEY          | Unique vendor ID
vendor_name          | TEXT      | NOT NULL             | Company name
contact_person       | TEXT      |                      | Contact name
contact_number       | TEXT      |                      | Phone (10 digits)
email                | TEXT      |                      | Email address
address              | TEXT      |                      | Full address
city                 | TEXT      |                      | City
state                | TEXT      |                      | State
pincode              | TEXT      |                      | Postal code (6 digits)
gst_number           | TEXT      |                      | GST registration
payment_terms        | TEXT      |                      | Payment conditions
is_active            | BOOLEAN   | DEFAULT true         | Active status
```

**`purchases`** (Inventory procurement)
```sql
purchase_id          | TEXT      | PRIMARY KEY          | PO number
vendor_id            | TEXT      | FK -> vendors        | Supplier
purchase_date        | DATE      | NOT NULL             | Order date
expected_delivery    | DATE      |                      | ETA
total_amount         | NUMERIC   | NOT NULL             | Total cost
payment_status       | TEXT      |                      | Paid/Pending/Partial
payment_method       | TEXT      |                      | Cash/Bank/UPI
notes                | TEXT      |                      | Additional info
status               | TEXT      | DEFAULT 'Pending'    | Order status
```

---

#### 2.1.2 Orders & Customers

**`orders`**
```sql
order_id             | TEXT      | PRIMARY KEY          | Unique order ID
customer_id          | INTEGER   | FK -> customers      | Buyer
order_status         | TEXT      |                      | pending/paid/shipped/cancelled
total_amount         | NUMERIC   | NOT NULL             | Order total
shipping_amount      | NUMERIC   | DEFAULT 0            | Shipping cost
payment_method       | TEXT      |                      | Payment type
order_note           | TEXT      |                      | Special instructions (contains affiliate code if applicable)
source               | TEXT      |                      | Order channel (Website/WhatsApp/Call)
created_at           | TIMESTAMP | DEFAULT now()        | Order timestamp
payment_transaction_id | TEXT    |                      | Payment reference
shipping_address     | TEXT      |                      | Delivery address
shipping_state       | TEXT      |                      | State
shipping_pincode     | TEXT      |                      | Postal code
contact_number       | TEXT      |                      | Customer phone
name                 | TEXT      |                      | Customer name
```

**`order_items`**
```sql
item_id              | BIGINT    | PRIMARY KEY          | Auto-increment ID
order_id             | TEXT      | FK -> orders         | Parent order
product_id           | TEXT      | FK -> products       | Product ordered
variant_id           | TEXT      | FK -> product_variants? | Variant if applicable
quantity             | INTEGER   | NOT NULL, > 0        | Qty ordered
price                | NUMERIC   | NOT NULL             | Unit price at order time
discount             | NUMERIC   | DEFAULT 0            | Item-level discount
```

**`customers`**
```sql
customer_id          | INTEGER   | PRIMARY KEY          | Auto-increment ID
name                 | TEXT      | NOT NULL             | Full name
email                | TEXT      | UNIQUE               | Email address
mobile               | TEXT      |                      | Phone number
address              | TEXT      |                      | Address
city                 | TEXT      |                      | City
state                | TEXT      |                      | State
pincode              | TEXT      |                      | Postal code
created_at           | TIMESTAMP | DEFAULT now()        | Registration date
```

---

#### 2.1.3 Marketing & Growth

**`coupons`**
```sql
id                   | UUID      | PRIMARY KEY          | Coupon ID
code                 | TEXT      | UNIQUE, NOT NULL     | Coupon code (auto-uppercase)
type                 | ENUM      | discount_type        | percentage/fixed_amount/buy_x_get_y
value                | NUMERIC   | > 0                  | Discount value
min_order_value      | NUMERIC   | >= 0                 | Minimum order requirement
usage_limit          | INTEGER   | NULL or > 0          | Max redemptions (NULL = unlimited)
usage_count          | INTEGER   | DEFAULT 0            | Times used
starts_at            | TIMESTAMP | NOT NULL             | Valid from
expires_at           | TIMESTAMP | NOT NULL             | Valid until
is_active            | BOOLEAN   | DEFAULT true         | Active status
```

**`affiliates`**
```sql
id                   | UUID      | PRIMARY KEY          | Affiliate ID
user_id              | UUID      | FK -> auth.users     | Linked user account
referral_code        | TEXT      | UNIQUE, NOT NULL     | Referral code (auto-uppercase alphanumeric)
commission_rate      | NUMERIC   | 0-100                | Commission percentage
total_earnings       | NUMERIC   | >= 0                 | Lifetime earnings
bank_details         | JSONB     |                      | Payout details
is_active            | BOOLEAN   | DEFAULT true         | Active status
```

**`referral_logs`**
```sql
id                   | UUID      | PRIMARY KEY          | Log ID
order_id             | TEXT      | FK -> orders         | Order with referral
affiliate_id         | UUID      | FK -> affiliates     | Affiliate who referred
commission_amount    | NUMERIC   | >= 0                 | Commission earned
order_total          | NUMERIC   |                      | Order value
commission_rate      | NUMERIC   |                      | Rate applied
created_at           | TIMESTAMP | DEFAULT now()        | Log timestamp
```

**`campaigns`**
```sql
id                   | UUID      | PRIMARY KEY          | Campaign ID
name                 | TEXT      | NOT NULL             | Campaign name
subject_line         | TEXT      | NOT NULL             | Email subject
content              | TEXT      | NOT NULL             | Email/SMS body
channel              | ENUM      | campaign_channel     | email/sms
target_segment       | TEXT      | DEFAULT 'all'        | Audience filter
status               | ENUM      | campaign_status      | draft/scheduled/sent
sent_at              | TIMESTAMP |                      | Send timestamp
created_by           | UUID      | FK -> auth.users     | Creator
```

---

#### 2.1.4 Support & Communication

**`queries`**
```sql
query_id             | UUID      | PRIMARY KEY          | Query ID
customer_id          | INTEGER   | FK -> customers      | Customer
subject              | TEXT      | NOT NULL             | Query topic
message              | TEXT      | NOT NULL             | Query content
status               | TEXT      | DEFAULT 'open'       | open/in_progress/closed
priority             | TEXT      | DEFAULT 'medium'     | low/medium/high
assigned_to          | TEXT      |                      | Admin username
created_at           | TIMESTAMP | DEFAULT now()        | Creation time
updated_at           | TIMESTAMP | DEFAULT now()        | Last update
resolved_at          | TIMESTAMP |                      | Resolution time
order_id             | TEXT      | FK -> orders?        | Related order
```

**`tickets`**
```sql
ticket_id            | UUID      | PRIMARY KEY          | Ticket ID
customer_id          | INTEGER   | FK -> customers      | Customer
subject              | TEXT      | NOT NULL             | Ticket subject
description          | TEXT      | NOT NULL             | Issue description
status               | TEXT      | DEFAULT 'open'       | open/in_progress/resolved/closed
priority             | TEXT      | DEFAULT 'medium'     | low/medium/high
category             | TEXT      |                      | Issue category
assigned_to          | UUID      | FK -> auth.users?    | Assigned admin
created_at           | TIMESTAMP | DEFAULT now()        | Creation time
updated_at           | TIMESTAMP | DEFAULT now()        | Last update
resolved_at          | TIMESTAMP |                      | Resolution time
```

**`ticket_messages`**
```sql
message_id           | UUID      | PRIMARY KEY          | Message ID
ticket_id            | UUID      | FK -> tickets        | Parent ticket
sender_type          | TEXT      |                      | customer/admin
sender_id            | TEXT      |                      | Sender identifier
message              | TEXT      | NOT NULL             | Message content
created_at           | TIMESTAMP | DEFAULT now()        | Send time
```

---

#### 2.1.5 Call Center Integration

**`calls`**
```sql
id                   | UUID      | PRIMARY KEY          | Call ID
exotel_call_sid      | TEXT      | UNIQUE               | Exotel call identifier
customer_phone       | TEXT      |                      | Caller phone number
agent_phone          | TEXT      |                      | Agent phone number
direction            | TEXT      |                      | inbound/outbound
status               | TEXT      |                      | busy/completed/no-answer
duration             | INTEGER   |                      | Call duration (seconds)
recording_url        | TEXT      |                      | Call recording URL
started_at           | TIMESTAMP |                      | Call start time
ended_at             | TIMESTAMP |                      | Call end time
created_at           | TIMESTAMP | DEFAULT now()        | Log creation
```

---

#### 2.1.6 RBAC (Role-Based Access Control)

**`users`** (Internal admin users)
```sql
user_id              | TEXT      | PRIMARY KEY          | User ID
auth_id              | TEXT      | FK -> auth.users.id  | Supabase Auth ID
username             | TEXT      | UNIQUE, NOT NULL     | Login username
full_name            | TEXT      |                      | Display name
email                | TEXT      | UNIQUE               | Email
role                 | TEXT      | NOT NULL             | Role name (Admin/Manager/Sales/etc)
is_active            | BOOLEAN   | DEFAULT true         | Account status
created_at           | TIMESTAMP | DEFAULT now()        | Creation time
```

**`roles`**
```sql
role_id              | TEXT      | PRIMARY KEY          | Role ID
role_name            | TEXT      | UNIQUE, NOT NULL     | Role display name
description          | TEXT      |                      | Role description
is_active            | BOOLEAN   | DEFAULT true         | Role status
```

**`permissions`**
```sql
permission_id        | TEXT      | PRIMARY KEY          | Permission ID
module               | TEXT      | NOT NULL             | Module name (products/orders/etc)
action               | TEXT      | NOT NULL             | Action (view/read/update/delete/export)
permission_key       | TEXT      | UNIQUE               | Composite key (module.action)
description          | TEXT      |                      | Permission description
```

**`role_permissions`** (Many-to-many)
```sql
role_id              | TEXT      | FK -> roles          | Role
permission_id        | TEXT      | FK -> permissions    | Permission
```

---

### 2.2 Database Enums

```sql
-- Marketing
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'buy_x_get_y');
CREATE TYPE campaign_channel AS ENUM ('email', 'sms');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sent');

-- (Additional enums may exist in migrations)
```

---

### 2.3 Key Data Flows

#### Data Flow 1: User Places Order
```
1. Customer adds products to cart (client-side state)
2. Customer proceeds to checkout
3. Frontend calls POST /api/orders
4. Server validates coupon (if applied) via RPC `validate_coupon`
5. Server creates order in `orders` table
6. Server creates order_items for each product
7. Server decrements product stock
8. If order_note contains "ref=XXXX":
   - Trigger `calculate_affiliate_commission` fires
   - Checks if XXXX matches active affiliate referral_code
   - Creates `referral_logs` entry
   - Updates `affiliates.total_earnings`
9. Server returns order confirmation
10. Frontend displays success message
```

#### Data Flow 2: Admin Sends Email Campaign
```
1. Admin creates campaign in `/dashboard/campaigns`
2. Frontend calls Edge Function `send-campaign`
3. Edge Function:
   - Fetches customer segment from `customers` table
   - Uses Resend API to send emails
   - Updates campaign status to 'sent'
   - Records sent_at timestamp
4. Returns success count to frontend
```

#### Data Flow 3: Customer Submits Support Query
```
1. Customer fills form on website
2. Frontend calls Edge Function `create-query` (or direct DB insert)
3. Query inserted into `queries` table with status='open'
4. Admin views query in `/dashboard/queries`
5. Admin responds (could be via `ticket_messages` or query notes)
6. Status updated to 'closed' when resolved
```

#### Data Flow 4: Dashboard Analytics (Sales Data)
```
1. User selects date in dashboard date picker
2. Frontend calls `dashboardService.getDailySalesStats(date, source)`
3. Service layer calls Supabase RPC `get_daily_sales_stats`
4. RPC function:
   - Queries `orders` table WHERE DATE(created_at) = target_date
   - Filters by source if specified
   - Aggregates: SUM(total_amount), COUNT(*), AVG(total_amount)
   - Returns single row
5. Service returns data to component
6. Component updates KPI cards and charts
```

---

## 3. Frontend Component Architecture

### 3.1 Screen-by-Screen Breakdown

#### 3.1.1 Dashboard Home (`/dashboard`)
**File:** `app/dashboard/page.tsx`  
**Type:** Client Component (`'use client'`)

**Key Components:**
- 4 large KPI cards (Sales, Orders, Customers, Products)
- 4 mini KPI charts (Sales sparkline, Orders sparkline, Avg Order progress bar, Active Rate pie chart)
- 2 main charts (Weekly Sales Performance area chart, Daily Order Distribution bar chart)
- Date picker (Radix UI + react-day-picker)
- Source filter dropdown (All/Website/WhatsApp/Call)

**Data Fetching:**
```tsx
useEffect(() => {
  const [dailyStats, customers, products, weekly] = await Promise.all([
    dashboardService.getDailySalesStats(selectedDate, selectedSource),
    dashboardService.getTotalCustomers(),
    dashboardService.getTotalProducts(),
    dashboardService.getWeeklySalesStats(selectedDate),
  ]);
  // Update state
}, [selectedDate, selectedSource]);
```

**Chart Library:** Recharts
- AreaChart for sales
- BarChart for orders
- LineChart for sparklines
- PieChart for ratios

---

#### 3.1.2 Products (`/dashboard/products`)
**File:** `app/dashboard/products/page.tsx`

**Features:**
- Product table with search/filter
- Add/Edit product dialog (React Hook Form + Zod)
- Variant management (dynamic form fields)
- Image upload (to Supabase Storage)
- Stock level indicators
- Export to Excel (xlsx library)

**State Management:** 
- `useProducts` hook (wraps React Query)
- Zustand for client-side cart state (if applicable)

**Data Flow:**
```
Add Product → 
  Form Submit → 
    Edge Function `create-product-with-variants` → 
      Insert into products + product_variants → 
        Returns new product → 
          React Query invalidates cache → 
            Table refreshes
```

---

#### 3.1.3 Orders (`/dashboard/orders`)
**File:** `app/dashboard/orders/page.tsx`

**Features:**
- Order list table (TanStack Table)
- Status filter (pending/shipped/delivered)
- Order details dialog
- Edit order status
- View order items (expandable row)
- Print invoice

**Data Fetching:**
```tsx
const { data: orders } = useOrders({
  status: statusFilter,
  dateRange: [startDate, endDate]
});
```

**Key Logic:**
- Status transitions: User can update `order_status`
- Triggers affiliate commission calculation on status = 'paid'

---

#### 3.1.4 Customers (`/dashboard/customers`)
**Features:**
- Customer table with search
- Multi-select checkboxes for bulk actions
- State filter dropdown
- 4 summary KPI cards (Total Customers, New This Month, Email Coverage, Mobile Coverage)
- Export customer list

---

#### 3.1.5 Coupons (`/dashboard/coupons`)
**Features:**
- Coupon table
- Add/Edit coupon form
- Auto-uppercase code (client + server-side trigger)
- Date range picker (starts_at, expires_at)
- Usage tracking (usage_count vs usage_limit)
- Inline validation (Zod schema)

---

#### 3.1.6 Campaigns (`/dashboard/campaigns`)
**Features:**
- Campaign wizard (multi-step form)
- Rich text editor for email content
- Customer segment selector (all/state/city)
- Preview before send
- Send button triggers Edge Function `send-campaign`

---

#### 3.1.7 Queries (`/dashboard/queries`)
**Features:**
- Query table with filters (status/priority)
- Assign to admin dropdown
- Reply dialog
- Status update (open → in_progress → closed)

---

#### 3.1.8 Vendors & Vendor Ledger
**Vendors List:** `/dashboard/vendors`
**Vendor Ledger:** `/dashboard/vendors/[id]`

**Dynamic Routing:**
```tsx
// app/dashboard/vendors/[id]/page.tsx
export default async function VendorLedgerPage({ params }: { params: { id: string } }) {
  const vendorId = params.id;
  // Fetch vendor + purchases
}
```

**Features:**
- Transaction history (purchases)
- Payment tracking
- Balance calculation

---

### 3.2 Layout Architecture

#### Root Layout (`app/layout.tsx`)
```tsx
<html>
  <body>
    <Providers>  {/* React Query + Zustand + Theme */}
      {children}  {/* All pages */}
    </Providers>
  </body>
</html>
```

#### Dashboard Layout (`app/dashboard/layout.tsx`)
```tsx
<div className="flex h-screen">
  {/* Collapsible Sidebar (hover-based auto-expand) */}
  <Sidebar isCollapsed={isSidebarCollapsed} />
  
  <div className="flex-1 flex flex-col">
    {/* App Bar (top nav) */}
    <AppBar />
    
    {/* Page Content */}
    <main className="flex-1 overflow-auto">
      {children}  {/* Dashboard sub-pages */}
    </main>
  </div>
</div>
```

**Sidebar Logic:**
- Starts collapsed (80px width)
- Expands on mouse enter (288px width)
- Collapses on mouse leave
- Smooth 300ms transition

---

### 3.3 Authentication Flow

**Protected Routes:** All `/dashboard/*` routes

**Auth Context:** `lib/contexts/auth-context.tsx`

**Login Flow:**
```
1. User visits /login
2. User enters username/password
3. Frontend calls Supabase Auth: supabase.auth.signInWithPassword()
4. Supabase returns JWT token
5. Token stored in cookies (HTTP-only for security)
6. Middleware checks token on all /dashboard requests
7. If invalid → redirect to /login
```

**Password Reset Flow:**
```
1. /forgot-password → User enters email
2. Edge Function generates OTP (6-digit)
3. OTP stored in `password_reset_otp` table
4. Email sent via Resend
5. User enters OTP in /verify-otp
6. Backend validates OTP
7. User sets new password in /reset-password
8. Supabase Auth updates password
```

---

## 4. Backend Logic (Supabase)

### 4.1 Supabase Edge Functions (20 Functions)

**Location:** `supabase/functions/`  
**Runtime:** Deno (TypeScript)  
**Deployment:** `supabase functions deploy <function-name>`

#### 4.1.1 Product Management

**`create-product-with-variants`**
- **Input:** `{ product, variants[] }`
- **Logic:** 
  - Validates product data
  - Inserts into `products` table
  - Inserts each variant into `product_variants`
  - Returns created product with variants
- **Output:** `{ success, product }`

**`update-product-with-variants`**
- **Input:** `{ product_id, updates, variants[] }`
- **Logic:** Updates product + syncs variants
- **Output:** `{ success }`

---

#### 4.1.2 Vendor & Procurement

**`create-vendor`**
- **Input:** `{ vendor_name, contact, ... }`
- **Output:** `{ success, vendor_id }`

**`get-vendor-purchases`**
- **Input:** `{ vendor_id }`
- **Output:** `{ success, purchases[] }`

**`create-vendor-purchase`**
- **Input:** `{ vendor_id, items[], total_amount, ... }`
- **Logic:** Creates purchase + updates inventory
- **Output:** `{ success, purchase_id }`

---

#### 4.1.3 Marketing

**`validate-coupon`**
- **Input:** `{ code, order_total }`
- **Logic:**
  - Checks if code exists and is active
  - Validates date range (now BETWEEN starts_at AND expires_at)
  - Checks usage_limit
  - Checks min_order_value
  - Calculates discount
- **Output:** `{ valid, discount_amount, error_message }`

**` send-campaign`**
- **Input:** `{ campaign_id, customer_segment }`
- **Logic:**
  - Fetches campaign from `campaigns` table
  - Fetches customers based on segment
  - Uses Resend API to send emails
  - Updates campaign status to 'sent'
  - Records sent_at timestamp
- **Output:** `{ success, sent_count }`

---

#### 4.1.4 Support

**`get-queries`**
- **Input:** `{ status?, assigned_to? }`
- **Output:** `{ queries[] }`

**`get-tickets`**
- **Input:** `{ status?, priority? }`
- **Output:** `{ tickets[] }`

---

#### 4.1.5 Call Center (Exotel Integration)

**`handle-incoming-call`**
- **Input:** Exotel webhook payload
- **Logic:** Logs call in `calls` table
- **Output:** Exotel response XML

**`handle-call-status`**
- **Input:** Exotel status update webhook
- **Logic:** Updates call status/duration
- **Output:** `{ success }`

**`handle-recording-ready`**
- **Input:** Exotel recording URL webhook
- **Logic:** Updates `recording_url` in calls table
- **Output:** `{ success }`

---

### 4.2 Database Triggers (Automated Logic)

#### Trigger 1: Uppercase Coupon Code
```sql
CREATE TRIGGER trg_uppercase_coupon_code
  BEFORE INSERT OR UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION uppercase_coupon_code();
```
**Purpose:** Ensures all coupon codes are uppercase (e.g., "save10" → "SAVE10")

---

#### Trigger 2: Affiliate Commission Calculation
```sql
CREATE TRIGGER trg_affiliate_commission
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_affiliate_commission();
```
**Logic:**
1. Fires when `order_status` changes to 'paid'
2. Checks if `order_note` contains "ref=XXXX"
3. Extracts referral code
4. Looks up affiliate in `affiliates` table
5. Calculates commission: `total_amount * commission_rate / 100`
6. Inserts into `referral_logs`
7. Updates `affiliates.total_earnings`

---

### 4.3 Row Level Security (RLS) Policies

#### Public Tables (Read Access)
```sql
-- Coupons: Anyone can read active coupons
CREATE POLICY "Public can read active coupons"
  ON coupons FOR SELECT
  TO public
  USING (is_active = true AND now() BETWEEN starts_at AND expires_at);
```

#### Admin-Only Tables
```sql
-- Campaigns: Only admins can manage
CREATE POLICY "Admins can manage campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM users WHERE user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()::text LIMIT 1)) = 'Admin'
  );
```

#### User-Specific Access
```sql
-- Affiliates: Users can view their own data
CREATE POLICY "Users can view own affiliate"
  ON affiliates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

---

### 4.4 RPC Functions (Stored Procedures)

#### `get_daily_sales_stats(p_target_date DATE, p_dsource_filter TEXT)`
**Returns:**
```
{
  target_date: DATE,
  total_sales: NUMERIC,
  order_count: BIGINT,
  average_order_value: NUMERIC
}
```

**Logic:**
```sql
SELECT 
  p_target_date AS target_date,
  SUM(total_amount) AS total_sales,
  COUNT(*) AS order_count,
  AVG(total_amount) AS average_order_value
FROM orders
WHERE DATE(created_at) = p_target_date
  AND (p_dsource_filter = 'All' OR source = p_dsource_filter)
  AND order_status != 'cancelled'
```

---

#### `get_weekly_sales_stats(p_target_date DATE)`
**Returns:** Array of 7 rows (Mon-Sun) containing week of `p_target_date`

---

## 5. Setup & Contribution Guide

### 5.1 Environment Variables

Create `.env.local` in `react-dashboard/`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1... # For admin operations

# Email (Resend - Required for campaigns/password reset)
RESEND_API_KEY=re_... # Get from https://resend.com

# Call Center (Optional - for Exotel integration)
EXOTEL_API_KEY=...
EXOTEL_API_TOKEN=...
EXOTEL_SID=...

# Next.js (Auto-set by Vercel)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**Where to get them:**
- **Supabase:** https://supabase.com/dashboard → Project Settings → API
- **Resend:** https://resend.com/api-keys
- **Exotel:** https://my.exotel.com/settings/api

---

### 5.2 Installation (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/your-org/dashboard-main.git
cd dashboard-main/react-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Run development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

---

### 5.3 Database Setup

#### Option A: Fresh Setup
```bash
# 1. Create Supabase project at https://supabase.com

# 2. Install Supabase CLI
npm install supabase -g

# 3. Link to your project
supabase link --project-ref [your-project-ref]

# 4. Push migrations
supabase db push

# 5. Deploy Edge Functions
cd supabase
supabase functions deploy send-campaign
supabase functions deploy validate-coupon
# ... deploy all 20 functions
```

#### Option B: Use Existing Schema
```bash
# Run migrations in order (in Supabase SQL Editor):
1. 20260102000002_create_vendors_table.sql
2. 20260103000001_vendor_ledger_migration.sql
3. 20260103000002_queries_tickets_system.sql
4. 20260104000001_call_center_system.sql
5. 20260105000001_marketing_growth_system.sql
6. 20260105000002_add_marketing_permissions.sql
7. 20260105000003_dashboard_analytics_functions.sql

# Then run:
- rbac_schema.sql (for role-based access control)
- RUN_THIS_SALES_FUNCTIONS.sql (for dashboard analytics)
```

---

### 5.4 Deployment

#### Frontend (Vercel)
```bash
# 1. Push to GitHub
git push origin main

# 2. Import to Vercel
# https://vercel.com/new

# 3. Add environment variables in Vercel dashboard

# 4. Deploy
# Vercel auto-deploys on git push
```

#### Backend (Supabase)
```bash
# Edge Functions
supabase functions deploy --project-ref [your-ref]

# Database migrations
supabase db push --project-ref [your-ref]
```

---

### 5.5 Testing Locally

```bash
# Run tests (if configured)
npm test

# Type check
npm run build  # TypeScript errors will show

# Lint
npm run lint
```

---

### 5.6 Contributing Guidelines

**Branch Naming:**
```
feature/product-search
fix/dashboard-chart-data
hotfix/coupon-validation
```

**Commit Messages:**
```
feat: Add multi-select to customer table
fix: Correct affiliate commission calculation
docs: Update README with RPC function details
```

**Pull Request Process:**
1. Create feature branch
2. Make changes
3. Test locally
4. Push and create PR
5. Request review
6. Merge after approval

---

### 5.7 Common Tasks

#### Add a New Screen
```bash
# 1. Create page file
touch app/dashboard/new-screen/page.tsx

# 2. Add to sidebar
# Edit components/layout/sidebar.tsx

# 3. Create service layer
touch lib/services/new-screen.service.ts

# 4. Create types
touch types/new-screen.types.ts
```

#### Add a New Database Table
```bash
# 1. Create migration file
cd supabase/migrations
touch $(date +%Y%m%d%H%M%S)_add_new_table.sql

# 2. Define schema
# CREATE TABLE new_table (...);

# 3. Add RLS policies

# 4. Push to Supabase
supabase db push
```

---

## 6. Performance & Optimization

### 6.1 Frontend Optimizations
- **React Query** caches all API responses (5-minute default)
- **Dynamic imports** for heavy components (charts, tables)
- **Image optimization** via Next.js `<Image />` component
- **Code splitting** automatic with App Router

### 6.2 Database Optimizations
- **Indexes** on frequently queried columns (order_status, created_at, customer_id)
- **RPC functions** for complex queries (faster than client-side joins)
- **Connection pooling** via Supabase's built-in Supavisor

---

## 7. Security

### 7.1 Authentication
- JWT tokens stored in HTTP-only cookies
- Token expiration: 1 hour (refresh token: 7 days)
- Password hashing: bcrypt (handled by Supabase Auth)

### 7.2 Authorization
- Row Level Security (RLS) enforced on all tables
- Middleware checks for valid session on protected routes
- Admin-only routes verified via RBAC

### 7.3 Input Validation
- Client-side: Zod schemas
- Server-side: Edge Function validation
- SQL injection protected via parameterized queries (Supabase client auto-escapes)

---

## 8. Troubleshooting

### Issue: Charts not showing data
**Solution:** 
1. Run database tests: `supabase/test_dashboard_functions.sql`
2. Check console logs for RPC errors
3. Verify date has orders: `SELECT * FROM orders WHERE DATE(created_at) = '2025-12-23'`

### Issue: Edge Function timeout
**Solution:**
- Check function logs: `supabase functions logs <function-name>`
- Optimize database queries (add indexes)
- Increase timeout in `deno.json` (max 55s)

### Issue: RLS blocking data
**Solution:**
- Verify user role: `SELECT role FROM users WHERE auth_id = '<user-auth-id>'`
- Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'your_table'`

---

## 9. Architecture Decisions

### Why App Router over Pages Router?
- Server Components reduce client bundle size
- Streaming SSR for faster initial loads
- Built-in layouts (no need for _app.tsx)

### Why Zustand over Redux?
- Simpler API (less boilerplate)
- Better TypeScript support
- Smaller bundle size (1KB vs 10KB)

### Why Recharts over Chart.js?
- SVG-based (better for responsive dashboards)
- React-native support (future mobile app)
- Declarative API matches React paradigm

---

## 10. Roadmap & Future Enhancements

**Q1 2026:**
- [ ] Real-time order updates (Supabase Realtime)
- [ ] Mobile app (React Native with shared types)
- [ ] Advanced analytics (Metabase integration)

**Q2 2026:**
- [ ] Multi-warehouse inventory
- [ ] Automated reorder points
- [ ] Customer portal (self-service)

---

## 11. Appendix

### 11.1 Complete Dependency List
See `package.json` for exact versions.

### 11.2 Database ERD
(Use tool like dbdiagram.io to visualize from schema)

### 11.3 API Endpoint Reference
```
GET  /api/feeds/products      # Google Shopping XML feed
POST /api/upload               # File upload endpoint
```

### 11.4 Supabase Edge Functions Full List
```
1.  create-product-with-variants
2.  update-product-with-variants
3.  create-vendor
4.  update-vendor
5.  delete-vendor
6.  get-vendors
7.  create-vendor-purchase (create-purchase)
8.  get-vendor-purchases
9.  delete-vendor-purchase (delete-purchase)
10. get-purchases
11. get-queries
12. get-tickets
13. validate-coupon
14. send-campaign
15. send-email
16. handle-incoming-call
17. handle-call-status
18. handle-recording-ready
19. (Future functions as needed)
20. (Reserved)
```

---

**Last Updated:** January 5, 2026  
**Maintained By:** Development Team  
**Questions?** [your-team-email@company.com]
