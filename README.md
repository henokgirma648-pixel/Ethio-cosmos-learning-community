# 🔭 Ethio-cosmos Learning Community

A production-ready, multi-user astronomy learning platform built with React 19, TypeScript, Vite, and Supabase.

## ✨ Features

- **🔐 Authentication** – Google OAuth and Email/Password sign-up & sign-in via Supabase Auth
- **👤 User Profiles** – Auto-created on sign-up with username derived from Google name or email prefix
- **📚 Learning Topics & Lessons** – Supabase-backed topic/subtopic/lesson structure with slug-based routing
- **💬 Real-time Community Chat** – Live chat with proper usernames (not UUIDs) via Supabase Realtime
- **🔖 Bookmarks** – Per-user lesson bookmarks stored in Supabase
- **📈 Progress Tracking** – Mark lessons complete; achievements based on completion count
- **🧪 Database-driven Quizzes** – Quizzes and questions from Supabase; attempts saved per user
- **🛠️ Admin CMS** – Full CRUD for topics, subtopics, lessons, quizzes, homepage/about/materials content
- **🖼️ Media Fallbacks** – Graceful image, video, and PDF fallback UI
- **🛡️ Row-Level Security** – All tables protected with Supabase RLS policies

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Storage)
- **Routing**: React Router DOM v6
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/henokgirma648-pixel/Ethio-cosmos-learning-community.git
cd Ethio-cosmos-learning-community
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon public key** from Project Settings → API

### 3. Set up the Database

1. In Supabase, go to **SQL Editor → New Query**
2. Paste the entire contents of `supabase-schema.sql` and run it
3. This creates all tables, RLS policies, triggers, and seeds default content

### 4. Set up Storage

1. In Supabase, go to **Storage → New Bucket**
2. Name: `uploads` | Public bucket: **Yes**
3. Add a policy allowing authenticated users to insert/select/update/delete

### 5. Set up Google OAuth (optional but recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Set authorized redirect URI to: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
4. In Supabase → Authentication → Providers → Google: enable and paste client ID/secret
5. Set Site URL in Supabase → Authentication → URL Configuration → Site URL

### 6. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 7. Run Locally

```bash
npm run dev
# Open http://localhost:5173
```

## 🔑 Admin Access

The admin panel is at `/admin`. Admin role is granted to `henokgirma648@gmail.com` automatically by the database trigger. To grant admin to another user, update their profile role in the Supabase dashboard:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## 📦 Deployment on Vercel

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy
5. In Supabase → Auth → URL Configuration, add your Vercel URL as:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

## 🗂️ Project Structure

```
src/
├── components/
│   ├── MediaFallback.tsx    # Graceful image/video/PDF fallbacks
│   ├── Navbar.tsx           # Fixed top navigation
│   └── Footer.tsx
├── context/
│   ├── AuthContext.tsx      # Supabase auth, profile loading, role check
│   └── DataContext.tsx      # Topics/subtopics/lessons + CMS state
├── pages/
│   ├── HomePage.tsx         # Hero + feature cards + featured topics
│   ├── LearningPage.tsx     # Topics grid
│   ├── TopicDetailPage.tsx  # Subtopics list (slug routing)
│   ├── LessonPage.tsx       # Lesson content + bookmark + mark complete
│   ├── ChatPage.tsx         # Real-time chat with profile usernames
│   ├── TestsPage.tsx        # DB-driven quizzes with attempt saving
│   ├── BookmarksPage.tsx    # User bookmarks from Supabase
│   ├── ProgressPage.tsx     # Progress + achievements from Supabase
│   ├── AdminPage.tsx        # Full CMS CRUD
│   ├── LoginPage.tsx        # Google + email/password auth
│   ├── AboutPage.tsx        # About page (DB-driven)
│   └── MaterialsPage.tsx    # Gallery, videos, PDFs (DB-driven)
├── services/
│   ├── topics.ts            # Topics/subtopics/lessons CRUD
│   ├── profiles.ts          # User profile CRUD + batch fetch
│   ├── progress.ts          # Lesson completion tracking
│   ├── bookmarks.ts         # Bookmark CRUD
│   ├── quizzes.ts           # Quiz + question + attempt CRUD
│   └── siteContent.ts       # Homepage/About/Materials CMS
├── types/
│   └── index.ts             # Full TypeScript types (DB + frontend)
├── supabase.ts              # Supabase client with env validation
└── App.tsx                  # Routes + ProtectedRoute + layout
supabase-schema.sql          # Complete SQL schema with RLS + seeds
```

## 🔒 Security

- All Supabase tables have Row-Level Security enabled
- Users can only read/write their own bookmarks and progress
- Chat is readable by all authenticated users, writable only by message owner
- Admin writes (topics, lessons, quizzes, CMS) require `role = 'admin'` in profiles
- No secrets in client code; all credentials via environment variables

## ⚠️ Environment Variables Note

Never commit your `.env` file. It is listed in `.gitignore`.
