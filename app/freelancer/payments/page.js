"use client";
import { useUser, useQ } from "@/lib/hooks";
import PayTable from "@/components/PayTable";
import s from "@/components/ui.module.css";
export default function Earnings() { const u = useUser(); return <div><div className={s.bar}><h1>Earnings & transactions</h1></div><PayTable fee rows={useQ("payments", "freelancerId", u?.uid)} /></div>; }
