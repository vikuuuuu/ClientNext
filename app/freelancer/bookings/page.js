"use client";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser, useProfile, useQ, useSite, useAutoAccept } from "@/lib/hooks";
import { inr, calc, dt } from "@/lib/util";
import Badge from "@/components/Badge";
import Gate from "@/components/Gate";
import Chat from "@/components/Chat";
import Count from "@/components/Count";
import s from "@/components/ui.module.css";
export default function Bookings() {
  const u = useUser(), p = useProfile(u?.uid), rows = useQ("bookings", "freelancerId", u?.uid), site = useSite(), [f, setF] = useState(""), [chat, setChat] = useState(null), [pf, setPf] = useState(null);
  useAutoAccept(rows);
  const set = (b, status, x = {}) => updateDoc(doc(db, "bookings", b.id), { status, updatedAt: Date.now(), ...x }).catch((e) => alert("Action not allowed (" + e.code + ")"));
  const deliver = (b) => { const l = prompt("Delivery link (https://...)"); if (!l) return; /^https:\/\//.test(l) ? set(b, "delivered", { deliveryLink: l }) : alert("The link must start with https://"); };
  const open = (b) => setPf({ b, tax: b.proposal?.tax ?? 0, note: b.proposal?.note || "", items: b.proposal?.items || [{ d: b.items?.[0] || "", q: 1, r: b.budget || 0 }] });
  const pi = (i, k, v) => setPf({ ...pf, items: pf.items.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
  const k = pf && calc({ items: pf.items, tax: pf.tax, disc: 0, dType: "%" }), pct = +site?.commission || 0;
  const send = async (e) => { e.preventDefault(); const items = pf.items.filter((i) => i.d && +i.r > 0); if (!items.length) return alert("Add at least one line item with an amount");
    const c = calc({ items, tax: pf.tax, disc: 0, dType: "%" });
    await set(pf.b, "proposed", { proposal: { items: items.map((i) => ({ d: i.d, q: +i.q || 1, r: +i.r })), tax: +pf.tax || 0, subtotal: c.sub, taxAmt: c.tax, total: c.total, note: pf.note || "", sentAt: Date.now() }, proposalReply: null }); setPf(null); };
  return <Gate p={p}><div className={s.bar}><h1>Booking requests</h1><select style={{ width: 170 }} value={f} onChange={(e) => setF(e.target.value)}><option value="">All statuses</option>{["pending", "accepted", "proposed", "agreed", "in_progress", "delivered", "approved", "completed", "rejected", "cancelled"].map((x) => <option key={x} value={x}>{x.replace("_", " ")}</option>)}</select></div>
    <div className={s.tbl}><table><thead><tr><th>Date</th><th>Client</th><th>Inquiry</th><th>Status</th><th></th></tr></thead><tbody>
      {rows.filter((b) => !f || b.status === f).map((b) => <tr key={b.id}><td>{dt(b.createdAt)}</td><td><b>{b.clientName}</b><br /><small>{b.clientEmail}</small></td>
        <td style={{ maxWidth: 300 }}><b>{b.serviceTitle}</b><br /><small>{(b.items || []).join(", ")}</small><br /><small>Budget {inr(b.budget)} · {b.timeline} days</small><div style={{ whiteSpace: "pre-line", fontSize: 13 }}>{b.message}</div>{b.proposal && <small>Proposal: <b>{inr(b.proposal.total)}</b></small>}</td>
        <td><Badge v={b.status} />{b.status === "pending" && <><br /><Count b={b} /></>}{b.status === "accepted" && b.proposalReply === "rejected" && <><br /><small>Client declined your proposal</small></>}</td>
        <td style={{ whiteSpace: "nowrap" }}>{b.status === "pending" && <><button className={s.btn} onClick={() => set(b, "accepted")}>Accept</button> <button onClick={() => set(b, "rejected")}>Reject</button></>}
          {["accepted", "proposed"].includes(b.status) && <button className={s.btn} onClick={() => open(b)}>{b.status === "proposed" ? "Revise proposal" : "Send proposal"}</button>}
          {b.status === "in_progress" && <button className={s.btn} onClick={() => deliver(b)}>Mark delivered</button>}
          {b.status === "agreed" && <small>Awaiting client payment</small>}{["delivered", "approved"].includes(b.status) && <small>Awaiting payout release</small>}
          {["accepted", "proposed", "agreed", "in_progress", "delivered", "approved", "completed"].includes(b.status) && <> <button onClick={() => setChat(b)}>💬 Chat</button></>}</td></tr>)}</tbody></table></div>
    {pf && <div className={s.ov}><form className={s.card} style={{ width: "min(620px,94vw)" }} onSubmit={send}><h3>Proposal / bill — {pf.b.serviceTitle}</h3>
      {pf.items.map((i, n) => <div className={s.row} key={n}><input placeholder="Description" value={i.d} onChange={(e) => pi(n, "d", e.target.value)} /><input type="number" style={{ width: 70 }} value={i.q} onChange={(e) => pi(n, "q", e.target.value)} /><input type="number" style={{ width: 110 }} placeholder="Rate" value={i.r} onChange={(e) => pi(n, "r", e.target.value)} /><button type="button" onClick={() => setPf({ ...pf, items: pf.items.filter((_, j) => j !== n) })}>✕</button></div>)}
      <button type="button" onClick={() => setPf({ ...pf, items: [...pf.items, { d: "", q: 1, r: 0 }] })}>+ Line item</button>
      <label style={{ marginTop: 12 }}>Tax / GST %<input type="number" min="0" max="100" value={pf.tax} onChange={(e) => setPf({ ...pf, tax: e.target.value })} /></label><label>Note to client<textarea rows={2} value={pf.note} onChange={(e) => setPf({ ...pf, note: e.target.value })} maxLength={500} /></label>
      <p>Subtotal {inr(k.sub)} · Tax {inr(k.tax)} · <b>Total {inr(k.total)}</b><br /><small style={{ color: "var(--mut)" }}>Platform commission ({pct}% default) is deducted from your payout: estimated net {inr(k.total - (k.total * pct) / 100)}.</small></p>
      <button className={s.btn}>Send proposal</button> <button type="button" onClick={() => setPf(null)}>Close</button></form></div>}
    {chat && <Chat b={chat} me={u} onClose={() => setChat(null)} />}</Gate>;
}
