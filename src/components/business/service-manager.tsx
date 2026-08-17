"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { Locale } from "@/config/app";
import { categories } from "@/config/categories";

type Service = { id: string; nameEs: string; nameEn?: string; categoryId: string; regularPriceCents: number; durationMinutes: number; active: boolean };
type Form = { nameEs: string; nameEn: string; categoryId: string; regularPrice: number; durationMinutes: number };

export function ServiceManager({ locale }: { locale: Locale }) {
  const [items, setItems] = useState<Service[]>([]); const [error, setError] = useState<string>();
  const { register, handleSubmit, reset } = useForm<Form>({ defaultValues: { categoryId: "hair", durationMinutes: 45 } });
  const load = useCallback(() => fetch("/api/v1/business/services").then((response) => response.json()).then((payload) => setItems(payload.data?.items ?? [])).catch(() => setError("Firebase not configured")), []);
  useEffect(() => { void load(); }, [load]);

  const submit = async (data: Form) => {
    setError(undefined); const response = await fetch("/api/v1/business/services", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ nameEs: data.nameEs, nameEn: data.nameEn || undefined, categoryId: data.categoryId, regularPriceCents: Math.round(data.regularPrice * 100), durationMinutes: Number(data.durationMinutes), active: true }) });
    if (!response.ok) { setError((await response.json()).error?.message); return; } reset(); void load();
  };

  const edit = async (item: Service) => {
    const nameEs = prompt(locale === "es" ? "Nombre del servicio" : "Service name", item.nameEs); if (!nameEs) return;
    const price = prompt(locale === "es" ? "Precio habitual (€)" : "Regular price (€)", String(item.regularPriceCents / 100)); if (!price || Number(price) <= 0) return;
    const response = await fetch(`/api/v1/business/services/${item.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ nameEs, regularPriceCents: Math.round(Number(price) * 100) }) });
    if (!response.ok) setError((await response.json()).error?.message); else void load();
  };

  const deactivate = async (item: Service) => {
    if (!confirm(locale === "es" ? "¿Desactivar este servicio?" : "Deactivate this service?")) return;
    const response = await fetch(`/api/v1/business/services/${item.id}`, { method: "DELETE" }); if (!response.ok) setError((await response.json()).error?.message); else void load();
  };

  return <div><header className="dashboard-heading"><p className="kicker">CATALOGUE</p><h1>{locale === "es" ? "Servicios" : "Services"}</h1></header><form className="inline-service-form" onSubmit={handleSubmit(submit)}><input placeholder={locale === "es" ? "Nombre del servicio" : "Service name"} {...register("nameEs", { required: true })} /><select {...register("categoryId")}>{categories.map((item) => <option value={item.id} key={item.id}>{locale === "es" ? item.labelEs : item.labelEn}</option>)}</select><input type="number" step=".01" placeholder="€" {...register("regularPrice", { required: true, valueAsNumber: true })} /><select {...register("durationMinutes", { valueAsNumber: true })}>{[15,30,45,60,90].map((value) => <option value={value} key={value}>{value} min</option>)}</select><button>{locale === "es" ? "Añadir" : "Add"}</button></form>{error && <p className="form-error">{error}</p>}<div className="management-list">{items.map((item) => <article key={item.id}><div><strong>{locale === "en" && item.nameEn ? item.nameEn : item.nameEs}</strong><span>{item.durationMinutes} min</span></div><b>{(item.regularPriceCents / 100).toFixed(0)} €</b><span className="status-badge">{item.active ? "Active" : "Inactive"}</span><span className="row-actions"><button onClick={() => edit(item)}>{locale === "es" ? "Editar" : "Edit"}</button>{item.active && <button onClick={() => deactivate(item)}>{locale === "es" ? "Desactivar" : "Disable"}</button>}</span></article>)}</div></div>;
}
