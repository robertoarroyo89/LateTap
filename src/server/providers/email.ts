export interface EmailMessage { to: string; subject: string; html: string }
export interface EmailProvider { send(message: EmailMessage): Promise<{ delivered: boolean }> }
export class NoEmailProvider implements EmailProvider { async send() { return { delivered: false }; } }
export class ResendEmailProvider implements EmailProvider {
  constructor(private apiKey: string, private from: string) {}
  async send(message: EmailMessage) { const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${this.apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ from: this.from, ...message }) }); return { delivered: response.ok }; }
}
export const emailProvider: EmailProvider = process.env.RESEND_API_KEY && process.env.EMAIL_FROM ? new ResendEmailProvider(process.env.RESEND_API_KEY, process.env.EMAIL_FROM) : new NoEmailProvider();
