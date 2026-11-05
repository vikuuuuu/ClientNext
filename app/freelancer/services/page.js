"use client";
import Crud from "@/components/Crud";
import Badge from "@/components/Badge";
import Gate from "@/components/Gate";
import { useUser, useProfile } from "@/lib/hooks";
import { inr } from "@/lib/util";
export default function Services() {
  const u = useUser(), p = useProfile(u?.uid);
  return <Gate p={p}><Crud title="My services" col="services" field="freelancerId" defaults={{ approved: "No" }}
    beforeSave={(d) => ({ ...d, freelancerName: p.name, price: +d.price || 0, delivery: +d.delivery || 0 })}
    fields={[{ k: "title", label: "Service title", req: 1 }, { k: "category", label: "Category (Web, Design...)" }, { k: "price", label: "Price (₹)", type: "number", req: 1 }, { k: "delivery", label: "Delivery time (days)", type: "number" },
      { k: "image", label: "Cover image URL (https://)", type: "url" }, { k: "desc", label: "Description", type: "textarea" }]}
    cols={[{ k: "title", label: "Service" }, { k: "price", label: "Price", fmt: inr }, { k: "delivery", label: "Days" }, { k: "approved", label: "Listing", fmt: (v) => <Badge v={v === "Yes" ? "approved" : "pending"} /> }]} /></Gate>;
}
