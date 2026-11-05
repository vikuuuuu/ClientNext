"use client";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQ } from "@/lib/hooks";
import { dt } from "@/lib/util";
import Badge from "@/components/Badge";
import s from "@/components/ui.module.css";
export default function Users() {
  const users = useQ("users"), sv = useQ("services"), [role, setRole] = useState(""), [q, setQ] = useState("");
  const toggle = async (x) => { const block = !x.blocked; if (!confirm(`${block ? "Block" : "Unblock"} ${x.email}?`)) return;
    await updateDoc(doc(db, "users", x.id), { blocked: block });
    if (block && x.role === "freelancer") { // hide their listings and profile while blocked
      await Promise.allSettled([updateDoc(doc(db, "profiles", x.id), { approved: "No" }), ...sv.filter((v) => v.freelancerId === x.id).map((v) => updateDoc(doc(db, "services", v.id), { approved: "No" }))]); } };
  const list = users.filter((x) => (!role || x.role === role) && x.email.includes(q.toLowerCase()));
  return <div><div className={s.bar}><h1>Users & access</h1><div className={s.row}><input style={{ width: 200 }} placeholder="Search email" value={q} onChange={(e) => setQ(e.target.value)} /><select style={{ width: 140 }} value={role} onChange={(e) => setRole(e.target.value)}><option value="">All roles</option><option value="client">Clients</option><option value="freelancer">Freelancers</option></select></div></div>
    <div className={s.grid}>{[["Clients", users.filter((x) => x.role === "client").length, "#2563eb"], ["Freelancers", users.filter((x) => x.role === "freelancer").length, "#0ea5e9"], ["Blocked", users.filter((x) => x.blocked).length, "#dc2626"]].map(([l, v, c]) => <div key={l} className={`${s.card} ${s.stat}`} style={{ "--a": c }}>{l}<b>{v}</b></div>)}</div>
    <div className={s.tbl}><table><thead><tr><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th></th></tr></thead><tbody>
      {list.map((x) => <tr key={x.id}><td><b>{x.email}</b></td><td style={{ textTransform: "capitalize" }}>{x.role}</td><td>{dt(x.createdAt)}</td><td><Badge v={x.blocked ? "failed" : "completed"} /> {x.blocked ? "Blocked" : "Active"}</td>
        <td><button className={x.blocked ? s.btn : ""} onClick={() => toggle(x)}>{x.blocked ? "Unblock" : "Block"}</button></td></tr>)}</tbody></table></div>
    <p style={{ color: "var(--mut)", fontSize: 13 }}>Blocked users are denied by the database rules (no bookings, messages, payments or edits) and see a suspension notice. Accounts that existed before this update appear after their next login.</p></div>;
}
