"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CheckinRow {
  id: string;
  checked_in_at: string;
  passes: { plan_name: string; users: { name: string | null; email: string } | null } | null;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdminDashboard() {
  const [todayCheckins, setTodayCheckins] = useState<CheckinRow[]>([]);
  const [stats, setStats] = useState({ today: 0, total: 0, activePasses: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/harunaapp/login"); return; }

      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") { router.push("/harunaapp/mypage"); return; }

      const today = new Date(); today.setHours(0, 0, 0, 0);

      const [
        { data: checkins },
        { count: todayCount },
        { count: totalCount },
        { count: activePassCount },
      ] = await Promise.all([
        supabase.from("checkins").select("id, checked_in_at, passes(plan_name, users(name, email))")
          .gte("checked_in_at", today.toISOString()).order("checked_in_at", { ascending: false }).limit(20),
        supabase.from("checkins").select("*", { count: "exact", head: true }).gte("checked_in_at", today.toISOString()),
        supabase.from("checkins").select("*", { count: "exact", head: true }),
        supabase.from("passes").select("*", { count: "exact", head: true }).eq("is_active", true),
      ]);

      setTodayCheckins((checkins ?? []) as unknown as CheckinRow[]);
      setStats({ today: todayCount ?? 0, total: totalCount ?? 0, activePasses: activePassCount ?? 0 });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F0E8" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "#2D5A27", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      <header className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid #E8E4DC" }}>
        <div>
          <p className="text-xs" style={{ color: "#8B6914" }}>管理者</p>
          <h1 className="text-base font-semibold" style={{ color: "#2D5A27" }}>ダッシュボード</h1>
        </div>
        <Link href="/harunaapp/admin/scan"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-95"
          style={{ backgroundColor: "#2D5A27" }}>
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
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "本日の利用", value: stats.today, unit: "件", color: "#2D5A27" },
            { label: "累計利用", value: stats.total, unit: "件", color: "#8B6914" },
            { label: "有効パス", value: stats.activePasses, unit: "枚", color: "#4A4A4A" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl flex flex-col"
              style={{ backgroundColor: "#FDFAF5", border: "1px solid #E8E4DC" }}>
              <span className="text-xs mb-1" style={{ color: "#8B6914" }}>{s.label}</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</span>
                <span className="text-xs" style={{ color: "#8B6914" }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#4A4A4A" }}>本日のチェックイン</h2>
          {todayCheckins.length > 0 ? (
            <div className="space-y-2">
              {todayCheckins.map((c) => {
                const u = c.passes?.users;
                return (
                  <div key={c.id} className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ backgroundColor: "#FDFAF5", border: "1px solid #E8E4DC" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                      style={{ backgroundColor: "#2D5A27" }}>
                      {(u?.name || u?.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#4A4A4A" }}>
                        {u?.name || u?.email || "不明"}
                      </p>
                      <p className="text-xs" style={{ color: "#8B6914" }}>{c.passes?.plan_name}</p>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: "#8B6914" }}>
                      {formatTime(c.checked_in_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 rounded-2xl"
              style={{ backgroundColor: "#FDFAF5", border: "1px dashed #E8E4DC" }}>
              <p className="text-sm" style={{ color: "#8B6914" }}>本日はまだチェックインがありません</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
