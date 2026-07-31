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

test.describe('Recherche et ajout à la watchlist', () => {
  test('un utilisateur connecté peut chercher un animé et l’ajouter à sa watchlist', async ({ page }) => {
    await authInit(page);

    await page.route('**/api/animes?**', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Naruto',
            titleEnglish: null,
            status: 'Terminé',
            score: 8.2,
            imageUrl: null,
          },
        ]),
      });
    });

    let addRequestBody: any = null;
    await page.route('**/api/watchlist', async (route) => {
      if (route.request().method() === 'POST') {
        addRequestBody = route.request().postDataJSON();
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ id: 99, animeId: 1, status: 'TO_WATCH', progress: 0 }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/animes/search');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Chercher un animé...').fill('Naruto');
    await page.getByRole('button', { name: 'Chercher' }).click();

    await expect(page.getByRole('heading', { name: 'Naruto' })).toBeVisible();

    const addButton = page.getByRole('button', { name: '+ Ajouter' });
    await expect(addButton).toBeEnabled();
    await addButton.click();

    await expect(page.getByRole('button', { name: '✓ Dans ma watchlist' })).toBeVisible();
    await expect(page.getByRole('button', { name: '✓ Dans ma watchlist' })).toBeDisabled();
    await expect.poll(() => addRequestBody).toEqual({ animeId: 1, status: 'TO_WATCH' });
  });

  test('une recherche vide affiche un message d’erreur sans appeler le serveur', async ({ page }) => {
    await authInit(page);

    let searchCalled = false;
    await page.route('**/api/animes?**', async (route) => {
      searchCalled = true;
      await route.continue();
    });

    await page.goto('/animes/search');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Chercher' }).click();

    await expect(page.getByText('Veuillez entrer un titre')).toBeVisible();
    expect(searchCalled).toBe(false);
  });

  test('une recherche sans résultat affiche "Aucun animé trouvé"', async ({ page }) => {
    await authInit(page);

    await page.route('**/api/animes?**', async (route) => {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/animes/search');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Chercher un animé...').fill('Introuvable');
    await page.getByRole('button', { name: 'Chercher' }).click();

    await expect(page.getByText('Aucun animé trouvé')).toBeVisible();
  });
});

test.describe('Gestion de la watchlist', () => {
  const watchlistItem = {
    id: 10,
    animeId: 1,
    title: 'Naruto',
    status: 'TO_WATCH',
    progress: 0,
    posterPath: null,
    anime: { episodes: 220 },
  };

  test('changer le statut, mettre à jour la progression et retirer un animé', async ({ page }) => {
    await authInit(page);

    let currentItem = { ...watchlistItem };
    const putRequests: any[] = [];

    await page.route('**/api/watchlist', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify([currentItem]) });
        return;
      }
      await route.continue();
    });

    await page.route('**/api/watchlist/10/status', async (route) => {
      const body = route.request().postDataJSON();
      putRequests.push({ type: 'status', body });
      currentItem = { ...currentItem, status: body.status };
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(currentItem) });
    });

    await page.route('**/api/watchlist/10/progress', async (route) => {
      const body = route.request().postDataJSON();
      putRequests.push({ type: 'progress', body });
      currentItem = { ...currentItem, progress: body.progress };
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(currentItem) });
    });

    await page.route('**/api/watchlist/10', async (route) => {
      if (route.request().method() === 'DELETE') {
        currentItem = null as any;
        await route.fulfill({ status: 204, body: '' });
        return;
      }
      await route.continue();
    });

    await page.goto('/watchlist');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Naruto' })).toBeVisible();

    await page.locator('select').selectOption('WATCHING');
    await expect.poll(() => putRequests.find((r) => r.type === 'status')?.body).toEqual({ status: 'WATCHING' });
    await expect(page.getByText('En cours ·', { exact: false })).toBeVisible();

    const rangeInput = page.locator('input[type="range"]');
    await rangeInput.evaluate((el: HTMLInputElement) => {
      el.value = '50';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.getByRole('button', { name: 'Enregistrer progression' }).click();
    await expect.poll(() => putRequests.find((r) => r.type === 'progress')?.body).toEqual({ progress: 50 });

    await page.getByRole('button', { name: 'Retirer' }).click();
    await expect(page.getByText('Aucun animé ici')).toBeVisible();
  });

  test('la watchlist vide affiche un état vide avec un lien vers le catalogue', async ({ page }) => {
    await authInit(page);

    await page.route('**/api/watchlist', async (route) => {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/watchlist');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Aucun animé ici')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Parcourir le catalogue' })).toBeVisible();
  });
});
