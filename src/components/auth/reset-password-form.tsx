"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

import type { Locale } from "@/config/app";
import { firebaseAuth } from "@/lib/firebase/client";
import type { Messages } from "@/messages";

export function ResetPasswordForm({ locale, messages }: { locale: Locale; messages: Messages }) {
  const [email, setEmail] = useState(""); const [status, setStatus] = useState<string>();
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!firebaseAuth) { setStatus(locale === "es" ? "Firebase no está configurado." : "Firebase is not configured."); return; } try { await sendPasswordResetEmail(firebaseAuth, email); setStatus(messages.auth.resetSent); } catch { setStatus(messages.common.error); } };
  return <div className="auth-card"><div className="auth-brand"><span className="live-dot" />LateTap</div><h1>{messages.auth.resetTitle}</h1><form onSubmit={submit}><label>{messages.auth.email}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>{status && <p className="config-note" role="status">{status}</p>}<button className="auth-submit">{messages.auth.reset}</button></form></div>;
}
