"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { inr } from "@/lib/util";
import s from "@/components/ui.module.css";
export default function Browse() {
  const [all, setAll] = useState([]), [q, setQ] = useState(""), [cat, setCat] = useState(""), [sort, setSort] = useState("new"), [ready, setReady] = useState(false);
  useEffect(() => { getDocs(query(collection(db, "services"), where("approved", "==", "Yes"))).then((x) => setAll(x.docs.map((d) => ({ id: d.id, ...d.data() })))).catch(() => {}).finally(() => setReady(true)); }, []);
  const cats = [...new Set(all.map((x) => x.category).filter(Boolean))];
  const list = all.filter((x) => (!cat || x.category === cat) && `${x.title} ${x.desc} ${x.freelancerName}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : (b.createdAt || 0) - (a.createdAt || 0)));
  return <div><div className={s.bar}><h1>Find services</h1></div>
    <div className={s.card}><div className={s.row}><input placeholder="Search services, skills or freelancers" value={q} onChange={(e) => setQ(e.target.value)} /><select style={{ width: 190 }} value={sort} onChange={(e) => setSort(e.target.value)}><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
      <div className={s.row} style={{ marginTop: 8 }}><button className={!cat ? s.btn : ""} onClick={() => setCat("")}>All</button>{cats.map((c) => <button key={c} className={cat === c ? s.btn : ""} onClick={() => setCat(c)}>{c}</button>)}</div></div>
    <div className={s.grid} style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>{list.map((x) => <div key={x.id} className={s.card} style={{ padding: 0, overflow: "hidden", margin: 0 }}>
      {/^https:\/\//.test(x.image || "") ? <img src={x.image} alt={x.title} referrerPolicy="no-referrer" style={{ width: "100%", height: 140, objectFit: "cover" }} /> : <div style={{ height: 140, background: "linear-gradient(135deg,#60a5fa,#bae6fd)" }} />}
      <div style={{ padding: 16 }}><b>{x.title}</b><br /><small style={{ color: "var(--mut)" }}>by {x.freelancerName}{x.delivery ? ` · ${x.delivery}-day delivery` : ""}</small><p style={{ margin: "10px 0", fontWeight: 800, color: "#1d4ed8" }}>From {inr(x.price)}</p>
        <Link href={"/service/" + x.id} style={{ fontWeight: 600 }}>View details & book →</Link></div></div>)}</div>
    {ready && !list.length && <p style={{ color: "var(--mut)" }}>No services match your search.</p>}</div>;
}
