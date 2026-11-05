"use client";
import Crud from "@/components/Crud";
import Badge from "@/components/Badge";
import { useUser, useCol } from "@/lib/hooks";
import { total, inr } from "@/lib/util";
export default function Clients() {
  const uid = useUser()?.uid, inv = useCol("invoices", uid), qt = useCol("quotations", uid), pr = useCol("projects", uid);
  const mine = (id) => inv.rows.filter((i) => i.clientId === id);
  const stamp = (r) => (r.portal === "Yes" && r.email ? r.email.toLowerCase() : "");
  const afterSave = (r) => { if (!r.id) return; const em = stamp(r); // portal access docs par sync
    [inv, qt, pr].forEach((h) => h.rows.filter((x) => x.clientId === r.id && (x.clientEmail || "") !== em).forEach((x) => h.upd(x.id, { clientEmail: em }))); };
  return <Crud title="Clients" col="clients" afterSave={afterSave} defaults={{ portal: "No" }}
    fields={[{ k: "name", label: "Name", req: 1 }, { k: "phone", label: "Phone" }, { k: "email", label: "Email (portal login isi email se)", type: "email" }, { k: "company", label: "Company" },
      { k: "portal", label: "Client portal access", type: "select", options: ["Yes", "No"] }, { k: "notes", label: "Notes / conversations", type: "textarea" }]}
    cols={[{ k: "name", label: "Name" }, { k: "phone", label: "Phone" }, { k: "company", label: "Company" }, { k: "portal", label: "Portal", fmt: (v) => (v === "Yes" ? <Badge v="Approved" /> : "—") }]}
    more={[{ label: "Projects", fn: (c) => pr.rows.filter((p) => p.clientId === c.id).length },
      { label: "Billed", fn: (c) => inr(mine(c.id).reduce((a, i) => a + total(i), 0)) },
      { label: "Received", fn: (c) => inr(mine(c.id).reduce((a, i) => a + (+i.paid || 0), 0)) },
      { label: "Pending", fn: (c) => inr(mine(c.id).reduce((a, i) => a + total(i) - (+i.paid || 0), 0)) }]} />;
}
