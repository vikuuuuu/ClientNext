"use client";
import { useState } from "react";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser, useCol, useQ, useSettings } from "@/lib/hooks";
import { inr, today } from "@/lib/util";
import Badge from "@/components/Badge";
import s from "@/components/ui.module.css";
export default function Payments() {
  const u = useUser(), cfg = useSettings(u?.uid), rows = useQ("payments"), bks = useQ("bookings"), fin = useCol("transactions", u?.uid), [q, setQ] = useState(""), [st, setSt] = useState("");
  const bkOf = (p) => bks.find((b) => b.id === p.bookingId);
  const move = async (p, status) => { const b = bkOf(p); if (!confirm(`Mark ${p.txnId} as ${status}?`)) return;
    const wb = writeBatch(db), pr = doc(db, "payments", p.id), br = b && doc(db, "bookings", b.id), now = Date.now();
    if (status === "verified") { wb.update(pr, { status, updatedAt: now }); if (br && b.status === "agreed") wb.update(br, { status: "in_progress", updatedAt: now }); }   // work starts after verified payment
    else if (status === "completed") { // payout: commission = service override, else platform default
      const sv = b ? await getDoc(doc(db, "services", b.serviceId)).catch(() => null) : null, pct = +(sv?.data()?.commission ?? cfg?.commission ?? 0) || 0, fee = Math.round(p.amount * pct) / 100, payout = Math.round((p.amount - fee) * 100) / 100;
      wb.update(pr, { status, fee, payout, commissionPct: pct, updatedAt: now }); if (br) wb.update(br, { status: "completed", updatedAt: now });   // project completes only when payment is finalised
      if (fee > 0) await fin.add({ type: "Income", amount: fee, date: today(), method: p.method, category: "Commission", note: `${p.txnId} (${pct}%)`, paymentId: p.id }); }
    else { wb.update(pr, { status, updatedAt: now }); if (status === "refunded" && br) wb.update(br, { status: "cancelled", updatedAt: now }); }
    await wb.commit().catch((e) => alert("Failed: " + e.code)); };
  const list = rows.filter((r) => (!st || r.status === st) && (r.txnId + r.reference).toLowerCase().includes(q.toLowerCase()));
  const sum = (x, k = "amount") => rows.filter((r) => r.status === x).reduce((a, r) => a + (+r[k] || 0), 0);
  return <div><div className={s.bar}><h1>Transactions</h1><div className={s.row}><input style={{ width: 200 }} placeholder="Search TXN / reference" value={q} onChange={(e) => setQ(e.target.value)} />
    <select style={{ width: 140 }} value={st} onChange={(e) => setSt(e.target.value)}><option value="">All status</option>{["pending", "verified", "completed", "failed", "refunded"].map((x) => <option key={x}>{x}</option>)}</select></div></div>
    <div className={s.grid}>{[["To verify", sum("pending"), "#d97706"], ["Held in escrow", sum("verified"), "#2563eb"], ["Paid out", sum("completed", "payout"), "#16a34a"], ["Commission earned", sum("completed", "fee"), "#0ea5e9"]].map(([l, v, c]) => <div key={l} className={`${s.card} ${s.stat}`} style={{ "--a": c }}>{l}<b>{inr(v)}</b></div>)}</div>
    <div className={s.tbl}><table><thead><tr><th>Transaction ID</th><th>Amount</th><th>Commission</th><th>Payout</th><th>Method / UTR</th><th>Status</th><th>Order</th><th></th></tr></thead><tbody>
      {list.map((r) => { const b = bkOf(r); return <tr key={r.id}><td><b>{r.txnId}</b><br /><small>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</small></td><td>{inr(r.amount)}</td><td>{r.status === "completed" ? `${inr(r.fee)} (${r.commissionPct}%)` : "—"}</td><td>{r.status === "completed" ? inr(r.payout) : "—"}</td><td>{r.method} · {r.reference}</td><td><Badge v={r.status} /></td><td>{b ? <Badge v={b.status} /> : "—"}</td>
        <td style={{ whiteSpace: "nowrap" }}>{r.status === "pending" && <><button className={s.btn} onClick={() => move(r, "verified")}>Verify</button> <button onClick={() => move(r, "failed")}>Reject</button></>}
          {r.status === "verified" && <>{b?.status === "approved" ? <button className={s.btn} onClick={() => move(r, "completed")}>Release payout</button> : <small>Waiting for delivery approval</small>} <button onClick={() => move(r, "refunded")}>Refund</button></>}</td></tr>; })}</tbody></table></div></div>;
}
