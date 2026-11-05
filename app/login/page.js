"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logEvent } from "@/lib/hooks";
import s from "@/components/ui.module.css";
const SIGNUP = process.env.NEXT_PUBLIC_ALLOW_SIGNUP === "true";
export default function Login() {
  const r = useRouter(), [e, setE] = useState(""), [p, setP] = useState(""), [n, setN] = useState(false), [err, setErr] = useState("");
  const go = async (ev) => {
    ev.preventDefault();
    try { const c = await (n ? createUserWithEmailAndPassword : signInWithEmailAndPassword)(auth, e, p); await logEvent(c.user.uid, "auth.login"); r.replace("/dashboard"); }
    catch { setErr("Invalid email or password"); }
  };
  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg,#eff6ff,#bfdbfe 60%,#7dd3fc)" }}>
    <form onSubmit={go} className={s.card} style={{ width: 360 }}>
      <h2 style={{ marginTop: 0 }}>🔐 {n ? "Create account" : "Welcome back"}</h2>
      <label>Email<input type="email" value={e} onChange={(x) => setE(x.target.value)} required /></label>
      <label>Password<input type="password" value={p} onChange={(x) => setP(x.target.value)} required minLength={8} /></label>
      {err && <p style={{ color: "#dc2626", fontSize: 13 }}>{err}</p>}
      <button className={s.btn} style={{ width: "100%" }}>{n ? "Sign up" : "Login"}</button>
      {SIGNUP && <p style={{ textAlign: "center" }}><a href="#" onClick={(x) => { x.preventDefault(); setN(!n); }}>{n ? "Have account? Login" : "New? Sign up"}</a></p>}
    </form></div>;
}
