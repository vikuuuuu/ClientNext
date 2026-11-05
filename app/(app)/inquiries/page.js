"use client";
import { useUser, useCol } from "@/lib/hooks";
import Badge from "@/components/Badge";
import s from "@/components/ui.module.css";
export default function Inquiries() {
  const uid = useUser()?.uid, { rows, upd, del } = useCol("inquiries", uid), cl = useCol("clients", uid), pr = useCol("projects", uid);
  const approve = async (r) => { // approve => client + project auto ban jate hain
    const c = await cl.add({ name: r.name, phone: r.phone, email: r.email || "", notes: "Inquiry: " + r.message });
    await pr.add({ title: r.service || "New project", clientId: c.id, status: "New", requirements: r.message, total: 0 });
    await upd(r.id, { status: "Approved" }); };
  return <div><div className={s.bar}><h1>Inquiries</h1></div>
    <div className={s.tbl}><table><thead><tr><th>Date</th><th>Client</th><th>Service</th><th>Budget</th><th>Message</th><th>Status</th><th></th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleDateString()}</td><td><b>{r.name}</b><br />{r.phone}<br />{r.email}</td><td>{r.service}</td><td>{r.budget}</td>
        <td style={{ maxWidth: 260 }}>{r.message}</td><td><Badge v={r.status} /></td>
        <td style={{ whiteSpace: "nowrap" }}>{r.status === "New" && <><button className={s.btn} onClick={() => approve(r)}>Approve</button> <button onClick={() => upd(r.id, { status: "Rejected" })}>Reject</button> </>}<button onClick={() => confirm("Delete?") && del(r.id)}>✕</button></td></tr>)}</tbody></table></div></div>;
}
