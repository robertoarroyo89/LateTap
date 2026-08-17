"use client";

import { Bell, CheckCircle2, Clock3, Mail, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { Locale } from "@/config/app";
import { categories, type CategoryId } from "@/config/categories";
import type { AlertDurationHours, AlertPreference, AvailabilityNotification } from "@/types/domain";

async function loadJson<T>(url: string): Promise<T[]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Request failed");
  const payload = await response.json() as { data?: { items?: T[] } };
  return payload.data?.items ?? [];
}

export function AlertsManager({ locale }: { locale: Locale }) {
  const spanish = locale === "es";
  const [items, setItems] = useState<AlertPreference[]>([]);
  const [notifications, setNotifications] = useState<AvailabilityNotification[]>([]);
  const [categoryId, setCategoryId] = useState<CategoryId>("hair");
  const [durationHours, setDurationHours] = useState<AlertDurationHours>(48);
  const [pending, setPending] = useState<string>();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const [alerts, matches] = await Promise.all([
        loadJson<AlertPreference>("/api/v1/me/alerts"),
        loadJson<AvailabilityNotification>("/api/v1/me/notifications"),
      ]);
      setItems(alerts);
      setNotifications(matches);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([
      loadJson<AlertPreference>("/api/v1/me/alerts"),
      loadJson<AvailabilityNotification>("/api/v1/me/notifications"),
    ]).then(([alerts, matches]) => {
      if (!active) return;
      setItems(alerts);
      setNotifications(matches);
      setError(false);
      setLoading(false);
    }).catch(() => {
      if (active) {
        setError(true);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const create = async () => {
    setPending("create");
    const response = await fetch("/api/v1/me/alerts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ categoryId, datePreference: "both", radiusKm: 10, durationHours, locale }),
    });
    setPending(undefined);
    if (!response.ok) return setError(true);
    await load();
  };

  const toggle = async (item: AlertPreference) => {
    setPending(item.id);
    const active = item.enabled && new Date(item.expiresAt).getTime() > now;
    const response = await fetch(`/api/v1/me/alerts/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: !active }),
    });
    setPending(undefined);
    if (!response.ok) return setError(true);
    await load();
  };

  const remove = async (item: AlertPreference) => {
    if (!window.confirm(spanish ? "¿Eliminar este aviso?" : "Delete this alert?")) return;
    setPending(item.id);
    const response = await fetch(`/api/v1/me/alerts/${item.id}`, { method: "DELETE" });
    setPending(undefined);
    if (!response.ok) return setError(true);
    setItems((current) => current.filter((candidate) => candidate.id !== item.id));
  };

  const markRead = async (notification: AvailabilityNotification) => {
    if (notification.readAt) return;
    const response = await fetch("/api/v1/me/notifications", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: notification.id }),
    });
    if (response.ok) setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item));
  };

  return (
    <div className="alerts-page-content">
      {notifications.length > 0 && (
        <section className="alert-matches" aria-labelledby="alert-matches-title">
          <div className="section-heading-row">
            <div><p className="kicker">{spanish ? "NOVEDADES" : "NEW MATCHES"}</p><h2 id="alert-matches-title">{spanish ? "Citas para ti" : "Appointments for you"}</h2></div>
            <span>{notifications.filter((item) => !item.readAt).length} {spanish ? "nuevas" : "new"}</span>
          </div>
          <div className="notification-list">
            {notifications.map((notification) => (
              <article key={notification.id} className={notification.readAt ? "read" : "unread"}>
                <span className="notification-icon"><Bell size={18} /></span>
                <div>
                  <strong>{notification.serviceName}</strong>
                  <span>{notification.businessName} · {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.startAt))}</span>
                  {notification.emailDelivered && <small><Mail size={12} />{spanish ? "También enviado por email" : "Also sent by email"}</small>}
                </div>
                <Link href={`/${locale}/slot/${notification.slotId}`} onClick={() => void markRead(notification)}>{spanish ? "Ver cita" : "View appointment"}</Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="my-alerts-title">
        <div className="section-heading-row"><div><p className="kicker">MY LATETAP</p><h2 id="my-alerts-title">{spanish ? "Mis avisos" : "My alerts"}</h2></div></div>
        <div className="alert-creator">
          <label>{spanish ? "Categoría" : "Category"}<select value={categoryId} onChange={(event) => setCategoryId(event.target.value as CategoryId)}>{categories.map((item) => <option value={item.id} key={item.id}>{spanish ? item.labelEs : item.labelEn}</option>)}</select></label>
          <label>{spanish ? "Duración" : "Duration"}<select value={durationHours} onChange={(event) => setDurationHours(Number(event.target.value) as AlertDurationHours)}>{[24, 48, 72].map((hours) => <option key={hours} value={hours}>{hours} h</option>)}</select></label>
          <button type="button" disabled={pending === "create"} onClick={create}>{pending === "create" ? "…" : spanish ? "Crear aviso" : "Create alert"}</button>
        </div>
        {error && <p className="form-error" role="alert">{spanish ? "No hemos podido actualizar tus avisos." : "We couldn't update your alerts."}</p>}
        {loading && <div className="dashboard-notice">{spanish ? "Cargando tus avisos…" : "Loading your alerts…"}</div>}
        <div className="management-list alert-management-list">
          {items.map((item) => {
            const expired = new Date(item.expiresAt).getTime() <= now;
            const active = item.enabled && !expired;
            const category = categories.find((candidate) => candidate.id === item.categoryId);
            return (
              <article key={item.id}>
                <span className="notification-icon"><Clock3 size={18} /></span>
                <div>
                  <strong>{category ? (spanish ? category.labelEs : category.labelEn) : spanish ? "Negocio guardado" : "Saved business"}</strong>
                  <span>{active ? (spanish ? `Activo hasta ${new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.expiresAt))}` : `Active until ${new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.expiresAt))}`) : expired ? (spanish ? "Aviso finalizado" : "Alert expired") : (spanish ? "Aviso pausado" : "Alert paused")}</span>
                </div>
                <span className={`status-badge ${active ? "confirmed" : ""}`}>{active ? (spanish ? "Activo" : "Active") : expired ? (spanish ? "Finalizado" : "Expired") : (spanish ? "Pausado" : "Paused")}</span>
                <div className="row-actions">
                  <button type="button" disabled={pending === item.id} onClick={() => toggle(item)}>{active ? (spanish ? "Pausar" : "Pause") : (spanish ? "Activar" : "Activate")}</button>
                  <button type="button" className="icon-danger" disabled={pending === item.id} aria-label={spanish ? "Eliminar aviso" : "Delete alert"} onClick={() => remove(item)}><Trash2 size={15} /></button>
                </div>
              </article>
            );
          })}
        </div>
        {!loading && !items.length && !error && <div className="market-empty"><CheckCircle2 /><h3>{spanish ? "No tienes avisos activos" : "You have no alerts"}</h3><p>{spanish ? "Crea uno para enterarte cuando aparezca una cita." : "Create one to hear when an appointment appears."}</p></div>}
      </section>
    </div>
  );
}
