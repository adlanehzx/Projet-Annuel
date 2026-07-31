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

test.describe('Création de listes', () => {
  test('la modale "Mes listes" refuse un titre vide puis crée la liste', async ({ page }) => {
    await authInit(page);

    await page.route('**/api/lists', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify([]) });
        return;
      }
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ id: 42, title: body.title, isPublic: body.isPublic, animes: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/lists');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '+ Créer une liste' }).click();
    await page.getByRole('button', { name: 'Créer', exact: true }).click();
    await expect(page.getByText('Le nom de la liste est requis')).toBeVisible();

    await page.getByPlaceholder('Ex: Mes classiques').fill('Mon top shonen');
    await page.getByRole('button', { name: 'Créer', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Nouvelle liste' })).toBeHidden();
  });

  test('la page dédiée /lists/new refuse un titre vide puis redirige vers la liste créée', async ({ page }) => {
    await authInit(page);

    await page.route('**/api/lists', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ id: 77, title: body.title, description: body.description, isPublic: body.isPublic }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/lists/77', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ id: 77, title: 'Mon top action', description: '', isPublic: true, animes: [] }),
      });
    });

    await page.goto('/lists/new');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Créer la liste' }).click();
    await expect(page.getByText('Le titre est requis')).toBeVisible();

    await page.getByPlaceholder('Mon top shonen...').fill('Mon top action');
    await page.getByText('Rendre cette liste publique').click();
    await page.getByRole('button', { name: 'Créer la liste' }).click();

    await expect(page).toHaveURL(/\/lists\/77$/);
  });
});
