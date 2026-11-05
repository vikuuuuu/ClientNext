"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthBox from "@/components/AuthBox";
import Shell from "@/components/Shell";
const NAV = [{ group: "My account", items: [{ href: "/portal", label: "Overview", icon: "📊" }, { href: "/portal/browse", label: "Find services", icon: "🔎" }, { href: "/portal/bookings", label: "My bookings", icon: "📅" }, { href: "/portal/payments", label: "Payments", icon: "💳" }] }];
function Inner({ u, children }) {
  const r = useRouter();
  useEffect(() => { const n = sessionStorage.getItem("next"); if (n) { sessionStorage.removeItem("next"); r.replace(n); } }, [r]); // back to the service you wanted to book
  return <Shell brand="Client Portal" role="Client" user={u} nav={NAV} onLogout={() => signOut(auth)}>{children}</Shell>;
}
export default function Layout({ children }) { return <AuthBox role="client" title="Client login" sub="Track your bookings, projects, invoices and payments.">{(u) => <Inner u={u}>{children}</Inner>}</AuthBox>; }
