# Ethio-cosmos-learning-community

Astronomy learning platform — React + TypeScript + Tailwind CSS + Supabase + Vercel.

---

## STEP 1 — Create Your Supabase Project

1. Go to https://supabase.com and create a free account
2. Click "New Project" — name it ethio-cosmos, set a database password
3. Wait for the project to finish setting up (about 1 minute)
4. Go to Project Settings → API — you will find:
   - Project URL → this is your VITE_SUPABASE_URL
   - anon / public key → this is your VITE_SUPABASE_ANON_KEY

---

## STEP 2 — Set Up Supabase Database Table

Go to your Supabase project → SQL Editor → New Query → paste this and click Run:

```sql
-- Create messages table for chat
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  sender_id text not null,
  sender_name text,
  sender_email text,
  text text,
  image_url text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table messages enable row level security;

-- Allow signed-in users to read messages
create policy "Authenticated users can read messages"
  on messages for select
  using (auth.role() = 'authenticated');

-- Allow signed-in users to insert messages
create policy "Authenticated users can send messages"
  on messages for insert
  with check (auth.role() = 'authenticated');

-- Enable realtime on messages table
alter publication supabase_realtime add table messages;
```

---

## STEP 3 — Create Supabase Storage Bucket

1. Go to your Supabase project → Storage → New Bucket
2. Name: uploads
3. Public bucket: YES (toggle it on)
4. Click Create
5. Then go to Storage → Policies → uploads bucket → New Policy → choose "Allow all operations for authenticated users"

---

## STEP 4 — Enable Google Auth in Supabase

1. Go to Authentication → Providers → Google
2. Toggle Enable Google provider ON
3. Go to https://console.cloud.google.com
4. Create a new project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
5. Application type: Web application
6. Add Authorized redirect URI: https://your-project-id.supabase.co/auth/v1/callback
7. Copy the Client ID and Client Secret back into Supabase Google provider settings
8. Also add your site URL in Supabase: Authentication → URL Configuration → Site URL

---

## STEP 5 — Configure Your Environment Variables

1. Copy .env.example to a new file named exactly .env
2. Fill in your values:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

NEVER push the .env file to GitHub. It is already protected by .gitignore.

---

## STEP 6 — Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## STEP 7 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ethio-cosmos-learning-community.git
git push -u origin main
```

Make sure .env is NOT included (check .gitignore is working).

---

## STEP 8 — Deploy on Vercel

1. Go to https://vercel.com — sign in with your GitHub account
2. Click "Add New Project" → import ethio-cosmos-learning-community
3. BEFORE clicking Deploy → go to "Environment Variables" section
4. Add these two variables:
   - VITE_SUPABASE_URL = your Supabase project URL
   - VITE_SUPABASE_ANON_KEY = your Supabase anon key
5. Click Deploy
6. Go to Authentication → URL Configuration in Supabase and add your Vercel URL to:
   - Site URL: https://your-app.vercel.app
   - Redirect URLs: https://your-app.vercel.app/**

Your site is now live!

---

## Admin Access

Sign in with henokgirma648@gmail.com to access the Admin Dashboard at /admin.

From the admin dashboard you can:
- Edit all page titles, subtitles, and text
- Upload and replace images on any page (stored in Supabase Storage)
- Add/edit/delete learning topics
- Add/edit/delete subtopics and lessons
- Insert images anywhere inside lesson content
- Manage gallery images, videos, and PDFs
- All changes persist in localStorage automatically

---

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS
- Vite
- Supabase (Auth, Database, Realtime, Storage)
- React Router DOM
- Vercel (hosting)
- GitHub (source control)
