"use client";
import Link from "next/link";
import s from "./ui.module.css";
export default function Gate({ p, children }) {
  if (p === undefined) return null;
  if (!p) return <div className={s.card}><h3>Create your profile first</h3><p>Add your details so the admin can approve you.</p><Link href="/freelancer/profile" className={s.btn} style={{ padding: "9px 16px", borderRadius: 10, textDecoration: "none", display: "inline-block" }}>Set up profile</Link></div>;
  if (p.approved !== "Yes") return <div className={s.card}><h3>Awaiting approval</h3><p>Your profile is under review. Services and booking requests unlock once it is approved.</p></div>;
  return children;
}
