"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRDisplayProps {
  passId: string;
  userId: string;
}

export default function QRDisplay({ passId, userId }: QRDisplayProps) {
  const qrData = JSON.stringify({ passId, userId, ts: Date.now() });

  return (
    <div className="flex flex-col items-center">
      <div
        className="p-5 rounded-2xl shadow-sm"
        style={{ backgroundColor: "white" }}
      >
        <QRCodeSVG
          value={qrData}
          size={200}
          bgColor="white"
          fgColor="#2D5A27"
          level="M"
        />
      </div>
      <p className="mt-3 text-xs text-center" style={{ color: "#8B6914" }}>
        スタッフにこのQRコードを読み取ってもらってください
      </p>
    </div>
  );
}
