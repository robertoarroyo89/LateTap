"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { Locale } from "@/config/app";
import { formatPrice, formatSlotDate, localizedServiceName } from "@/lib/format";
import type { Slot } from "@/types/domain";

export function SlotManager({ locale }: { locale: Locale }) {
  const [items, setItems] = useState<Slot[]>([]); const [error, setError] = useState<string>();
  const load = useCallback(() => fetch("/api/v1/business/slots").then((response) => response.json()).then((payload) => setItems(payload.data?.items ?? [])).catch(() => setItems([])), []);
  useEffect(() => { void load(); }, [load]);
  const cancel = async (id: string) => { if (!confirm(locale === "es" ? "¿Cancelar esta cita?" : "Cancel this slot?")) return; const response = await fetch(`/api/v1/business/slots/${id}`, { method: "DELETE" }); if (!response.ok) setError((await response.json()).error?.message); else void load(); };
  const edit = async (item: Slot) => { const price = prompt(locale === "es" ? "Nuevo precio (€)" : "New price (€)", String(item.priceCents / 100)); if (!price || Number(price) <= 0) return; const response = await fetch(`/api/v1/business/slots/${item.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ priceCents: Math.round(Number(price) * 100) }) }); if (!response.ok) setError((await response.json()).error?.message); else void load(); };
  const duplicate = async (item: Slot) => { const initial = new Date(new Date(item.startAt).getTime() + 24 * 60 * 60_000).toISOString().slice(0, 16); const value = prompt(locale === "es" ? "Nueva fecha y hora (YYYY-MM-DDTHH:mm)" : "New date and time (YYYY-MM-DDTHH:mm)", initial); if (!value) return; const start = new Date(value); if (Number.isNaN(start.getTime())) return; const response = await fetch(`/api/v1/business/slots/${item.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ startAt: start.toISOString() }) }); if (!response.ok) setError((await response.json()).error?.message); else void load(); };
  return <div><header className="dashboard-heading row"><div><p className="kicker">INVENTORY</p><h1>{locale === "es" ? "Citas publicadas" : "Published slots"}</h1></div><Link className="quick-add small" href={`/${locale}/business-dashboard/slots/new`}>+ {locale === "es" ? "Publicar" : "Add"}</Link></header>{error && <p className="form-error">{error}</p>}<div className="management-list">{items.map((item) => <article key={item.id}><div><strong>{localizedServiceName(item.serviceSnapshot, locale)}</strong><span>{formatSlotDate(item.startAt, locale, item.timezone)}</span></div><b>{formatPrice(item.priceCents, item.currency, locale)}</b><span className={`status-badge ${item.status}`}>{item.status}</span><span className="row-actions">{item.status === "published" && <button onClick={() => edit(item)}>{locale === "es" ? "Editar" : "Edit"}</button>}<button onClick={() => duplicate(item)}>{locale === "es" ? "Duplicar" : "Duplicate"}</button>{item.status === "published" && <button onClick={() => cancel(item.id)}>{locale === "es" ? "Cancelar" : "Cancel"}</button>}</span></article>)}</div>{!items.length && <div className="dashboard-notice">{locale === "es" ? "Aún no hay citas." : "No slots yet."}</div>}</div>;
}
