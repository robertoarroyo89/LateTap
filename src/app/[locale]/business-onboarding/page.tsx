import { notFound } from "next/navigation";

import { BusinessOnboardingForm } from "@/components/business/business-onboarding-form";
import { isLocale } from "@/config/app";

export const metadata = { title: "Business onboarding", robots: { index: false } };
export default async function OnboardingPage({ params }: PageProps<"/[locale]/business-onboarding">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <div className="onboarding-page shell"><BusinessOnboardingForm locale={locale} /></div>; }
