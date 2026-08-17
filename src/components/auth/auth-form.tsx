"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, inMemoryPersistence, setPersistence, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Locale } from "@/config/app";
import { firebaseAuth, googleAuthProvider, isFirebaseClientConfigured } from "@/lib/firebase/client";
import type { Messages } from "@/messages";

type FormData = { displayName: string | undefined; email: string; password: string; acceptTerms: boolean | undefined };

export function AuthForm({ locale, messages, mode }: { locale: Locale; messages: Messages; mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string>();
  const schema = z.object({
    displayName: mode === "register" ? z.string().trim().min(2).max(80) : z.string().optional(),
    email: z.email(),
    password: z.string().min(8).max(128),
    acceptTerms: mode === "register" ? z.literal(true) : z.boolean().optional(),
  });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { displayName: undefined, email: "", password: "", acceptTerms: false } });

  const completeSession = async (user: import("firebase/auth").User, displayName?: string) => {
    const idToken = await user.getIdToken();
    const session = await fetch("/api/auth/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken }) });
    if (!session.ok) throw new Error("Could not create a secure session");
    await fetch("/api/v1/me/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ displayName: displayName || user.displayName || "", preferredLocale: locale }) });
    const returnTo = searchParams.get("returnTo");
    router.replace(returnTo?.startsWith("/") ? returnTo : `/${locale}/account/bookings`);
    router.refresh();
  };

  const onSubmit = async (data: FormData) => {
    setServerError(undefined);
    if (!firebaseAuth) { setServerError(locale === "es" ? "Firebase debe configurarse antes de iniciar sesión." : "Firebase must be configured before signing in."); return; }
    try {
      await setPersistence(firebaseAuth, inMemoryPersistence);
      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
        await updateProfile(credential.user, { displayName: data.displayName });
        await completeSession(credential.user, data.displayName);
      } else {
        const credential = await signInWithEmailAndPassword(firebaseAuth, data.email, data.password);
        await completeSession(credential.user);
      }
    } catch (error) { setServerError(error instanceof Error ? error.message.replace("Firebase: ", "") : messages.common.error); }
  };

  const googleLogin = async () => {
    if (!firebaseAuth) { setServerError(locale === "es" ? "Firebase no está configurado." : "Firebase is not configured."); return; }
    try { await setPersistence(firebaseAuth, inMemoryPersistence); const credential = await signInWithPopup(firebaseAuth, googleAuthProvider); await completeSession(credential.user); }
    catch (error) { setServerError(error instanceof Error ? error.message.replace("Firebase: ", "") : messages.common.error); }
  };

  return (
    <div className="auth-card"><div className="auth-brand"><span className="live-dot" />LateTap</div><h1>{mode === "login" ? messages.auth.loginTitle : messages.auth.registerTitle}</h1>
      {!isFirebaseClientConfigured && <p className="config-note">{locale === "es" ? "La interfaz está lista. Añade las variables de Firebase para activar el acceso real." : "The interface is ready. Add Firebase variables to enable real sign-in."}</p>}
      <button className="google-button" type="button" onClick={googleLogin}><span>G</span>{messages.auth.continueGoogle}</button><div className="auth-divider"><span>{locale === "es" ? "o con email" : "or with email"}</span></div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {mode === "register" && <label>{messages.auth.name}<input autoComplete="name" {...register("displayName")} />{errors.displayName && <small>{errors.displayName.message}</small>}</label>}
        <label>{messages.auth.email}<input type="email" autoComplete="email" {...register("email")} />{errors.email && <small>{errors.email.message}</small>}</label>
        <label>{messages.auth.password}<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} {...register("password")} />{errors.password && <small>{errors.password.message}</small>}</label>
        {mode === "register" && <label className="check-label"><input type="checkbox" {...register("acceptTerms")} /><span>{messages.auth.terms}</span></label>}
        {serverError && <p className="form-error" role="alert">{serverError}</p>}
        <button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? messages.common.loading : mode === "login" ? messages.auth.login : messages.auth.register}</button>
      </form>
      {mode === "login" && <Link className="forgot-link" href={`/${locale}/forgot-password`}>{messages.auth.forgot}</Link>}
      <p className="auth-switch">{mode === "login" ? messages.auth.noAccount : messages.auth.hasAccount} <Link href={`/${locale}/${mode === "login" ? "register" : "login"}`}>{mode === "login" ? messages.auth.register : messages.auth.login}</Link></p>
    </div>
  );
}
