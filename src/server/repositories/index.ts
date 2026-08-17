import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { DemoSlotRepository } from "@/server/repositories/demo-slot-repository";
import { FirebaseSlotRepository } from "@/server/repositories/firebase-slot-repository";
import type { SlotRepository } from "@/server/repositories/slot-repository";

let slotRepository: SlotRepository | undefined;

export function getSlotRepository(): SlotRepository {
  if (!slotRepository) {
    slotRepository = isFirebaseAdminConfigured
      ? new FirebaseSlotRepository()
      : new DemoSlotRepository();
  }
  return slotRepository;
}
