import { z } from "zod";

import { categories } from "@/config/categories";

const categoryIds = categories.map((item) => item.id) as [string, ...string[]];
export const serviceSchema = z.object({ categoryId: z.enum(categoryIds), nameEs: z.string().trim().min(2).max(100), nameEn: z.string().trim().max(100).optional(), descriptionEs: z.string().trim().max(500).optional(), regularPriceCents: z.number().int().positive().max(1_000_000), durationMinutes: z.number().int().min(10).max(480), active: z.boolean().default(true) });

export const businessOnboardingSchema = z.object({
  name: z.string().trim().min(2).max(100),
  primaryCategoryId: z.enum(categoryIds),
  email: z.email(), phone: z.string().trim().min(6).max(30), whatsapp: z.string().trim().max(30).optional(),
  descriptionEs: z.string().trim().min(20).max(1000), website: z.url().optional().or(z.literal("")), instagram: z.string().trim().max(80).optional(),
  address: z.object({ street: z.string().trim().min(2).max(120), number: z.string().trim().max(20), postalCode: z.string().trim().min(4).max(12), city: z.string().trim().min(2).max(60), region: z.string().trim().min(2).max(60), country: z.string().trim().min(2).max(60), countryCode: z.string().length(2), neighborhood: z.string().trim().max(80).optional() }),
  location: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }),
  showExactAddress: z.boolean().default(true), termsAccepted: z.literal(true), firstService: serviceSchema,
});

export const moderationSchema = z.object({ action: z.enum(["approve", "reject", "suspend", "restore"]), reason: z.string().trim().max(500).optional() }).superRefine((value, context) => { if (value.action === "reject" && !value.reason) context.addIssue({ code: "custom", path: ["reason"], message: "A rejection reason is required" }); });
