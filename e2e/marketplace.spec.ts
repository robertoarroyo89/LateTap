import { expect, test } from "@playwright/test";

test("consumer can discover a real development slot", async ({ page }) => {
  await page.goto("/es");
  await expect(page.getByRole("heading", { name: /Tu próxima cita/i })).toBeVisible();
  await page.getByRole("link", { name: /Ver citas para hoy/i }).click();
  await expect(page).toHaveURL(/\/es\/explore/);
  await expect(page.getByRole("heading", { name: /Citas disponibles/i })).toBeVisible();
  await page.getByRole("link", { name: /Corte \+ barba/i }).first().click();
  await expect(page.getByRole("heading", { name: /Corte \+ barba/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Reservar/i })).toBeVisible();
});

test("English route renders localized discovery", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /Your next appointment/i })).toBeVisible();
  await page.goto("/en/explore");
  await expect(page.getByRole("heading", { name: /Available appointments/i })).toBeVisible();
});

test("location CTA searches nearby appointments in one step", async ({ context, page }) => {
  await context.grantPermissions(["geolocation"], { origin: "http://127.0.0.1:3000" });
  await context.setGeolocation({ latitude: 39.4699, longitude: -0.3763 });
  await page.goto("/es");

  await page.getByRole("button", { name: "Usar mi ubicación" }).click();

  await expect(page).toHaveURL(/\/es\/explore\?lat=39\.4699&lng=-0\.3763&radius=5/);
  await expect(page.getByRole("heading", { name: "Citas disponibles" })).toBeVisible();
});
