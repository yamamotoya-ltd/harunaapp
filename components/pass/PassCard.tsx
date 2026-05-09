import { Pass } from "@/types/database";

interface PassCardProps {
  pass: Pass;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function getDaysRemaining(expiresAt: string) {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function PassCard({ pass }: PassCardProps) {
  const remaining = pass.total_count - pass.used_count;
  const daysLeft = getDaysRemaining(pass.expires_at);
  const isExpiringSoon = daysLeft <= 14;
  const isLowCount = remaining <= 3;

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 shadow-md"
      style={{ backgroundColor: "#2D5A27" }}
    >
      {/* 背景テクスチャ */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ヘッダー */}
      <div className="relative flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-medium tracking-widest opacity-70 text-white uppercase">
            Coworking Pass
          </p>
          <h2 className="text-xl font-bold text-white mt-0.5">
            TORCH 4h PASS
          </h2>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M16 4 L22 14 L16 12 L10 14 Z" fill="white" opacity="0.9" />
            <path d="M16 12 L22 14 L16 28 L10 14 Z" fill="white" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* 残枚数 */}
      <div className="relative mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-bold text-white leading-none">
            {remaining}
          </span>
          <span className="text-lg text-white/70">
            / {pass.total_count}枚
          </span>
        </div>
        <p className="text-sm text-white/70 mt-1">残り利用回数</p>
      </div>

      {/* パンチ穴 */}
      <div className="relative flex gap-2 mb-6">
        {Array.from({ length: pass.total_count }).map((_, i) => {
          const isUsed = i < pass.used_count;
          return (
            <div
              key={i}
              className="flex-1 aspect-square rounded-full border-2 transition-all"
              style={{
                borderColor: isUsed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)",
                backgroundColor: isUsed ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.15)",
              }}
            >
              {isUsed && (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* フッター */}
      <div className="relative flex items-end justify-between">
        <div>
          <p className="text-xs text-white/60">有効期限</p>
          <p
            className="text-sm font-medium text-white mt-0.5"
            style={{ color: isExpiringSoon ? "#FCD34D" : "white" }}
          >
            {formatDate(pass.expires_at)}
            {isExpiringSoon && (
              <span className="ml-1.5 text-xs">
                （残{daysLeft}日）
              </span>
            )}
          </p>
        </div>

        {(isLowCount || isExpiringSoon) && (
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#FCD34D" }}
          >
            {isLowCount ? `残り${remaining}枚` : `残り${daysLeft}日`}
          </div>
        )}
      </div>

      {!pass.is_active && (
        <div className="absolute inset-0 flex items-center justify-center rounded-3xl"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <span className="text-white font-bold text-xl">期限切れ</span>
        </div>
      )}
    </div>
  );
}
