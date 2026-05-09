"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/harunaapp/mypage");
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F0E8" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#2D5A27", borderTopColor: "transparent" }} />
        <p className="text-sm" style={{ color: "#8B6914" }}>ログイン処理中...</p>
      </div>
    </div>
  );
}
