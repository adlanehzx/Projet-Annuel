import { expect, test } from '@playwright/test';

test.describe('Parcours public', () => {
  test('la page d’accueil présente HankoTrack et les actions principales', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/HankoTrack/);
    await expect(page.getByRole('heading', { name: /votre carnet d'animé/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Créer mon compte' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /voir le catalogue/i }).first()).toBeVisible();
  });

  test('un visiteur peut accéder au catalogue et revenir à la connexion', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /voir le catalogue/i }).first().click();
    await expect(page).toHaveURL(/\/animes$/);
    await expect(page.getByPlaceholder('Rechercher un animé…')).toBeVisible();

    await page.getByRole('link', { name: 'Connexion' }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('heading', { name: /connexion à hankotrack/i })).toBeVisible();
  });
});
