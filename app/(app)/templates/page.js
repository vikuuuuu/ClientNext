"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/hooks";
import Crud from "@/components/Crud";
import { inr } from "@/lib/util";
export default function T() {
  const u = useUser(), [pf, setPf] = useState([]);
  useEffect(() => { if (u) return onSnapshot(collection(db, "profiles"), (x) => setPf(x.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.approved === "Yes"))); }, [u]);
  return <Crud title="Services / Price Templates" col="templates" defaults={{ public: "Yes" }}
    beforeSave={(d) => { const p = pf.find((x) => x.id === d.devId); return { ...d, devName: p?.name || "", devUrl: p?.portfolioUrl || "" }; }}
    fields={[{ k: "name", label: "Service name", req: 1 }, { k: "price", label: "Starting price (₹)", type: "number", req: 1 },
      { k: "image", label: "Image URL (https://...)", type: "url" }, { k: "public", label: "Show on public website?", type: "select", options: ["Yes", "No"] },
      { k: "devId", label: "Assigned developer (approved profiles)", type: "select", options: pf.map((p) => ({ v: p.id, l: p.name })) },
      { k: "desc", label: "Description", type: "textarea" }]}
    cols={[{ k: "image", label: "Image", fmt: (v) => v ? <img src={v} alt="" style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 8 }} /> : "—" },
      { k: "name", label: "Service" }, { k: "price", label: "Price", fmt: inr }, { k: "devName", label: "Developer" }, { k: "public", label: "Public" }]} />;
}
