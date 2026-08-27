// Renders 5 stars. Pass `value` + `onChange` for an interactive input,
// or omit `onChange` for a read-only display (used in admin tables).
export default function StarRating({ value = 0, onChange, size = 18 }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === "function";

  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {stars.map((n) => {
        const filled = n <= Math.round(value);
        return (
          <span
            key={n}
            onClick={interactive ? () => onChange(n) : undefined}
            style={{
              fontSize: size,
              lineHeight: 1,
              cursor: interactive ? "pointer" : "default",
              color: filled ? "#B9862B" : "var(--line)",
              transition: "color 0.12s var(--ease)",
            }}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}
