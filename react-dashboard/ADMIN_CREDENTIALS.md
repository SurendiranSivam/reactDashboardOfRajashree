# 🔐 Admin Login Credentials

**Rajashree Fashions Dashboard**  
**Created:** December 30, 2025

---

## 👤 **Admin Login:**

### **Email:**
```
admin@rajashree.com
```

### **Password:**
```
Admin@123
```

---

## 🚀 **Login URL:**

```
http://localhost:3001/login
```

---

## ⚙️ **Setup Instructions:**

### **1. Create Admin User in Database:**

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
INSERT INTO users (email, password, full_name, role, is_active)
VALUES (
  'admin@rajashree.com',
  'Admin@123',
  'System Administrator',
  'Admin',
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = true;
```

### **2. Verify User Created:**

```sql
SELECT user_id, email, full_name, role, is_active 
FROM users 
WHERE email = 'admin@rajashree.com';
```

### **3. Login:**

1. Go to: http://localhost:3001/login
2. Enter email: `admin@rajashree.com`
3. Enter password: `Admin@123`
4. Click "Sign In"

---

## 🔒 **Security Notes:**

⚠️ **IMPORTANT:**
- This is a default password for initial setup
- **Change the password immediately after first login**
- Use a strong, unique password
- Enable 2FA if available

---

## 📋 **Password Requirements:**

For security, passwords should:
- ✅ Be at least 8 characters
- ✅ Include uppercase and lowercase letters
- ✅ Include numbers
- ✅ Include special characters

---

## 🎯 **What You Get After Login:**

As an Admin, you have access to:
- ✅ All 10 dashboard pages
- ✅ Full CRUD operations
- ✅ Role Management
- ✅ User Management
- ✅ All permissions
- ✅ Export functionality
- ✅ System settings

---

## 🔄 **Alternative Users (For Testing):**

You can create additional test users with different roles:

```sql
-- Manager User
INSERT INTO users (email, password, full_name, role, is_active)
VALUES ('manager@rajashree.com', 'Manager@123', 'Store Manager', 'Manager', true);

-- Executive User  
INSERT INTO users (email, password, full_name, role, is_active)
VALUES ('executive@rajashree.com', 'Executive@123', 'Sales Executive', 'Executive', true);

-- Support User
INSERT INTO users (email, password, full_name, role, is_active)
VALUES ('support@rajashree.com', 'Support@123', 'Customer Support', 'Support', true);
```

---

## ✅ **Troubleshooting:**

### **Can't Login?**

1. **Check user exists:**
   ```sql
   SELECT * FROM users WHERE email = 'admin@rajashree.com';
   ```

2. **Check user is active:**
   ```sql
   UPDATE users SET is_active = true WHERE email = 'admin@rajashree.com';
   ```

3. **Reset password:**
   ```sql
   UPDATE users SET password = 'Admin@123' WHERE email = 'admin@rajashree.com';
   ```

### **Role Not Assigned?**

Check if Admin role is assigned:
```sql
SELECT u.email, r.role_name
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE u.email = 'admin@rajashree.com';
```

If not, run:
```sql
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
  u.user_id,
  r.role_id,
  u.user_id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@rajashree.com'
  AND r.role_name = 'Admin'
ON CONFLICT DO NOTHING;
```

---

**Ready to login!** 🚀

Use the credentials above to access your dashboard.
