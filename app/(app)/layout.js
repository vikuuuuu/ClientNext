"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useUser, useSettings, logEvent } from "@/lib/hooks";
import Shell from "@/components/Shell";
const OWNER = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").toLowerCase();
const I = (href, label, icon) => ({ href, label, icon });
const NAV = [
  { group: "Overview", items: [I("/dashboard", "Dashboard", "📊")] },
  { group: "Marketplace", items: [I("/marketplace", "Services & orders", "🛒"), I("/payments", "Transactions", "💳"), I("/users", "Users & access", "🔐"), I("/team", "Freelancer profiles", "🌟"), I("/inquiries", "Inquiries", "📨")] },
  { group: "Business", items: [I("/clients", "Clients", "👥"), I("/quotations", "Quotations", "📝"), I("/invoices", "Invoices", "🧾"), I("/projects", "Projects", "🚀"), I("/finance", "Finance", "💰")] },
  { group: "Setup", items: [I("/freelancers", "Freelancer contacts", "🧑‍💻"), I("/templates", "Price templates", "🏷️"), I("/coupons", "Coupons", "🎟️"), I("/logs", "Activity log", "🛡️"), I("/settings", "Settings", "⚙️")] },
];
export default function AppLayout({ children }) {
  const u = useUser(), isOwner = !!u && u.email?.toLowerCase() === OWNER, cfg = useSettings(isOwner ? u.uid : null), r = useRouter(), [dark, setDark] = useState(false);
  const out = (why) => logEvent(u?.uid, why).finally(() => signOut(auth).then(() => r.replace("/login")));
  const mins = +cfg?.idle || 15;
  useEffect(() => { if (u === null) r.replace("/login"); else if (u && OWNER && !isOwner) getDoc(doc(db, "users", u.uid)).then((d) => r.replace(d.data()?.role === "freelancer" ? "/freelancer" : "/portal")).catch(() => r.replace("/portal")); }, [u, isOwner, r]);
  useEffect(() => { if (!isOwner) return; getDoc(doc(db, "site", u.uid)).then((d) => { if (!d.exists()) setDoc(doc(db, "site", u.uid), { uid: u.uid, business: "My Business", tagline: "", phone: "", whatsapp: "" }); }).catch(() => {}); }, [isOwner, u]);
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  useEffect(() => {
    if (!isOwner) return; let t; const ev = ["click", "keydown", "mousemove", "touchstart"];
    const reset = () => { clearTimeout(t); t = setTimeout(() => out("auth.idle_logout"), mins * 60000); };
    ev.forEach((e) => addEventListener(e, reset)); reset();
    return () => { clearTimeout(t); ev.forEach((e) => removeEventListener(e, reset)); };
  }, [isOwner, mins]); // eslint-disable-line
  if (!OWNER) return <p style={{ padding: 24 }}>Set NEXT_PUBLIC_OWNER_EMAIL in your environment variables.</p>;
  if (!isOwner) return null;
  return <Shell brand={cfg?.business || "Admin"} role="Admin" user={u} nav={NAV} onLogout={() => out("auth.logout")} extra={<button onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>}>{children}</Shell>;
}
