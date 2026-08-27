export default function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function StatusBadge({ status }) {
  const active = status === "ACTIVE" || status === true;
  return <Badge tone={active ? "active" : "inactive"}>{active ? "Active" : "Inactive"}</Badge>;
}
