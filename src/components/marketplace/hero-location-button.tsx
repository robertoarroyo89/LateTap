"use client";

import { LocateFixed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

import type { Locale } from "@/config/app";

type LocationStatus = "idle" | "locating" | "error";
const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function HeroLocationButton({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const ready = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const locating = status === "locating";

  const locate = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const query = new URLSearchParams({
          lat: coords.latitude.toFixed(4),
          lng: coords.longitude.toFixed(4),
          radius: "5",
        });
        router.push(`/${locale}/explore?${query.toString()}`);
      },
      () => setStatus("error"),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
    );
  };

  return (
    <div className="hero-location-control">
      <button className="secondary-button" type="button" disabled={!ready || locating} aria-busy={locating} onClick={locate}>
        <LocateFixed size={18} />
        {locating ? (locale === "es" ? "Buscando…" : "Locating…") : label}
      </button>
      {status === "error" && (
        <span className="hero-location-error" role="alert">
          {locale === "es"
            ? "No hemos podido obtener tu ubicación. Revisa el permiso del navegador."
            : "We couldn't get your location. Check your browser permission."}
        </span>
      )}
    </div>
  );
}
