import { notFound } from "next/navigation";
import { BookingsList } from "@/components/booking/bookings-list";
import { isLocale } from "@/config/app";
export const metadata = { title: "Bookings", robots: { index: false } };
export default async function Page({ params }: PageProps<"/[locale]/account/bookings">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <div className="account-page shell"><header className="page-intro"><p className="kicker">MY LATETAP</p><h1>{locale === "es" ? "Mis reservas" : "My bookings"}</h1></header><BookingsList locale={locale} /></div>; }
