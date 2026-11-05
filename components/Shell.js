"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import s from "./shell.module.css";
// nav: [{group, items:[{href,label,icon}]}]
export default function Shell({ brand, role, user, nav, onLogout, extra, children }) {
  const path = usePathname(), [open, setOpen] = useState(false), [menu, setMenu] = useState(false);
  const hit = nav.flatMap((g) => g.items).filter((i) => path === i.href || path.startsWith(i.href + "/")).sort((a, b) => b.href.length - a.href.length)[0];
  return <div className={s.app}>
    <aside className={`${s.sb} ${open ? s.open : ""} noprint`}>
      <div className={s.brand}><span className={s.mark}>◆</span>{brand}</div>
      <nav className={s.nav} onClick={() => setOpen(false)}>{nav.map((g) => <div key={g.group}><div className={s.grp}>{g.group}</div>
        {g.items.map((i) => <Link key={i.href} href={i.href} className={hit === i ? s.on : ""}><span className={s.ic}>{i.icon}</span>{i.label}</Link>)}</div>)}
        <div className={s.grp}>Site</div><Link href="/"><span className={s.ic}>🌐</span>Public website</Link></nav>
    </aside>
    <div className={`${s.ov} ${open ? s.open : ""}`} onClick={() => setOpen(false)} />
    <div className={s.col}>
      <header className={`${s.top} noprint`}><button className={s.burger} onClick={() => setOpen(true)}>☰</button>
        <div className={s.crumb}><small>{role}</small>{hit?.label}</div>{extra}<span className={s.pill}>{role}</span>
        <div style={{ position: "relative" }}><button className={s.avb} onClick={() => setMenu(!menu)}>{(user?.displayName || user?.email || "?")[0].toUpperCase()}</button>
          {menu && <div className={s.menu}><b>{user?.displayName || "Account"}</b><small>{user?.email}</small><button onClick={onLogout}>Log out</button></div>}</div></header>
      <main className={s.page}>{children}</main></div></div>;
}
