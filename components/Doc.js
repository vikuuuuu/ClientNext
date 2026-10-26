"use client";
import { useState } from "react";
import { useUser, useCol } from "@/lib/hooks";
import { total, inr, today, status, nextNo, BRAND } from "@/lib/util";
import Badge, { COLORS } from "./Badge";
import s from "./ui.module.css";
export default function Doc({ type }) {
  const Q = type === "quotations", uid = useUser()?.uid;
  const { rows, add, upd, del } = useCol(type, uid), inv = useCol("invoices", uid), pay = useCol("transactions", uid);
  const cl = useCol("clients", uid).rows, tp = useCol("templates", uid).rows;
  const [f, setF] = useState(null), [v, setV] = useState(null), [pf, setPf] = useState(null);
  const cli = (id) => cl.find((c) => c.id === id) || {}, name = (id) => cli(id).name || "-";
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const item = (i, k, val) => setF({ ...f, items: f.items.map((x, j) => (j === i ? { ...x, [k]: val } : x)) });
  const save = async (e) => { e.preventDefault(); const { id, ...d } = f; id ? await upd(id, d) : await add(d); setF(null); };
  const toInvoice = async (q) => { await inv.add({ no: nextNo(inv.rows, "INV-"), clientId: q.clientId, date: today(), due: "", items: q.items, paid: 0, payments: [], terms: q.terms || "" }); alert("Invoice ban gaya ✔"); };
  const wa = (r) => { const c = cli(r.clientId); let ph = (c.phone || "").replace(/\D/g, ""); if (ph.length === 10) ph = "91" + ph;
    open(`https://wa.me/${ph}?text=` + encodeURIComponent(`Hi ${c.name || ""}, ${Q ? "quotation" : "invoice"} ${r.no}: total ${inr(total(r))}` + (Q ? "" : `, balance ${inr(total(r) - (+r.paid || 0))}`))); };
  // --- payments: invoice payment => Finance me auto Income entry ---
  const record = (i, a, method, date) => pay.add({ type: "Income", amount: a, date, method, category: "Invoice payment", note: `${i.no} · ${name(i.clientId)}`, invoiceId: i.id });
  const addPay = async (e) => { e.preventDefault(); const i = rows.find((r) => r.id === pf.id), a = +pf.amount, bal = total(i) - (+i.paid || 0);
    if (!(a > 0) || a > bal) return alert("Amount 0 se zyada aur balance (" + inr(bal) + ") se kam hona chahiye");
    const t = await record(i, a, pf.method, pf.date);
    await upd(i.id, { paid: (+i.paid || 0) + a, payments: [...(i.payments || []), { id: t.id, amount: a, date: pf.date, method: pf.method }] }); setPf({ ...pf, amount: "" }); };
  const rmPay = async (i, p) => { if (!confirm("Payment hatao? Finance entry bhi hategi")) return; await pay.del(p.id);
    await upd(i.id, { paid: Math.max(0, (+i.paid || 0) - p.amount), payments: i.payments.filter((x) => x.id !== p.id) }); };
  const legacy = (i) => (+i.paid || 0) - (i.payments || []).reduce((a, p) => a + p.amount, 0);
  const sync = async (i) => { const a = legacy(i), t = await record(i, a, "Cash", today()); await upd(i.id, { payments: [...(i.payments || []), { id: t.id, amount: a, date: today(), method: "Cash" }] }); };
  const remove = (r) => { if (!confirm("Delete?")) return; (r.payments || []).forEach((p) => pay.del(p.id)); del(r.id); };
  const vd = rows.find((r) => r.id === v), pd = rows.find((r) => r.id === pf?.id);

  if (vd) { const t = total(vd), st = Q ? "" : status(vd), c = cli(vd.clientId);
    return <div><div className="noprint" style={{ marginBottom: 12, display: "flex", gap: 8 }}>
      <button className={s.btn} onClick={() => print()}>⬇ Print / Save PDF</button><button onClick={() => wa(vd)}>WhatsApp</button><button onClick={() => setV(null)}>← Back</button></div>
      <div className={s.sheet}>
        <div className={s.hd}><h1>{BRAND}</h1><div><h2>{Q ? "QUOTATION" : "INVOICE"}</h2><div style={{ textAlign: "right" }}>{vd.no}</div></div></div>
        <div className={s.bd}>
          <div className={s.meta}><div><small>BILLED TO</small><br /><b>{c.name}</b><br />{c.company}<br />{c.phone} {c.email}</div>
            <div><small>DETAILS</small><br />Date: {vd.date}{vd.due && <><br />Due: {vd.due}</>}{vd.validTill && <><br />Valid till: {vd.validTill}</>}
              {!Q && <><br /><span className={s.stamp} style={{ color: COLORS[st] }}>{st.toUpperCase()}</span></>}</div></div>
          {Q && vd.service && <div className={s.note}><b>{vd.service}</b><div style={{ whiteSpace: "pre-line" }}>{vd.features}</div><small>⏱ {vd.delivery} · 🔁 {vd.revisions} revisions</small></div>}
          <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>
            {vd.items.map((i, k) => <tr key={k}><td>{k + 1}</td><td>{i.d}</td><td>{i.q}</td><td>{inr(i.r)}</td><td>{inr(i.q * i.r)}</td></tr>)}</tbody></table>
          <div className={s.tot}><div><span>Subtotal</span><b>{inr(t)}</b></div>
            {Q ? <div className={s.grand}><span>Total</span><span>{inr(t)}</span></div>
              : <><div><span>Paid</span><b style={{ color: "#16a34a" }}>{inr(vd.paid)}</b></div><div className={s.grand}><span>Balance due</span><span>{inr(t - (+vd.paid || 0))}</span></div></>}</div>
          {!Q && vd.payments?.length > 0 && <><h4>Payment history</h4><table><tbody>{vd.payments.map((p) => <tr key={p.id}><td>{p.date}</td><td>{p.method}</td><td>{inr(p.amount)}</td></tr>)}</tbody></table></>}
          {vd.terms && <div className={s.note}><b>Payment terms</b><br />{vd.terms}</div>}
        </div><div className={s.ft}>Thank you for your business · {BRAND}</div></div></div>; }

  return <div>
    <div className={s.bar}><h1>{Q ? "Quotations" : "Invoices"}</h1>
      <button className={s.btn} onClick={() => setF({ no: nextNo(rows, Q ? "QT-" : "INV-"), date: today(), items: [{ d: "", q: 1, r: 0 }], paid: 0, payments: [] })}>+ New</button></div>
    {f && <form className={s.card} onSubmit={save}><div className={s.form}>
      <label>Number<input value={f.no} onChange={set("no")} /></label>
      <label>Client<select value={f.clientId || ""} onChange={set("clientId")} required><option value="">--</option>{cl.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Date<input type="date" value={f.date} onChange={set("date")} /></label>
      {Q ? <><label>Valid till<input type="date" value={f.validTill || ""} onChange={set("validTill")} /></label>
        <label>Service<input value={f.service || ""} onChange={set("service")} /></label>
        <label>Delivery time<input value={f.delivery || ""} onChange={set("delivery")} /></label>
        <label>Revisions<input value={f.revisions || ""} onChange={set("revisions")} /></label>
        <label className={s.wide}>Features<textarea value={f.features || ""} onChange={set("features")} /></label></>
        : <label>Due date<input type="date" value={f.due || ""} onChange={set("due")} /></label>}
      <label className={s.wide}>Payment terms<textarea value={f.terms || ""} onChange={set("terms")} placeholder="50% advance, 50% on delivery" /></label>
      <label>Add from price template<select value="" onChange={(e) => { const t = tp.find((x) => x.id === e.target.value); t && setF({ ...f, items: [...f.items, { d: t.name, q: 1, r: t.price }] }); }}>
        <option value="">--</option>{tp.map((t) => <option key={t.id} value={t.id}>{t.name} ({inr(t.price)})</option>)}</select></label></div>
      {f.items.map((i, k) => <div className={s.row} key={k}>
        <input placeholder="Description" value={i.d} onChange={(e) => item(k, "d", e.target.value)} />
        <input type="number" style={{ width: 80 }} value={i.q} onChange={(e) => item(k, "q", +e.target.value)} />
        <input type="number" style={{ width: 120 }} value={i.r} onChange={(e) => item(k, "r", +e.target.value)} />
        <button type="button" onClick={() => setF({ ...f, items: f.items.filter((_, j) => j !== k) })}>✕</button></div>)}
      <button type="button" onClick={() => setF({ ...f, items: [...f.items, { d: "", q: 1, r: 0 }] })}>+ Item</button>
      <h3>Total: {inr(total(f))}</h3><button className={s.btn}>Save</button> <button type="button" onClick={() => setF(null)}>Cancel</button>
    </form>}
    <div className={s.tbl}><table><thead><tr><th>No</th><th>Client</th><th>Date</th><th>Total</th>{!Q && <><th>Paid</th><th>Status</th></>}<th></th></tr></thead>
      <tbody>{rows.map((r) => <tr key={r.id}><td>{r.no}</td><td>{name(r.clientId)}</td><td>{r.date}</td><td>{inr(total(r))}</td>
        {!Q && <><td>{inr(r.paid)}</td><td><Badge v={status(r)} /></td></>}
        <td style={{ whiteSpace: "nowrap" }}>{!Q && <button className={s.btn} onClick={() => setPf({ id: r.id, amount: "", method: "UPI", date: today() })}>+ Payment</button>} <button onClick={() => setV(r.id)}>PDF</button> <button onClick={() => setF(r)}>Edit</button> {Q && <button onClick={() => toInvoice(r)}>→ Invoice</button>} <button onClick={() => remove(r)}>✕</button></td></tr>)}</tbody></table></div>
    {pd && <div className={s.ov}><form className={s.card} onSubmit={addPay}>
      <h3 style={{ marginTop: 0 }}>{pd.no} · Balance {inr(total(pd) - (+pd.paid || 0))}</h3>
      <label>Amount<input type="number" value={pf.amount} onChange={(e) => setPf({ ...pf, amount: e.target.value })} required /></label>
      <label>Method<select value={pf.method} onChange={(e) => setPf({ ...pf, method: e.target.value })}>{["UPI", "Bank", "Cash"].map((m) => <option key={m}>{m}</option>)}</select></label>
      <label>Date<input type="date" value={pf.date} onChange={(e) => setPf({ ...pf, date: e.target.value })} /></label>
      {(pd.payments || []).map((p) => <div key={p.id} className={s.row}><span style={{ flex: 1 }}>{p.date} · {p.method} · {inr(p.amount)}</span><button type="button" onClick={() => rmPay(pd, p)}>✕</button></div>)}
      {legacy(pd) > 0 && <p><button type="button" onClick={() => sync(pd)}>Purane {inr(legacy(pd))} Finance me add karo</button></p>}
      <button className={s.btn}>Save payment</button> <button type="button" onClick={() => setPf(null)}>Close</button></form></div>}
  </div>;
}
