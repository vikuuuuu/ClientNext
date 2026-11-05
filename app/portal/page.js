"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot, getDocs, limit } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { calc, total, status, inr } from "@/lib/util";
import { useUser } from "@/lib/hooks";
import Team from "@/components/Team";
import Badge, { COLORS } from "@/components/Badge";
import s from "@/components/ui.module.css";
const PROG = { New: 10, "In Progress": 50, Review: 80, Completed: 100 };
function useMine(name, email) {
  const [r, setR] = useState([]), [err, setErr] = useState("");
  useEffect(() => onSnapshot(query(collection(db, name), where("clientEmail", "==", email)),
    (x) => setR(x.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))), (e) => setErr(e.code)), [name, email]);
  return [r, err];
}
export default function Portal() { const u = useUser(); return u ? <Dash u={u} /> : null; }
function Dash({ u }) {
  const em = u.email.toLowerCase(), [pr, e1] = useMine("projects", em), [inv, e2] = useMine("invoices", em), [qt, e3] = useMine("quotations", em);
  const [view, setView] = useState(null), [site, setSite] = useState(null), [team, setTeam] = useState([]);
  useEffect(() => { getDocs(query(collection(db, "site"), limit(1))).then((x) => setSite(x.docs[0]?.data())).catch(() => {});
    getDocs(query(collection(db, "profiles"), where("approved", "==", "Yes"))).then((x) => setTeam(x.docs.map((d) => ({ id: d.id, ...d.data() })))).catch(() => {}); }, []);
  const B = site?.business || "Client Portal", billed = inv.reduce((a, i) => a + total(i), 0), paid = inv.reduce((a, i) => a + (+i.paid || 0), 0);
  if (view) { const d = view.d, k = calc(d), st = view.t === "Invoice" ? status(d) : "";
    return <div style={{ padding: 16 }}><div className="noprint" style={{ marginBottom: 12, display: "flex", gap: 8 }}><button className={s.btn} onClick={() => print()}>⬇ Print / Save PDF</button><button onClick={() => setView(null)}>← Back</button></div>
      <div className={s.sheet}><div className={s.hd}><h1>{B}</h1><div><h2>{view.t.toUpperCase()}</h2><div style={{ textAlign: "right" }}>{d.no}</div></div></div>
        <div className={s.bd}><div className={s.meta}><div><small>BILLED TO</small><br /><b>{u.email}</b></div><div><small>DETAILS</small><br />Date: {d.date}{d.due && <><br />Due: {d.due}</>}{st && <><br /><span className={s.stamp} style={{ color: COLORS[st] }}>{st.toUpperCase()}</span></>}</div></div>
          <div style={{ overflowX: "auto" }}><table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{(d.items || []).map((i, n) => <tr key={n}><td>{i.d}</td><td>{i.q}</td><td>{inr(i.r)}</td><td>{inr(i.q * i.r)}</td></tr>)}</tbody></table></div>
          <div className={s.tot}><div><span>Subtotal</span><b>{inr(k.sub)}</b></div>{k.disc > 0 && <div><span>Discount</span><b>-{inr(k.disc)}</b></div>}{k.tax > 0 && <div><span>GST ({d.tax}%)</span><b>{inr(k.tax)}</b></div>}
            {view.t === "Invoice" ? <><div><span>Paid</span><b>{inr(d.paid)}</b></div><div className={s.grand}><span>Balance due</span><span>{inr(k.total - (+d.paid || 0))}</span></div></> : <div className={s.grand}><span>Total</span><span>{inr(k.total)}</span></div>}</div>
          {d.terms && <div className={s.note}><b>Payment terms</b><br />{d.terms}</div>}</div><div className={s.ft}>{B}</div></div></div>; }
  return <div>
    <div style={{ maxWidth: 1000, margin: "auto", padding: "28px 16px" }}>
      <div className={s.bar}><h1 style={{ margin: 0 }}>Welcome 👋</h1><Link href="/portal/browse" className={s.btn} style={{ padding: "9px 16px", borderRadius: 10, textDecoration: "none" }}>Find services</Link></div>{(e1 || e2 || e3) && <p style={{ color: "#dc2626" }}>Could not load your data ({e1 || e2 || e3}).</p>}
      {!pr.length && !inv.length && !qt.length && <div className={s.card}>No projects or invoices are linked to your account yet. If you expected to see some, please contact us so we can enable portal access for this email address.</div>}
      <div className={s.grid}>{[["Active projects", pr.filter((x) => x.status !== "Completed").length, "#0ea5e9"], ["Total billed", inr(billed), "#2563eb"], ["Paid", inr(paid), "#16a34a"], ["Balance due", inr(billed - paid), "#d97706"]].map(([l, v, c]) => <div key={l} className={`${s.card} ${s.stat}`} style={{ "--a": c }}>{l}<b>{v}</b></div>)}</div>
      <h2>Projects</h2><div className={s.grid} style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>{pr.map((x) => <div key={x.id} className={s.card}>
        <div className={s.row} style={{ justifyContent: "space-between" }}><b>{x.title}</b><Badge v={x.status} /></div>
        <div style={{ background: "var(--bd)", borderRadius: 99, height: 8, margin: "10px 0" }}><div style={{ width: (PROG[x.status] || 0) + "%", height: 8, borderRadius: 99, background: "linear-gradient(90deg,#2563eb,#38bdf8)" }} /></div>
        <small style={{ color: "var(--mut)" }}>{PROG[x.status] || 0}% complete{x.deadline && ` · Deadline ${x.deadline}`}</small>
        {x.status === "Completed" && /^https:\/\//.test(x.deliveryLink || "") && <p><a href={x.deliveryLink} target="_blank" rel="noopener noreferrer">📦 Delivery files</a></p>}</div>)}</div>
      <h2>Invoices</h2><div className={s.tbl}><table><thead><tr><th>No</th><th>Date</th><th>Total</th><th>Paid</th><th>Status</th><th></th></tr></thead><tbody>{inv.map((i) => <tr key={i.id}><td>{i.no}</td><td>{i.date}</td><td>{inr(total(i))}</td><td>{inr(i.paid)}</td><td><Badge v={status(i)} /></td><td><button onClick={() => setView({ t: "Invoice", d: i })}>View</button></td></tr>)}</tbody></table></div>
      <h2>Quotations</h2><div className={s.tbl}><table><thead><tr><th>No</th><th>Date</th><th>Valid till</th><th>Total</th><th></th></tr></thead><tbody>{qt.map((i) => <tr key={i.id}><td>{i.no}</td><td>{i.date}</td><td>{i.validTill || "—"}</td><td>{inr(total(i))}</td><td><button onClick={() => setView({ t: "Quotation", d: i })}>View</button></td></tr>)}</tbody></table></div>
      {team.length > 0 && <><h2>Our developers</h2><Team list={team} /></>}</div></div>;
}
