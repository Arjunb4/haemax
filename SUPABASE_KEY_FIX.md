## ⚠️ CRITICAL: Your Supabase Anon Key is Invalid!

The current key `sb_publishable_263dKwMCf1qr515bDQmRSg_Dz8JMO4V` is **not** a valid Supabase anon key.

### How to Get Your Real Anon Key:

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project: `nqzzubggsyiwnmnztlah`
3. Click **Settings** (gear icon) in the left sidebar
4. Click **API** under Project Settings
5. Copy the **`anon` `public`** key — it starts with `eyJ...` and is very long (600+ characters)

### Update Your `.env` file:

Open `client-side/.env` and replace:
```
VITE_SUPABASE_ANON_KEY=sb_publishable_263dKwMCf1qr515bDQmRSg_Dz8JMO4V
```

With:
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  (your real key from dashboard)
```

> **Note:** Without the correct anon key, ALL Supabase operations will fail — login, signup, admin panel, and everything else.
