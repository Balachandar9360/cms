import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  listCanteenItems, qrLookupStudent, qrPurchaseForStudent, getStudentWallet,
} from "../../api/adminApi";
import { WalletPill, fmt } from "../../components/WalletStub";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

const SCANNER_ID = "qr-scanner-region";

export default function QrCheckout() {
  const [scanning, setScanning] = useState(false);
  const [student, setStudent] = useState(null); // full student + wallet data
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [resolving, setResolving] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [lastPurchase, setLastPurchase] = useState(null);
  const toast = useToast();
  const scannerRef = useRef(null);
  // Debounce: ignore repeated scan events for the same code
  const lastScannedRef = useRef(null);

  useEffect(() => {
    listCanteenItems()
      .then((res) => setItems(res.data.data.content || res.data.data || []))
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load menu")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* already stopped */ }
      try { scannerRef.current.clear(); } catch { /* no-op */ }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  // Called when scanner reads a QR — the value is the student's studentId
  const handleScanSuccess = useCallback(async (decodedText) => {
    // Prevent duplicate fires for same scan
    if (lastScannedRef.current === decodedText) return;
    lastScannedRef.current = decodedText;

    await stopScanner();
    setResolving(true);
    try {
      const sid = decodedText.trim();
      // Fetch student profile AND wallet in parallel for correct balance
      const [sRes, wRes] = await Promise.all([
        qrLookupStudent(sid),
        getStudentWallet(sid),
      ]);
      const s = sRes.data.data;
      const w = wRes.data.data;
      const currentBalance =
        w?.currentBalance ?? w?.balance ??
        s.wallet?.currentBalance ?? s.walletBalance ?? 0;
      setStudent({
        studentId: s.studentId,
        studentName: s.name,
        currentBalance,
        email: s.email,
        status: s.status,
      });
      setCart({});
      setLastPurchase(null);
    } catch (err) {
      toast.error("Student not found. Make sure you scanned a valid canteen QR code.");
      lastScannedRef.current = null; // allow retry
    } finally {
      setResolving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopScanner]);

  const startScanner = async () => {
    setStudent(null);
    lastScannedRef.current = null;
    setScanning(true);
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 25,                           // ↑ from 10 → 25 for faster detection
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
            disableFlip: false,
            // Use the fastest decoder format — QR codes only
            formatsToSupport: [0], // 0 = QR_CODE in Html5Qrcode format enum
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true, // uses native BarcodeDetector API on Chrome/Edge — ~3x faster
            },
          },
          handleScanSuccess,
          () => {} // per-frame miss — ignore
        );
      } catch (err) {
        setScanning(false);
        toast.error("Could not access camera. Check browser permissions.");
      }
    }, 50);
  };

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  const cartTotal = (cartSnapshot) =>
    Object.entries(cartSnapshot).reduce((sum, [id, qty]) => {
      const item = items.find((i) => String(i.id) === String(id));
      return item ? sum + Number(item.price) * qty : sum;
    }, 0);

  const addToCart = (item) => {
    const newCart = { ...cart, [item.id]: (cart[item.id] || 0) + 1 };
    const newTotal = cartTotal(newCart);
    if (student && newTotal > Number(student.currentBalance)) return; // balance guard
    if (item.stockQuantity !== undefined && (cart[item.id] || 0) >= item.stockQuantity) return; // stock guard
    setCart(newCart);
  };

  const removeOne = (id) => setCart((c) => {
    const next = { ...c };
    if (next[id] <= 1) delete next[id];
    else next[id] -= 1;
    return next;
  });

  const cartLines = useMemo(() =>
    Object.entries(cart).map(([id, qty]) => {
      const item = items.find((i) => String(i.id) === String(id));
      return item ? { item, qty } : null;
    }).filter(Boolean),
    [cart, items]
  );

  const total = cartLines.reduce((sum, l) => sum + Number(l.item.price) * l.qty, 0);
  const overBudget = student && total > Number(student.currentBalance);

  // Would adding one more of this item exceed balance?
  const wouldExceedBalance = (item) => {
    if (!student) return false;
    const nextQty = (cart[item.id] || 0) + 1;
    const nextTotal = total
      - (Number(item.price) * (cart[item.id] || 0))
      + (Number(item.price) * nextQty);
    return nextTotal > Number(student.currentBalance);
  };
  const isMaxStock = (item) =>
    item.stockQuantity !== undefined && (cart[item.id] || 0) >= item.stockQuantity;

  // Sort: available + in-stock first → low-stock → out-of-stock last
  const sortedItems = useMemo(() => {
    return [...items]
      .filter((it) => it.activeStatus && it.available)
      .sort((a, b) => {
        const aOos = (a.stockQuantity ?? 0) === 0;
        const bOos = (b.stockQuantity ?? 0) === 0;
        if (aOos !== bOos) return aOos ? 1 : -1; // in-stock before oos
        const aLow = !aOos && (a.stockQuantity ?? 0) <= (a.lowStockThreshold || 10);
        const bLow = !bOos && (b.stockQuantity ?? 0) <= (b.lowStockThreshold || 10);
        if (aLow !== bLow) return aLow ? 1 : -1; // normal before low
        return 0;
      });
  }, [items]);

  const completeCheckout = async () => {
    if (!student || cartLines.length === 0) return;
    setCheckingOut(true);
    try {
      const payload = cartLines.map((l) => ({ itemId: l.item.id, quantity: l.qty }));
      const { data } = await qrPurchaseForStudent(student.studentId, payload);
      const p = data.data;
      setLastPurchase(p);
      toast.success(`Purchase ${p.purchaseNumber} completed — ₹${fmt(p.totalAmount)} debited`);
      setStudent(null);
      setCart({});
    } catch (err) {
      toast.error(apiErrorMessage(err, "Checkout failed"));
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Counter</span>
          <h1>QR Checkout</h1>
          <p className="desc">Scan a student's QR code, build their order, and complete the purchase.</p>
        </div>
        {!student && (
          <button className="btn btn-brass" onClick={scanning ? stopScanner : startScanner}>
            {scanning ? "Stop Scanning" : "Scan Student QR"}
          </button>
        )}
      </div>

      {/* Scanner viewport */}
      {!student && scanning && (
        <div className="card card-pad" style={{ maxWidth: 380, margin: "0 auto" }}>
          <div id={SCANNER_ID} style={{ borderRadius: 12, overflow: "hidden" }} />
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12, textAlign: "center" }}>
            Point the camera at the student's QR code card or screen.
          </p>
        </div>
      )}

      {/* Resolving state */}
      {!student && !scanning && resolving && (
        <div className="card card-pad" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>Looking up student…</p>
        </div>
      )}

      {/* Empty state */}
      {!student && !scanning && !resolving && !lastPurchase && (
        <EmptyState glyph="◱" title="No student scanned yet" description="Tap 'Scan Student QR' to begin a counter purchase." />
      )}

      {/* Order builder */}
      {student && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          <div>
            {/* Student info bar */}
            <div className="card card-pad" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="td-strong" style={{ fontSize: 16 }}>{student.studentName}</div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>{student.studentId}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "right" }}>
                    <span className="eyebrow">Balance</span>
                    <div className="mono" style={{ fontSize: 18 }}>₹{fmt(student.currentBalance)}</div>
                  </div>
                  <Badge tone={student.status === "ACTIVE" ? "active" : "inactive"}>{student.status}</Badge>
                </div>
              </div>
            </div>

            {/* Menu grid — in-stock first, out-of-stock last */}
            <div className="items-grid">
              {sortedItems.map((it) => {
                const oos = (it.stockQuantity ?? 0) === 0;
                const exceedsBalance = wouldExceedBalance(it);
                const atMaxStock = isMaxStock(it);
                const cantAdd = oos || exceedsBalance || atMaxStock;
                return (
                  <div className={`item-card${oos ? " item-card--oos" : ""}`} key={it.id}>
                    <span className="cat">{it.category}</span>
                    <div className="name">{it.itemName}</div>
                    {it.stockQuantity !== undefined && (
                      <div className="stock-row">
                        <span className={`stock-badge${oos ? " oos" : it.stockQuantity <= (it.lowStockThreshold || 10) ? " low" : ""}`}>
                          {oos ? "Out of stock" : `${it.stockQuantity} left`}
                        </span>
                      </div>
                    )}
                    <div className="foot">
                      <span className="price">₹{fmt(it.price)}</span>
                      <button
                        className="btn btn-brass btn-sm"
                        onClick={() => addToCart(it)}
                        disabled={cantAdd}
                        title={
                          oos ? "Out of stock" :
                          exceedsBalance ? "Exceeds student balance" :
                          atMaxStock ? `Only ${it.stockQuantity} available` : ""
                        }
                      >
                        {oos ? "Unavailable" : exceedsBalance ? "Over budget" : "Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart panel */}
          <div className="card" style={{ position: "sticky", top: 88 }}>
            <div className="card-head">
              <h3>Order</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => { setStudent(null); setCart({}); }}>
                Cancel
              </button>
            </div>
            <div style={{ padding: "8px 20px" }}>
              {cartLines.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "16px 0" }}>
                  Add items to build this student's order.
                </p>
              )}
              {cartLines.map(({ item, qty }) => {
                const atMaxStock = isMaxStock(item);
                const nextExceedsBalance = wouldExceedBalance(item);
                return (
                  <div className="cart-row" key={item.id}>
                    <div>
                      <div className="td-strong" style={{ fontSize: 13.5 }}>{item.itemName}</div>
                      <WalletPill amount={item.price * qty} />
                    </div>
                    <div className="qty-control">
                      <button onClick={() => removeOne(item.id)}>−</button>
                      <span className="n">{qty}</span>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={atMaxStock || nextExceedsBalance}
                        title={atMaxStock ? "Max stock reached" : nextExceedsBalance ? "Exceeds balance" : ""}
                      >+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {cartLines.length > 0 && (
              <div style={{ padding: "16px 20px", borderTop: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <span className="eyebrow">Total</span>
                  <WalletPill amount={total} />
                </div>
                {overBudget && (
                  <div className="login-error" style={{ marginBottom: 12 }}>
                    Exceeds student's balance of ₹{fmt(student.currentBalance)}.
                  </div>
                )}
                <button
                  className="btn btn-brass btn-block"
                  onClick={completeCheckout}
                  disabled={checkingOut || overBudget || student.status !== "ACTIVE"}
                >
                  {checkingOut && <span className="btn-spinner" />}
                  {checkingOut ? "Processing…" : "Complete Purchase"}
                </button>
                {student.status !== "ACTIVE" && (
                  <p style={{ fontSize: 11.5, color: "var(--debit)", marginTop: 8, textAlign: "center" }}>
                    Cannot checkout — student account is {student.status}.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last purchase receipt */}
      {lastPurchase && (
        <div className="card card-pad" style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3>Last Purchase</h3>
            <Badge tone="credit">SUCCESS</Badge>
          </div>
          <div className="table-wrap">
            <table className="grid">
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                {lastPurchase.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td className="td-strong">{it.itemName}</td>
                    <td className="mono">{it.quantity}</td>
                    <td><WalletPill amount={it.unitPrice} /></td>
                    <td><WalletPill amount={it.totalPrice} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 16, fontSize: 13 }}>
            <span className="td-id">{lastPurchase.purchaseNumber}</span>
            <span>New balance: <strong className="mono">₹{fmt(lastPurchase.newBalance)}</strong></span>
          </div>
          <button className="btn btn-brass btn-sm" style={{ marginTop: 16 }} onClick={startScanner}>
            Scan Next Student
          </button>
        </div>
      )}
    </>
  );
}
