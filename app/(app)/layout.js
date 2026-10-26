"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/lib/hooks";
import { BRAND } from "@/lib/util";
import s from "@/components/ui.module.css";
const links = [["dashboard", "📊"], ["clients", "👥"], ["quotations", "📝"], ["invoices", "🧾"], ["projects", "🚀"], ["finance", "💰"], ["templates", "🏷️"]];
export default function AppLayout({ children }) {
  const u = useUser(), r = useRouter(), path = usePathname(), [dark, setDark] = useState(false);
  useEffect(() => { if (u === null) r.replace("/login"); }, [u, r]);
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  useEffect(() => { // 15 min inactivity => auto logout
    if (!u) return; let t; const ev = ["click", "keydown", "mousemove", "touchstart"];
    const reset = () => { clearTimeout(t); t = setTimeout(() => signOut(auth), 15 * 60 * 1000); };
    ev.forEach((e) => addEventListener(e, reset)); reset();
    return () => { clearTimeout(t); ev.forEach((e) => removeEventListener(e, reset)); };
  }, [u]);
  if (!u) return null; // login ke bina kuch render nahi hota
  return <div className={s.shell}>
    <nav className={`${s.side} noprint`}>
      <div className={s.logo}>{BRAND}</div>
      {links.map(([l, i]) => <Link key={l} href={"/" + l} className={path === "/" + l ? s.on : ""}>{i} {l[0].toUpperCase() + l.slice(1)}</Link>)}
      <div className={s.sp} />
      <button onClick={() => setDark(!dark)}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
      <button onClick={() => signOut(auth).then(() => r.replace("/login"))}>⎋ Logout</button>
    </nav>
    <main className={s.main}>{children}</main>
  </div>;
}
