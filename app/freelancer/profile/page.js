"use client";
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser, useProfile, useSite } from "@/lib/hooks";
import Badge from "@/components/Badge";
import s from "@/components/ui.module.css";
const ok = (v) => !v || /^https:\/\//.test(v);
export default function Profile() {
  const u = useUser(), p = useProfile(u?.uid), site = useSite(), [f, setF] = useState(null);
  if (p === undefined || !site) return null;
  const v = f || p || { name: "", title: "", bio: "", skills: "", portfolioUrl: "", image: "", resume: "", items: [] };
  const set = (k) => (e) => setF({ ...v, [k]: e.target.value }), item = (i, k, x) => setF({ ...v, items: v.items.map((y, j) => (j === i ? { ...y, [k]: x } : y)) });
  const save = async (e) => { e.preventDefault();
    if (![v.portfolioUrl, v.image, v.resume, ...v.items.flatMap((i) => [i.url, i.img])].every(ok)) return alert("All links must start with https:// (Google Drive links work)");
    await setDoc(doc(db, "profiles", u.uid), { owner: site.uid || "", email: u.email.toLowerCase(), name: v.name, title: v.title || "", bio: v.bio || "", skills: v.skills || "", portfolioUrl: v.portfolioUrl || "", image: v.image || "", resume: v.resume || "", items: v.items.slice(0, 6), approved: p?.approved || "No", createdAt: p?.createdAt || Date.now() });
    setF(null); alert("Profile saved"); };
  return <div><div className={s.bar}><h1>Profile & portfolio</h1><Badge v={p?.approved === "Yes" ? "approved" : "pending"} /></div>
    <form className={s.card} onSubmit={save}><div className={s.form}>
      <label>Full name *<input value={v.name} onChange={set("name")} maxLength={100} required /></label><label>Professional title<input value={v.title || ""} onChange={set("title")} placeholder="Full-stack developer" /></label>
      <label>Skills (comma separated)<input value={v.skills || ""} onChange={set("skills")} maxLength={200} /></label><label>Portfolio website<input value={v.portfolioUrl || ""} onChange={set("portfolioUrl")} placeholder="https://" /></label>
      <label>Photo URL<input value={v.image || ""} onChange={set("image")} placeholder="https://" /></label><label>Resume URL (Google Drive)<input value={v.resume || ""} onChange={set("resume")} placeholder="https://" /></label>
      <label className={s.wide}>Bio<textarea rows={4} value={v.bio || ""} onChange={set("bio")} maxLength={1500} /></label></div>
      <h3>Portfolio items (max 6)</h3>{v.items.map((i, k) => <div className={s.row} key={k}><input placeholder="Title" value={i.title || ""} onChange={(e) => item(k, "title", e.target.value)} /><input placeholder="Project link" value={i.url || ""} onChange={(e) => item(k, "url", e.target.value)} /><input placeholder="Image URL" value={i.img || ""} onChange={(e) => item(k, "img", e.target.value)} /><button type="button" onClick={() => setF({ ...v, items: v.items.filter((_, j) => j !== k) })}>✕</button></div>)}
      {v.items.length < 6 && <button type="button" onClick={() => setF({ ...v, items: [...v.items, { title: "", url: "", img: "" }] })}>+ Add item</button>} <button className={s.btn}>Save profile</button></form></div>;
}
