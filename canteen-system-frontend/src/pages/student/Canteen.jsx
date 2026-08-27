import { useEffect, useMemo, useState } from "react";
import { getCanteenItems, purchase, getWallet } from "../../api/studentApi";
import { WalletPill, fmt } from "../../components/WalletStub";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

export default function Canteen() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({}); // { itemId: qty }
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [lastPurchase, setLastPurchase] = useState(null);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([getCanteenItems(), getWallet()])
      .then(([i, w]) => {
        setItems(i.data.data.content || i.data.data || []);
        setBalance(w.data.data.currentBalance);
      })
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load canteen menu")))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const cartTotal = (cartSnapshot) =>
    Object.entries(cartSnapshot).reduce((sum, [id, qty]) => {
      const item = items.find((i) => String(i.id) === String(id));
      return item ? sum + Number(item.price) * qty : sum;
    }, 0);

  const addToCart = (item) => {
    const newCart = { ...cart, [item.id]: (cart[item.id] || 0) + 1 };
    const newTotal = cartTotal(newCart);
    // Block if adding this item would exceed wallet balance
    if (balance !== null && newTotal > Number(balance)) return;
    // Block if adding exceeds available stock
    const currentQty = cart[item.id] || 0;
    if (item.stockQuantity !== undefined && currentQty >= item.stockQuantity) return;
    setCart(newCart);
  };

  const addMoreInCart = (item) => addToCart(item);

  const removeOne = (id) => setCart((c) => {
    const next = { ...c };
    if (next[id] <= 1) delete next[id];
    else next[id] -= 1;
    return next;
  });
  const clearCart = () => setCart({});

  const cartLines = useMemo(() =>
    Object.entries(cart).map(([id, qty]) => {
      const item = items.find((i) => String(i.id) === String(id));
      return item ? { item, qty } : null;
    }).filter(Boolean),
    [cart, items]
  );

  const total = cartLines.reduce((sum, l) => sum + Number(l.item.price) * l.qty, 0);
  const overBudget = balance !== null && total > Number(balance);

  // Helper: would adding one more of this item exceed the balance?
  const wouldExceedBalance = (item) => {
    if (balance === null) return false;
    const nextQty = (cart[item.id] || 0) + 1;
    const nextTotal = total - (Number(item.price) * (cart[item.id] || 0)) + (Number(item.price) * nextQty);
    return nextTotal > Number(balance);
  };

  const isOutOfStock = (item) => item.stockQuantity !== undefined && item.stockQuantity === 0;
  const isMaxStock = (item) => item.stockQuantity !== undefined && (cart[item.id] || 0) >= item.stockQuantity;

  const checkout = async () => {
    if (cartLines.length === 0) return;
    setCheckingOut(true);
    setLastPurchase(null);
    try {
      const payload = cartLines.map((l) => ({ itemId: l.item.id, quantity: l.qty }));
      const { data } = await purchase(payload);
      const p = data.data;
      setLastPurchase(p);
      setBalance(p.newBalance);
      clearCart();
      toast.success(`Purchase ${p.purchaseNumber} successful — ₹${fmt(p.totalAmount)} debited`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Purchase failed"));
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Menu</span>
          <h1>Canteen</h1>
          <p className="desc">
            Available balance:{" "}
            <strong className="mono">{balance !== null ? `₹${fmt(balance)}` : "—"}</strong>
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        <div>
          {loading && (
            <div className="items-grid">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={150} />)}
            </div>
          )}
          {!loading && items.length === 0 && (
            <EmptyState glyph="▤" title="Nothing on the menu yet" description="Check back once the canteen adds items." />
          )}
          {!loading && items.length > 0 && (
            <div className="items-grid">
              {items.map((it) => {
                const outOfStock = isOutOfStock(it);
                const maxStock = isMaxStock(it);
                const exceedsBalance = wouldExceedBalance(it);
                const cantAdd = outOfStock || maxStock || exceedsBalance;
                return (
                  <div className={`item-card${outOfStock ? " item-card--oos" : ""}`} key={it.id}>
                    <span className="cat">{it.category}</span>
                    <div className="name">{it.itemName}</div>
                    {it.description && <div className="desc">{it.description}</div>}
                    <div className="stock-row">
                      {outOfStock ? (
                        <span className="stock-badge oos">Out of stock</span>
                      ) : it.stockQuantity !== undefined ? (
                        <span className={`stock-badge${it.stockQuantity <= (it.lowStockThreshold || 10) ? " low" : ""}`}>
                          {it.stockQuantity} {it.unit || "pcs"} left
                        </span>
                      ) : null}
                    </div>
                    <div className="foot">
                      <span className="price">₹{fmt(it.price)}</span>
                      <button
                        className="btn btn-brass btn-sm"
                        onClick={() => addToCart(it)}
                        disabled={cantAdd}
                        title={
                          outOfStock ? "Out of stock" :
                          maxStock ? `Only ${it.stockQuantity} available` :
                          exceedsBalance ? "Exceeds your wallet balance" : ""
                        }
                      >
                        {outOfStock ? "Unavailable" : exceedsBalance ? "Over budget" : "Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card" style={{ position: "sticky", top: 88 }}>
          <div className="card-head">
            <h3>Your Cart</h3>
            {cartLines.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearCart}>Clear</button>
            )}
          </div>
          <div style={{ padding: "8px 20px" }}>
            {cartLines.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "16px 0" }}>
                Add items from the menu to build your order.
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
                      onClick={() => addMoreInCart(item)}
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
                  This exceeds your current balance of ₹{fmt(balance)}.
                </div>
              )}
              <button
                className="btn btn-brass btn-block"
                onClick={checkout}
                disabled={checkingOut || overBudget}
              >
                {checkingOut && <span className="btn-spinner" />}
                {checkingOut ? "Placing order…" : "Confirm Purchase"}
              </button>
            </div>
          )}
        </div>
      </div>

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
                {lastPurchase.items.map((it, idx) => (
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
        </div>
      )}
    </>
  );
}
