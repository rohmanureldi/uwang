# Supabase Setup Guide

## 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy your project URL and anon key

## 2. Configure Environment
Update `.env.local` with your credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Setup Database
Run the SQL in `supabase-setup.sql` in your Supabase SQL editor:
- Creates transactions table
- Enables real-time subscriptions
- Sets up basic security policies

## 4. Migration from localStorage
Your existing data will be preserved. The app will:
- Load from Supabase if available
- Fall back to localStorage if needed
- Sync across all your devices automatically

## Features Enabled
✅ Real-time sync across devices
✅ Offline support (coming soon)
✅ Data backup and recovery
✅ Multi-device access