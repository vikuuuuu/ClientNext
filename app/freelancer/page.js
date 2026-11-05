"use client";
import Link from "next/link";
import { useUser, useProfile, useQ } from "@/lib/hooks";
import { inr, dt } from "@/lib/util";
import Badge from "@/components/Badge";
import Gate from "@/components/Gate";
import s from "@/components/ui.module.css";
export default function Overview() {
  const u = useUser(), p = useProfile(u?.uid), bk = useQ("bookings", "freelancerId", u?.uid), py = useQ("payments", "freelancerId", u?.uid), jobs = useQ("assignments", "freelancerEmail", u?.email?.toLowerCase());
  const n = (st) => bk.filter((b) => st.includes(b.status)).length, sum = (st, k = "amount") => py.filter((x) => x.status === st).reduce((a, x) => a + (+x[k] || 0), 0);
  return <Gate p={p}><div className={s.bar}><h1>Welcome back, {p?.name?.split(" ")[0]}</h1></div>
    <div className={s.grid}>{[["New inquiries", n(["pending", "accepted"]), "#d97706"], ["Proposals sent", n(["proposed"]), "#7c3aed"], ["Active orders", n(["agreed", "in_progress", "delivered", "approved"]), "#2563eb"], ["Completed", n(["completed"]), "#16a34a"], ["Net earnings", inr(sum("completed", "payout")), "#0ea5e9"], ["In escrow", inr(sum("verified")), "#7c3aed"]].map(([l, v, c]) => <div key={l} className={`${s.card} ${s.stat}`} style={{ "--a": c }}>{l}<b>{v}</b></div>)}</div>
    <div className={s.card}><div className={s.bar} style={{ margin: 0 }}><h3>Latest requests</h3><Link href="/freelancer/bookings">Manage all →</Link></div><div className={s.tbl} style={{ border: 0 }}><table><tbody>
      {bk.slice(0, 5).map((b) => <tr key={b.id}><td>{dt(b.createdAt)}</td><td>{b.serviceTitle}</td><td>{b.clientName}</td><td><Badge v={b.status} /></td></tr>)}{!bk.length && <tr><td style={{ color: "var(--mut)" }}>No requests yet.</td></tr>}</tbody></table></div></div>
    {jobs.length > 0 && <div className={s.card}><h3>Projects assigned by admin</h3><div className={s.tbl} style={{ border: 0 }}><table><tbody>{jobs.map((j) => <tr key={j.id}><td><b>{j.title}</b></td><td>{j.client}</td><td><Badge v={j.status} /></td><td>{j.deadline || "—"}</td></tr>)}</tbody></table></div></div>}</Gate>;
}
