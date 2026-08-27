import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../context/AuthContext";

export default function PayAtCounter() {
  const { user } = useAuth();
  // The student's permanent QR simply encodes their studentId.
  // No token, no expiry — admin scans this to identify the student at the counter.
  const studentId = user?.studentId || user?.username || "";

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Counter Checkout</span>
          <h1>Show this to canteen staff</h1>
          <p className="desc">Your personal QR code — staff will scan it and add your items at the counter.</p>
        </div>
      </div>

      <div className="card card-pad" style={{ maxWidth: 380, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", padding: 20, background: "#fff",
          borderRadius: 16, border: "2px solid var(--line)", marginBottom: 16,
        }}>
          {studentId ? (
            <QRCodeSVG
              value={studentId}
              size={220}
              level="H"
              includeMargin={false}
            />
          ) : (
            <div style={{ width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Loading…
            </div>
          )}
        </div>

        <div className="mono" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>
          {studentId}
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>
          This QR code is permanent and unique to your account.
        </p>
      </div>
    </>
  );
}
