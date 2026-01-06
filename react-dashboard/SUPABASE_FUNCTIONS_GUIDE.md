# Supabase Database Functions - React Integration Guide

**Last Updated:** December 30, 2025  
**Total Functions:** 38

---

## 📊 Function Categories

### 1. Queries & Tickets (5 functions)
| Function | Status | Purpose |
|----------|--------|---------|
| `check_query_duplicate` | ⏳ Not Used | Check if query already exists |
| `find_or_create_ticket` | ⏳ Ready | Smart ticket creation (prevents duplicates) |
| `get_queries_full` | ⏳ Not Used | Get all queries with full details |
| `get_query_with_messages` | ⏳ Not Used | Get single query with message history |

### 2. Orders & Cart (6 functions)
| Function | Status | Purpose |
|----------|--------|---------|
| `get_next_order_id` | ⏳ Not Used | Generate next order ID |
| `get_order_details` | ⏳ Not Used | Get full order details as JSON |
| `add_to_cart` | ⏳ Not Used | Add product to customer cart |
| `get_cart` | ⏳ Not Used | Get customer's cart items |
| `place_order` | ⏳ Not Used | Create new order from cart |

### 3. Products & Inventory (6 functions)
| Function | Status | Purpose |
|----------|--------|---------|
| `count_products` | ⏳ Not Used | Get total product count |
| `get_total_products` | ⏳ Not Used | Get product count |
| `get_product_with_variants` | ⏳ Not Used | Get product with all variants |
| `increment_stock` | ⏳ Not Used | Increase variant stock |
| `decrement_stock` | ⏳ Not Used | Decrease variant stock |
| `daily_sku_summary_with_stock` | ⏳ Not Used | Daily SKU sales with current stock |

### 4. Analytics & Reports (4 functions)
| Function | Status | Purpose |
|----------|--------|---------|
| `get_daily_sales_stats` | ⏳ **HIGH PRIORITY** | Daily sales dashboard stats |
| `get_weekly_sales_stats` | ⏳ **HIGH PRIORITY** | Weekly sales dashboard stats |
| `daily_sku_summary` | ⏳ Not Used | Daily SKU sales summary |
| `daily_sku_summary_withstock` | ⏳ Not Used | Daily SKU with stock levels |

### 5. Authentication (1 function)
| Function | Status | Purpose |
|----------|--------|---------|
| `login_internal_user` | ⏳ **NEEDED** | Admin/staff login |

### 6. Utilities (3 functions)
| Function | Status | Purpose |
|----------|--------|---------|
| `analyze_sentiment` | ⏳ Not Used | AI sentiment analysis on reviews |
| `commit_transaction` | ⏳ Not Used | Transaction management |
| `rollback_transaction` | ⏳ Not Used | Transaction rollback |

### 7. Triggers (13 functions)
These are database triggers, not called directly:
- `set_order_id`
- `set_order_item_id`
- `set_purchase_updated_at`
- `set_updated_at`
- `set_vendor_updated_at`
- `trigger_analyze_sentiment`
- `update_timestamp`
- `update_updated_at_column`

---

## 🚀 High Priority Integrations

### 1. Dashboard Analytics

```typescript
// lib/services/analytics.service.ts
import { supabase } from '@/lib/supabase';

export interface DailySalesStats {
  sale_date: string;
  total_sales: number;
  order_count: number;
}

export interface WeeklySalesStats extends DailySalesStats {
  pending_count: number;
  completed_count: number;
  cancelled_count: number;
}

export async function getDailySalesStats(
  targetDate?: string,
  sourceFilter?: string
): Promise<DailySalesStats[]> {
  try {
    const { data, error } = await supabase.rpc('get_daily_sales_stats', {
      target_date: targetDate || new Date().toISOString().split('T')[0],
      dsource_filter: sourceFilter,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching daily sales stats:', error);
    return [];
  }
}

export async function getWeeklySalesStats(): Promise<WeeklySalesStats[]> {
  try {
    const { data, error } = await supabase.rpc('get_weekly_sales_stats');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching weekly sales stats:', error);
    return [];
  }
}
```

### 2. Smart Ticket Management

```typescript
// lib/services/queries.service.ts (UPDATE)

export async function findOrCreateTicket(
  source: string,
  name: string,
  mobile: string,
  email: string,
  orderId: string,
  message: string,
  priority: string = 'medium'
): Promise<number | null> {
  try {
    const { data, error } = await supabase.rpc('find_or_create_ticket', {
      p_source: source,
      p_name: name,
      p_mobile: mobile,
      p_email: email,
      p_order_id: orderId,
      p_message: message,
      p_priority: priority,
    });

    if (error) throw error;
    return data; // Returns query_id
  } catch (error) {
    console.error('Error finding/creating ticket:', error);
    return null;
  }
}
```

