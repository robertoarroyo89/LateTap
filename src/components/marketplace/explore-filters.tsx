"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LocateFixed, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import type { Locale } from "@/config/app";
import { categories } from "@/config/categories";
import type { Messages } from "@/messages";

export function ExploreFilters({ locale, messages }: { locale: Locale; messages: Messages }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locationStatus, setLocationStatus] = useState<"idle" | "locating" | "error">("idle");
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/${locale}/explore?${next.toString()}`);
  };
  const locate = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next = new URLSearchParams(searchParams.toString());
        next.delete("location");
        next.set("lat", coords.latitude.toFixed(4));
        next.set("lng", coords.longitude.toFixed(4));
        next.set("radius", next.get("radius") ?? "5");
        setLocationStatus("idle");
        router.push(`/${locale}/explore?${next.toString()}`);
      },
      () => setLocationStatus("error"),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
    );
  };
  return (
    <div className="explore-filters">
      <span className="filter-title"><SlidersHorizontal size={17} />{messages.explore.filters}</span>
      <label>{messages.explore.date}<select value={searchParams.get("date") ?? "today"} onChange={(event) => update("date", event.target.value)}><option value="today">{messages.explore.today}</option><option value="tomorrow">{messages.explore.tomorrow}</option><option value="week">{messages.explore.week}</option></select></label>
      <label>{messages.explore.category}<select value={searchParams.get("category") ?? ""} onChange={(event) => update("category", event.target.value)}><option value="">{messages.explore.any}</option>{categories.map((category) => <option value={category.id} key={category.id}>{locale === "es" ? category.labelEs : category.labelEn}</option>)}</select></label>
      <label>{messages.explore.radius}<select value={searchParams.get("radius") ?? "5"} onChange={(event) => update("radius", event.target.value)}>{[1,3,5,10,20].map((radius) => <option key={radius} value={radius}>{radius} km</option>)}</select></label>
      <label>{messages.explore.price}<select value={searchParams.get("maxPrice") ?? ""} onChange={(event) => update("maxPrice", event.target.value)}><option value="">{messages.explore.any}</option><option value="2500">25 €</option><option value="3500">35 €</option><option value="5000">50 €</option></select></label>
      <div className="explore-location-control">
        <button type="button" disabled={locationStatus === "locating"} aria-busy={locationStatus === "locating"} onClick={locate}><LocateFixed size={17} />{locationStatus === "locating" ? (locale === "es" ? "Buscando…" : "Locating…") : messages.home.useLocation}</button>
        {locationStatus === "error" && <span role="alert">{locale === "es" ? "No hemos podido obtener tu ubicación." : "We couldn't get your location."}</span>}
      </div>
    </div>
  );
}
