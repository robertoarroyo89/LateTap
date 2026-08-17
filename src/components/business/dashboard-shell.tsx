import Link from "next/link";
import { BarChart3, Building2, CalendarCheck, CalendarPlus, LayoutDashboard, Scissors } from "lucide-react";

import type { Locale } from "@/config/app";

export function DashboardShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const es = locale === "es";
  return <div className="dashboard-shell shell"><aside><div><p className="kicker">BUSINESS MODE</p><h2>LateTap</h2></div><nav><Link href={`/${locale}/business-dashboard`}><LayoutDashboard />{es ? "Inicio" : "Overview"}</Link><Link href={`/${locale}/business-dashboard/slots`}><CalendarCheck />{es ? "Citas" : "Slots"}</Link><Link href={`/${locale}/business-dashboard/services`}><Scissors />{es ? "Servicios" : "Services"}</Link><Link href={`/${locale}/business-dashboard/bookings`}><BarChart3 />{es ? "Reservas" : "Bookings"}</Link><Link href={`/${locale}/business-dashboard/profile`}><Building2 />{es ? "Negocio" : "Business"}</Link></nav><Link className="dashboard-add" href={`/${locale}/business-dashboard/slots/new`}><CalendarPlus />{es ? "Publicar cita" : "Add a slot"}</Link></aside><section className="dashboard-content">{children}</section></div>;
}
