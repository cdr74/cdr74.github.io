import { test, expect } from '@playwright/test';

// Hilfsfunktion: Mock-Benutzer in sessionStorage setzen und App neu initialisieren
async function loginMockUser({ page }) {
  await page.goto('/');
  await page.waitForFunction(() => typeof window.App !== 'undefined');
  await page.evaluate(() => {
    sessionStorage.setItem('cdr74_current_user', JSON.stringify({ username: 'TestUser' }));
  });
  // Seite neu laden damit Auth-State wirksam wird
  await page.reload();
  await page.waitForFunction(() => typeof window.App !== 'undefined');
}

// Hilfsfunktion: Deutsch-Übung starten
async function startDeutschExercise(page, mode) {
  await page.locator('#btn-deutsch').click();
  await page.locator('#deutsch-mode').selectOption(mode);
  await page.locator('#deutsch-start').click();
}

test.describe('Deutsch-Übungen: Ohne Anmeldung', () => {
  test('Los geht\'s! ohne Benutzer öffnet Login-Seite', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof window.App !== 'undefined');
    await page.locator('#btn-deutsch').click();
    await page.locator('#deutsch-start').click();
    await expect(page.locator('#login')).toBeVisible();
  });
});

test.describe('Deutsch-Übungen: Grammatik', () => {
  test.beforeEach(loginMockUser);

  test('Grammatik-Übung zeigt Titel', async ({ page }) => {
    await startDeutschExercise(page, 'grammar');
    await expect(page.locator('#deutsch-area')).toBeVisible();
    await expect(page.locator('#deutsch-title')).toContainText('Grammatik');
  });

  test('Grammatik-Übung zeigt Antwort-Buttons', async ({ page }) => {
    await startDeutschExercise(page, 'grammar');
    await expect(page.locator('#grammar-options')).toBeVisible();
    const buttons = page.locator('#grammar-options .option');
    await expect(buttons).toHaveCount(8);
  });

  test('Grammatik-Übung zeigt Wort-Anzeige', async ({ page }) => {
    await startDeutschExercise(page, 'grammar');
    await expect(page.locator('#grammar-question')).toBeVisible();
  });
});

test.describe('Deutsch-Übungen: Artikel', () => {
  test.beforeEach(loginMockUser);

  test('Artikel-Übung zeigt Titel', async ({ page }) => {
    await startDeutschExercise(page, 'artikel');
    await expect(page.locator('#deutsch-area')).toBeVisible();
    await expect(page.locator('#artikel-area h3')).toContainText('Artikel');
  });

  test('Artikel-Übung zeigt drei Artikel-Buttons (der/die/das)', async ({ page }) => {
    await startDeutschExercise(page, 'artikel');
    await expect(page.locator('[data-artikel="der"]')).toBeVisible();
    await expect(page.locator('[data-artikel="die"]')).toBeVisible();
    await expect(page.locator('[data-artikel="das"]')).toBeVisible();
  });
});

test.describe('Deutsch-Übungen: Wörter ordnen', () => {
  test.beforeEach(loginMockUser);

  test('Ordnen-Übung zeigt Titel', async ({ page }) => {
    await startDeutschExercise(page, 'woerter-ordnen');
    await expect(page.locator('#deutsch-area')).toBeVisible();
    await expect(page.locator('#ordnen-area h3')).toContainText('Wörter ordnen');
  });

  test('Ordnen-Übung zeigt Prüfen-Button', async ({ page }) => {
    await startDeutschExercise(page, 'woerter-ordnen');
    await expect(page.locator('#ordnen-check')).toBeVisible();
  });
});

test.describe('Deutsch-Übungen: Diktat', () => {
  test.beforeEach(loginMockUser);

  test('Diktat-Übung zeigt Titel', async ({ page }) => {
    await startDeutschExercise(page, 'diktat');
    await expect(page.locator('#deutsch-area')).toBeVisible();
    await expect(page.locator('#diktat-area h3')).toContainText('Diktat');
  });
});

test.describe('Deutsch-Übungen: Lesen', () => {
  test.beforeEach(loginMockUser);

  test('Lese-Übung lädt und zeigt Inhalt', async ({ page }) => {
    await startDeutschExercise(page, 'reading');
    await expect(page.locator('#deutsch-area')).toBeVisible();
    await expect(page.locator('#reading-area')).toBeVisible();
  });
});
