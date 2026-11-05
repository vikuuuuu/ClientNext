"use client";
import { useState } from "react";
import { useUser, useCol } from "@/lib/hooks";
import s from "@/components/ui.module.css";
export default function Logs() {
  const rows = useCol("logs", useUser()?.uid).rows, [q, setQ] = useState("");
  const list = rows.filter((r) => (r.action + r.detail).toLowerCase().includes(q.toLowerCase())).slice(0, 200);
  return <div><div className={s.bar}><h1>Activity Log</h1><input style={{ maxWidth: 220 }} placeholder="Filter (auth, invoices...)" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    <div className={s.tbl}><table><thead><tr><th>Time</th><th>Event</th><th>Detail</th><th>Device</th></tr></thead><tbody>
      {list.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td><b>{r.action}</b></td><td>{r.detail}</td><td style={{ fontSize: 11, color: "var(--mut)" }}>{r.ua}</td></tr>)}</tbody></table></div>
    <p style={{ color: "var(--mut)", fontSize: 12 }}>Logs append-only hain — rules ki wajah se edit/delete nahi hote.</p></div>;
}
