"use client";
import { useEffect, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQ } from "@/lib/hooks";
import s from "./ui.module.css";
export default function Chat({ b, me, onClose }) {
  const cli = me.uid === b.clientUid, msgs = [...useQ("messages", "bookingId", b.id, cli ? "clientUid" : "freelancerId", me.uid)].reverse(), [t, setT] = useState(""), end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView(); }, [msgs.length]);
  const send = async (e) => { e.preventDefault(); const text = t.trim(); if (!text) return; setT("");
    try { await addDoc(collection(db, "messages"), { bookingId: b.id, clientUid: b.clientUid, freelancerId: b.freelancerId, senderUid: me.uid, senderName: (me.displayName || me.email.split("@")[0]).slice(0, 100), text, createdAt: serverTimestamp() }); }
    catch { alert("Message could not be sent. Chat is available once the request has been accepted."); } };
  return <div className={s.ov}><div className={s.card} style={{ display: "flex", flexDirection: "column", height: "min(560px,90vh)", margin: 0 }}>
    <div className={s.bar} style={{ marginBottom: 8 }}><b>💬 {b.serviceTitle}</b><button onClick={onClose}>Close</button></div>
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: "4px 2px" }}>
      {msgs.map((m) => { const mine = m.senderUid === me.uid; return <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "80%", background: mine ? "#2563eb" : "#eff6ff", color: mine ? "#fff" : "#0f2744", padding: "8px 12px", borderRadius: 14, fontSize: 14, whiteSpace: "pre-wrap" }}>{!mine && <b style={{ display: "block", fontSize: 11 }}>{m.senderName}</b>}{m.text}</div>; })}
      {!msgs.length && <small style={{ color: "var(--mut)" }}>No messages yet. Say hello 👋</small>}<div ref={end} /></div>
    <form onSubmit={send} className={s.row} style={{ marginTop: 10, marginBottom: 0 }}><input value={t} onChange={(e) => setT(e.target.value)} placeholder="Type a message…" maxLength={1000} /><button className={s.btn}>Send</button></form></div></div>;
}
