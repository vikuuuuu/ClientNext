"use client";
import Crud from "@/components/Crud";
import { useUser, useCol } from "@/lib/hooks";
import { total, inr } from "@/lib/util";
export default function Clients() {
  const u = useUser(), inv = useCol("invoices", u?.uid).rows, pr = useCol("projects", u?.uid).rows;
  const mine = (id) => inv.filter((i) => i.clientId === id);
  return <Crud title="Clients" col="clients"
    fields={[{ k: "name", label: "Name", req: 1 }, { k: "phone", label: "Phone" }, { k: "email", label: "Email", type: "email" }, { k: "company", label: "Company" }, { k: "notes", label: "Notes / conversations", type: "textarea" }]}
    cols={[{ k: "name", label: "Name" }, { k: "phone", label: "Phone" }, { k: "company", label: "Company" }, { k: "notes", label: "Notes" }]}
    more={[{ label: "Projects", fn: (c) => pr.filter((p) => p.clientId === c.id).length },
      { label: "Billed", fn: (c) => inr(mine(c.id).reduce((a, i) => a + total(i), 0)) },
      { label: "Received", fn: (c) => inr(mine(c.id).reduce((a, i) => a + (+i.paid || 0), 0)) },
      { label: "Pending", fn: (c) => inr(mine(c.id).reduce((a, i) => a + total(i) - (+i.paid || 0), 0)) }]} />;
}
