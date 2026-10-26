"use client";
import { useState } from "react";
import { useUser, useCol } from "@/lib/hooks";
import s from "./ui.module.css";
// lock(row)=true => Edit/Delete band (auto entries)
export default function Crud({ title, col, fields, cols, more = [], defaults = {}, lock = () => false, extra }) {
  const u = useUser(), { rows, add, upd, del } = useCol(col, u?.uid), [f, setF] = useState(null);
  const set = (k, t) => (e) => setF({ ...f, [k]: t === "number" ? +e.target.value : e.target.value });
  const save = async (e) => { e.preventDefault(); const { id, ...d } = f; id ? await upd(id, d) : await add(d); setF(null); };
  return <div>
    <div className={s.bar}><h1>{title}</h1><div className={s.row}>{extra?.(rows)}<button className={s.btn} onClick={() => setF({ ...defaults })}>+ Add</button></div></div>
    {f && <form className={s.card} onSubmit={save}><div className={s.form}>
      {fields.map((x) => <label key={x.k} className={x.type === "textarea" ? s.wide : ""}>{x.label}
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
        <td>{lock(r) ? "🔒" : <><button onClick={() => setF(r)}>Edit</button> <button onClick={() => confirm("Delete?") && del(r.id)}>✕</button></>}</td>
      </tr>)}</tbody></table></div>
  </div>;
}
