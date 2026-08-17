"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LocateFixed, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Locale } from "@/config/app";

type LocationStatus = "idle" | "locating" | "error";

export function LocationSelector({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LocationStatus>("idle");

  const requestCurrentLocation = () => {
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
        setStatus("idle");
        setOpen(false);
        router.push(`/${locale}/explore?${query.toString()}`);
      },
      () => setStatus("error"),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
    );
  };

  const locating = status === "locating";
  return (
    <DropdownMenu.Root open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen);
      if (!nextOpen && status === "error") setStatus("idle");
    }}>
      <DropdownMenu.Trigger asChild>
        <button className="location-button" type="button">
          <MapPin size={16} strokeWidth={2.4} aria-hidden="true" />
          {label}
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="location-menu" align="start" sideOffset={10} collisionPadding={12}>
          <DropdownMenu.Label className="location-menu-label">
            {locale === "es" ? "¿Dónde quieres buscar?" : "Where do you want to search?"}
          </DropdownMenu.Label>
          <DropdownMenu.Item
            className="location-menu-item"
            disabled={locating}
            onSelect={(event) => {
              event.preventDefault();
              requestCurrentLocation();
            }}
          >
            <LocateFixed size={17} aria-hidden="true" />
            <span>
              <strong>{locating ? (locale === "es" ? "Buscando…" : "Locating…") : (locale === "es" ? "Usar mi ubicación" : "Use my location")}</strong>
              <small>{locale === "es" ? "Ver citas a menos de 5 km" : "See appointments within 5 km"}</small>
            </span>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="location-menu-item" asChild>
            <Link href={`/${locale}/explore`}>
              <Search size={17} aria-hidden="true" />
              <span>
                <strong>{locale === "es" ? "Explorar todas" : "Explore all"}</strong>
                <small>{locale === "es" ? "Sin filtrar por distancia" : "Without a distance filter"}</small>
              </span>
            </Link>
          </DropdownMenu.Item>
          {status === "error" && (
            <p className="location-menu-error" role="alert">
              {locale === "es"
                ? "No hemos podido obtener tu ubicación. Revisa el permiso del navegador."
                : "We couldn't get your location. Check your browser permission."}
            </p>
          )}
          <DropdownMenu.Arrow className="location-menu-arrow" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
