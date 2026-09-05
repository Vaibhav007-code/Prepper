-- =============================================
-- PREPPER - Learning Tracker Schema
-- Compatible with React Native / Expo future app
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS (handled by Supabase Auth)
-- We extend with a profiles table
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_activity_date DATE,
  daily_goal_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SUBJECTS
-- =============================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,  -- e.g. '01', '02'
  title TEXT NOT NULL,        -- e.g. 'DSA'
  description TEXT,
  icon TEXT,                   -- icon name string
  color TEXT,                  -- hex color
  order_index INTEGER NOT NULL,
  total_topics INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PHASES (within subjects)
-- =============================================
CREATE TABLE IF NOT EXISTS phases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,          -- e.g. 'A', 'B', 'Phase A'
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TOPIC GROUPS (within phases)
-- =============================================
CREATE TABLE IF NOT EXISTS topic_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phase_id UUID REFERENCES phases(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,          -- e.g. 'A1', 'A2'
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TOPICS (individual learning items)
-- =============================================
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_group_id UUID REFERENCES topic_groups(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER PROGRESS
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'reviewing')) DEFAULT 'not_started',
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- =============================================
-- DAILY SESSIONS (for streak/activity tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS daily_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_date DATE NOT NULL,
  topics_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_date)
);

-- =============================================
-- ACHIEVEMENTS / BADGES
-- =============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 50,
  condition_type TEXT,  -- 'streak', 'topics', 'subject_complete', 'xp'
  condition_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- PROBLEM LOG (for DSA tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS problem_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  platform TEXT,            -- 'leetcode', 'codeforces', etc.
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  pattern TEXT,             -- e.g. 'sliding window', 'dp'
  subject_id UUID REFERENCES subjects(id),
  topic_group_id UUID REFERENCES topic_groups(id),
  status TEXT CHECK (status IN ('solved', 'attempted', 'revisit')),
  time_taken_minutes INTEGER,
  notes TEXT,
  url TEXT,
  solved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_topic_id ON user_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_daily_sessions_user_date ON daily_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_problem_log_user_id ON problem_log(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_group_id ON topics(topic_group_id);
CREATE INDEX IF NOT EXISTS idx_topic_groups_phase_id ON topic_groups(phase_id);
CREATE INDEX IF NOT EXISTS idx_phases_subject_id ON phases(subject_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_log ENABLE ROW LEVEL SECURITY;

-- Public read for subjects/phases/topics/topic_groups
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own
DROP POLICY IF EXISTS "profiles_self" ON profiles;
CREATE POLICY "profiles_self" ON profiles FOR ALL USING (auth.uid() = id);

-- User progress: own data only
DROP POLICY IF EXISTS "progress_self" ON user_progress;
CREATE POLICY "progress_self" ON user_progress FOR ALL USING (auth.uid() = user_id);

-- Daily sessions: own data only
DROP POLICY IF EXISTS "sessions_self" ON daily_sessions;
CREATE POLICY "sessions_self" ON daily_sessions FOR ALL USING (auth.uid() = user_id);

-- Achievements: own data only
DROP POLICY IF EXISTS "user_achievements_self" ON user_achievements;
CREATE POLICY "user_achievements_self" ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- Problem log: own data only
DROP POLICY IF EXISTS "problem_log_self" ON problem_log;
CREATE POLICY "problem_log_self" ON problem_log FOR ALL USING (auth.uid() = user_id);

-- Public curriculum data: readable by authenticated users
DROP POLICY IF EXISTS "subjects_read" ON subjects;
CREATE POLICY "subjects_read" ON subjects FOR SELECT USING (true);
DROP POLICY IF EXISTS "phases_read" ON phases;
CREATE POLICY "phases_read" ON phases FOR SELECT USING (true);
DROP POLICY IF EXISTS "topic_groups_read" ON topic_groups;
CREATE POLICY "topic_groups_read" ON topic_groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "topics_read" ON topics;
CREATE POLICY "topics_read" ON topics FOR SELECT USING (true);
DROP POLICY IF EXISTS "achievements_read" ON achievements;
CREATE POLICY "achievements_read" ON achievements FOR SELECT USING (true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'User'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update profile updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS user_progress_updated_at ON user_progress;
CREATE TRIGGER user_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
