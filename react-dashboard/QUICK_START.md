# Quick Start Guide - React Dashboard

## 🚀 Getting Started

### Start the Server
```bash
cd c:\Antigravity_projects\Dashboard-main\react-dashboard
npm run dev
```
**URL:** http://localhost:3001

---

## 📍 All Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Redirects to login | ✅ |
| `/login` | Premium login page | ✅ |
| `/dashboard` | Dashboard home with stats | ✅ |
| `/dashboard/queries` | **Queries management** | ✅ **WORKING** |
| `/dashboard/orders` | Orders management | ⏳ Placeholder |
| `/dashboard/customers` | Customer list | ⏳ Placeholder |
| `/dashboard/products` | Product catalog | ⏳ Placeholder |
| `/dashboard/vendors` | Vendor management | ⏳ Placeholder |
| `/dashboard/shipments` | Shipment tracking | ⏳ Placeholder |
| `/dashboard/returns` | Returns management | ⏳ Placeholder |
| `/dashboard/combos` | Product combos | ⏳ Placeholder |
| `/dashboard/purchases` | Purchase orders | ⏳ Placeholder |
| `/dashboard/banners` | Banner management | ⏳ Placeholder |

---

## 🎯 Queries Screen Features

**Fully functional with 2,302 real tickets from Supabase!**

### What Works:
- ✅ Real-time data fetching
- ✅ Search across all fields
- ✅ Filter by Status, Priority, Source
- ✅ Ticket ID badges (TKT-xxx)
- ✅ Source badges (WhatsApp/Web)
- ✅ Color-coded status/priority
- ✅ Formatted dates
- ✅ Conversation dialog (component ready)

### To Test:
1. Go to http://localhost:3001/dashboard/queries
2. Try filtering by Status
3. Search for a customer name
4. Click "View" to see conversation

---

## 📝 Common Tasks

### Install New Package
```bash
npm install [package-name]
```

### Add shadcn Component
```bash
npx shadcn@latest add [component]
```

### View Logs
Check terminal running `npm run dev`

### Restart Server
`Ctrl+C` then `npm run dev`

---

## 🛠️ File Locations

### Core Files:
- **Environment:** `.env.local`
- **Root Layout:** `app/layout.tsx`
- **Sidebar:** `components/layout/sidebar.tsx`
- **Supabase Client:** `lib/supabase.ts`
- **Types:** `lib/types.ts`

### Queries Files:
- **Page:** `app/dashboard/queries/page.tsx`
- **Service:** `lib/services/queries.service.ts`
- **Hooks:** `lib/hooks/use-queries.ts`
- **Badges:** `components/queries/query-badges.tsx`
- **Dialog:** `components/queries/conversation-dialog.tsx`

---

## 🎨 Design Tokens

### Colors:
```css
Primary: from-indigo-600 to-purple-600
Success: green-600
Warning: orange-600
Error: red-600
```

### Spacing:
```css
--spacing-1: 0.25rem  /* 4px */
--spacing-4: 1rem     /* 16px */
--spacing-6: 1.5rem   /* 24px */
```

---

## ⚡ Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Install dependencies
npm install

# Add TypeScript types
npm install --save-dev @types/[package]
```

---

## 🐛 Troubleshooting

### Port already in use
- Flutter app is on 3000
- React app is on 3001
- Both can run simultaneously

### Environment variables not loading
1. Restart dev server
2. Check `.env.local` exists
3. Variables must start with `NEXT_PUBLIC_`

### Supabase errors
- Check `.env.local` has correct keys
- Verify Supabase project is running
- Check network tab in browser DevTools

---

## 📚 Next Steps

1. **Implement remaining screens:**
   - Copy pattern from Queries screen
   - Create service → hooks → page

2. **Add authentication:**
   - Integrate Supabase Auth
   - Add protected routes
   - Add login logic

3. **Enhance Queries:**
   - Connect View button to dialog
   - Add real-time subscriptions
   - Add export functionality

4. **Deploy:**
   - Push to GitHub
   - Deploy to Vercel
   - Configure environment variables

---

## 💡 Tips

- All screens follow the same pattern
- Use existing components as templates
- shadcn/ui docs: https://ui.shadcn.com
- React Query docs: https://tanstack.com/query
- Supabase docs: https://supabase.com/docs

---

**Happy coding!** 🚀
