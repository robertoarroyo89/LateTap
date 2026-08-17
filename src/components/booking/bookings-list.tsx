"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/config/app";
import { formatPrice, formatSlotDate, localizedServiceName } from "@/lib/format";
import type { Reservation } from "@/types/domain";

async function fetchReservations(business: boolean) {
  const response = await fetch(business ? "/api/v1/business/reservations" : "/api/v1/me/reservations");
  if (!response.ok) throw new Error("Could not load reservations");
  const payload = await response.json() as { data: { items: Reservation[] } };
  return payload.data.items;
}

export function BookingsList({ locale, business = false }: { locale: Locale; business?: boolean }) {
  const [items, setItems] = useState<Reservation[]>([]);
  const [error, setError] = useState(false);
  const [pendingId, setPendingId] = useState<string>();
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    void fetchReservations(business)
      .then((reservations) => {
        if (!active) return;
        setItems(reservations);
        setError(false);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [business]);

  const action = async (item: Reservation, type: string) => {
    setPendingId(item.id);
    const url = business
      ? `/api/v1/business/reservations/${item.id}`
      : `/api/v1/reservations/${item.id}/cancel`;
    const response = await fetch(url, {
      method: business ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(business ? { action: type } : {}),
    });
    setPendingId(undefined);
    if (!response.ok) {
      setError(true);
      return;
    }
    try {
      setItems(await fetchReservations(business));
      setError(false);
    } catch {
      setError(true);
    }
  };

  const remove = async (item: Reservation) => {
    const confirmed = window.confirm(locale === "es"
      ? "¿Eliminar esta reserva de tu historial? Esta acción no afecta al registro del negocio."
      : "Remove this booking from your history? This does not affect the business record.");
    if (!confirmed) return;
    setPendingId(item.id);
    const response = await fetch(`/api/v1/me/reservations/${item.id}`, { method: "DELETE" });
    setPendingId(undefined);
    if (!response.ok) {
      setError(true);
      return;
    }
    setItems((current) => current.filter((candidate) => candidate.id !== item.id));
  };

  const statusLabel = (status: Reservation["status"]) => {
    const labels = locale === "es" ? {
      confirmed: "Confirmada",
      cancelled_by_customer: "Cancelada",
      cancelled_by_business: "Cancelada por el negocio",
      completed: "Completada",
      no_show: "No asistió",
    } : {
      confirmed: "Confirmed",
      cancelled_by_customer: "Cancelled",
      cancelled_by_business: "Cancelled by business",
      completed: "Completed",
      no_show: "No-show",
    };
    return labels[status];
  };

  return (
    <div className="bookings-list">
      {error && (
        <div className="dashboard-notice">
          {locale === "es"
            ? "No se pudieron cargar tus reservas. Inténtalo de nuevo."
            : "Your bookings could not be loaded. Please try again."}
        </div>
      )}
      {items.map((item) => {
        const isPast = new Date(item.startAt).getTime() < now;
        const canRemove = !business && (item.status !== "confirmed" || isPast);
        return <article key={item.id}>
          <div className="booking-date">
            <span>{new Date(item.startAt).getDate()}</span>
            <small>{new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(item.startAt))}</small>
          </div>
          <div>
            <strong>{localizedServiceName(item.serviceSnapshot, locale)}</strong>
            <span>{item.businessSnapshot.name} · {formatSlotDate(item.startAt, locale, item.timezone)}</span>
          </div>
          <b>{formatPrice(item.priceCents, item.currency, locale)}</b>
          <span className={`status-badge ${item.status}`}>{statusLabel(item.status)}</span>
          {item.status === "confirmed" && (business ? (
            <div className="row-actions">
              <button disabled={pendingId === item.id} onClick={() => action(item, "complete")}>Complete</button>
              <button disabled={pendingId === item.id} onClick={() => action(item, "no_show")}>No-show</button>
              <button disabled={pendingId === item.id} onClick={() => action(item, "cancel")}>Cancel</button>
            </div>
          ) : !isPast ? (
            <button disabled={pendingId === item.id} onClick={() => action(item, "cancel")}>{locale === "es" ? "Cancelar" : "Cancel"}</button>
          ) : null)}
          {canRemove && <button className="booking-remove" disabled={pendingId === item.id} onClick={() => remove(item)}>{locale === "es" ? "Eliminar" : "Remove"}</button>}
        </article>;
      })}
      {!error && !items.length && (
        <div className="dashboard-notice">{locale === "es" ? "Todavía no hay reservas." : "No bookings yet."}</div>
      )}
    </div>
  );
}
