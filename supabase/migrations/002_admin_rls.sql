-- 管理者がクライアントから直接操作できるRLSポリシーを追加

-- 管理者ロール確認用のヘルパー関数
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- passes: 管理者は全パスを読み取れる
CREATE POLICY "admin_passes_select" ON public.passes
  FOR SELECT USING (public.is_admin());

-- passes: 管理者はused_countを更新できる
CREATE POLICY "admin_passes_update" ON public.passes
  FOR UPDATE USING (public.is_admin());

-- checkins: 管理者は全チェックインを読み取れる
CREATE POLICY "admin_checkins_select" ON public.checkins
  FOR SELECT USING (public.is_admin());

-- checkins: 管理者はチェックインを追加できる
CREATE POLICY "admin_checkins_insert" ON public.checkins
  FOR INSERT WITH CHECK (public.is_admin());

-- users: 管理者は全ユーザーを読み取れる
CREATE POLICY "admin_users_select" ON public.users
  FOR SELECT USING (public.is_admin());
