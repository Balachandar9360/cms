import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile, getWallet, getCanteenItems } from "../../api/studentApi";
import WalletStub from "../../components/WalletStub";
import { WalletPill } from "../../components/WalletStub";
import { Skeleton } from "../../components/Skeleton";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    Promise.all([getProfile(), getWallet(), getCanteenItems()])
      .then(([p, w, i]) => {
        setProfile(p.data.data);
        setWallet(w.data.data);
        setItems((i.data.data.content || i.data.data || []).slice(0, 4));
      })
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load your dashboard")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Skeleton h={220} />
        <Skeleton h={220} />
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h1>{profile?.name}</h1>
          <p className="desc">{profile?.department} · {profile?.course}, Year {profile?.year}</p>
        </div>
        <Link to="/student/canteen" className="btn btn-brass">Browse Canteen →</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        <WalletStub wallet={wallet} studentId={profile?.studentId} badge={profile?.status} />

        <div className="card">
          <div className="card-head">
            <h3>Popular Right Now</h3>
            <Link to="/student/canteen" className="btn btn-ghost btn-sm">View menu →</Link>
          </div>
          <div style={{ padding: "8px 20px" }}>
            {items.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "16px 0" }}>
                No canteen items available right now.
              </p>
            )}
            {items.map((it) => (
              <div key={it.id} className="cart-row">
                <div>
                  <div className="td-strong" style={{ fontSize: 14 }}>{it.itemName}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{it.category}</div>
                </div>
                <WalletPill amount={it.price} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
