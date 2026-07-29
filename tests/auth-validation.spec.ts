import { expect, test } from '@playwright/test';

test.describe('Inscription', () => {
  test('refuse un mot de passe trop court avant tout appel au serveur', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder("Nom d'utilisateur").fill('e2e-user');
    await page.getByPlaceholder('Email').fill('e2e@example.test');
    await page.getByPlaceholder('Mot de passe', { exact: true }).fill('court');
    await page.getByPlaceholder('Confirmer le mot de passe').fill('court');
    await page.getByRole('button', { name: "S'inscrire" }).click();

    await expect(page.getByText('Le mot de passe doit contenir au moins 6 caractères')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/register$/);
  });

  test('refuse deux mots de passe différents', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder("Nom d'utilisateur").fill('e2e-user');
    await page.getByPlaceholder('Email').fill('e2e@example.test');
    await page.getByPlaceholder('Mot de passe', { exact: true }).fill('mot-de-passe-solide');
    await page.getByPlaceholder('Confirmer le mot de passe').fill('un-autre-mot-de-passe');
    await page.getByRole('button', { name: "S'inscrire" }).click();

    await expect(page.getByText('Les mots de passe ne correspondent pas')).toBeVisible();
  });
});
