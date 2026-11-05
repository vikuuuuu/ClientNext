import Badge from "./Badge";
import { inr } from "@/lib/util";
import s from "./ui.module.css";
// fee=true (freelancer view) also shows commission and net payout
export default function PayTable({ rows, fee }) {
  const sum = (st, k = "amount") => rows.filter((r) => r.status === st).reduce((a, r) => a + (+r[k] || 0), 0);
  const cards = fee ? [["Pending verification", sum("pending"), "#d97706"], ["In escrow", sum("verified"), "#2563eb"], ["Paid out (net)", sum("completed", "payout"), "#16a34a"]] : [["Pending verification", sum("pending"), "#d97706"], ["Verified (held)", sum("verified"), "#2563eb"], ["Completed", sum("completed"), "#16a34a"]];
  return <div><div className={s.grid}>{cards.map(([l, v, c]) => <div key={l} className={`${s.card} ${s.stat}`} style={{ "--a": c }}>{l}<b>{inr(v)}</b></div>)}</div>
    <div className={s.tbl}><table><thead><tr><th>Transaction ID</th><th>Date</th><th>Amount</th>{fee && <><th>Commission</th><th>Net payout</th></>}<th>Method</th><th>Status</th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.id}><td><b>{r.txnId}</b></td><td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "…"}</td><td>{inr(r.amount)}</td>{fee && <><td>{r.status === "completed" ? `${inr(r.fee)} (${r.commissionPct}%)` : "—"}</td><td>{r.status === "completed" ? inr(r.payout) : "—"}</td></>}<td>{r.method}</td><td><Badge v={r.status} /></td></tr>)}
      {!rows.length && <tr><td colSpan={7} style={{ color: "var(--mut)" }}>No transactions yet.</td></tr>}</tbody></table></div></div>;
}
