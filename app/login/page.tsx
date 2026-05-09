"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: "#F5F0E8" }}>
      {/* ロゴ */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{ backgroundColor: "#2D5A27" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4 L22 14 L16 12 L10 14 Z" fill="white" opacity="0.9" />
            <path d="M16 12 L22 14 L16 28 L10 14 Z" fill="white" opacity="0.6" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-wide" style={{ color: "#2D5A27" }}>
          TORCH Pass
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#8B6914" }}>
          コワーキング回数券
        </p>
      </div>

      <div className="w-full max-w-sm">
        {sent ? (
          <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: "#FDFAF5" }}>
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-lg font-medium mb-2" style={{ color: "#2D5A27" }}>
              メールを送信しました
            </h2>
            <p className="text-sm" style={{ color: "#4A4A4A" }}>
              <strong>{email}</strong> 宛にログインリンクを送りました。
              メールをご確認ください。
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="mt-6 text-sm underline"
              style={{ color: "#8B6914" }}
            >
              別のメールで試す
            </button>
          </div>
        ) : (
          <div className="p-8 rounded-2xl shadow-sm" style={{ backgroundColor: "#FDFAF5" }}>
            {/* Google ログイン */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-sm font-medium transition-all active:scale-95"
              style={{
                borderColor: "#E8E4DC",
                color: "#4A4A4A",
                backgroundColor: "white",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Googleでログイン
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: "#E8E4DC" }} />
              <span className="text-xs" style={{ color: "#8B6914" }}>または</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#E8E4DC" }} />
            </div>

            {/* メールログイン */}
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#4A4A4A" }}>
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    borderColor: "#E8E4DC",
                    backgroundColor: "white",
                    color: "#4A4A4A",
                  }}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 px-4 rounded-xl text-sm font-medium text-white transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "#2D5A27" }}
              >
                {loading ? "送信中..." : "ログインリンクを送る"}
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-xs" style={{ color: "#8B6914" }}>
          TORCH Camping &amp; Coworking Space
        </p>
      </div>
    </div>
  );
}
