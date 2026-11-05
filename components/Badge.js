export const COLORS = { Paid: "#16a34a", Completed: "#16a34a", Income: "#16a34a", Partial: "#d97706", "In Progress": "#2563eb", Review: "#7c3aed", New: "#0891b2", Unpaid: "#64748b", Overdue: "#dc2626", Expense: "#dc2626", Invoice: "#2563eb", Approved: "#16a34a", Rejected: "#dc2626", Payment: "#0891b2", pending: "#d97706", verified: "#2563eb", completed: "#16a34a", failed: "#dc2626", refunded: "#7c3aed", approved: "#16a34a", rejected: "#dc2626", delivered: "#0891b2", cancelled: "#64748b", accepted: "#0ea5e9", proposed: "#7c3aed", agreed: "#2563eb", in_progress: "#2563eb" };
export default function Badge({ v }) {
  const c = COLORS[v] || "#64748b";
  return <span style={{ background: c + "22", color: c, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{String(v).replace("_", " ")}</span>;
}
