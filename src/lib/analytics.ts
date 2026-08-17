export type AnalyticsEvent = "slot_viewed" | "reserve_clicked" | "reservation_created" | "slot_published" | "slot_completed";
export interface AnalyticsProvider { track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>): void }
export class NoAnalyticsProvider implements AnalyticsProvider { track() {} }
export const analytics: AnalyticsProvider = new NoAnalyticsProvider();
