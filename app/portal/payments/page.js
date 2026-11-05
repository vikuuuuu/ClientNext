"use client";
import { useUser, useQ } from "@/lib/hooks";
import PayTable from "@/components/PayTable";
import s from "@/components/ui.module.css";
export default function Pay() { const u = useUser(); return <div><div className={s.bar}><h1>Payment history</h1></div><PayTable rows={useQ("payments", "clientUid", u?.uid)} /></div>; }
