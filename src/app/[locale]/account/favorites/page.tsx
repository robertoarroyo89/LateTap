import { notFound } from "next/navigation";
import { FavoritesList } from "@/components/account/favorites-list";
import { isLocale } from "@/config/app";
export default async function Page({ params }: PageProps<"/[locale]/account/favorites">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <div className="account-page shell"><header className="page-intro"><p className="kicker">MY LATETAP</p><h1>{locale === "es" ? "Favoritos" : "Favorites"}</h1></header><FavoritesList locale={locale} /></div>; }
