"use client";
import { useState } from "react";
import Link from "next/link";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser, useQ, useSite, useAutoAccept } from "@/lib/hooks";
import { inr, dt } from "@/lib/util";
import { txnId } from "@/lib/id";
import Badge from "@/components/Badge";
import Chat from "@/components/Chat";
import Count from "@/components/Count";
import s from "@/components/ui.module.css";
const TABS = { All: () => true, Inquiries: (b) => ["pending", "accepted", "rejected", "cancelled"].includes(b.status), Proposals: (b) => b.status === "proposed", Active: (b) => ["agreed", "in_progress", "delivered", "approved"].includes(b.status), Completed: (b) => b.status === "completed" };
const HINT = { accepted: "Waiting for the freelancer's proposal", proposed: "Review the proposal", agreed: "Proposal accepted — payment required", in_progress: "Payment verified — work in progress", delivered: "Delivered — please review", approved: "Approved — awaiting payout release" };
export default function MyBookings() {
  const u = useUser(), bk = useQ("bookings", "clientUid", u?.uid), py = useQ("payments", "clientUid", u?.uid), site = useSite(), [tab, setTab] = useState("All"), [pm, setPm] = useState(null), [pv, setPv] = useState(null), [chat, setChat] = useState(null);
  useAutoAccept(bk);
  const paid = (b) => py.find((x) => x.bookingId === b.id && !["failed", "refunded"].includes(x.status));
  const mv = (b, status, x = {}) => updateDoc(doc(db, "bookings", b.id), { status, updatedAt: Date.now(), ...x }).then(() => setPv(null)).catch((e) => alert("Action not allowed (" + e.code + ")"));
  const pay = async (e) => { e.preventDefault(); const id = txnId(), b = pm.b;
    try { await setDoc(doc(db, "payments", id), { txnId: id, bookingId: b.id, clientUid: u.uid, freelancerId: b.freelancerId, amount: b.proposal.total, method: pm.method, reference: pm.ref.trim(), status: "pending", createdAt: Date.now() }); setPm(null); }
    catch (x) { alert("Could not record the payment (" + (x.code || "error") + ")"); } };
  return <div><div className={s.bar}><h1>My bookings</h1><Link href="/portal/browse" className={s.btn} style={{ padding: "9px 16px", borderRadius: 10, textDecoration: "none" }}>Find services</Link></div>
    <div className={s.row}>{Object.keys(TABS).map((t) => <button key={t} className={tab === t ? s.btn : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
    <div className={s.tbl}><table><thead><tr><th>Date</th><th>Service & brief</th><th>Status</th><th>Payment</th><th></th></tr></thead><tbody>
      {bk.filter(TABS[tab]).map((b) => { const p = paid(b); return <tr key={b.id}><td>{dt(b.createdAt)}</td>
        <td><b>{b.serviceTitle}</b><br /><small>{(b.items || []).join(", ")} · Budget {inr(b.budget)} · {b.timeline} days</small>{b.deliveryLink && <><br /><a href={b.deliveryLink} target="_blank" rel="noopener noreferrer">📦 Delivery files</a></>}</td>
        <td><Badge v={b.status} /><br /><small style={{ color: "var(--mut)" }}>{b.status === "accepted" && b.proposalReply === "rejected" ? "You declined the last proposal" : HINT[b.status]}</small>{b.status === "pending" && <><br /><Count b={b} /></>}</td>
        <td>{p ? <><Badge v={p.status} /><br /><small>{p.txnId}</small></> : b.proposal ? <small>{inr(b.proposal.total)} due</small> : "—"}</td>
        <td style={{ whiteSpace: "nowrap" }}>{b.status === "pending" && <button onClick={() => mv(b, "cancelled")}>Cancel</button>}
          {b.status === "proposed" && <button className={s.btn} onClick={() => setPv(b)}>View proposal</button>}
          {b.status === "agreed" && !p && <button className={s.btn} onClick={() => setPm({ b, method: "UPI", ref: "" })}>Pay {inr(b.proposal.total)}</button>}
          {b.status === "delivered" && <button className={s.btn} onClick={() => confirm("Approve the delivery? Payout is released after admin review.") && mv(b, "approved")}>Approve delivery</button>}
          {["accepted", "proposed", "agreed", "in_progress", "delivered", "approved", "completed"].includes(b.status) && <> <button onClick={() => setChat(b)}>💬 Chat</button></>}</td></tr>; })}
      {!bk.length && <tr><td colSpan={5} style={{ color: "var(--mut)" }}>No bookings yet. Find a service and send your first request.</td></tr>}</tbody></table></div>
    {pv && <div className={s.ov}><div className={s.card} style={{ width: "min(560px,94vw)" }}><h3>Proposal — {pv.serviceTitle}</h3>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{pv.proposal.items.map((i, k) => <tr key={k}><td>{i.d}</td><td>{i.q}</td><td>{inr(i.r)}</td><td>{inr(i.q * i.r)}</td></tr>)}</tbody></table>
      <p style={{ textAlign: "right" }}>Subtotal {inr(pv.proposal.subtotal)}<br />Tax ({pv.proposal.tax}%) {inr(pv.proposal.taxAmt)}<br /><b style={{ fontSize: 18 }}>Total {inr(pv.proposal.total)}</b></p>{pv.proposal.note && <p style={{ color: "var(--mut)" }}>{pv.proposal.note}</p>}
      <button className={s.btn} onClick={() => mv(pv, "agreed")}>Accept proposal</button> <button onClick={() => confirm("Reject this proposal?") && mv(pv, "accepted", { proposalReply: "rejected" })}>Reject</button> <button onClick={() => setPv(null)}>Close</button></div></div>}
    {pm && <div className={s.ov}><form className={s.card} onSubmit={pay}><h3>Pay {inr(pm.b.proposal.total)} — {pm.b.serviceTitle}</h3>
      <p style={{ color: "var(--mut)", fontSize: 14 }}>Send the amount{site?.upi ? <> to UPI ID <b>{site.upi}</b></> : " as instructed by the platform"}, then enter the UTR / reference number. Work starts once the payment is verified.</p>
      <label>Method<select value={pm.method} onChange={(e) => setPm({ ...pm, method: e.target.value })}><option>UPI</option><option>Bank</option></select></label>
      <label>UTR / reference (6–40 characters)<input value={pm.ref} onChange={(e) => setPm({ ...pm, ref: e.target.value })} minLength={6} maxLength={40} required /></label>
      <button className={s.btn}>Submit payment</button> <button type="button" onClick={() => setPm(null)}>Close</button></form></div>}
    {chat && <Chat b={chat} me={u} onClose={() => setChat(null)} />}</div>;
}
