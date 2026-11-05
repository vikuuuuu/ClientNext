"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/hooks";
import Badge from "@/components/Badge";
import s from "@/components/ui.module.css";
const link = (u, t) => /^https:\/\//.test(u || "") ? <a href={u} target="_blank" rel="noopener noreferrer">{t}</a> : "—";
export default function Team() {
  const u = useUser(), [rows, setRows] = useState([]);
  useEffect(() => { if (u) return onSnapshot(collection(db, "profiles"), (x) => setRows(x.docs.map((d) => ({ id: d.id, ...d.data() })))); }, [u]);
  const set = (id, approved) => updateDoc(doc(db, "profiles", id), { approved });
  return <div><div className={s.bar}><h1>Team profiles</h1></div>
    <p style={{ color: "var(--mut)" }}>Freelancers <b>/freelancer</b> par register karke profile bharte hain. Approve karne par wo public site, client portal aur Templates ke developer list me aate hain.</p>
    <div className={s.tbl}><table><thead><tr><th>Name</th><th>Email</th><th>Portfolio</th><th>Resume</th><th>Status</th><th></th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.id}><td><b>{r.name}</b><br /><small>{r.title}</small></td><td>{r.email}</td><td>{link(r.portfolioUrl, "Open")}</td><td>{link(r.resume, "Resume")}</td><td><Badge v={r.approved === "Yes" ? "Approved" : "New"} /></td>
        <td style={{ whiteSpace: "nowrap" }}>{r.approved === "Yes" ? <button onClick={() => set(r.id, "No")}>Hide</button> : <button className={s.btn} onClick={() => set(r.id, "Yes")}>Approve</button>} <button onClick={() => confirm("Delete profile?") && deleteDoc(doc(db, "profiles", r.id))}>✕</button></td></tr>)}</tbody></table></div></div>;
}
