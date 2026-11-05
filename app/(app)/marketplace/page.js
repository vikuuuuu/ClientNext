"use client";
import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQ, useAutoAccept } from "@/lib/hooks";
import { inr, dt } from "@/lib/util";
import Badge from "@/components/Badge";
import s from "@/components/ui.module.css";
export default function Marketplace() {
  const [tab, setTab] = useState("services"), sv = useQ("services"), bk = useQ("bookings"), pf = useQ("profiles");
  useAutoAccept(bk);
  const dev = (id) => pf.find((p) => p.id === id)?.name || "—";
  const fee = (x) => { const v = prompt("Commission % for this service (leave empty to use the platform default)", x.commission ?? ""); if (v === null) return; updateDoc(doc(db, "services", x.id), { commission: v.trim() === "" ? null : Math.min(100, Math.max(0, +v || 0)) }); };
  return <div><div className={s.bar}><h1>Services & orders</h1><div className={s.row}>{["services", "bookings"].map((t) => <button key={t} className={tab === t ? s.btn : ""} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div></div>
    {tab === "services" ? <div className={s.tbl}><table><thead><tr><th>Service</th><th>Freelancer</th><th>Price</th><th>Commission</th><th>Listing</th><th></th></tr></thead><tbody>
      {sv.map((x) => <tr key={x.id}><td><b>{x.title}</b><br /><small>{x.category}</small></td><td>{x.freelancerName}</td><td>{inr(x.price)}</td><td>{x.commission != null ? `${x.commission}%` : "Default"} <button onClick={() => fee(x)}>Set</button></td><td><Badge v={x.approved === "Yes" ? "approved" : "pending"} /></td>
        <td style={{ whiteSpace: "nowrap" }}><button className={s.btn} onClick={() => updateDoc(doc(db, "services", x.id), { approved: x.approved === "Yes" ? "No" : "Yes" })}>{x.approved === "Yes" ? "Pause" : "Approve"}</button> <button onClick={() => confirm("Delete?") && deleteDoc(doc(db, "services", x.id))}>✕</button></td></tr>)}</tbody></table></div>
    : <div className={s.tbl}><table><thead><tr><th>Date</th><th>Service</th><th>Client</th><th>Freelancer</th><th>Budget</th><th>Proposal</th><th>Status</th></tr></thead><tbody>
      {bk.map((b) => <tr key={b.id}><td>{dt(b.createdAt)}</td><td>{b.serviceTitle}</td><td>{b.clientEmail}</td><td>{dev(b.freelancerId)}</td><td>{inr(b.budget ?? b.price)}</td><td>{b.proposal ? inr(b.proposal.total) : "—"}</td><td><Badge v={b.status} /></td></tr>)}</tbody></table></div>}</div>;
}
