"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthBox from "@/components/AuthBox";
import Shell from "@/components/Shell";
const NAV = [{ group: "Workspace", items: [{ href: "/freelancer", label: "Overview", icon: "📊" }, { href: "/freelancer/bookings", label: "Booking requests", icon: "📥" }, { href: "/freelancer/services", label: "My services", icon: "🛍️" }, { href: "/freelancer/payments", label: "Earnings", icon: "💳" }] },
  { group: "Account", items: [{ href: "/freelancer/profile", label: "Profile & portfolio", icon: "👤" }] }];
export default function Layout({ children }) {
  return <AuthBox role="freelancer" title="Freelancer login" sub="Manage your profile, services and booking requests.">{(u) => <Shell brand="Freelancer" role="Freelancer" user={u} nav={NAV} onLogout={() => signOut(auth)}>{children}</Shell>}</AuthBox>;
}
