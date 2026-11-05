"use client";
import Crud from "@/components/Crud";
import Badge from "@/components/Badge";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser, useCol } from "@/lib/hooks";
import { inr, today, nextNo } from "@/lib/util";
export default function Projects() {
  const uid = useUser()?.uid, cl = useCol("clients", uid).rows, fr = useCol("freelancers", uid).rows, inv = useCol("invoices", uid);
  const nm = (id) => cl.find((c) => c.id === id)?.name || "-", bal = (p) => (p.total || 0) - (p.advance || 0) - (p.finalPaid || 0);
  const emailOf = (id) => { const c = cl.find((x) => x.id === id); return c?.portal === "Yes" && c.email ? c.email.toLowerCase() : ""; };
  const finalInv = async (p) => { await inv.add({ no: nextNo(inv.rows, "INV-"), clientId: p.clientId, clientEmail: emailOf(p.clientId), date: today(), due: "", items: [{ d: `Final payment — ${p.title}`, q: 1, r: bal(p) }], paid: 0, payments: [], terms: "" }); alert("Final invoice ban gaya ✔"); };
  const sync = async (p) => { if (!p.id) return; const sel = p.freelancerIds || []; // freelancer ko sirf safe assignment copy milti hai (paise nahi)
    await Promise.allSettled(fr.map((f) => { const ref = doc(db, "assignments", `${p.id}_${f.id}`);
      return sel.includes(f.id) && f.email ? setDoc(ref, { uid, projectId: p.id, freelancerEmail: f.email.toLowerCase(), title: p.title, client: nm(p.clientId), status: p.status || "New", deadline: p.deadline || "", requirements: p.requirements || "", refLinks: p.refLinks || "", createdAt: Date.now() }) : deleteDoc(ref); })); };
  return <Crud title="Projects" afterSave={sync} col="projects" defaults={{ status: "New", freelancerIds: [] }} beforeSave={(d) => ({ ...d, clientEmail: emailOf(d.clientId) })}
    fields={[{ k: "title", label: "Title", req: 1 }, { k: "clientId", label: "Client", type: "select", options: cl.map((c) => ({ v: c.id, l: c.name })) },
      { k: "status", label: "Status", type: "select", options: ["New", "In Progress", "Review", "Completed"] },
      { k: "deadline", label: "Deadline", type: "date" },
      { k: "freelancerIds", label: "Assign freelancers (multiple)", type: "multi", options: fr.map((x) => ({ v: x.id, l: x.name })) },
      { k: "requirements", label: "Requirements / tasks", type: "textarea" }, { k: "refLinks", label: "Reference links", type: "textarea" }, { k: "deliveryLink", label: "Delivery link (https://, client ko completed par dikhega)" },
      { k: "total", label: "Total amount", type: "number" }, { k: "advance", label: "Advance received", type: "number" }, { k: "finalPaid", label: "Final payment received", type: "number" }]}
    cols={[{ k: "title", label: "Project" }, { k: "clientId", label: "Client", fmt: nm }, { k: "status", label: "Status", fmt: (v) => <Badge v={v} /> }, { k: "deadline", label: "Deadline" },
      { k: "freelancerIds", label: "Team", fmt: (v) => (v || []).map((i) => fr.find((x) => x.id === i)?.name).filter(Boolean).join(", ") || "—" }]}
    more={[{ label: "Balance", fn: (p) => inr(bal(p)) }, { label: "", fn: (p) => p.status === "Completed" && bal(p) > 0 && <button onClick={() => finalInv(p)}>Final invoice</button> }]} />;
}
