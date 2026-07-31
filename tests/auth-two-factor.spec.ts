import { expect, test } from '@playwright/test';

const testUser = {
  id: 1,
  email: '2fa@example.test',
  username: '2fa-user',
};

test.describe('Connexion avec authentification à deux facteurs', () => {
  test('un compte protégé par 2FA demande le code avant de connecter l’utilisateur', async ({ page }) => {
    let loginAttempts = 0;

    await page.route('**/api/auth/login', async (route) => {
      loginAttempts += 1;
      const body = route.request().postDataJSON();

      if (!body.totpToken) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Code 2FA requis', requiresTwoFactor: true }),
        });
        return;
      }

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ token: '2fa-token', user: testUser }),
      });
    });

    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Email').fill(testUser.email);
    await page.getByPlaceholder('Mot de passe').fill('mot-de-passe-solide');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByText('Entrez le code généré par votre application 2FA')).toBeVisible();
    await expect(page.getByPlaceholder('Code 2FA (6 chiffres)')).toBeVisible();

    await page.getByPlaceholder('Code 2FA (6 chiffres)').fill('123456');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/animes$/);
    expect(loginAttempts).toBe(2);
  });

  test('bascule vers un code de secours quand l’application 2FA n’est pas disponible', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      const body = route.request().postDataJSON();

      if (!body.totpToken && !body.backupCode) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Code 2FA requis', requiresTwoFactor: true }),
        });
        return;
      }

      if (body.backupCode === 'AAAA-BBBB') {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ token: 'backup-token', user: testUser }),
        });
        return;
      }

      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Code invalide' }),
      });
    });

    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Email').fill(testUser.email);
    await page.getByPlaceholder('Mot de passe').fill('mot-de-passe-solide');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByPlaceholder('Code 2FA (6 chiffres)')).toBeVisible();
    await page.getByRole('button', { name: 'Utiliser un code de secours' }).click();

    await expect(page.getByPlaceholder('Code de secours (XXXX-XXXX)')).toBeVisible();
    await page.getByPlaceholder('Code de secours (XXXX-XXXX)').fill('AAAA-BBBB');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/animes$/);
  });
});
