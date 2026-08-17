"use client";

import { useCallback, useEffect, useState } from "react";

import type { Locale } from "@/config/app";
import { categories } from "@/config/categories";

type Alert = { id: string; categoryId?: string; datePreference?: string; enabled: boolean };
export function AlertsManager({ locale }: { locale: Locale }) {
  const [items, setItems] = useState<Alert[]>([]); const [categoryId, setCategoryId] = useState("hair"); const load = useCallback(() => fetch("/api/v1/me/alerts").then((response) => response.json()).then((payload) => setItems(payload.data?.items ?? [])), []); useEffect(() => { void load(); }, [load]);
  const create = async () => { await fetch("/api/v1/me/alerts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ categoryId, datePreference: "both", radiusKm: 10, locale }) }); void load(); };
  return <div><div className="alert-creator"><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((item) => <option value={item.id} key={item.id}>{locale === "es" ? item.labelEs : item.labelEn}</option>)}</select><button onClick={create}>{locale === "es" ? "Crear alerta" : "Create alert"}</button></div><div className="management-list">{items.map((item) => <article key={item.id}><div><strong>{categories.find((category) => category.id === item.categoryId)?.[locale === "es" ? "labelEs" : "labelEn"] ?? item.categoryId}</strong><span>{item.datePreference === "both" ? (locale === "es" ? "Hoy y mañana" : "Today and tomorrow") : item.datePreference}</span></div><span className="status-badge">{item.enabled ? "Active" : "Disabled"}</span></article>)}</div>{!items.length && <div className="market-empty"><h3>{locale === "es" ? "No tienes alertas" : "You have no alerts"}</h3></div>}</div>;
}
