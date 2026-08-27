import { useState } from "react";
import Modal from "./Modal";

// mode: "restock" | "adjust"
export default function StockActionModal({ item, mode, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!item) return null;
  const isRestock = mode === "restock";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const num = Number(amount);
    if (!num || (isRestock && num <= 0)) {
      setError(isRestock ? "Enter a quantity greater than 0." : "Enter a non-zero amount.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(num, reason);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title={isRestock ? "Restock Item" : "Adjust Stock"}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-brass" form="stock-action-form" disabled={saving}>
            {saving && <span className="btn-spinner" />}
            {isRestock ? "Add Stock" : "Apply Adjustment"}
          </button>
        </>
      }
    >
      <div style={{ marginBottom: "var(--space-3)" }}>
        <div className="td-strong">{item.itemName}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Current stock: <span className="mono">{item.stockQuantity}</span> {item.unit}
        </div>
      </div>

      <form onSubmit={submit} id="stock-action-form">
        <div className="form-field full">
          <label>
            {isRestock ? `Quantity to add (${item.unit})` : `Adjustment (+/- ${item.unit})`}
            <span className="req">*</span>
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={isRestock ? "e.g. 50" : "e.g. -5 for wastage"}
            required
          />
        </div>
        <div className="form-field full">
          <label>Reason</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isRestock ? "Weekly restock" : "Spoiled batch"}
          />
        </div>
        {error && <p style={{ color: "var(--debit)", fontSize: 13 }}>{error}</p>}
      </form>
    </Modal>
  );
}
