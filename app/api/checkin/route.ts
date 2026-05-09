import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Pass, User } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // 認証チェック
  const {
    data: { user: staffUser },
  } = await supabase.auth.getUser();

  if (!staffUser) {
    return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
  }

  // スタッフ権限チェック
  const { data: staffProfile } = await adminSupabase
    .from("users")
    .select("role")
    .eq("id", staffUser.id)
    .single<User>();

  if (staffProfile?.role !== "admin") {
    return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 });
  }

  const body = (await request.json()) as { passId: string; userId: string };
  const { passId, userId } = body;

  if (!passId || !userId) {
    return NextResponse.json({ success: false, message: "無効なQRコードです" }, { status: 400 });
  }

  // パスの取得
  const { data: pass } = await adminSupabase
    .from("passes")
    .select("*")
    .eq("id", passId)
    .eq("user_id", userId)
    .single<Pass>();

  if (!pass) {
    return NextResponse.json({ success: false, message: "パスが見つかりません" }, { status: 404 });
  }

  if (!pass.is_active) {
    return NextResponse.json({ success: false, message: "このパスは無効です" }, { status: 400 });
  }

  const now = new Date();
  if (new Date(pass.expires_at) < now) {
    return NextResponse.json({ success: false, message: "このパスは有効期限切れです" }, { status: 400 });
  }

  const remaining = pass.total_count - pass.used_count;
  if (remaining <= 0) {
    return NextResponse.json({ success: false, message: "このパスの利用回数が上限に達しています" }, { status: 400 });
  }

  // チェックインレコード作成 & used_count +1（トランザクション的に実行）
  const { error: checkinError } = await adminSupabase
    .from("checkins")
    .insert({
      pass_id: passId,
      user_id: userId,
      staff_id: staffUser.id,
      checked_in_at: now.toISOString(),
    });

  if (checkinError) {
    return NextResponse.json({ success: false, message: "チェックインに失敗しました" }, { status: 500 });
  }

  const { error: updateError } = await adminSupabase
    .from("passes")
    .update({ used_count: pass.used_count + 1 })
    .eq("id", passId);

  if (updateError) {
    return NextResponse.json({ success: false, message: "パスの更新に失敗しました" }, { status: 500 });
  }

  // ユーザー名取得
  const { data: userProfile } = await adminSupabase
    .from("users")
    .select("name, email")
    .eq("id", userId)
    .single<User>();

  const newRemaining = remaining - 1;

  return NextResponse.json({
    success: true,
    message: `チェックインしました。残り${newRemaining}枚です。`,
    userName: userProfile?.name || userProfile?.email || "不明",
    remaining: newRemaining,
  });
}
