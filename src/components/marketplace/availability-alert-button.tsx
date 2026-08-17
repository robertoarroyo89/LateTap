"use client";

import { Bell, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Locale } from "@/config/app";
import { categories, type CategoryId } from "@/config/categories";
import type { AlertDurationHours, Coordinates } from "@/types/domain";

type DatePreference = "today" | "tomorrow" | "both" | "week";

interface AvailabilityAlertButtonProps {
  locale: Locale;
  initialCategoryId?: CategoryId;
  businessId?: string;
  cityKey?: string;
  datePreference?: DatePreference;
  location?: Coordinates;
  radiusKm?: number;
  maxPriceCents?: number;
}

export function AvailabilityAlertButton({
  locale,
  initialCategoryId,
  businessId,
  cityKey = "valencia",
  datePreference = "both",
  location,
  radiusKm = 10,
  maxPriceCents,
}: AvailabilityAlertButtonProps) {
  const spanish = locale === "es";
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [categoryId, setCategoryId] = useState<CategoryId>(initialCategoryId ?? categories[0].id);
  const [durationHours, setDurationHours] = useState<AlertDurationHours>(48);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const create = async () => {
    setStatus("saving");
    const response = await fetch("/api/v1/me/alerts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ categoryId, businessId, cityKey, datePreference, location, radiusKm, maxPriceCents, durationHours, locale }),
    });
    if (response.status === 401) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.push(`/${locale}/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    setStatus(response.ok ? "saved" : "error");
  };

  if (status === "saved") {
    return (
      <div className="availability-alert-success" role="status">
        <Check size={18} />
        <span>{spanish ? `Aviso activo durante ${durationHours} horas.` : `Alert active for ${durationHours} hours.`}</span>
        <Link href={`/${locale}/account/alerts`}>{spanish ? "Ver mis avisos" : "View my alerts"}</Link>
      </div>
    );
  }

  return (
    <div className="availability-alert">
      {!expanded ? (
        <button className="availability-alert-trigger" type="button" onClick={() => setExpanded(true)}>
          <Bell size={18} />{spanish ? "Avísame cuando aparezca una cita" : "Notify me when an appointment appears"}
        </button>
      ) : (
        <div className="availability-alert-panel">
          <div>
            <strong>{spanish ? "Crea un aviso" : "Create an alert"}</strong>
            <span>{spanish ? "Te avisaremos en LateTap cuando aparezca una cita que encaje." : "We'll notify you in LateTap when a matching appointment appears."}</span>
          </div>
          {!businessId && (
            <label>
              {spanish ? "Categoría" : "Category"}
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value as CategoryId)}>
                {categories.map((category) => <option key={category.id} value={category.id}>{spanish ? category.labelEs : category.labelEn}</option>)}
              </select>
            </label>
          )}
          <label>
            {spanish ? "Duración del aviso" : "Alert duration"}
            <select value={durationHours} onChange={(event) => setDurationHours(Number(event.target.value) as AlertDurationHours)}>
              {[24, 48, 72].map((hours) => <option key={hours} value={hours}>{hours} {spanish ? "horas" : "hours"}</option>)}
            </select>
          </label>
          {status === "error" && <p className="form-error" role="alert">{spanish ? "No hemos podido crear el aviso." : "We couldn't create the alert."}</p>}
          <div className="availability-alert-actions">
            <button type="button" className="secondary-button" onClick={() => setExpanded(false)}>{spanish ? "Ahora no" : "Not now"}</button>
            <button type="button" disabled={status === "saving"} onClick={create}>{status === "saving" ? "…" : spanish ? "Activar aviso" : "Activate alert"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
