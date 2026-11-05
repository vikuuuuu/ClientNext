"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, limit, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { inr } from "@/lib/util";
import Team from "@/components/Team";
import s from "@/components/site.module.css";
const blank = { name: "", phone: "", email: "", service: "", budget: "", message: "", hp: "" }, https = (u) => /^https:\/\//.test(u || "");
export default function Landing() {
  const [site, setSite] = useState(null), [svc, setSvc] = useState([]), [team, setTeam] = useState([]), [f, setF] = useState(blank), [done, setDone] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState(""), [ready, setReady] = useState(false);
  useEffect(() => { (async () => { try {
    const o = (await getDocs(query(collection(db, "site"), limit(1)))).docs[0]?.data(); if (o) { setSite(o); document.title = o.business || "Hire trusted freelancers"; }
    setSvc((await getDocs(query(collection(db, "services"), where("approved", "==", "Yes")))).docs.map((x) => ({ id: x.id, ...x.data() })));
    setTeam((await getDocs(query(collection(db, "profiles"), where("approved", "==", "Yes")))).docs.map((x) => ({ id: x.id, ...x.data() })));
  } catch (e) { setErr(`Could not load data (${e.code || e.message}).`); } setReady(true); })(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const send = async (e) => { e.preventDefault(); if (f.hp || busy) return; setErr("");
    if (!site?.uid) return setErr("This site is not fully set up yet. Please try again later.");
    if (Date.now() - (+localStorage.getItem("iq") || 0) < 60000) return setErr("Please wait a minute before sending another message.");
    setBusy(true); try { const { hp, ...d } = f; await addDoc(collection(db, "inquiries"), { ...d, uid: site.uid, status: "New", createdAt: Date.now() }); localStorage.setItem("iq", Date.now()); setDone(true); }
    catch (x) { setErr(`Your message could not be sent (${x.code || x.message}).`); } setBusy(false); };
  const wa = site?.whatsapp && `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;
  return <div>
    <header className={s.nav}><div className={s.w}><b>{site?.business || "Marketplace"}</b><div><a href="#services">Services</a><a href="#how">How it works</a><a href="#about">About</a><a href="#team">Freelancers</a><a href="#contact">Contact</a><Link href="/portal">Log in</Link></div></div></header>
    <section className={s.hero}><div className={s.w}><h1>{site?.tagline || "Hire vetted freelancers for web, design and development."}</h1>
      <p>Browse ready-to-book services, work with a dedicated expert and track every order, payment and delivery in one secure place.</p>
      <a className={s.cta} href="#services">Browse services</a><Link className={`${s.cta} ${s.cta2}`} href="/freelancer">Become a freelancer</Link>
      <div className={s.stats}><div><b>{svc.length}</b>Services</div><div><b>{team.length}</b>Verified freelancers</div><div><b>100%</b>Verified payments</div></div></div></section>
    <section id="services" className={`${s.sec} ${s.w}`}><h2>Popular services</h2><p className={s.sub}>Fixed-price services from freelancers we have reviewed and approved.</p>
      {svc.length === 0 ? <p style={{ color: "var(--mut)" }}>{ready ? "No services are listed yet — please check back soon." : "Loading..."}</p> : <div className={s.cards}>{svc.map((t) => <div key={t.id} className={s.svc}>
        {https(t.image) ? <img src={t.image} alt={t.title} loading="lazy" referrerPolicy="no-referrer" /> : <div className={s.ph} />}
        <div className={s.body}><span className={s.chip} style={{ alignSelf: "flex-start" }}>{t.category || "Service"}</span><b>{t.title}</b><p>{(t.desc || "").slice(0, 110)}</p><div className={s.dev}>by {t.freelancerName}{t.delivery ? ` · ${t.delivery}-day delivery` : ""}</div>
          <span className={s.price}>From {inr(t.price)}</span><Link href={"/service/" + t.id} className={s.link}>View details & book →</Link></div></div>)}</div>}</section>
    <section id="how" className={`${s.sec} ${s.alt}`}><div className={s.w}><h2>How it works</h2><p className={s.sub}>A simple, transparent process from request to delivery.</p>
      <div className={s.steps}>{[["Choose a service", "Compare services, prices and portfolios."], ["Send a booking request", "Share your requirements; the freelancer accepts or declines."], ["Pay securely", "Submit your payment reference. We verify it before work is released."], ["Approve the delivery", "Review the work, accept it and close the order."]].map(([t, d], i) => <div key={t}><i>{i + 1}</i><b>{t}</b><p style={{ color: "var(--mut)", fontSize: 14 }}>{d}</p></div>)}</div></div></section>
    <section id="about" className={`${s.sec} ${s.w}`}><div className={s.about}><div><h2>About us</h2><p className={s.sub}>Quality work, clear communication, fair pricing.</p>
      <p>{site?.about || "We connect businesses with skilled freelancers and manage the process end to end — from scoping and booking to secure payments and delivery — so you can focus on results."}</p></div>
      <div className={s.perks}><div><b>Vetted talent</b><br />Every freelancer profile is reviewed before it goes live.</div><div><b>Protected payments</b><br />Payments are verified and released only after delivery.</div><div><b>Full visibility</b><br />Track status, invoices and history from your dashboard.</div></div></div></section>
    {team.length > 0 && <section id="team" className={`${s.sec} ${s.alt}`}><div className={s.w}><h2>Meet our freelancers</h2><p className={s.sub}>Real portfolios from approved professionals.</p><Team list={team} /></div></section>}
    <section className={`${s.sec} ${s.w}`}><div className={s.band}><div><h3>Are you a freelancer?</h3><span>Create your profile, list your services and manage your own booking requests.</span></div><Link href="/freelancer">Join as a freelancer</Link></div></section>
    <section id="contact" className={`${s.sec} ${s.alt}`}><div className={s.w}><h2 style={{ textAlign: "center" }}>Need something custom?</h2><p className={s.sub} style={{ margin: "0 auto 26px", textAlign: "center" }}>Send us a brief and we will match you with the right freelancer.</p>
      {done ? <div className={`${s.form} ${s.ok}`}><h3>✅ Message received</h3><p>Thank you — we will get back to you shortly.</p></div>
      : <form className={s.form} onSubmit={send}><input className={s.hp} tabIndex={-1} autoComplete="off" value={f.hp} onChange={set("hp")} aria-hidden />
        <label>Name *<input value={f.name} onChange={set("name")} maxLength={100} required /></label><label>Phone / WhatsApp *<input value={f.phone} onChange={set("phone")} maxLength={20} required /></label>
        <label>Email<input type="email" value={f.email} onChange={set("email")} maxLength={120} /></label><label>Service needed<input value={f.service} onChange={set("service")} maxLength={120} placeholder="e.g. Business website" /></label>
        <label>Budget<input value={f.budget} onChange={set("budget")} maxLength={40} placeholder="₹10,000 – ₹20,000" /></label><label>Project details *<textarea rows={4} value={f.message} onChange={set("message")} maxLength={1500} required /></label>
        {err && <p style={{ color: "#dc2626", fontSize: 13 }}>{err}</p>}<button style={{ background: "linear-gradient(90deg,#2563eb,#0ea5e9)", color: "#fff", border: 0, padding: 14, fontWeight: 600, width: "100%" }} disabled={busy}>{busy ? "Sending..." : "Send message"}</button></form>}
      {wa && <p style={{ textAlign: "center" }}><a className={s.link} href={wa}>💬 Chat on WhatsApp</a></p>}</div></section>
    <footer className={s.foot}>© {new Date().getFullYear()} {site?.business} {site?.phone && `· ${site.phone}`} · <Link href="/portal">Client login</Link> · <Link href="/freelancer">Freelancers</Link> · <Link href="/login">Admin</Link></footer></div>;
}
