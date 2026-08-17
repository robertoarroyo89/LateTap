export const categories = [
  { id: "hair", labelEs: "Peluquería", labelEn: "Hair salon" },
  { id: "barber", labelEs: "Barbería", labelEn: "Barber" },
  { id: "nails", labelEs: "Uñas", labelEn: "Nails" },
  { id: "massage", labelEs: "Masajes", labelEn: "Massage" },
  { id: "beauty", labelEs: "Estética", labelEn: "Beauty" },
  { id: "brows-lashes", labelEs: "Cejas y pestañas", labelEn: "Brows & lashes" },
  { id: "physio", labelEs: "Fisioterapia", labelEn: "Physiotherapy" },
  { id: "wellness", labelEs: "Bienestar", labelEn: "Wellness" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
