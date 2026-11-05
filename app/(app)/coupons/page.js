"use client";
import Crud from "@/components/Crud";
export default function C() {
  return <Crud title="Coupons & Discounts" col="coupons" defaults={{ type: "%", active: "Yes" }}
    fields={[{ k: "code", label: "Code (e.g. WELCOME10)", req: 1 }, { k: "type", label: "Type", type: "select", options: ["%", "Flat ₹"] },
      { k: "value", label: "Value", type: "number", req: 1 }, { k: "active", label: "Active", type: "select", options: ["Yes", "No"] }]}
    cols={[{ k: "code", label: "Code" }, { k: "type", label: "Type" }, { k: "value", label: "Value" }, { k: "active", label: "Active" }]} />;
}
