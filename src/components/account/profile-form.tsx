"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { Locale } from "@/config/app";

type Form = { displayName: string; phone: string; preferredLocale: Locale; defaultCity: string };

export function ProfileForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>();
  const { register, reset, handleSubmit } = useForm<Form>();

  useEffect(() => {
    fetch("/api/v1/me/profile")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unauthorized");
        return response.json();
      })
      .then((payload) => reset(payload.data))
      .catch(() => setStatus(locale === "es" ? "Inicia sesión para editar tu perfil." : "Sign in to edit your profile."));
  }, [locale, reset]);

  const submit = async (data: Form) => {
    const response = await fetch("/api/v1/me/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    setStatus(response.ok ? (locale === "es" ? "Perfil guardado." : "Profile saved.") : (locale === "es" ? "No se pudo guardar." : "Could not save."));
  };

  const logout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push(`/${locale}`);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm(locale === "es" ? "¿Eliminar definitivamente tu cuenta? Esta acción no se puede deshacer." : "Permanently delete your account? This cannot be undone.")) return;
    const response = await fetch("/api/v1/me/profile", { method: "DELETE" });
    const payload = await response.json();
    if (response.ok) {
      router.push(`/${locale}`);
      router.refresh();
    } else setStatus(payload.error?.message ?? "Error");
  };

  return <form className="profile-form" onSubmit={handleSubmit(submit)}>
    <label>{locale === "es" ? "Nombre" : "Name"}<input {...register("displayName")} /></label>
    <label>{locale === "es" ? "Teléfono" : "Phone"}<input {...register("phone")} /></label>
    <label>{locale === "es" ? "Idioma" : "Language"}<select {...register("preferredLocale")}><option value="es">Español</option><option value="en">English</option></select></label>
    <label>{locale === "es" ? "Ciudad" : "City"}<select {...register("defaultCity")}><option value="valencia">Valencia</option></select></label>
    {status && <p className="config-note" role="status">{status}</p>}
    <div className="profile-actions"><button>{locale === "es" ? "Guardar cambios" : "Save changes"}</button><button className="secondary-button" type="button" onClick={logout}>{locale === "es" ? "Cerrar sesión" : "Log out"}</button></div>
    <div className="danger-zone"><strong>{locale === "es" ? "Zona sensible" : "Sensitive actions"}</strong><p>{locale === "es" ? "Las reservas históricas se anonimizan. Debes cancelar antes cualquier reserva activa." : "Historical bookings are anonymized. Active bookings must be cancelled first."}</p><button className="danger-button" type="button" onClick={remove}>{locale === "es" ? "Eliminar mi cuenta" : "Delete my account"}</button></div>
  </form>;
}
