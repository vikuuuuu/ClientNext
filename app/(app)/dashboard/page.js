"use client";
import { useUser, useCol } from "@/lib/hooks";
import { total, inr, status } from "@/lib/util";
import Badge from "@/components/Badge";
import s from "@/components/ui.module.css";
export default function Dashboard() {
  const uid = useUser()?.uid, inv = useCol("invoices", uid).rows, tx = useCol("transactions", uid).rows;
  const pr = useCol("projects", uid).rows, cl = useCol("clients", uid).rows;
  const sum = (a, f) => a.reduce((x, r) => x + f(r), 0), amt = (t) => +t.amount || 0, ym = new Date().toISOString().slice(0, 7);
  // Sirf Finance transactions se gine jate hain (invoice payment auto Finance me aati hai => double count nahi)
  const inc = tx.filter((t) => t.type === "Income"), ex = tx.filter((t) => t.type === "Expense");
  const earn = sum(inc, amt), spend = sum(ex, amt), month = sum(inc.filter((t) => (t.date || "").startsWith(ym)), amt);
  const pending = sum(inv, (i) => total(i) - (+i.paid || 0)), due = inv.filter((i) => total(i) > (+i.paid || 0));
  const over = inv.filter((i) => status(i) === "Overdue"), active = pr.filter((p) => p.status !== "Completed");
  const months = [...Array(6)].map((_, k) => { const d = new Date(); d.setMonth(d.getMonth() - 5 + k, 1); const m = d.toISOString().slice(0, 7);
    const f = (T) => sum(tx.filter((t) => t.type === T && (t.date || "").startsWith(m)), amt); return { m, i: f("Income"), e: f("Expense") }; });
  const mx = Math.max(1, ...months.flatMap((x) => [x.i, x.e]));
  const S = ({ l, v, c }) => <div className={`${s.card} ${s.stat}`} style={{ "--a": c }}>{l}<b>{v}</b></div>;
  return <div><div className={s.bar}><h1>Dashboard</h1></div>
    <div className={s.grid}><S l="Total earning" v={inr(earn)} c="#16a34a" /><S l="This month" v={inr(month)} c="#6366f1" /><S l="Total expenses" v={inr(spend)} c="#dc2626" />
      <S l="Net profit" v={inr(earn - spend)} c="#8b5cf6" /><S l="Pending payments" v={inr(pending)} c="#d97706" /><S l="Overdue bills" v={over.length} c="#dc2626" /><S l="Active projects" v={active.length} c="#0891b2" /></div>
    <div className={s.card}><h3 style={{ marginTop: 0 }}>Income vs Expense (6 months)</h3><div className={s.bars}>
      {months.map((x) => <div key={x.m} className={s.col}><div className={s.pair}><i title={inr(x.i)} style={{ height: (x.i / mx) * 100 + "%", background: "#16a34a" }} /><i title={inr(x.e)} style={{ height: (x.e / mx) * 100 + "%", background: "#ef4444" }} /></div>{x.m.slice(2)}</div>)}</div>
      <small style={{ color: "#16a34a" }}>■ Income</small> <small style={{ color: "#ef4444" }}>■ Expense</small></div>
    <div className={s.grid} style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
      <div className={s.card}><h3 style={{ marginTop: 0 }}>Outstanding invoices</h3>{due.slice(0, 5).map((i) => <div key={i.id} className={s.row}><span style={{ flex: 1 }}>{i.no} · {cl.find((c) => c.id === i.clientId)?.name}</span><b>{inr(total(i) - (+i.paid || 0))}</b><Badge v={status(i)} /></div>)}</div>
      <div className={s.card}><h3 style={{ marginTop: 0 }}>Upcoming deadlines</h3>{active.filter((p) => p.deadline).sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 5).map((p) => <div key={p.id} className={s.row}><span style={{ flex: 1 }}>{p.deadline} · {p.title}</span><Badge v={p.status} /></div>)}</div>
      <div className={s.card}><h3 style={{ marginTop: 0 }}>Recent clients</h3>{cl.slice(0, 5).map((c) => <div key={c.id}>{c.name} {c.company && `· ${c.company}`}</div>)}</div>
      <div className={s.card}><h3 style={{ marginTop: 0 }}>Latest transactions</h3>{tx.slice(0, 5).map((t) => <div key={t.id} className={s.row}><span style={{ flex: 1 }}>{t.date} · {t.category}</span><Badge v={t.type} /><b>{inr(t.amount)}</b></div>)}</div></div></div>;
}
