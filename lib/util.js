export const BRAND = "ClientNext"; // apna business naam yahan badlo
export const inr = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");
export const today = () => new Date().toISOString().slice(0, 10);
export const total = (d) => (d.items || []).reduce((a, i) => a + (+i.q || 0) * (+i.r || 0), 0);
export const status = (d) => {
  const t = total(d), p = +d.paid || 0;
  if (t > 0 && p >= t) return "Paid";
  if (d.due && d.due < today()) return "Overdue";
  return p > 0 ? "Partial" : "Unpaid";
};
export const nextNo = (rows, p) => p + String(Math.max(0, ...rows.map((r) => parseInt(r.no?.split("-")[1]) || 0)) + 1).padStart(4, "0");
