# 🔐 RBAC System Implementation Guide

**Rajashree Fashions Dashboard - Role-Based Access Control**  
**Date:** December 30, 2025, 1:20 PM IST

---

## ✅ **COMPLETED:**

### **1. Database Schema** ✅
**File:** `supabase/rbac_schema.sql`

Created complete RBAC database structure:
- ✅ `roles` table - User roles (admin, manager, sales, etc.)
- ✅ `permissions` table - Granular permissions
- ✅ `role_permissions` table - Maps permissions to roles
- ✅ `user_roles` table - Assigns roles to users

### **2. Default Roles** ✅
Pre-configured 6 roles:
1. **Admin** - Full access to everything
2. **Manager** - Manage products, orders, customers
3. **Sales** - Orders and queries management
4. **Inventory** - Products, purchases, shipments
5. **Support** - Only queries (view and update)
6. **Viewer** - Read-only access

### **3. Permissions** ✅
Created permissions for all modules:
- Dashboard: view
- Queries: view, create, update, delete, export
- Orders: view, create, update, delete, export
- Customers: view, create, update, delete, export
- Products: view, create, update, delete, adjust_stock, export
- Vendors: view, create, update, delete, export
- Purchases: view, create, update, delete, export
- Shipments: view, create, update, delete, export
- Returns: view, create, update, delete, export
- Combos: view, create, update, delete, export
- Banners: view, create, update, delete, export
- Roles: view, create, update, delete, assign

**Total: 60+ permissions**

### **4. RPC Functions** ✅
Created backend functions:
- `get_user_permissions(user_id)` - Get all user permissions
- `user_has_permission(user_id, permission)` - Check specific permission
- `get_user_roles_with_permissions(user_id)` - Get roles with details
- `assign_role_to_user(user_id, role_id, assigned_by)` - Assign role
- `remove_role_from_user(user_id, role_id, removed_by)` - Remove role

### **5. RBAC Service** ✅
**File:** `lib/services/rbac.service.ts`

Frontend service with functions:
- Fetch roles
- Fetch permissions
- Get user roles
- Check permissions
- Assign/remove roles
- Update role permissions
- Create/update/delete roles

---

## 📋 **NEXT STEPS:**

### **Step 1: Run Database Migration** ⏳

Execute the SQL file in Supabase:

```bash
supabase migration new rbac_system
# Copy content from rbac_schema.sql to the migration file
supabase db push
```

**Or manually in Supabase SQL Editor:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire content of `supabase/rbac_schema.sql`
3. Run the SQL
4. Verify tables created

### **Step 2: Create Role Management UI** ⏳

Create these pages:

**A. Role List Page**
- `app/dashboard/role-management/page.tsx`
- Show all roles in a table
- Add/Edit/Delete role buttons
- View permissions for each role

**B. Role Edit Dialog**
- Component to edit role details
- Checkbox tree for permissions
- Group permissions by module
- Save changes

**C. User Role Assignment Page**
- `app/dashboard/role-management/users/page.tsx`
- List all users
- Assign/remove roles per user
- Show current user permissions

### **Step 3: Update Auth Context** ⏳

Modify `lib/contexts/auth-context.tsx`:
- Load user permissions on login
- Store permissions in state
- Provide `hasPermission(permission)` function
- Provide `hasAnyPermission([permissions])` function

### **Step 4: Create Permission Hooks** ⏳

Create `lib/hooks/use-permissions.ts`:
```tsx
export function usePermission(permission: string) {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

export function usePermissions(permissions: string[]) {
  const { hasPermission } = useAuth();
  return permissions.every(p => hasPermission(p));
}
```

### **Step 5: Create Protected Components** ⏳

Create `components/auth/protected.tsx`:
```tsx
export function Protected({ 
  permission, 
  children, 
  fallback 
}) {
  const hasPerm = usePermission(permission);
  if (!hasPerm) return fallback || null;
  return children;
}
```

### **Step 6: Protect Routes** ⏳

Create `middleware.ts`:
```tsx
export function middleware(request: NextRequest) {
  // Check if user has access to route
  // Redirect if no permission
}
```

### **Step 7: Protect UI Elements** ⏳

Update pages to show/hide based on permissions:

```tsx
<Protected permission="products.create">
  <Button>Add Product</Button>
</Protected>

<Protected permission="products.delete">
  <Button variant="destructive">Delete</Button>
</Protected>

<Protected permission="products.export">
  <Button>Export</Button>
</Protected>
```

---

## 🎯 **Permission Structure:**

### **Format:** `module.action`

