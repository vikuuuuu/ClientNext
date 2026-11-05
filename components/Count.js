"use client";
import { useEffect, useState } from "react";
export default function Count({ b }) {
  const [, tick] = useState(0);
  useEffect(() => { const i = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(i); }, []);
  const left = b.createdAt ? Math.ceil((b.createdAt + 10000 - Date.now()) / 1000) : 10;
  return <small style={{ color: "var(--mut)" }}>{left > 0 ? `Auto-accepting in ${left}s` : "Accepting…"}</small>;
}
