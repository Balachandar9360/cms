import { useCallback, useEffect, useState } from "react";
import { getTransactions, getPendingFeedback, submitFeedback } from "../../api/studentApi";
import Badge from "../../components/Badge";
import StarRating from "../../components/StarRating";
import { WalletPill } from "../../components/WalletStub";
import { SkeletonRows } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

const TYPE_TONE = { CREDIT: "credit", DEBIT: "debit", ADJUSTMENT: "brass" };

function PendingFeedbackCard({ purchaseItemId, itemName, quantity, purchasedAt, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const submit = async () => {
    if (rating === 0) {
      toast.error("Pick a star rating first");
      return;
    }
    setSaving(true);
    try {
      await submitFeedback(purchaseItemId, rating, comment);
      toast.success(`Thanks for rating "${itemName}"`);
      onSubmitted(purchaseItemId);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not submit feedback"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 0", borderBottom: "1px solid var(--line)", gap: 16,
    }}>
      <div style={{ minWidth: 0 }}>
        <div className="td-strong">{itemName} {quantity > 1 && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>× {quantity}</span>}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {purchasedAt ? new Date(purchasedAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : ""}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <StarRating value={rating} onChange={setRating} />
        <input
          placeholder="Optional comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ width: 160, fontSize: 12.5 }}
        />
        <button className="btn btn-brass btn-sm" onClick={submit} disabled={saving}>
          {saving ? "Saving…" : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const toast = useToast();
  const size = 10;

  const load = useCallback(() => {
    setLoading(true);
    getTransactions(page, size)
      .then((res) => setData(res.data.data))
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load transactions")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadPending = useCallback(() => {
    setPendingLoading(true);
    getPendingFeedback()
      .then((res) => setPending(res.data.data || []))
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load pending reviews")))
      .finally(() => setPendingLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadPending(); }, [loadPending]);

  const removeFromPending = (purchaseItemId) =>
    setPending((p) => p.filter((x) => x.purchaseItemId !== purchaseItemId));

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Ledger</span>
          <h1>Transactions</h1>
          <p className="desc">Every credit and debit posted to your wallet, most recent first.</p>
        </div>
      </div>

      {!pendingLoading && pending.length > 0 && (
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 4 }}>Rate your recent purchases</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
            Your feedback helps the canteen improve the menu.
          </p>
          {pending.map((p) => (
            <PendingFeedbackCard key={p.purchaseItemId} {...p} onSubmitted={removeFromPending} />
          ))}
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows rows={6} cols={5} />}
              {!loading && data.content.map((t) => (
                <tr key={t.id}>
                  <td className="mono" style={{ fontSize: 12.5 }}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                  </td>
                  <td><Badge tone={TYPE_TONE[t.transactionType] || "neutral"}>{t.transactionType}</Badge></td>
                  <td style={{ maxWidth: 320 }}>{t.description}</td>
                  <td>
                    <span style={{ color: t.transactionType === "DEBIT" ? "var(--debit)" : "var(--credit)", fontWeight: 600 }}>
                      {t.transactionType === "DEBIT" ? "−" : "+"}
                      <WalletPill amount={t.amount} />
                    </span>
                  </td>
                  <td><WalletPill amount={t.newBalance} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && data.content.length === 0 && (
            <EmptyState glyph="☰" title="No transactions yet" description="Purchases and wallet top-ups will appear here." />
          )}
        </div>
        <Pagination page={page} totalPages={data.totalPages} totalElements={data.totalElements} pageSize={size} onChange={setPage} />
      </div>
    </>
  );
}
