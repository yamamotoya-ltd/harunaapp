import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Checkin, User, PassWithUser } from "@/types/database";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 管理者チェック
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single<User>();

  if (profile?.role !== "admin") {
    redirect("/mypage");
  }

  // 今日のチェックイン
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayCheckins } = await supabase
    .from("checkins")
    .select("*, passes(plan_name, users(name, email))")
    .gte("checked_in_at", today.toISOString())
    .order("checked_in_at", { ascending: false })
    .limit(20);

  // 統計
  const { count: todayCount } = await supabase
    .from("checkins")
    .select("*", { count: "exact", head: true })
    .gte("checked_in_at", today.toISOString());

  const { count: totalCount } = await supabase
    .from("checkins")
    .select("*", { count: "exact", head: true });

  const { count: activePassCount } = await supabase
    .from("passes")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid #E8E4DC" }}
      >
        <div>
          <p className="text-xs" style={{ color: "#8B6914" }}>管理者</p>
          <h1 className="text-base font-semibold" style={{ color: "#2D5A27" }}>
            ダッシュボード
          </h1>
        </div>
        <Link
          href="/admin/scan"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-95"
          style={{ backgroundColor: "#2D5A27" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" stroke="white" strokeWidth="1.5" />
            <rect x="10" y="1" width="5" height="5" rx="1" stroke="white" strokeWidth="1.5" />
            <rect x="1" y="10" width="5" height="5" rx="1" stroke="white" strokeWidth="1.5" />
            <rect x="10" y="10" width="2" height="2" fill="white" />
            <rect x="13" y="10" width="2" height="2" fill="white" />
            <rect x="10" y="13" width="2" height="2" fill="white" />
            <rect x="13" y="13" width="2" height="2" fill="white" />
          </svg>
          QRスキャン
        </Link>
      </header>

      <main className="px-5 py-6 max-w-md mx-auto space-y-6 pb-24">
        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="本日の利用"
            value={todayCount ?? 0}
            unit="件"
            color="#2D5A27"
          />
          <StatCard
            label="累計利用"
            value={totalCount ?? 0}
            unit="件"
            color="#8B6914"
          />
          <StatCard
            label="有効パス"
            value={activePassCount ?? 0}
            unit="枚"
            color="#4A4A4A"
          />
        </div>

        {/* 本日のチェックイン */}
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#4A4A4A" }}>
            本日のチェックイン
          </h2>

          {todayCheckins && todayCheckins.length > 0 ? (
            <div className="space-y-2">
              {todayCheckins.map((checkin: Record<string, unknown>) => {
                const pass = checkin.passes as Record<string, unknown> | null;
                const userInfo = pass?.users as Record<string, unknown> | null;
                return (
                  <div
                    key={checkin.id as string}
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ backgroundColor: "#FDFAF5", border: "1px solid #E8E4DC" }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                      style={{ backgroundColor: "#2D5A27" }}
                    >
                      {((userInfo?.name as string) || (userInfo?.email as string) || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#4A4A4A" }}>
                        {(userInfo?.name as string) || (userInfo?.email as string) || "不明"}
                      </p>
                      <p className="text-xs" style={{ color: "#8B6914" }}>
                        {pass?.plan_name as string || "TORCH 4h PASS"}
                      </p>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: "#8B6914" }}>
                      {formatTime(checkin.checked_in_at as string)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="text-center py-10 rounded-2xl"
              style={{ backgroundColor: "#FDFAF5", border: "1px dashed #E8E4DC" }}
            >
              <p className="text-sm" style={{ color: "#8B6914" }}>
                本日はまだチェックインがありません
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div
      className="p-4 rounded-2xl flex flex-col"
      style={{ backgroundColor: "#FDFAF5", border: "1px solid #E8E4DC" }}
    >
      <span className="text-xs mb-1" style={{ color: "#8B6914" }}>
        {label}
      </span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl font-bold" style={{ color }}>
          {value}
        </span>
        <span className="text-xs" style={{ color: "#8B6914" }}>
          {unit}
        </span>
      </div>
    </div>
  );
}
