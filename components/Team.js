import s from "./site.module.css";
const https = (u) => /^https:\/\//.test(u || "");
export default function Team({ list }) {
  return <div className={s.cards}>{list.map((p) => <div key={p.id} className={s.team}>
    <div className={s.av}>{https(p.image) ? <img src={p.image} alt={p.name} referrerPolicy="no-referrer" /> : p.name?.[0]}</div>
    <b>{p.name}</b><small>{p.title}</small><p>{p.bio}</p>
    <div className={s.chips}>{(p.skills || "").split(",").map((k) => k.trim()).filter(Boolean).slice(0, 6).map((k) => <span key={k}>{k}</span>)}</div>
    <div className={s.thumbs}>{(p.items || []).filter((i) => https(i.url)).slice(0, 3).map((i, k) => <a key={k} href={i.url} target="_blank" rel="noopener noreferrer">{https(i.img) ? <img src={i.img} alt={i.title} referrerPolicy="no-referrer" /> : i.title}</a>)}</div>
    {https(p.portfolioUrl) && <a className={s.link} href={p.portfolioUrl} target="_blank" rel="noopener noreferrer">View portfolio ↗</a>}</div>)}</div>;
}