### 3. Authentication

```typescript
// lib/services/auth.service.ts
import { supabase } from '@/lib/supabase';

export interface InternalUser {
  user_id: number;
  full_name: string;
  role: 'admin' | 'staff';
  email: string;
}

export async function loginInternalUser(
  email: string,
  password: string
): Promise<InternalUser | null> {
  try {
    const { data, error } = await supabase.rpc('login_internal_user', {
      p_email: email,
      p_password: password,
    });

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
}
```

---

## 📝 Integration Examples

### Example 1: Enhanced Dashboard with Analytics

```typescript
// app/dashboard/page.tsx (ENHANCED VERSION)
'use client';

import { useQuery } from '@tanstack/react-query';
import { getDailySalesStats, getWeeklySalesStats } from '@/lib/services/analytics.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

export default function DashboardPage() {
  const { data: dailyStats } = useQuery({
    queryKey: ['daily-sales'],
    queryFn: () => getDailySalesStats(),
  });

  const { data: weeklyStats } = useQuery({
    queryKey: ['weekly-sales'],
    queryFn: () => getWeeklySalesStats(),
  });

  const todaySales = dailyStats?.[0];
  const weekTotal = weeklyStats?.reduce((sum, day) => sum + (day.total_sales || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold">
                  ₹{(todaySales?.total_sales || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-500">
                  {todaySales?.order_count || 0} orders
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">
                  ₹{(weekTotal || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add chart here using the weeklyStats data */}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Example 2: Smart Query Creation (Webhook Integration)

```typescript
// app/api/webhooks/whatsapp/route.ts
import { NextResponse } from 'next/server';
import { findOrCreateTicket } from '@/lib/services/queries.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Parse WhatsApp webhook data
    const { from, message, orderId } = body;

    // Smart ticket creation - finds existing or creates new
    const queryId = await findOrCreateTicket(
      'WhatsApp',
      'Customer', // Extract from contacts if available
      from,
      '', // No email from WhatsApp
      orderId || '',
      message,
      'medium'
    );

    return NextResponse.json({ success: true, queryId });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

---

## 🔧 Quick Implementation Guide

### Step 1: Create Analytics Service
```bash
# Create the file
New-Item -Path "c:\Antigravity_projects\Dashboard-main\react-dashboard\lib\services\analytics.service.ts" -ItemType File
```

### Step 2: Create Analytics Hooks
```typescript
// lib/hooks/use-analytics.ts
import { useQuery } from '@tanstack/react-query';
import { getDailySalesStats, getWeeklySalesStats } from '@/lib/services/analytics.service';

export function useDailySales(date?: string, source?: string) {
  return useQuery({
    queryKey: ['daily-sales', date, source],
    queryFn: () => getDailySalesStats(date, source),
    staleTime: 60000, // 1 minute
  });
}

export function useWeeklySales() {
  return useQuery({
    queryKey: ['weekly-sales'],
    queryFn: () => getWeeklySalesStats(),
    staleTime: 300000, // 5 minutes
  });
}
```

### Step 3: Update Dashboard Page
Replace the current dashboard page with the enhanced version above.

---

## 📊 Function Usage Priority

### Must Implement (High Impact):
1. ✅ `get_daily_sales_stats` - Dashboard analytics
2. ✅ `get_weekly_sales_stats` - Dashboard trends
3. ✅ `find_or_create_ticket` - Smart ticket management
4. ✅ `login_internal_user` - Authentication

### Should Implement (Medium Impact):
5. `get_order_details` - Detailed order view
6. `daily_sku_summary_with_stock` - Inventory reports
7. `get_query_with_messages` - Alternative query fetching

### Nice to Have (Low Priority):
8. `analyze_sentiment` - AI features
9. `increment_stock` / `decrement_stock` - Manual stock adjustments
10. Cart functions - If building customer portal

---

## 🎯 Next Steps

1. **Create `analytics.service.ts`** with sales stats functions
2. **Create `use-analytics.ts`** hooks
3. **Update dashboard home page** with real sales data
4. **Implement authentication** with `login_internal_user`
5. **Add `find_or_create_ticket`** to queries service
6. **Create webhook handlers** for WhatsApp/Email

---

## 📝 Notes

- All RPC functions use `supabase.rpc()` method
- Functions return promises, perfect for React Query
- Most functions have `Invoker` security (run as calling user)
- `Definer` functions run with owner privileges
- Triggers run automatically, no manual calls needed

---

**Total Available:** 38 functions  
**Currently Used:** 0 directly (using tables instead)  
**Recommended:** Implement 4-7 key functions for better performance

This will significantly enhance your dashboard with real-time analytics! 🚀
