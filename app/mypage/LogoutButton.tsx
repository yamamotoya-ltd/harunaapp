"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs px-3 py-1.5 rounded-lg transition-all active:scale-95"
      style={{ backgroundColor: "#E8E4DC", color: "#4A4A4A" }}
    >
      ログアウト
    </button>
  );
}
