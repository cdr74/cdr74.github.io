import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Warten bis die App initialisiert ist
    await page.waitForFunction(() => typeof window.App !== 'undefined');
  });

  test('Klick auf Grössen zeigt Einstellungen', async ({ page }) => {
    await page.locator('#btn-groessen').click();
    await expect(page.locator('#settings')).toBeVisible();
    await expect(page.locator('#start-menu')).toBeHidden();
  });

  test('Einstellungen: alle Übungs-Optionen vorhanden', async ({ page }) => {
    await page.locator('#btn-groessen').click();
    const options = page.locator('#mode option');
    await expect(options).toHaveCount(3);
    await expect(page.locator('#start-btn')).toBeVisible();
  });

  test('Klick auf Deutsch zeigt Deutsch-Einstieg', async ({ page }) => {
    await page.locator('#btn-deutsch').click();
    await expect(page.locator('#deutsch')).toBeVisible();
    await expect(page.locator('#start-menu')).toBeHidden();
  });

  test('Deutsch-Einstieg: Überschrift und alle 5 Übungsoptionen', async ({ page }) => {
    await page.locator('#btn-deutsch').click();
    await expect(page.locator('#deutsch h2')).toHaveText('Deutsch — Einstieg');
    const options = page.locator('#deutsch-mode option');
    await expect(options).toHaveCount(5);
  });

  test('Zurück-Button navigiert zum Startmenü', async ({ page }) => {
    await page.locator('#btn-deutsch').click();
    await expect(page.locator('#deutsch')).toBeVisible();
    await page.locator('#header-back-btn').click();
    await expect(page.locator('#start-menu')).toBeVisible();
    await expect(page.locator('#deutsch')).toBeHidden();
  });

  test('Anmelden-Seite erscheint bei Klick auf Anmelden', async ({ page }) => {
    await page.locator('#header-login-btn').click();
    await expect(page.locator('#login')).toBeVisible();
    await expect(page.locator('#login-content')).toBeVisible();
  });
});
