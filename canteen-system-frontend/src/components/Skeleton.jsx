export function Skeleton({ h = 16, w = "100%", radius }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: radius }} />;
}

export function SkeletonRows({ rows = 4, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c}><Skeleton h={14} /></td>
          ))}
        </tr>
      ))}
    </>
  );
}
