"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface CheckinResult {
  success: boolean;
  message: string;
  userName?: string;
  remaining?: number;
}

export default function ScanPage() {
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  async function startScanner() {
    setScanning(true);
    setResult(null);

    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
      );
    } catch {
      setScanning(false);
      setResult({
        success: false,
        message: "カメラへのアクセスが拒否されました。設定を確認してください。",
      });
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current as {
      isScanning?: boolean;
      stop?: () => Promise<void>;
    } | null;
    if (scanner?.isScanning && scanner?.stop) {
      await scanner.stop().catch(() => {});
    }
    scannerRef.current = null;
    setScanning(false);
  }

  async function onScanSuccess(decodedText: string) {
    await stopScanner();
    setLoading(true);

    try {
      const data = JSON.parse(decodedText) as { passId: string; userId: string };

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passId: data.passId, userId: data.userId }),
      });

      const json = (await res.json()) as CheckinResult;
      setResult(json);
    } catch {
      setResult({
        success: false,
        message: "QRコードの読み取りに失敗しました。",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3"
        style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid #E8E4DC" }}
      >
        <Link
          href="/admin/dashboard"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: "#E8E4DC" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-base font-semibold" style={{ color: "#2D5A27" }}>
          QRスキャン
        </h1>
      </header>

      <main className="px-5 py-6 max-w-md mx-auto space-y-6">
        {/* スキャナー */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ backgroundColor: "#FDFAF5", border: "1px solid #E8E4DC" }}
        >
          {scanning ? (
            <div className="relative">
              <div id="qr-reader" className="w-full" />
              <button
                onClick={stopScanner}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white" }}
              >
                キャンセル
              </button>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: "#E8E4DC" }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="4" y="4" width="13" height="13" rx="2" stroke="#2D5A27" strokeWidth="2" />
                  <rect x="23" y="4" width="13" height="13" rx="2" stroke="#2D5A27" strokeWidth="2" />
                  <rect x="4" y="23" width="13" height="13" rx="2" stroke="#2D5A27" strokeWidth="2" />
                  <rect x="23" y="23" width="5" height="5" fill="#2D5A27" />
                  <rect x="31" y="23" width="5" height="5" fill="#2D5A27" />
                  <rect x="23" y="31" width="5" height="5" fill="#2D5A27" />
                  <rect x="31" y="31" width="5" height="5" fill="#2D5A27" />
                </svg>
              </div>
              <h2 className="text-base font-semibold mb-2" style={{ color: "#4A4A4A" }}>
                QRコードを読み取る
              </h2>
              <p className="text-sm mb-6" style={{ color: "#8B6914" }}>
                利用者のスマホに表示されたQRコードをカメラで読み取ってください
              </p>
              <button
                onClick={startScanner}
                disabled={loading}
                className="px-8 py-3 rounded-xl text-sm font-medium text-white transition-all active:scale-95"
                style={{ backgroundColor: "#2D5A27" }}
              >
                スキャン開始
              </button>
            </div>
          )}
        </div>

        {/* ローディング */}
        {loading && (
          <div
            className="p-6 rounded-2xl text-center"
            style={{ backgroundColor: "#FDFAF5", border: "1px solid #E8E4DC" }}
          >
            <div className="flex justify-center mb-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#2D5A27", borderTopColor: "transparent" }}
              />
            </div>
            <p className="text-sm" style={{ color: "#4A4A4A" }}>チェックイン処理中...</p>
          </div>
        )}

        {/* 結果 */}
        {result && !loading && (
          <div
            className="p-6 rounded-2xl"
            style={{
              backgroundColor: result.success ? "#FDFAF5" : "#FEF2F2",
              border: `1px solid ${result.success ? "#E8E4DC" : "#FECACA"}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: result.success ? "#2D5A27" : "#EF4444" }}
              >
                {result.success ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M6 6l8 8M14 6l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-semibold" style={{ color: result.success ? "#2D5A27" : "#EF4444" }}>
                  {result.success ? "チェックイン完了" : "エラー"}
                </p>
                {result.userName && (
                  <p className="text-sm" style={{ color: "#4A4A4A" }}>
                    {result.userName}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm" style={{ color: "#4A4A4A" }}>
              {result.message}
            </p>
            {result.remaining !== undefined && (
              <div
                className="mt-3 px-4 py-2.5 rounded-xl"
                style={{ backgroundColor: "#E8E4DC" }}
              >
                <p className="text-sm" style={{ color: "#4A4A4A" }}>
                  残り枚数: <strong style={{ color: "#2D5A27" }}>{result.remaining}枚</strong>
                </p>
              </div>
            )}
            <button
              onClick={() => setResult(null)}
              className="mt-4 w-full py-3 rounded-xl text-sm font-medium text-white transition-all active:scale-95"
              style={{ backgroundColor: "#2D5A27" }}
            >
              次のスキャン
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
