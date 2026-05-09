-- ============================
-- TORCH Pass App — 初期スキーマ
-- ============================

-- usersテーブル（Supabase Authと連携）
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL UNIQUE,
  name        text,
  role        text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- passesテーブル（回数券）
CREATE TABLE IF NOT EXISTS public.passes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_name    text NOT NULL DEFAULT 'TORCH 4h PASS',
  total_count  int NOT NULL DEFAULT 10,
  used_count   int NOT NULL DEFAULT 0,
  expires_at   timestamptz NOT NULL,
  is_active    boolean NOT NULL DEFAULT true,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT used_count_valid CHECK (used_count >= 0 AND used_count <= total_count)
);

-- checkinsテーブル（利用記録）
CREATE TABLE IF NOT EXISTS public.checkins (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id        uuid NOT NULL REFERENCES public.passes(id) ON DELETE RESTRICT,
  user_id        uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  checked_in_at  timestamptz NOT NULL DEFAULT now(),
  staff_id       uuid REFERENCES public.users(id),
  note           text
);

-- ============================
-- インデックス
-- ============================
CREATE INDEX IF NOT EXISTS idx_passes_user_id ON public.passes(user_id);
CREATE INDEX IF NOT EXISTS idx_passes_is_active ON public.passes(is_active);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON public.checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_pass_id ON public.checkins(pass_id);
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON public.checkins(checked_in_at);

-- ============================
-- Row Level Security (RLS)
-- ============================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- users RLS
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- passes RLS
CREATE POLICY "passes_select_own" ON public.passes
  FOR SELECT USING (auth.uid() = user_id);

-- checkins RLS
CREATE POLICY "checkins_select_own" ON public.checkins
  FOR SELECT USING (auth.uid() = user_id);

-- ============================
-- 新規ユーザー自動登録トリガー
-- ============================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
