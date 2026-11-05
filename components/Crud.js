"use client";
import { useState } from "react";
import { useUser, useCol } from "@/lib/hooks";
import s from "./ui.module.css";
// type: text|number|date|select|textarea|multi  | lock(row) | beforeSave(d) | afterSave(row)
export default function Crud({ field = "uid", title, col, fields, cols, more = [], defaults = {}, lock = () => false, extra, beforeSave, afterSave }) {
  const u = useUser(), { rows, add, upd, del } = useCol(col, u?.uid, field), [f, setF] = useState(null);
  const set = (k, t) => (e) => setF({ ...f, [k]: t === "number" ? +e.target.value : e.target.value });
  const save = async (e) => { e.preventDefault(); const { id, ...d0 } = f, d = beforeSave ? beforeSave(d0) : d0;
    let pid = id; if (id) await upd(id, d); else pid = (await add(d)).id; afterSave?.({ ...d, id: pid }); setF(null); };
  const multi = (x) => { const a = f[x.k] || []; return <div key={x.k} className={s.wide}><small style={{ fontWeight: 600, color: "var(--mut)" }}>{x.label}</small>
    <div className={s.row} style={{ marginTop: 6 }}>{x.options.length ? x.options.map((o) => { const on = a.includes(o.v);
      return <button type="button" key={o.v} onClick={() => setF({ ...f, [x.k]: on ? a.filter((z) => z !== o.v) : [...a, o.v] })} style={on ? { background: "#2563eb", color: "#fff", borderColor: "#2563eb" } : {}}>{on ? "✓ " : ""}{o.l}</button>; }) : <small>Pehle freelancers add karo</small>}</div></div>; };
  return <div>
    <div className={s.bar}><h1>{title}</h1><div className={s.row}>{extra?.(rows)}<button className={s.btn} onClick={() => setF({ ...defaults })}>+ Add</button></div></div>
    {f && <form className={s.card} onSubmit={save}><div className={s.form}>
      {fields.map((x) => x.type === "multi" ? multi(x) : <label key={x.k} className={x.type === "textarea" ? s.wide : ""}>{x.label}
        {x.type === "select" ? <select value={f[x.k] ?? ""} onChange={set(x.k)} required={x.req}><option value="">--</option>
          {x.options.map((o) => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}</select>
        : x.type === "textarea" ? <textarea rows={3} value={f[x.k] ?? ""} onChange={set(x.k)} />
        : <input type={x.type || "text"} value={f[x.k] ?? ""} onChange={set(x.k, x.type)} required={x.req} />}
      </label>)}</div>
      <button className={s.btn}>Save</button> <button type="button" onClick={() => setF(null)}>Cancel</button>
    </form>}
    <div className={s.tbl}><table><thead><tr>
      {cols.map((c) => <th key={c.k}>{c.label}</th>)}{more.map((m) => <th key={m.label}>{m.label}</th>)}<th></th></tr></thead>
      <tbody>{rows.map((r) => <tr key={r.id}>
        {cols.map((c) => <td key={c.k}>{c.fmt ? c.fmt(r[c.k], r) : r[c.k]}</td>)}
        {more.map((m) => <td key={m.label}>{m.fn(r)}</td>)}
        <td style={{ whiteSpace: "nowrap" }}>{lock(r) ? "🔒" : <><button onClick={() => setF(r)}>Edit</button> <button onClick={() => confirm("Delete?") && del(r.id)}>✕</button></>}</td>
      </tr>)}</tbody></table></div>
  </div>;
}
