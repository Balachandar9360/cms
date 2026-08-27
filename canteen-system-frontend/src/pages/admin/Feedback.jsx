import { useCallback, useEffect, useState } from "react";
import { getAllFeedback } from "../../api/adminApi";
import StarRating from "../../components/StarRating";
import { SkeletonRows } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

export default function Feedback() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const size = 15;

  const load = useCallback(() => {
    setLoading(true);
    getAllFeedback(page, size)
      .then((res) => setData(res.data.data))
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load feedback")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Insights</span>
          <h1>Student Feedback</h1>
          <p className="desc">Ratings and comments left on purchased items, most recent first.</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th>Item</th>
                <th>Student</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows rows={8} cols={5} />}
              {!loading && data.content.map((f) => (
                <tr key={f.id}>
                  <td className="td-strong">{f.itemName}</td>
                  <td>{f.studentName}</td>
                  <td><StarRating value={f.rating} size={15} /></td>
                  <td style={{ maxWidth: 320, color: f.comment ? "inherit" : "var(--text-muted)" }}>
                    {f.comment || "—"}
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {f.createdAt ? new Date(f.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && data.content.length === 0 && (
            <EmptyState glyph="★" title="No feedback yet" description="Reviews will appear here once students rate their purchases." />
          )}
        </div>
        <Pagination page={page} totalPages={data.totalPages} totalElements={data.totalElements} pageSize={size} onChange={setPage} />
      </div>
    </>
  );
}
