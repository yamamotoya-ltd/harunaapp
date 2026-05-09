import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Checkin } from "@/types/database";

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`,
    time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    weekday: ["日", "月", "火", "水", "木", "金", "土"][d.getDay()],
  };
}

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: checkins } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: false })
    .limit(50)
    .returns<Checkin[]>();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3"
        style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid #E8E4DC" }}
      >
        <Link
          href="/mypage"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: "#E8E4DC" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-base font-semibold" style={{ color: "#2D5A27" }}>
          利用履歴
        </h1>
      </header>

      <main className="px-5 py-6 max-w-md mx-auto pb-24">
        {checkins && checkins.length > 0 ? (
          <div className="space-y-3">
            {checkins.map((checkin) => {
              const dt = formatDateTime(checkin.checked_in_at);
              return (
                <div
                  key={checkin.id}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ backgroundColor: "#FDFAF5", border: "1px solid #E8E4DC" }}
                >
                  {/* 日付アイコン */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
                    style={{ backgroundColor: "#E8E4DC" }}
                  >
                    <span className="text-xs font-medium" style={{ color: "#8B6914" }}>
                      {dt.weekday}
                    </span>
                    <span className="text-lg font-bold leading-none" style={{ color: "#2D5A27" }}>
                      {new Date(checkin.checked_in_at).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "#4A4A4A" }}>
                      TORCH 4h PASS 利用
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#8B6914" }}>
                      {dt.date} {dt.time}
                    </p>
                    {checkin.note && (
                      <p className="text-xs mt-0.5" style={{ color: "#8B6914" }}>
                        {checkin.note}
                      </p>
                    )}
                  </div>

                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#2D5A27" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-medium" style={{ color: "#4A4A4A" }}>
              まだ利用履歴がありません
            </p>
            <p className="text-sm mt-1" style={{ color: "#8B6914" }}>
              チェックイン後に記録されます
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
