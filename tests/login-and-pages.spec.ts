import { expect, test } from '@playwright/test';

const testUser = {
  id: 1,
  email: 'e2e@example.test',
  username: 'e2e-user',
};

test.describe('Connexion', () => {
  test('un utilisateur peut se connecter et accéder à son espace', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ token: 'e2e-token', user: testUser }),
      });
    });

    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Email').fill(testUser.email);
    await page.getByPlaceholder('Mot de passe').fill('mot-de-passe-e2e');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/animes$/);
    await expect(page.getByText(testUser.username, { exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBe('e2e-token');
  });

  test('les pages de l’espace utilisateur sont accessibles depuis le menu', async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('token', 'e2e-token');
      localStorage.setItem('user', JSON.stringify(user));
    }, testUser);
    await page.goto('/');

    for (const item of [
      { label: 'Ma Watchlist', path: '/watchlist' },
      { label: 'Mes Listes', path: '/lists' },
      { label: 'Recommandations', path: '/recommendations' },
      { label: 'Profil', path: '/profile' },
    ]) {
      await page.getByRole('link', { name: item.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${item.path}$`));
      await expect(page.locator('body')).not.toBeEmpty();
    }

    await page.getByRole('link', { name: 'Paramètres', exact: true }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('heading', { name: 'Paramètres' })).toBeVisible();
  });
});

test.describe('Pages statiques', () => {
  const publicPages = [
    '/',
    '/animes',
    '/animes/search',
    '/animes/add',
    '/auth/login',
    '/auth/register',
    '/collections',
    '/privacy',
    '/profiles/e2e-user',
  ];

  for (const path of publicPages) {
    test(`${path} se charge sans erreur serveur`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status(), `La page ${path} ne doit pas retourner une erreur serveur`).toBeLessThan(500);
      await expect(page.locator('body')).not.toBeEmpty();
    });
  }
});
