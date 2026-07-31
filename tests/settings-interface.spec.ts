import { expect, test } from '@playwright/test';

const testUser = {
  id: 1,
  email: 'e2e@example.test',
  username: 'e2e-user',
};

const authInit = (page: import('@playwright/test').Page) =>
  page.addInitScript((user) => {
    localStorage.setItem('token', 'e2e-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, testUser);

const mockProfileAndStatus = async (
  page: import('@playwright/test').Page,
  overrides: { isPublic?: boolean; bio?: string; totpEnabled?: boolean; backupCodesRemaining?: number } = {},
) => {
  await page.route('**/api/auth/profile', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'e2e-user',
          email: testUser.email,
          bio: overrides.bio ?? '',
          isPublic: overrides.isPublic ?? false,
          hasPassword: true,
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/api/auth/2fa/status', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        totpEnabled: overrides.totpEnabled ?? false,
        backupCodesRemaining: overrides.backupCodesRemaining ?? 0,
      }),
    });
  });
};

test.describe('Paramètres — profil et confidentialité', () => {
  test('modifier et enregistrer la description du profil', async ({ page }) => {
    await authInit(page);
    await mockProfileAndStatus(page, { bio: 'Ancienne description' });

    let putBody: any = null;
    await page.route('**/api/auth/profile', async (route) => {
      if (route.request().method() === 'PUT') {
        putBody = route.request().postDataJSON();
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ bio: putBody.bio, isPublic: false }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const bioField = page.getByPlaceholder('Parlez un peu de vous, de vos goûts animés…');
    await expect(bioField).toHaveValue('Ancienne description');
    await bioField.fill('Fan de shonen depuis 2010');
    await page.getByRole('button', { name: 'Enregistrer la description' }).click();

    await expect(page.getByText('Description enregistrée.')).toBeVisible();
    await expect.poll(() => putBody?.bio).toBe('Fan de shonen depuis 2010');
  });

  test('activer/désactiver la visibilité publique du profil', async ({ page }) => {
    await authInit(page);
    await mockProfileAndStatus(page, { isPublic: false });

    let putBody: any = null;
    await page.route('**/api/auth/profile', async (route) => {
      if (route.request().method() === 'PUT') {
        putBody = route.request().postDataJSON();
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ isPublic: putBody.isPublic }) });
        return;
      }
      await route.continue();
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const toggle = page.getByRole('checkbox', { name: /Rendre mon profil public/ });
    await expect(toggle).not.toBeChecked();
    await toggle.check();

    await expect(page.getByText('Ton profil est maintenant public.')).toBeVisible();
    await expect.poll(() => putBody?.isPublic).toBe(true);
  });

  test('activer la 2FA via le QR code puis afficher les codes de secours', async ({ page }) => {
    await authInit(page);
    await mockProfileAndStatus(page, { totpEnabled: false });

    await page.route('**/api/auth/2fa/setup', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ secret: 'SECRETBASE32', qrCode: 'data:image/png;base64,abc' }),
      });
    });
    await page.route('**/api/auth/2fa/enable', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ message: 'ok', backupCodes: ['AAAA-AAAA', 'BBBB-BBBB'] }),
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Activer la 2FA' }).click();
    await expect(page.getByAltText('QR code 2FA')).toBeVisible();

    await page.getByPlaceholder('Code à 6 chiffres').fill('123456');
    await page.getByRole('button', { name: 'Confirmer' }).click();

    await expect(page.getByText('Sauvegardez ces codes de secours maintenant', { exact: false })).toBeVisible();
    await expect(page.getByText('AAAA-AAAA')).toBeVisible();
    await expect(page.getByText('BBBB-BBBB')).toBeVisible();
  });

  test('le bouton de suppression de compte reste désactivé tant que le pseudo tapé ne correspond pas', async ({ page }) => {
    await authInit(page);
    await mockProfileAndStatus(page);

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const deleteButton = page.getByRole('button', { name: 'Supprimer définitivement mon compte' });
    await expect(deleteButton).toBeDisabled();

    await page.getByPlaceholder('e2e-user').fill('mauvais-pseudo');
    await expect(deleteButton).toBeDisabled();

    await page.getByPlaceholder('e2e-user').fill('e2e-user');
    await expect(deleteButton).toBeDisabled();

    await page.getByPlaceholder('Votre mot de passe').fill('mot-de-passe');
    await expect(deleteButton).toBeEnabled();
  });
});
