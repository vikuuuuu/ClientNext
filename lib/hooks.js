"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, limit, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "./firebase";
export const logEvent = (uid, action, detail = "") => uid ? addDoc(collection(db, "logs"), { uid, action, detail: String(detail).slice(0, 200), ua: (navigator.userAgent || "").slice(0, 90), createdAt: Date.now() }).catch(() => {}) : Promise.resolve();
export function useUser() {
  const [u, setU] = useState(undefined);
  useEffect(() => onAuthStateChanged(auth, (x) => setU(x || null)), []);
  return u;
}
export function useSettings(uid) {
  const [s, setS] = useState(null);
  useEffect(() => { if (uid) return onSnapshot(doc(db, "settings", uid), (x) => setS(x.data() || {})); }, [uid]);
  return s;
}
export function useSite() { // public business card (UPI id etc.)
  const [s, setS] = useState(null);
  useEffect(() => { getDocs(query(collection(db, "site"), limit(1))).then((x) => setS(x.docs[0]?.data() || {})).catch(() => setS({})); }, []);
  return s;
}
export function useProfile(uid) { // undefined = loading, null = none
  const [p, setP] = useState(undefined);
  useEffect(() => { if (uid) return onSnapshot(doc(db, "profiles", uid), (x) => setP(x.data() || null), () => setP(null)); }, [uid]);
  return p;
}
const newest = (a, b) => (b.createdAt || 0) - (a.createdAt || 0);
// useQ(name, field, value): rows where field==value. useQ(name): all docs (admin only)
export function useQ(name, field, val, f2, v2) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if ((field && !val) || (f2 && !v2)) return;
    const q = field ? query(collection(db, name), where(field, "==", val), ...(f2 ? [where(f2, "==", v2)] : [])) : collection(db, name);
    return onSnapshot(q, (s) => setRows(s.docs.map((d) => { const x = d.data(); return { id: d.id, ...x, createdAt: x.createdAt?.toMillis ? x.createdAt.toMillis() : x.createdAt }; }).sort(newest)), () => setRows([]));
  }, [name, field, val, f2, v2]);
  return rows;
}
// Auto-accept: pending inquiries are accepted 10s after creation unless handled manually.
// Enforced by Firestore rules via server time (works while any party's dashboard is open).
export function useAutoAccept(rows) {
  useEffect(() => {
    const go = (b) => updateDoc(doc(db, "bookings", b.id), { status: "accepted", updatedAt: Date.now() });
    const t = rows.filter((b) => b.status === "pending" && b.createdAt).map((b) => setTimeout(() => go(b).catch(() => setTimeout(() => go(b).catch(() => {}), 4000)), Math.max(0, b.createdAt + 10500 - Date.now())));
    return () => t.forEach(clearTimeout);
  }, [rows]);
}
export function useCol(name, uid, field = "uid") {
  const rows = useQ(name, field, uid), lg = (a, d) => field === "uid" && name !== "logs" && logEvent(uid, `${name}.${a}`, d);
  return {
    rows,
    add: async (d) => { const r = await addDoc(collection(db, name), { ...d, [field]: uid, createdAt: Date.now() }); lg("create", d.no || d.name || d.title || d.code || ""); return r; },
    upd: async (id, d) => { await updateDoc(doc(db, name, id), d); lg("update", d.no || d.status || id); },
    del: async (id) => { await deleteDoc(doc(db, name, id)); lg("delete", id); },
  };
}
