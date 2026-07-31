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

const anime = {
  id: 5,
  title: 'One Piece',
  synopsis: 'Un chasseur de trésors part en mer.',
  imageUrl: null,
  score: 9.1,
  episodes: 1000,
  status: 'Ongoing',
  genres: [],
};

const mockAnimeAndReviews = async (page: import('@playwright/test').Page, reviews: any[] = []) => {
  await page.route('**/api/animes/5', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(anime) });
  });
  await page.route('**/api/reviews/anime/5', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(reviews) });
  });
};

test.describe('Fiche animé — reviews', () => {
  test('un visiteur non connecté qui tente de noter voit une invite de connexion', async ({ page }) => {
    await mockAnimeAndReviews(page);

    await page.goto('/animes/5');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'One Piece' })).toBeVisible();
    await page.getByRole('button', { name: '☆ Noter' }).click();

    await expect(page.getByRole('heading', { name: 'Connectez-vous pour continuer' })).toBeVisible();
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('un utilisateur connecté peut publier une review', async ({ page }) => {
    await authInit(page);
    await mockAnimeAndReviews(page);

    await page.route('**/api/watchlist', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify([]) });
        return;
      }
      if (route.request().method() === 'POST') {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ id: 33, animeId: 5, status: 'TO_WATCH', progress: 0 }),
        });
        return;
      }
      await route.continue();
    });

    let reviewBody: any = null;
    await page.route('**/api/reviews', async (route) => {
      if (route.request().method() === 'POST') {
        reviewBody = route.request().postDataJSON();
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, ...reviewBody }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/animes/5');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '☆ Noter' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByPlaceholder('Partagez votre avis sur cet animé...').fill('Excellent animé, à voir absolument.');
    await page.getByRole('button', { name: 'Publier' }).click();

    await expect(page.getByRole('dialog')).toBeHidden();
    await expect.poll(() => reviewBody?.comment).toBe('Excellent animé, à voir absolument.');
    expect(reviewBody.watchlistId).toBe(33);
  });
});
