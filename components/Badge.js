export const COLORS = { Paid: "#16a34a", Completed: "#16a34a", Income: "#16a34a", Partial: "#d97706", "In Progress": "#2563eb", Review: "#7c3aed", New: "#0891b2", Unpaid: "#64748b", Overdue: "#dc2626", Expense: "#dc2626", Invoice: "#6366f1" };
export default function Badge({ v }) {
  const c = COLORS[v] || "#64748b";
  return <span style={{ background: c + "22", color: c, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{v}</span>;
}
