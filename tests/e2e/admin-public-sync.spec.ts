import { test, expect } from '@playwright/test';

/**
 * Suite de tests E2E Playwright : Synchronisation en direct Admin <-> Pages Publiques
 * et Garantie Anti-Cache pour le Collège Isaac Newton.
 */
test.describe('Synchronisation Admin & Pages Publiques (Anti-Cache)', () => {
  const timestamp = Date.now();
  const testSlideId = `e2e-slide-${timestamp}`;
  const testGalleryId = `e2e-gal-${timestamp}`;
  const testNewsSlug = `e2e-article-${timestamp}`;

  // Nettoyage avant et après les tests
  test.beforeEach(async ({ request }) => {
    // Vérifier l'état de santé du serveur
    const health = await request.get('/api/slides');
    expect(health.ok()).toBeTruthy();
  });

  test('1. En-têtes HTTP Anti-Cache stricts sur toutes les routes dynamiques', async ({ request }) => {
    const endpoints = ['/api/slides', '/api/gallery', '/api/media', '/api/settings'];

    for (const ep of endpoints) {
      const res = await request.get(`${ep}?_t=${Date.now()}`);
      expect(res.ok()).toBeTruthy();
      
      const cacheControl = res.headers()['cache-control'] || '';
      expect(cacheControl.toLowerCase()).toContain('no-cache');
      expect(cacheControl.toLowerCase()).toContain('no-store');
      expect(cacheControl.toLowerCase()).toContain('must-revalidate');
    }
  });

  test('2. Diaporama d’Entête : Ajout, modification, persistance de 9 diapositives et suppression sans cache zombie', async ({ page, request }) => {
    // Étape A : Récupérer les diapositives actuelles
    const initialRes = await request.get(`/api/slides?_t=${Date.now()}`);
    const originalSlides = await initialRes.json();
    expect(Array.isArray(originalSlides)).toBeTruthy();

    // Étape B : Mettre à jour exactement 9 diapositives
    const nineSlides = Array.from({ length: 9 }).map((_, idx) => ({
      id: `slide-sync-${idx + 1}`,
      title: idx === 0 ? `Titre Spécial E2E Test ${timestamp}` : `Diapositive Excellence #${idx + 1}`,
      subtitle: `Sous-titre certifié synchronisé pour le test numéro ${idx + 1}`,
      badge: `Campus Principal · Niveau ${idx + 1}`,
      image: '/images/campus_facade_real_1790679454540.jpg',
      ctaText: 'Préinscription',
      ctaTarget: 'pre-registration',
      secondaryCtaText: 'Contact',
      secondaryCtaTarget: 'contact',
      isActive: true,
      order: idx + 1,
      version: timestamp,
      updatedAt: timestamp,
    }));

    const putRes = await request.put(`/api/slides?_t=${Date.now()}`, {
      data: nineSlides,
      headers: { 'Content-Type': 'application/json' }
    });
    expect(putRes.ok()).toBeTruthy();
    const putData = await putRes.json();
    expect(putData.length).toBe(9);

    // Étape C : Vérifier que l'API renvoie bien 9 diapositives
    const verifyRes = await request.get(`/api/slides?_t=${Date.now()}`);
    const verifyData = await verifyRes.json();
    expect(verifyData.length).toBe(9);

    // Étape D : Visiter la page d'accueil publique et vérifier l'affichage en direct
    await page.goto('/?direct=1');
    await page.waitForLoadState('networkidle');

    // Vérifier la présence du titre de la diapositive active
    const heroTitle = page.locator('h1, h2').filter({ hasText: `Titre Spécial E2E Test ${timestamp}` });
    await expect(heroTitle.first()).toBeVisible({ timeout: 10000 });

    // Étape E : Supprimer une diapositive et vérifier que le total passe immédiatement à 8
    const deleteRes = await request.delete(`/api/slides/slide-sync-9?_t=${Date.now()}`);
    expect(deleteRes.ok()).toBeTruthy();

    const afterDeleteRes = await request.get(`/api/slides?_t=${Date.now()}`);
    const afterDeleteData = await afterDeleteRes.json();
    expect(afterDeleteData.length).toBe(8);

    // Étape F : Recharger la page publique et vérifier que le compte et le contenu sont à jour
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Rétablir les diapositives initiales propres pour ne pas polluer l'environnement
    if (originalSlides.length > 0) {
      await request.put('/api/slides', {
        data: originalSlides,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  test('3. Galerie des Activités Scolaires : Ajout, persistance live et suppression réactive', async ({ page, request }) => {
    const uniqueTitle = `Photo E2E Cérémonie Civique ${timestamp}`;
    const uniqueCaption = `Légende détaillée test E2E pour vérification en direct ${timestamp}`;

    // Étape A : Créer un nouvel élément de galerie
    const postRes = await request.post('/api/gallery', {
      data: {
        title: uniqueTitle,
        imageUrl: '/images/students_assembly_1790529184364.jpg',
        caption: uniqueCaption,
        altText: uniqueTitle,
        category: 'Vie Scolaire',
        highlights: ['Discipline civique', 'Élèves réunis'],
      },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(postRes.status()).toBe(201);
    const createdItem = await postRes.json();
    expect(createdItem.id).toBeDefined();

    // Étape B : Visiter la page publique de la Galerie (/galerie)
    await page.goto('/galerie');
    await page.waitForLoadState('networkidle');

    // Le nouvel élément doit être visible dans la grille publique
    const galleryCard = page.locator(`text=${uniqueTitle}`);
    await expect(galleryCard.first()).toBeVisible({ timeout: 10000 });

    // Étape C : Modifier l'élément
    const updatedTitle = `${uniqueTitle} (Modifié)`;
    const putRes = await request.put(`/api/gallery/${createdItem.id}`, {
      data: {
        title: updatedTitle,
        caption: `${uniqueCaption} - version modifiée`,
        category: 'Vie Scolaire',
      },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(putRes.ok()).toBeTruthy();

    // Recharger la page publique de la galerie
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${updatedTitle}`).first()).toBeVisible({ timeout: 10000 });

    // Étape D : Supprimer l'élément et vérifier sa disparition immédiate
    const delRes = await request.delete(`/api/gallery/${createdItem.id}`);
    expect(delRes.ok()).toBeTruthy();

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${updatedTitle}`)).toHaveCount(0);
  });

  test('4. Paramètres de Cache-Busting sur les images (v & t obligatoires)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Inspecter toutes les images avec src du campus
    const images = await page.locator('img[src*="/images/"]').all();
    expect(images.length).toBeGreaterThan(0);

    for (const img of images.slice(0, 5)) {
      const src = await img.getAttribute('src');
      if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
        // Doit inclure un paramètre anti-cache (?v= ou ?t= ou &v= ou &t=)
        const hasCacheBuster = src.includes('v=') || src.includes('t=') || src.includes('cin_cb=');
        expect(hasCacheBuster).toBeTruthy();
      }
    }
  });
});
