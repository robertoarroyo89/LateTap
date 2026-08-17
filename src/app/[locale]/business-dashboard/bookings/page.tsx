import { notFound } from "next/navigation";
import { BookingsList } from "@/components/booking/bookings-list";
import { isLocale } from "@/config/app";
export default async function Page({ params }: PageProps<"/[locale]/business-dashboard/bookings">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <><header className="dashboard-heading"><p className="kicker">BOOKINGS</p><h1>{locale === "es" ? "Reservas" : "Bookings"}</h1></header><BookingsList locale={locale} business /></>; }
