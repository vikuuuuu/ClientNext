"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/hooks";
import { inr } from "@/lib/util";
import s from "@/components/site.module.css";
const https = (u) => /^https:\/\//.test(u || "");
export default function ServicePage() {
  const { id } = useParams(), r = useRouter(), u = useUser(), [sv, setSv] = useState(undefined), [dev, setDev] = useState(null), [open, setOpen] = useState(false), [f, setF] = useState({ items: [""], budget: "", timeline: "", message: "" }), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { (async () => { try { const x = await getDoc(doc(db, "services", id)); if (!x.exists()) return setSv(null);
    const d = { id: x.id, ...x.data() }; setSv(d); const p = await getDoc(doc(db, "profiles", d.freelancerId)); if (p.exists()) setDev(p.data()); } catch { setSv(null); } })(); }, [id]);
  const item = (i, v) => setF({ ...f, items: f.items.map((x, j) => (j === i ? v : x)) });
  const book = async (e) => { e.preventDefault(); setErr(""); const items = f.items.map((x) => x.trim()).filter(Boolean);
    if (!items.length) return setErr("Please list at least one item or deliverable."); setBusy(true);
    try { await addDoc(collection(db, "bookings"), { freelancerId: sv.freelancerId, clientUid: u.uid, clientEmail: u.email.toLowerCase(), clientName: (u.displayName || u.email.split("@")[0]).slice(0, 100), serviceId: sv.id, serviceTitle: sv.title, price: sv.price, items, budget: +f.budget, timeline: +f.timeline, message: f.message, status: "pending", createdAt: serverTimestamp() }); r.push("/portal/bookings"); }
    catch (x) { setErr(`Your request could not be sent (${x.code || "error"}). Only client accounts can book services, and you cannot book your own service.`); } setBusy(false); };
  if (sv === undefined) return null;
  if (!sv) return <div className={`${s.w} ${s.sec}`}><h2>Service not found</h2><Link href="/" className={s.link}>← Back to home</Link></div>;
  const btn = { margin: 0, width: "100%", border: 0, cursor: "pointer" };
  return <div><header className={s.nav}><div className={s.w}><b><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>← Home</Link></b><div><Link href="/portal/browse">Browse</Link><Link href="/portal">My account</Link></div></div></header>
    <div className={`${s.w} ${s.sec} ${s.svwrap}`}><div>{https(sv.image) ? <img className={s.cover} src={sv.image} alt={sv.title} referrerPolicy="no-referrer" /> : <div className={`${s.ph} ${s.cover}`} />}
      <span className={s.chip}>{sv.category || "Service"}</span><h1 style={{ margin: "10px 0" }}>{sv.title}</h1><p style={{ whiteSpace: "pre-line", lineHeight: 1.8, color: "#3b556f" }}>{sv.desc}</p>
      {dev && <div className={s.devcard}><div className={s.av}>{https(dev.image) ? <img src={dev.image} alt="" referrerPolicy="no-referrer" /> : dev.name[0]}</div><div><b>{dev.name}</b><br /><small>{dev.title}</small><p style={{ margin: "6px 0" }}>{dev.bio}</p>{https(dev.portfolioUrl) && <a className={s.link} href={dev.portfolioUrl} target="_blank" rel="noopener noreferrer">View portfolio ↗</a>}</div></div>}</div>
      <aside className={s.aside}><div className={s.price} style={{ fontSize: 28 }}>From {inr(sv.price)}</div><p style={{ color: "#5b7089" }}>{sv.delivery ? `⏱ Typically ${sv.delivery}-day delivery` : "Delivery time agreed after booking"}</p>
        {!u ? <Link className={s.cta} href="/portal" onClick={() => sessionStorage.setItem("next", "/service/" + id)} style={{ margin: 0, display: "block", textAlign: "center" }}>Log in to book</Link>
          : !u.emailVerified ? <p>Please verify your email first (<Link href="/portal" className={s.link}>open portal</Link>).</p>
          : open ? <form onSubmit={book}><label>Items / deliverables *</label>{f.items.map((x, i) => <input key={i} style={{ marginBottom: 6 }} value={x} onChange={(e) => item(i, e.target.value)} maxLength={120} placeholder={`Item ${i + 1}, e.g. 5-page website`} />)}
            {f.items.length < 10 && <button type="button" onClick={() => setF({ ...f, items: [...f.items, ""] })}>+ Add item</button>}
            <label>Your budget (₹) *<input type="number" min="0" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} required /></label>
            <label>Timeline (days) *<input type="number" min="1" max="730" value={f.timeline} onChange={(e) => setF({ ...f, timeline: e.target.value })} required /></label>
            <label>Project details *<textarea rows={4} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={1500} required /></label>
            {err && <p style={{ color: "#dc2626", fontSize: 13 }}>{err}</p>}<button className={s.cta} style={btn} disabled={busy}>{busy ? "Sending..." : "Send inquiry"}</button></form>
          : <button className={s.cta} style={btn} onClick={() => setOpen(true)}>Book now</button>}
        <small style={{ color: "#5b7089", display: "block", marginTop: 10 }}>Free to send. The freelancer replies with a proposal; you pay only after you accept it.</small></aside></div></div>;
}
