"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { Locale } from "@/config/app";

type Profile = { name: string; status: string; logoUrl?: string; coverImageUrl?: string };
const passthroughLoader = ({ src }: { src: string }) => src;

export function BusinessProfileEditor({ locale }: { locale: Locale }) {
  const [profile, setProfile] = useState<Profile>();
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    fetch("/api/v1/business/profile")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        return response.json();
      })
      .then((payload) => setProfile(payload.data))
      .catch(() => setStatus(locale === "es" ? "Inicia sesión con una cuenta de negocio." : "Sign in with a business account."));
  }, [locale]);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>, kind: "logo" | "cover") => {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.set("file", file);
    body.set("kind", kind);
    setStatus(locale === "es" ? "Subiendo…" : "Uploading…");
    const response = await fetch("/api/v1/business/media", { method: "POST", body });
    const payload = await response.json();
    if (response.ok) {
      setProfile((current) => current ? { ...current, [kind === "logo" ? "logoUrl" : "coverImageUrl"]: payload.data.url } : current);
      setStatus(locale === "es" ? "Imagen actualizada." : "Image updated.");
    } else setStatus(payload.error?.message ?? "Error");
  };

  return <div>
    <header className="dashboard-heading"><p className="kicker">BUSINESS PROFILE</p><h1>{profile?.name ?? (locale === "es" ? "Tu negocio" : "Your business")}</h1>{profile?.status && <span className={`status-badge ${profile.status}`}>{profile.status}</span>}</header>
    <div className="media-grid">
      <label><span>Logo</span><span className="media-preview logo-preview">{profile?.logoUrl ? <Image loader={passthroughLoader} unoptimized fill sizes="160px" src={profile.logoUrl} alt="Business logo" /> : <i>L</i>}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event, "logo")} /><small>JPEG, PNG o WebP · 2 MB</small></label>
      <label className="cover-upload"><span>{locale === "es" ? "Portada" : "Cover"}</span><span className="media-preview cover-preview">{profile?.coverImageUrl ? <Image loader={passthroughLoader} unoptimized fill sizes="600px" src={profile.coverImageUrl} alt="Business cover" /> : <i>LateTap</i>}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event, "cover")} /><small>JPEG, PNG o WebP · 5 MB</small></label>
    </div>
    {status && <p className="config-note" role="status">{status}</p>}
  </div>;
}
