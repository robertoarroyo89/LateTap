export interface MapProvider { directionsUrl(location: { latitude: number; longitude: number }): string }
export class ProviderNeutralMap implements MapProvider { directionsUrl(location: { latitude: number; longitude: number }) { return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`; } }
export const mapProvider: MapProvider = new ProviderNeutralMap();
