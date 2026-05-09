import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PassCard from "@/components/pass/PassCard";
import QRDisplay from "@/components/qr/QRDisplay";
import LogoutButton from "./LogoutButton";
import FlexPassBanner from "./FlexPassBanner";
import type { Pass, User } from "@/types/database";
import Link from "next/link";

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // ユーザー情報取得
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single<User>();

  // アクティブなパス取得
  const { data: passes } = await supabase
    .from("passes")
    .select("*")
    .eq("user_id", authUser.id)
    .eq("is_active", true)
    .order("purchased_at", { ascending: false });

  const activePass = passes?.[0] ?? null;
  const remaining = activePass ? activePass.total_count - activePass.used_count : 0;
  const showFlexBanner = activePass && remaining <= 3;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid #E8E4DC" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#2D5A27" }}
          >
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
              <path d="M16 4 L22 14 L16 12 L10 14 Z" fill="white" opacity="0.9" />
              <path d="M16 12 L22 14 L16 28 L10 14 Z" fill="white" opacity="0.6" />
            </svg>
          </div>
          <span className="font-semibold text-sm" style={{ color: "#2D5A27" }}>
            TORCH Pass
          </span>
        </div>
        <LogoutButton />
      </header>

      <main className="px-5 py-6 max-w-md mx-auto space-y-6 pb-24">
        {/* あいさつ */}
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2D5A27" }}>
            こんにちは{userProfile?.name ? `、${userProfile.name}さん` : ""} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B6914" }}>
            今日もTORCHでいい仕事を。
          </p>
        </div>

        {/* パスカード */}
        {activePass ? (
          <>
            <PassCard pass={activePass} />

            {/* FLEX PASSバナー */}
            {showFlexBanner && <FlexPassBanner remaining={remaining} />}

            {/* QRコード */}
            <div
              className="p-6 rounded-2xl"
              style={{ backgroundColor: "#FDFAF5", border: "1px solid #E8E4DC" }}
            >
              <h2 className="text-sm font-semibold mb-4 text-center" style={{ color: "#4A4A4A" }}>
                チェックイン用QRコード
              </h2>
              <QRDisplay passId={activePass.id} userId={authUser.id} />
            </div>
          </>
        ) : (
          <div
            className="p-8 rounded-2xl text-center"
            style={{ backgroundColor: "#FDFAF5", border: "1px dashed #E8E4DC" }}
          >
            <div className="text-4xl mb-3">🎟️</div>
            <h2 className="font-semibold mb-1" style={{ color: "#4A4A4A" }}>
              有効なパスがありません
            </h2>
            <p className="text-sm" style={{ color: "#8B6914" }}>
              スタッフにお声がけいただくか、フロントにてご購入ください。
            </p>
          </div>
        )}

        {/* 利用履歴リンク */}
        <Link
          href="/history"
          className="flex items-center justify-between p-4 rounded-2xl transition-all active:scale-95"
          style={{ backgroundColor: "#FDFAF5", border: "1px solid #E8E4DC" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#E8E4DC" }}
            >
              <span className="text-lg">📋</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#4A4A4A" }}>
                利用履歴
              </p>
              <p className="text-xs" style={{ color: "#8B6914" }}>
                過去のチェックイン記録
              </p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </main>
    </div>
  );
}
