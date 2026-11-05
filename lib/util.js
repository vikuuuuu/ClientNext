export const BRAND = "Vikash."; // apna business naam yahan badlo
export const inr = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");
export const today = () => new Date().toISOString().slice(0, 10);
const r2 = (n) => Math.round(n * 100) / 100;
export const calc = (d) => {
  const sub = (d.items || []).reduce((a, i) => a + (+i.q || 0) * (+i.r || 0), 0);
  const disc = d.dType === "₹" ? Math.min(+d.disc || 0, sub) : (sub * Math.min(+d.disc || 0, 100)) / 100;
  const tax = ((sub - disc) * (+d.tax || 0)) / 100;
  return { sub: r2(sub), disc: r2(disc), tax: r2(tax), total: r2(sub - disc + tax) };
};
export const total = (d) => calc(d).total;
export const status = (d) => {
  const t = total(d), p = +d.paid || 0;
  if (t > 0 && p >= t) return "Paid";
  if (d.due && d.due < today()) return "Overdue";
  return p > 0 ? "Partial" : "Unpaid";
};
export const nextNo = (rows, p) => p + String(Math.max(0, ...rows.map((r) => parseInt(r.no?.split("-")[1]) || 0)) + 1).padStart(4, "0");
export const dt = (x) => (x ? new Date(x).toLocaleDateString() : "…");
