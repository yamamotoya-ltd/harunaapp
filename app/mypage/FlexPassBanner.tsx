interface FlexPassBannerProps {
  remaining: number;
}

export default function FlexPassBanner({ remaining }: FlexPassBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{ backgroundColor: "#8B6914" }}
    >
      <div className="absolute top-0 right-0 opacity-10 text-8xl leading-none">🌿</div>
      <div className="relative">
        <p className="text-xs font-medium tracking-wider text-white/70 uppercase mb-1">
          おすすめ
        </p>
        <h3 className="text-base font-bold text-white mb-1">
          FLEX PASSはいかがですか？
        </h3>
        <p className="text-sm text-white/80">
          残り{remaining}枚になりました。月額プランなら毎月使い放題でお得です。
        </p>
        <button
          className="mt-3 px-4 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
          style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
        >
          詳しく見る →
        </button>
      </div>
    </div>
  );
}
