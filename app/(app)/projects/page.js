"use client";
import Crud from "@/components/Crud";
import Badge from "@/components/Badge";
import { useUser, useCol } from "@/lib/hooks";
import { inr, today, nextNo } from "@/lib/util";
export default function Projects() {
  const uid = useUser()?.uid, cl = useCol("clients", uid).rows, inv = useCol("invoices", uid);
  const nm = (id) => cl.find((c) => c.id === id)?.name || "-", bal = (p) => (p.total || 0) - (p.advance || 0) - (p.finalPaid || 0);
  const finalInv = async (p) => { await inv.add({ no: nextNo(inv.rows, "INV-"), clientId: p.clientId, date: today(), due: "", items: [{ d: `Final payment — ${p.title}`, q: 1, r: bal(p) }], paid: 0, payments: [], terms: "" }); alert("Final invoice ban gaya ✔"); };
  return <Crud title="Projects" col="projects" defaults={{ status: "New" }}
    fields={[{ k: "title", label: "Title", req: 1 }, { k: "clientId", label: "Client", type: "select", options: cl.map((c) => ({ v: c.id, l: c.name })) },
      { k: "status", label: "Status", type: "select", options: ["New", "In Progress", "Review", "Completed"] },
      { k: "deadline", label: "Deadline", type: "date" }, { k: "requirements", label: "Requirements / tasks", type: "textarea" },
      { k: "refLinks", label: "Reference links", type: "textarea" }, { k: "deliveryLink", label: "Delivery link" },
      { k: "total", label: "Total amount", type: "number" }, { k: "advance", label: "Advance received", type: "number" }, { k: "finalPaid", label: "Final payment received", type: "number" }]}
    cols={[{ k: "title", label: "Project" }, { k: "clientId", label: "Client", fmt: nm }, { k: "status", label: "Status", fmt: (v) => <Badge v={v} /> }, { k: "deadline", label: "Deadline" }]}
    more={[{ label: "Balance", fn: (p) => inr(bal(p)) }, { label: "", fn: (p) => p.status === "Completed" && bal(p) > 0 && <button onClick={() => finalInv(p)}>Final invoice</button> }]} />;
}
