import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { isLocale } from "@/config/app";
import { getMessages } from "@/messages";

export const metadata = { title: "Log in", robots: { index: false } };
export default async function LoginPage({ params }: PageProps<"/[locale]/login">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <div className="auth-page"><Suspense><AuthForm locale={locale} messages={getMessages(locale)} mode="login" /></Suspense></div>; }
