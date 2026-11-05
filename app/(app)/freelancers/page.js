"use client";
import Crud from "@/components/Crud";
import { useUser, useCol } from "@/lib/hooks";
import { inr } from "@/lib/util";
export default function Freelancers() {
  const pr = useCol("projects", useUser()?.uid).rows;
  return <Crud title="Freelancers" col="freelancers"
    fields={[{ k: "name", label: "Name", req: 1 }, { k: "skill", label: "Skill (React, Design...)" }, { k: "phone", label: "Phone" }, { k: "email", label: "Email", type: "email" }, { k: "rate", label: "Rate (₹ / project or hour)", type: "number" }, { k: "notes", label: "Notes", type: "textarea" }]}
    cols={[{ k: "name", label: "Name" }, { k: "skill", label: "Skill" }, { k: "phone", label: "Phone" }, { k: "rate", label: "Rate", fmt: inr }]}
    more={[{ label: "Active projects", fn: (f) => pr.filter((p) => p.status !== "Completed" && (p.freelancerIds || []).includes(f.id)).length }]} />;
}
