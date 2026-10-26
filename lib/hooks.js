"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "./firebase";
export function useUser() {
  const [u, setU] = useState(undefined);
  useEffect(() => onAuthStateChanged(auth, (x) => setU(x || null)), []);
  return u;
}
export function useCol(name, uid) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(query(collection(db, name), where("uid", "==", uid)), (s) =>
      setRows(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))));
  }, [name, uid]);
  return {
    rows,
    add: (d) => addDoc(collection(db, name), { ...d, uid, createdAt: Date.now() }),
    upd: (id, d) => updateDoc(doc(db, name, id), d),
    del: (id) => deleteDoc(doc(db, name, id)),
  };
}
