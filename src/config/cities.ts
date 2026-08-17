export const cities = {
  valencia: {
    key: "valencia",
    name: "Valencia",
    countryCode: "ES",
    region: "Valencia",
    timezone: "Europe/Madrid",
    currency: "EUR",
    coordinates: { latitude: 39.4699, longitude: -0.3763 },
    enabled: true,
  },
  madrid: {
    key: "madrid",
    name: "Madrid",
    countryCode: "ES",
    region: "Madrid",
    timezone: "Europe/Madrid",
    currency: "EUR",
    coordinates: { latitude: 40.4168, longitude: -3.7038 },
    enabled: false,
  },
} as const;

export type CityKey = keyof typeof cities;
