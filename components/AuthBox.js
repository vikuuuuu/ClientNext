"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useUser } from "@/lib/hooks";
import s from "./ui.module.css";
const OWNER = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").toLowerCase(), HOME = { client: "/portal", freelancer: "/freelancer" };
const wrap = { minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg,#eff6ff,#bfdbfe 60%,#7dd3fc)", padding: 16 };
const lnk = { padding: "9px 16px", borderRadius: 10, textDecoration: "none", display: "inline-block" };
function Card({ title, children }) { return <div style={wrap}><div className={s.card} style={{ width: "min(460px,100%)", textAlign: "center" }}><h2 style={{ marginTop: 0 }}>{title}</h2>{children}<p><button onClick={() => signOut(auth)}>Log out</button></p></div></div>; }
// Only an account whose role matches this portal gets in; blocked accounts are shut out live.
function Roled({ u, role, children }) {
  const [d, setD] = useState(undefined);
  useEffect(() => { let un; (async () => { try { const r = doc(db, "users", u.uid);
    if (!(await getDoc(r)).exists()) { const fl = (await getDoc(doc(db, "profiles", u.uid))).exists(); await setDoc(r, { email: u.email.toLowerCase(), name: "", role: fl ? "freelancer" : role, blocked: false, createdAt: Date.now() }); }
    un = onSnapshot(r, (y) => setD(y.data() || null), () => setD(null)); } catch { setD(null); } })(); return () => un && un(); }, [u.uid]); // eslint-disable-line
  if (d === undefined) return null;
  if (!d) return <Card title="Something went wrong"><p>We could not verify your account. Please try again.</p></Card>;
  if (d.blocked) return <Card title="Account suspended"><p>Your account has been blocked by the administrator. Please contact support.</p></Card>;
  if (d.role !== role) return <Card title="Wrong portal"><p>This account is registered as a <b>{d.role}</b>, so it cannot sign in here.</p><Link href={HOME[d.role]} className={s.btn} style={lnk}>Go to the {d.role} portal</Link></Card>;
  return children(u, d);
}
export default function AuthBox({ role, title, sub, children }) {
  const u = useUser(), [up, setUp] = useState(false), [e, setE] = useState(""), [p, setP] = useState(""), [p2, setP2] = useState(""), [msg, setMsg] = useState(""), [wait, setWait] = useState(false);
  if (u === undefined) return null;
  if (u?.emailVerified) return u.email.toLowerCase() === OWNER ? <Card title="Administrator account"><p>This is the admin account. Please use the admin dashboard.</p><Link href="/dashboard" className={s.btn} style={lnk}>Open admin dashboard</Link></Card> : <Roled u={u} role={role}>{children}</Roled>;
  const go = async (ev) => { ev.preventDefault(); setMsg("");
    if (up && (p !== p2 || !/^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/.test(p))) return setMsg("Use 8+ characters with a letter and a number, and confirm it");
    try { if (up) { const c = await createUserWithEmailAndPassword(auth, e, p); await setDoc(doc(db, "users", c.user.uid), { email: e.toLowerCase(), name: "", role, blocked: false, createdAt: Date.now() }).catch(() => {}); await sendEmailVerification(c.user); } else await signInWithEmailAndPassword(auth, e, p); }
    catch { setMsg(up ? "Could not register (the email may already be in use)" : "Incorrect email or password"); } };
  if (u) return <Card title="📧 Verify your email"><p>{u.email} — we sent a verification link. You need to verify before you can continue.</p>
    <button className={s.btn} onClick={async () => { await auth.currentUser.reload(); await auth.currentUser.getIdToken(true); location.reload(); }}>I've verified my email</button>{" "}
    <button disabled={wait} onClick={() => { setWait(true); sendEmailVerification(auth.currentUser).then(() => alert("Verification email sent again")); setTimeout(() => setWait(false), 60000); }}>Resend</button></Card>;
  return <div style={wrap}><form onSubmit={go} className={s.card} style={{ width: "min(400px,100%)" }}>
    <h2 style={{ marginTop: 0 }}>{up ? `Create ${role} account` : title}</h2><p style={{ color: "var(--mut)", fontSize: 13, marginTop: 0 }}>{sub}</p>
    <label>Email<input type="email" value={e} onChange={(x) => setE(x.target.value)} required /></label><label>Password<input type="password" value={p} onChange={(x) => setP(x.target.value)} required /></label>
    {up && <label>Confirm password<input type="password" value={p2} onChange={(x) => setP2(x.target.value)} required /></label>}
    {msg && <p style={{ color: "#dc2626", fontSize: 13 }}>{msg}</p>}<button className={s.btn} style={{ width: "100%" }}>{up ? "Sign up & verify email" : "Log in"}</button>
    <p style={{ textAlign: "center", fontSize: 13 }}><a href="#" onClick={(x) => { x.preventDefault(); setUp(!up); setMsg(""); }}>{up ? "Already registered? Log in" : "New here? Register"}</a>
      {!up && e && <> · <a href="#" onClick={(x) => { x.preventDefault(); sendPasswordResetEmail(auth, e).then(() => setMsg("Password reset email sent")); }}>Forgot password?</a></>}</p></form></div>;
}
