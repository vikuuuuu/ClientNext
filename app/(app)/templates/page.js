"use client";
import Crud from "@/components/Crud";
import { inr } from "@/lib/util";
export default function T() {
  return <Crud title="Price Templates" col="templates"
    fields={[{ k: "name", label: "Service name (e.g. Static Website)", req: 1 }, { k: "price", label: "Price (₹)", type: "number", req: 1 }]}
    cols={[{ k: "name", label: "Service" }, { k: "price", label: "Price", fmt: inr }]} />;
}
