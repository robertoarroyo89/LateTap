import { notFound } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { isLocale } from "@/config/app";
import { getMessages } from "@/messages";

export const metadata = { title: "Reset password", robots: { index: false } };
export default async function ForgotPage({ params }: PageProps<"/[locale]/forgot-password">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <div className="auth-page"><ResetPasswordForm locale={locale} messages={getMessages(locale)} /></div>; }
