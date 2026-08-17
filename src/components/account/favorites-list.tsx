"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { Locale } from "@/config/app";

type Favorite = { businessId: string; name: string; slug: string; categoryId: string };
export function FavoritesList({ locale }: { locale: Locale }) {
  const [items, setItems] = useState<Favorite[]>([]); const load = useCallback(() => fetch("/api/v1/me/favorites").then((response) => response.json()).then((payload) => setItems(payload.data?.items ?? [])), []); useEffect(() => { void load(); }, [load]);
  const remove = async (businessId: string) => { await fetch("/api/v1/me/favorites", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ businessId }) }); void load(); };
  if (!items.length) return <div className="market-empty"><h3>{locale === "es" ? "Aún no has guardado negocios" : "No saved businesses yet"}</h3><p>{locale === "es" ? "Guarda tus favoritos para encontrar sus próximas citas más rápido." : "Save favorites to find their next openings faster."}</p></div>;
  return <div className="management-list">{items.map((item) => <article key={item.businessId}><div><Link href={`/${locale}/business/${item.slug}`}><strong>{item.name}</strong></Link><span>{item.categoryId}</span></div><button onClick={() => remove(item.businessId)}>{locale === "es" ? "Quitar" : "Remove"}</button></article>)}</div>;
}
