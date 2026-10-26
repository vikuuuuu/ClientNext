"use client";
import Crud from "@/components/Crud";
import Badge from "@/components/Badge";
import { useUser, useCol } from "@/lib/hooks";
import { inr, today } from "@/lib/util";
import s from "@/components/ui.module.css";
export default function Finance() {
  const u = useUser(), tx = useCol("transactions", u?.uid).rows, m = {};
  tx.forEach((t) => { const k = (t.date || "").slice(0, 7); m[k] ||= { i: 0, e: 0 }; m[k][t.type === "Income" ? "i" : "e"] += +t.amount || 0; });
  const csv = (rows) => <button onClick={() => { const b = new Blob(["Date,Type,Amount,Category,Method,Note\n" + rows.map((r) => [r.date, r.type, r.amount, r.category, r.method, `"${r.note || ""}"`].join(",")).join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "finance.csv"; a.click(); }}>⬇ CSV</button>;
  return <div>
    <Crud title="Finance" col="transactions" defaults={{ type: "Expense", date: today() }} extra={csv} lock={(r) => !!r.invoiceId}
      fields={[{ k: "type", label: "Type", type: "select", options: ["Income", "Expense"] }, { k: "amount", label: "Amount", type: "number", req: 1 },
        { k: "date", label: "Date", type: "date" }, { k: "category", label: "Category", type: "select", options: ["Hosting", "Domain", "Software", "Freelancer", "Other income", "Other"] },
        { k: "method", label: "Method", type: "select", options: ["Cash", "Bank", "UPI"] }, { k: "note", label: "Note" }]}
      cols={[{ k: "date", label: "Date" }, { k: "type", label: "Type", fmt: (v) => <Badge v={v} /> }, { k: "amount", label: "Amount", fmt: inr }, { k: "category", label: "Category" }, { k: "method", label: "Method" }, { k: "note", label: "Note" }]}
      more={[{ label: "Source", fn: (r) => (r.invoiceId ? <Badge v="Invoice" /> : "Manual") }]} />
    <h2>Monthly report</h2><div className={s.tbl}><table><thead><tr><th>Month</th><th>Income</th><th>Expense</th><th>Net</th></tr></thead><tbody>
      {Object.keys(m).sort().reverse().map((k) => <tr key={k}><td>{k}</td><td>{inr(m[k].i)}</td><td>{inr(m[k].e)}</td><td><b>{inr(m[k].i - m[k].e)}</b></td></tr>)}</tbody></table></div>
  </div>;
}
