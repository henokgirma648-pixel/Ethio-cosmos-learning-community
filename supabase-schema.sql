-- ============================================================
-- Ethio-cosmos Learning Community — Complete Supabase Schema
-- Run this entire script in: Supabase → SQL Editor → New Query
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
-- Mirrors auth.users, adds username and role
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text not null,
  email        text,
  avatar_url   text,
  role         text not null default 'user',  -- 'user' | 'admin'
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint profiles_role_check check (role in ('user','admin'))
);

alter table public.profiles enable row level security;

-- Public: anyone can read profiles (for chat usernames etc.)
create policy "profiles_public_read"
  on public.profiles for select
  using (true);

-- Authenticated users can insert their own profile
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update only their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can update any profile (for role management)
create policy "profiles_admin_update"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── AUTO-CREATE PROFILE ON SIGN-UP ──────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _username text;
begin
  -- Derive a username: prefer full_name from metadata, fall back to email prefix
  _username := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, username, email, avatar_url, role)
  values (
    new.id,
    _username,
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    -- Make the first registered user (or hardcoded admin email) an admin
    case
      when new.email = 'henokgirma648@gmail.com' then 'admin'
      else 'user'
    end
  )
  on conflict (id) do update
    set username   = excluded.username,
        email      = excluded.email,
        avatar_url = excluded.avatar_url,
        updated_at = now();

  return new;
end;
$$;

