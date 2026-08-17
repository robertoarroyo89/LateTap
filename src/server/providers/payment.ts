export interface PaymentProvider {
  readonly mode: "venue" | "online";
  createPayment(input: { reservationId: string; amountCents: number; currency: string }): Promise<{ reference?: string }>;
}

export class NoPaymentProvider implements PaymentProvider {
  readonly mode = "venue" as const;
  async createPayment() { return {}; }
}

export const paymentProvider: PaymentProvider = new NoPaymentProvider();
