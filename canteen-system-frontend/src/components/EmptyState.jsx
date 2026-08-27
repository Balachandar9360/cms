export default function EmptyState({ glyph = "—", title, description }) {
  return (
    <div className="empty-state">
      <div className="glyph">{glyph}</div>
      <h4>{title}</h4>
      {description && <p>{description}</p>}
    </div>
  );
}
