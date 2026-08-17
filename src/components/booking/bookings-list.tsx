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
    const url = business
      ? `/api/v1/business/reservations/${item.id}`
      : `/api/v1/reservations/${item.id}/cancel`;
    await fetch(url, {
      method: business ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(business ? { action: type } : {}),
    });
    try {
      setItems(await fetchReservations(business));
      setError(false);
    } catch {
      setError(true);
    }
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
      {items.map((item) => (
        <article key={item.id}>
          <div className="booking-date">
            <span>{new Date(item.startAt).getDate()}</span>
            <small>{new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(item.startAt))}</small>
          </div>
          <div>
            <strong>{localizedServiceName(item.serviceSnapshot, locale)}</strong>
            <span>{item.businessSnapshot.name} · {formatSlotDate(item.startAt, locale, item.timezone)}</span>
          </div>
          <b>{formatPrice(item.priceCents, item.currency, locale)}</b>
          <span className={`status-badge ${item.status}`}>{item.status.replaceAll("_", " ")}</span>
          {item.status === "confirmed" && (business ? (
            <div className="row-actions">
              <button onClick={() => action(item, "complete")}>Complete</button>
              <button onClick={() => action(item, "no_show")}>No-show</button>
              <button onClick={() => action(item, "cancel")}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => action(item, "cancel")}>{locale === "es" ? "Cancelar" : "Cancel"}</button>
          ))}
        </article>
      ))}
      {!error && !items.length && (
        <div className="dashboard-notice">{locale === "es" ? "Todavía no hay reservas." : "No bookings yet."}</div>
      )}
    </div>
  );
}
