"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Locale } from "@/config/app";
import { formatPrice, formatSlotDate, localizedServiceName } from "@/lib/format";
import type { Messages } from "@/messages";
import type { Slot } from "@/types/domain";

export function BookingButton({ slot, locale, messages }: { slot: Slot; locale: Locale; messages: Messages }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ id?: string; error?: string }>();
  const confirm = async () => {
    setPending(true); setResult(undefined);
    const response = await fetch("/api/v1/reservations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slotId: slot.id }) });
    if (response.status === 401) { router.push(`/${locale}/login?returnTo=/${locale}/slot/${slot.id}`); return; }
    const payload = await response.json();
    setPending(false);
    setResult(response.ok ? { id: payload.data.id } : { error: payload.error?.message ?? messages.common.error });
  };
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild><button className="reserve-primary" type="button">{messages.slot.reserve}</button></Dialog.Trigger>
      <Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="dialog-content" aria-describedby="booking-description">
        <Dialog.Close className="dialog-close" aria-label="Close"><X size={19} /></Dialog.Close>
        {result?.id ? <div className="booking-success"><span><Check size={26} /></span><Dialog.Title>{messages.booking.successTitle}</Dialog.Title><Dialog.Description id="booking-description">{messages.booking.successBody}</Dialog.Description><button onClick={() => router.push(`/${locale}/account/bookings`)}>{messages.booking.viewBooking}</button></div> : <>
          <Dialog.Title>{messages.booking.title}</Dialog.Title><Dialog.Description id="booking-description">{localizedServiceName(slot.serviceSnapshot, locale)} · {slot.businessSnapshot.name}</Dialog.Description>
          <div className="booking-summary"><strong>{formatSlotDate(slot.startAt, locale, slot.timezone)}</strong><span>{slot.durationMinutes} {messages.slot.minutes}</span><b>{formatPrice(slot.priceCents, slot.currency, locale)}</b></div>
          <p className="venue-note">{messages.slot.payAtVenue}</p>
          {result?.error && <p className="form-error" role="alert">{result.error}</p>}
          <button className="reserve-primary full" type="button" disabled={pending} onClick={confirm}>{pending ? messages.common.loading : messages.booking.confirm}</button>
        </>}
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  );
}
