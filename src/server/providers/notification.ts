export type NotificationEvent = "booking_confirmed" | "booking_cancelled" | "business_approved" | "business_rejected";
export interface NotificationProvider { notify(event: NotificationEvent, recipient: { email?: string; locale: "es" | "en" }, data: Record<string, string | number>): Promise<void> }
export class NoNotificationProvider implements NotificationProvider { async notify() {} }
export const notificationProvider: NotificationProvider = new NoNotificationProvider();
