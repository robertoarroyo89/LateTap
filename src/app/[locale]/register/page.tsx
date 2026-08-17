import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { isLocale } from "@/config/app";
import { getMessages } from "@/messages";

export const metadata = { title: "Register", robots: { index: false } };
export default async function RegisterPage({ params }: PageProps<"/[locale]/register">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <div className="auth-page"><Suspense><AuthForm locale={locale} messages={getMessages(locale)} mode="register" /></Suspense></div>; }