**Examples:**
- `products.view` - View products page
- `products.create` - Add new products
- `products.update` - Edit products
- `products.delete` - Delete products
- `products.adjust_stock` - Adjust stock levels
- `products.export` - Export products data

### **Checking Permissions:**

```tsx
// In component
const canCreate = usePermission('products.create');
const canDelete = usePermission('products.delete');

//  In auth context
const { hasPermission } = useAuth();
if (hasPermission('products.create')) {
  // Show add button
}
```

---

## 📊 **Role Permissions Matrix:**

| Module | Admin | Manager | Sales | Inventory | Support | Viewer |
|--------|-------|---------|-------|-----------|---------|--------|
| Dashboard | ✅ All | ✅ View | ✅ View | ✅ View | ✅ View | ✅ View |
| Queries | ✅ All | ❌ | ✅ CRUD | ❌ | ✅ View/Update | ✅ View |
| Orders | ✅ All | ✅ CRUD | ✅ CRUD | ❌ | ❌ | ✅ View |
| Customers | ✅ All | ✅ CRUD | ✅ CRUD | ❌ | ❌ | ✅ View |
| Products | ✅ All | ✅ CRUD | ❌ | ✅ CRUD + Stock | ❌ | ✅ View |
| Vendors | ✅ All | ✅ CRUD | ❌ | ✅ CRUD | ❌ | ✅ View |
| Purchases | ✅ All | ✅ CRUD | ❌ | ✅ CRUD | ❌ | ✅ View |
| Shipments | ✅ All | ✅ CRUD | ❌ | ✅ CRUD | ❌ | ✅ View |
| Returns | ✅ All | ✅ CRUD | ❌ | ❌ | ❌ | ✅ View |
| Combos | ✅ All | ✅ CRUD | ❌ | ❌ | ❌ | ✅ View |
| Banners | ✅ All | ✅ CRUD | ❌ | ❌ | ❌ | ✅ View |
| Role Mgmt | ✅ All | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🚀 **Quick Start:**

1. **Run SQL Migration:**
   ```bash
   # In Supabase Dashboard SQL Editor
   # Paste content from supabase/rbac_schema.sql
   # Execute
   ```

2. **Verify Database:**
   ```sql
   SELECT * FROM roles;
   SELECT * FROM permissions;
   SELECT * FROM user_roles;
   ```

3. **Test Permission Check:**
   ```sql
   SELECT get_user_permissions(1);
   SELECT user_has_permission(1, 'products.create');
   ```

---

## 📝 **Implementation Checklist:**

### **Backend:**
- ✅ Database schema created
- ✅ Roles defined
- ✅ Permissions created
- ✅ RPC functions created
- ✅ Default assignments done
- ⏳ Run migration in Supabase

### **Frontend:**
- ✅ RBAC service created
- ⏳ Update auth context with permissions
- ⏳ Create permission hooks
- ⏳ Create Protected component
- ⏳ Create role management UI
- ⏳ Add route protection middleware
- ⏳ Update pages with permission checks

---

## 🎯 **Example Usage:**

### **1. Hide Button for Users Without Permission:**
```tsx
import { usePermission } from '@/lib/hooks/use-permissions';

export function ProductsPage() {
  const canCreate = usePermission('products.create');
  
  return (
    <div>
      {canCreate && (
        <Button onClick={handleAdd}>
          Add Product
        </Button>
      )}
    </div>
  );
}
```

### **2. Protected Component:**
```tsx
import { Protected } from '@/components/auth/protected';

<Protected permission="products.delete">
  <Button variant="destructive">Delete</Button>
</Protected>
```

### **3. Route Protection:**
```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const user = await getUser();
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/dashboard/role-management')) {
    if (!await hasPermission(user.id, 'roles.view')) {
      return NextResponse.redirect('/dashboard');
    }
  }
}
```

---

## ✅ **Current Status:**

```
✅ Database Schema: 100%
✅ Roles & Permissions: 100%
✅ RPC Functions: 100%
✅ RBAC Service: 100%
⏳ Auth Context Update: 0%
⏳ Permission Hooks: 0%
⏳ Protected Components: 0%
⏳ Role Management UI: 0%
⏳ Route Middleware: 0%
⏳ Page Updates: 0%

Overall RBAC: 40% Complete
```

---

## 🔥 **Ready to Continue!**

The foundation is complete! Now we need to:
1. Run the SQL migration
2. Build the Role Management UI
3. Update Auth Context
4. Add permission checks to pages

**Would you like me to:**
**A)** Create the Role Management UI page?
**B)** Update Auth Context with permissions?
**C)** Create Protected components and hooks?

Let me know which one to do first! 🚀
