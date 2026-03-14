import { test, expect } from '@playwright/test';

test.describe('Seitenaufruf', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Seitentitel ist korrekt', async ({ page }) => {
    await expect(page).toHaveTitle('Online Übungen');
  });

  test('Header ist sichtbar', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
  });

  test('Anmelden-Button im Header sichtbar (kein Benutzer)', async ({ page }) => {
    await expect(page.locator('#header-login-btn')).toBeVisible();
  });

  test('Statistik- und Abmelden-Button ausgeblendet (kein Benutzer)', async ({ page }) => {
    await expect(page.locator('#header-stats-btn')).toBeHidden();
    await expect(page.locator('#header-logout-btn')).toBeHidden();
  });

  test('Startmenü zeigt beide Themen-Buttons', async ({ page }) => {
    await expect(page.locator('#btn-groessen')).toBeVisible();
    await expect(page.locator('#btn-deutsch')).toBeVisible();
    await expect(page.locator('#btn-groessen')).toHaveText('Grössen');
    await expect(page.locator('#btn-deutsch')).toHaveText('Deutsch');
  });
});