-- Attach trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── TOPICS ──────────────────────────────────────────────────────────────────
create table if not exists public.topics (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  emoji        text not null default '🚀',
  title        text not null,
  description  text not null default '',
  lesson_count integer not null default 0,
  image_url    text not null default '/images/topic-fundamentals.jpg',
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.topics enable row level security;

create policy "topics_public_read"
  on public.topics for select
  using (true);

create policy "topics_admin_write"
  on public.topics for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── SUBTOPICS / LESSONS ──────────────────────────────────────────────────────
create table if not exists public.subtopics (
  id           uuid primary key default gen_random_uuid(),
  topic_id     uuid not null references public.topics(id) on delete cascade,
  slug         text not null,
  emoji        text not null default '📚',
  title        text not null,
  description  text not null default '',
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (topic_id, slug)
);

alter table public.subtopics enable row level security;

create policy "subtopics_public_read"
  on public.subtopics for select
  using (true);

create policy "subtopics_admin_write"
  on public.subtopics for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── LESSON CONTENT (block-based) ────────────────────────────────────────────
create table if not exists public.lessons (
  id           uuid primary key default gen_random_uuid(),
  subtopic_id  uuid not null references public.subtopics(id) on delete cascade,
  blocks       jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (subtopic_id)
);

alter table public.lessons enable row level security;

create policy "lessons_public_read"
  on public.lessons for select
  using (true);

create policy "lessons_admin_write"
  on public.lessons for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── SITE CONTENT (homepage, about, materials CMS data) ───────────────────────
create table if not exists public.site_content (
  key          text primary key,
  value        jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "site_content_public_read"
  on public.site_content for select
  using (true);

create policy "site_content_admin_write"
  on public.site_content for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Seed default site_content rows so upserts work even on fresh projects
insert into public.site_content (key, value) values
  ('homepage', '{
    "heroTitle": "Ethio-cosmos-learning-community",
    "heroSubtitle": "Your Gateway to Astronomy Exploration & Learning",
    "featureCards": [
      {"icon": "🔭", "title": "Discover the Cosmos", "description": "Learn about stars, planets, galaxies, and more."},
      {"icon": "⭐", "title": "Boost Your Stargazing", "description": "Skywatching tips for beginners and enthusiasts."},
      {"icon": "📖", "title": "Stay Informed", "description": "News, guides, and resources on everything space."}
    ],
    "featuredTopics": [
      {"id": "stargazing", "title": "Stargazing Basics for Beginners", "description": "Master the fundamentals of observing the night sky.", "image": "/images/featured-stargazing.jpg"},
      {"id": "events", "title": "Key Astronomical Events", "description": "Learn about eclipses, meteor showers, and other celestial phenomena.", "image": "/images/featured-events.jpg"},
      {"id": "telescope", "title": "Telescope Selection Guide", "description": "Discover how to choose the perfect telescope.", "image": "/images/featured-telescope.jpg"}
    ]
  }'::jsonb),
  ('about', '{
    "missionText": "At Ethio-cosmos-learning-community, our mission is to make the vast wonders of the cosmos accessible to everyone. We strive to foster a deeper understanding of astronomy and provide tools for individuals to embark on their own journeys of celestial discovery.",
    "whoWeAreText1": "We are a diverse team of passionate astronomers, educators, and space enthusiasts dedicated to connecting the world with the universe.",
    "whoWeAreText2": "Based in Ethiopia, we are committed to building a vibrant, global learning community. Our platform offers a wealth of curated knowledge, interactive guides, and expert-led content to help you explore the stars, planets, and galaxies from anywhere.",
    "missionImage": "/images/mission.jpg",
    "whoWeAreImage1": "/images/who-we-are-1.jpg",
    "whoWeAreImage2": "/images/who-we-are-2.jpg"
  }'::jsonb),
  ('materials', '{
    "galleryImages": [
      {"id": "1", "url": "/images/gallery-1.jpg", "title": "Nebula"},
      {"id": "2", "url": "/images/gallery-2.jpg", "title": "Galaxy"},
      {"id": "3", "url": "/images/gallery-3.jpg", "title": "Star Cluster"},
      {"id": "4", "url": "/images/gallery-4.jpg", "title": "Planetary"}
    ],
    "videos": [
      {"id": "1", "url": "/videos/space-intro.mp4", "thumbnail": "/images/video-thumb-1.jpg", "title": "Introduction to Space"}
    ],
    "pdfs": [
      {"id": "1", "url": "/pdfs/astronomy-guide.pdf", "title": "Astronomy Guide", "label": "Astronomy Guide"},
      {"id": "2", "url": "/pdfs/telescope-manual.pdf", "title": "Telescope Manual", "label": "Telescope Manual"}
    ]
  }'::jsonb)
on conflict (key) do nothing;

-- ─── QUIZZES ─────────────────────────────────────────────────────────────────
create table if not exists public.quizzes (
  id           uuid primary key default gen_random_uuid(),
  topic_id     uuid references public.topics(id) on delete set null,
  subtopic_id  uuid references public.subtopics(id) on delete set null,
  title        text not null,
  description  text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.quizzes enable row level security;

create policy "quizzes_public_read"
  on public.quizzes for select
  using (true);

create policy "quizzes_admin_write"
  on public.quizzes for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── QUIZ QUESTIONS ──────────────────────────────────────────────────────────
create table if not exists public.quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references public.quizzes(id) on delete cascade,
  question_text  text not null,
  options        jsonb not null default '[]'::jsonb,
  correct_index  integer not null,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);

alter table public.quiz_questions enable row level security;

create policy "quiz_questions_public_read"
  on public.quiz_questions for select
  using (true);

create policy "quiz_questions_admin_write"
  on public.quiz_questions for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Seed a default general quiz (so the Tests page works immediately)
do $$
declare
  _quiz_id uuid;
begin
  insert into public.quizzes (id, title, description)
  values (gen_random_uuid(), 'Astronomy Fundamentals Quiz', 'Test your knowledge of the cosmos')
  returning id into _quiz_id;

  insert into public.quiz_questions (quiz_id, question_text, options, correct_index, sort_order) values
    (_quiz_id, 'What is the closest star to Earth?',
     '["Proxima Centauri","The Sun","Sirius","Alpha Centauri"]'::jsonb, 1, 0),
    (_quiz_id, 'Which planet is known as the Red Planet?',
     '["Venus","Jupiter","Mars","Saturn"]'::jsonb, 2, 1),
    (_quiz_id, 'What is the largest planet in our solar system?',
     '["Earth","Saturn","Jupiter","Neptune"]'::jsonb, 2, 2),
    (_quiz_id, 'How many moons does Earth have?',
     '["None","One","Two","Seventy-nine"]'::jsonb, 1, 3),
    (_quiz_id, 'What causes the Earth''s seasons?',
     '["Distance from the Sun","The Earth''s tilt","Solar flares","The Moon''s gravity"]'::jsonb, 1, 4),
    (_quiz_id, 'What is the name of our galaxy?',
     '["Andromeda","Milky Way","Triangulum","Sombrero"]'::jsonb, 1, 5),
    (_quiz_id, 'How long does it take light to travel from the Sun to Earth?',
     '["8 minutes","8 hours","8 seconds","8 days"]'::jsonb, 0, 6),
    (_quiz_id, 'What is a light-year?',
     '["The distance light travels in one year","The time light takes to circle Earth","The age of a star","A unit of time"]'::jsonb, 0, 7);
end $$;

-- ─── BOOKMARKS ───────────────────────────────────────────────────────────────
create table if not exists public.bookmarks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  item_type    text not null,   -- 'topic' | 'subtopic'
  item_id      text not null,   -- slug or uuid of the bookmarked item
  title        text not null,
  description  text not null default '',
  url          text not null,
  created_at   timestamptz not null default now(),
  unique (user_id, item_id)
);

alter table public.bookmarks enable row level security;

create policy "bookmarks_own_read"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "bookmarks_own_insert"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "bookmarks_own_delete"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- ─── USER PROGRESS ───────────────────────────────────────────────────────────
create table if not exists public.user_progress (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  subtopic_id    uuid not null references public.subtopics(id) on delete cascade,
  completed_at   timestamptz not null default now(),
  unique (user_id, subtopic_id)
);

alter table public.user_progress enable row level security;

create policy "progress_own_read"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "progress_own_insert"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "progress_own_delete"
  on public.user_progress for delete
  using (auth.uid() = user_id);

-- ─── CHAT MESSAGES ───────────────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  message_text  text,
  image_url     text,
  created_at    timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "chat_authenticated_read"
  on public.chat_messages for select
  using (auth.role() = 'authenticated');

create policy "chat_own_insert"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- Enable realtime on chat_messages
alter publication supabase_realtime add table public.chat_messages;

-- ─── QUIZ ATTEMPTS ───────────────────────────────────────────────────────────
create table if not exists public.quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  quiz_id     uuid not null references public.quizzes(id) on delete cascade,
  score       integer not null,
  total       integer not null,
  answers     jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "attempts_own_read"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy "attempts_own_insert"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- ─── SEED DEFAULT TOPICS ─────────────────────────────────────────────────────
insert into public.topics (slug, emoji, title, description, lesson_count, image_url, sort_order) values
  ('fundamentals', '🚀', 'Fundamentals of Astronomy', 'Start your journey with the basics of astronomy and space observation', 12, '/images/topic-fundamentals.jpg', 0),
  ('ethiopia', '🌍', 'Astronomy and Ethiopia', '7000 years of Ethiopian astronomical heritage and ancient knowledge', 3, '/images/topic-ethiopia.jpg', 1),
  ('solar-system', '☀️', 'Solar System', 'Our cosmic neighborhood and the Sun''s family of planets', 10, '/images/topic-solar-system.jpg', 2),
  ('planets', '🪐', 'Planets', 'Terrestrial and gas giants of our solar system', 9, '/images/topic-planets.jpg', 3),
  ('moon', '🌙', 'Moon', 'Earth''s natural satellite and its phases', 1, '/images/topic-moon.jpg', 4),
  ('stars', '⭐', 'Stars', 'The brilliant stars that light up our galaxy', 11, '/images/topic-stars.jpg', 5),
  ('black-hole', '🌀', 'Black Hole', 'Mysteries of gravitational giants', 10, '/images/topic-black-hole.jpg', 6),
  ('worm-hole', '🔮', 'Worm Hole', 'Theoretical structures through space-time', 6, '/images/topic-worm-hole.jpg', 7),
  ('nebula', '💫', 'Nebula', 'Cosmic clouds where stars are born', 8, '/images/topic-nebula.jpg', 8),
  ('asteroid', '☄️', 'Asteroid', 'Space rocks and minor celestial bodies', 6, '/images/topic-asteroid.jpg', 9)
on conflict (slug) do nothing;

-- ─── SEED DEFAULT SUBTOPICS ───────────────────────────────────────────────────
do $$
declare
  _topic_id uuid;
begin
  -- fundamentals
  select id into _topic_id from public.topics where slug = 'fundamentals';
  insert into public.subtopics (topic_id, slug, emoji, title, description, sort_order) values
    (_topic_id, 'f1', '🔭', 'Introduction to Astronomy', 'Understanding the study of celestial objects', 0),
    (_topic_id, 'f2', '🌌', 'The Night Sky', 'Learning to navigate the stars above', 1),
    (_topic_id, 'f3', '📐', 'Celestial Coordinates', 'Mapping positions in the sky', 2),
    (_topic_id, 'f4', '🔬', 'Observational Tools', 'Telescopes, binoculars, and naked eye', 3),
    (_topic_id, 'f5', '⚡', 'Light and Radiation', 'How we perceive the universe', 4),
    (_topic_id, 'f6', '📊', 'Astronomical Measurements', 'Distances, magnitudes, and scales', 5)
  on conflict (topic_id, slug) do nothing;

  -- ethiopia
  select id into _topic_id from public.topics where slug = 'ethiopia';
  insert into public.subtopics (topic_id, slug, emoji, title, description, sort_order) values
    (_topic_id, 'e1', '🏛️', 'Ancient Ethiopian Astronomy', 'Early stargazing traditions', 0),
    (_topic_id, 'e2', '📜', 'Astronomical Manuscripts', 'Historical records of the sky', 1),
    (_topic_id, 'e3', '🌅', 'Modern Ethiopian Astronomy', 'Contemporary developments', 2)
  on conflict (topic_id, slug) do nothing;

  -- solar-system
  select id into _topic_id from public.topics where slug = 'solar-system';
  insert into public.subtopics (topic_id, slug, emoji, title, description, sort_order) values
    (_topic_id, 's1', '☀️', 'The Sun', 'Our star and its properties', 0),
    (_topic_id, 's2', '☿️', 'Mercury', 'The smallest planet', 1),
    (_topic_id, 's3', '♀️', 'Venus', 'The hottest planet', 2),
    (_topic_id, 's4', '🌍', 'Earth', 'Our home world', 3),
    (_topic_id, 's5', '♂️', 'Mars', 'The red planet', 4)
  on conflict (topic_id, slug) do nothing;

  -- planets
  select id into _topic_id from public.topics where slug = 'planets';
  insert into public.subtopics (topic_id, slug, emoji, title, description, sort_order) values
    (_topic_id, 'p1', '🪐', 'Gas Giants', 'Jupiter and Saturn', 0),
    (_topic_id, 'p2', '❄️', 'Ice Giants', 'Uranus and Neptune', 1),
    (_topic_id, 'p3', '🌑', 'Dwarf Planets', 'Pluto and beyond', 2)
  on conflict (topic_id, slug) do nothing;

  -- moon
  select id into _topic_id from public.topics where slug = 'moon';
  insert into public.subtopics (topic_id, slug, emoji, title, description, sort_order) values
    (_topic_id, 'm1', '🌙', 'Lunar Phases', 'Understanding moon cycles', 0)
  on conflict (topic_id, slug) do nothing;

  -- stars
  select id into _topic_id from public.topics where slug = 'stars';
  insert into public.subtopics (topic_id, slug, emoji, title, description, sort_order) values
    (_topic_id, 'st1', '⭐', 'Star Formation', 'How stars are born', 0),
    (_topic_id, 'st2', '💥', 'Star Life Cycle', 'Birth to death of stars', 1),
    (_topic_id, 'st3', '🌟', 'Types of Stars', 'Classifying stellar objects', 2)
  on conflict (topic_id, slug) do nothing;

  -- black-hole
  select id into _topic_id from public.topics where slug = 'black-hole';
  insert into public.subtopics (topic_id, slug, emoji, title, description, sort_order) values
    (_topic_id, 'b1', '🌀', 'What is a Black Hole?', 'Understanding these mysterious objects', 0),
    (_topic_id, 'b2', '⚫', 'Event Horizon', 'The point of no return', 1),
    (_topic_id, 'b3', '🌌', 'Supermassive Black Holes', 'Giants at galaxy centers', 2)
  on conflict (topic_id, slug) do nothing;

  -- worm-hole
  select id into _topic_id from public.topics where slug = 'worm-hole';
  insert into public.subtopics (topic_id, slug, emoji, title, description, sort_order) values
    (_topic_id, 'w1', '🔮', 'Wormhole Theory', 'Einstein-Rosen bridges', 0),
    (_topic_id, 'w2', '🚀', 'Interstellar Travel', 'Theoretical space travel', 1)
  on conflict (topic_id, slug) do nothing;

  -- nebula
  select id into _topic_id from public.topics where slug = 'nebula';
  insert into public.subtopics (topic_id, slug, emoji, title, description, sort_order) values
    (_topic_id, 'n1', '💫', 'Star Nurseries', 'Where stars are born', 0),
    (_topic_id, 'n2', '🌈', 'Types of Nebulae', 'Emission, reflection, and dark', 1)
  on conflict (topic_id, slug) do nothing;

  -- asteroid
  select id into _topic_id from public.topics where slug = 'asteroid';
  insert into public.subtopics (topic_id, slug, emoji, title, description, sort_order) values
    (_topic_id, 'a1', '☄️', 'Asteroid Belt', 'The region between Mars and Jupiter', 0),
    (_topic_id, 'a2', '🌍', 'Near-Earth Objects', 'Asteroids close to home', 1)
  on conflict (topic_id, slug) do nothing;
end $$;

-- ─── STORAGE BUCKET HELPER NOTE ──────────────────────────────────────────────
-- After running this SQL, also do the following in the Supabase dashboard:
-- 1. Go to Storage → New Bucket
-- 2. Name: uploads  |  Public bucket: YES
-- 3. Go to Storage → Policies → uploads bucket:
--    Add a policy: Allow authenticated users all operations
