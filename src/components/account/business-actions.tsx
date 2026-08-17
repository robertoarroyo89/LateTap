"use client";

import { Flag, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Locale } from "@/config/app";

export function CustomerBusinessActions({ businessId, locale }: { businessId: string; locale: Locale }) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(false); const [status, setStatus] = useState<string>();
  useEffect(() => { fetch("/api/v1/me/favorites").then((response) => response.ok ? response.json() : null).then((payload) => setFavorite(payload?.data?.items?.some((item: { businessId: string }) => item.businessId === businessId) ?? false)).catch(() => undefined); }, [businessId]);
  const toggle = async () => { const response = await fetch("/api/v1/me/favorites", { method: favorite ? "DELETE" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ businessId }) }); if (response.status === 401) { router.push(`/${locale}/login`); return; } if (response.ok) setFavorite((value) => !value); else setStatus((await response.json()).error?.message); };
  const report = async () => { const details = prompt(locale === "es" ? "¿Qué problema has encontrado?" : "What problem did you find?"); if (!details) return; const response = await fetch("/api/v1/reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entityType: "business", entityId: businessId, reason: "other", details }) }); setStatus(response.ok ? (locale === "es" ? "Reporte enviado. Gracias." : "Report sent. Thank you.") : (locale === "es" ? "Inicia sesión para reportar." : "Sign in to report.")); };
  return <div className="customer-business-actions"><button onClick={toggle} aria-pressed={favorite}><Heart size={17} fill={favorite ? "currentColor" : "none"} />{favorite ? (locale === "es" ? "Guardado" : "Saved") : (locale === "es" ? "Guardar" : "Save")}</button><button onClick={report}><Flag size={16} />{locale === "es" ? "Reportar" : "Report"}</button>{status && <small role="status">{status}</small>}</div>;
}
