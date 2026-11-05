"use client";
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useUser, useSettings, logEvent } from "@/lib/hooks";
import s from "@/components/ui.module.css";
export default function Settings() {
  const u = useUser(), st = useSettings(u?.uid), [f, setF] = useState({}), [name, setName] = useState(""), [pw, setPw] = useState({ cur: "", n: "" });
  useEffect(() => { if (st) setF(st); }, [st]);
  useEffect(() => { if (u) setName(u.displayName || ""); }, [u]);
  const set = (k, num) => (e) => setF({ ...f, [k]: num ? +e.target.value : e.target.value });
  const save = async (e) => { e.preventDefault();
    await setDoc(doc(db, "settings", u.uid), { ...f, uid: u.uid });
    await setDoc(doc(db, "site", u.uid), { uid: u.uid, business: f.business || "", tagline: f.tagline || "", phone: f.phone || "", whatsapp: f.whatsapp || "", about: (f.about || "").slice(0, 1500), upi: f.upi || "", commission: Math.min(100, Math.max(0, +f.commission || 0)) }); // public card
    await updateProfile(auth.currentUser, { displayName: name }); logEvent(u.uid, "settings.update"); alert("Saved ✔"); };
  const chPw = async (e) => { e.preventDefault(); if (pw.n.length < 8) return alert("Min 8 characters");
    try { await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(u.email, pw.cur)); await updatePassword(auth.currentUser, pw.n);
      logEvent(u.uid, "auth.password_changed"); setPw({ cur: "", n: "" }); alert("Password changed ✔"); } catch { alert("Current password galat hai"); } };
  return <div><div className={s.bar}><h1>Profile & Settings</h1></div>
    <form className={s.card} onSubmit={save}><h3 style={{ marginTop: 0 }}>Profile & business</h3><div className={s.form}>
      <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>Email<input value={u?.email || ""} disabled /></label>
      <label>Business name<input value={f.business || ""} onChange={set("business")} /></label>
      <label>Tagline (public site)<input value={f.tagline || ""} onChange={set("tagline")} /></label>
      <label className={s.wide}>About us (public site)<textarea rows={4} value={f.about || ""} onChange={set("about")} /></label>
      <label>Phone<input value={f.phone || ""} onChange={set("phone")} /></label>
      <label>WhatsApp number (91...)<input value={f.whatsapp || ""} onChange={set("whatsapp")} /></label>
      <label>Platform commission % (default, deducted from freelancer payout)<input type="number" min="0" max="100" value={f.commission || 0} onChange={set("commission", 1)} /></label>
      <label>UPI ID (clients pay here)<input value={f.upi || ""} onChange={set("upi")} /></label>
      <label>GSTIN<input value={f.gstin || ""} onChange={set("gstin")} /></label>
      <label>Default GST %<input type="number" value={f.tax || 0} onChange={set("tax", 1)} /></label>
      <label className={s.wide}>Address<input value={f.address || ""} onChange={set("address")} /></label>
      <label>Auto-logout (idle)<select value={f.idle || 15} onChange={set("idle", 1)}>{[5, 15, 30, 60].map((m) => <option key={m} value={m}>{m} min</option>)}</select></label></div>
      <button className={s.btn}>Save</button></form>
    <form className={s.card} onSubmit={chPw}><h3 style={{ marginTop: 0 }}>Security</h3><div className={s.form}>
      <label>Current password<input type="password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} required /></label>
      <label>New password<input type="password" value={pw.n} onChange={(e) => setPw({ ...pw, n: e.target.value })} required /></label></div>
      <button className={s.btn}>Change password</button> <button type="button" onClick={() => sendPasswordResetEmail(auth, u.email).then(() => alert("Reset email bhej diya"))}>Email reset link</button></form></div>;
}
