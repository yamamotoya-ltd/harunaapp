"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      router.push(user ? "/harunaapp/mypage" : "/harunaapp/login");
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F0E8" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "#2D5A27", borderTopColor: "transparent" }} />
    </div>
  );
}
