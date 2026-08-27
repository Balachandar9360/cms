export default function Pagination({ page, totalPages, onChange, totalElements, pageSize }) {
  if (totalPages <= 1) return null;
  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="pagination">
      <span className="info">
        {start}–{end} of {totalElements}
      </span>
      <div className="controls">
        <button className="btn btn-ghost btn-sm" disabled={page <= 0} onClick={() => onChange(page - 1)}>
          ← Prev
        </button>
        <button className="btn btn-ghost btn-sm" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}
