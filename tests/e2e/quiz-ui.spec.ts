import { expect, test, type Page } from '@playwright/test';

async function goToCharacterSelection(page: Page) {
    await page.goto('/');
    await page.locator('html[data-kana-ready="true"]').waitFor({ state: 'attached' });
    await page.locator('.step:visible').getByRole('button', { name: 'Próximo' }).click();
    await expect(page.getByRole('heading', { name: 'Caracteres' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Modo de estudo' })).toBeHidden();
}

async function startQuiz(page: Page) {
    await goToCharacterSelection(page);
    await page.locator('.step:visible').getByRole('button', { name: 'Próximo' }).click();
    await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Caracteres' })).toBeHidden();
    await page.getByRole('button', { name: 'Começar quiz' }).click();
    await expect(page.locator('.quiz')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('input[type="text"]')).toBeEnabled({ timeout: 5_000 });
}

test('keeps quiz controls clear of the content at every viewport', async ({ page }, testInfo) => {
    await startQuiz(page);

    const actions = page.locator('.quiz-actions');
    await expect(actions.locator('button')).toHaveCount(3);

    if (testInfo.project.name === 'mobile-chromium') {
        const actionsBox = await actions.boundingBox();
        const quizBox = await page.locator('.quiz').boundingBox();
        expect(actionsBox).not.toBeNull();
        expect(quizBox).not.toBeNull();
        expect(actionsBox!.y + actionsBox!.height).toBeLessThanOrEqual(quizBox!.y);
    }

    await page.locator('input[type="text"]').fill('resposta-invalida');
    await page.locator('input[type="text"]').press('Enter');
    await expect(page.getByText('Resposta incorreta')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toHaveClass(/is-error/);

    await page.getByRole('button', { name: 'Sair do quiz' }).click();
    const overlay = page.locator('.modal-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveCSS('animation-name', 'none');
});

test('summarizes mistakes and starts a focused review', async ({ page }) => {
    await page.goto('/');
    await page.locator('html[data-kana-ready="true"]').waitFor({ state: 'attached' });
    await page.getByRole('button', { name: 'Hiragana' }).click();
    await page.locator('.step:visible').getByRole('button', { name: 'Próximo' }).click();
    await expect(page.getByRole('heading', { name: 'Caracteres' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Modo de estudo' })).toBeHidden();

    for (const clearSection of await page.getByRole('button', { name: 'Nenhum' }).all()) {
        await clearSection.click();
    }
    await page.locator('label[for="char-0"]').click();
    await expect(page.locator('#char-0')).toBeChecked();
    await page.locator('.step:visible').getByRole('button', { name: 'Próximo' }).click();
    await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Caracteres' })).toBeHidden();
    await page.locator('#repeat').fill('1');
    await page.getByRole('button', { name: 'Começar quiz' }).click();

    const answer = page.locator('input[type="text"]');
    await expect(answer).toBeEnabled({ timeout: 5_000 });
    await answer.fill('x');
    await answer.press('Enter');
    await expect(page.getByText('Resposta incorreta')).toBeVisible();

    await expect(answer).toBeEnabled({ timeout: 3_000 });
    await answer.fill('a');
    await answer.press('Enter');

    await expect(page.getByText('Precisam de revisão')).toBeVisible();
    await expect(page.getByText('1 erro')).toBeVisible();
    await page.getByRole('button', { name: 'Revisar meus erros' }).click();
    await expect(page.locator('.quiz')).toBeVisible();
    await expect(answer).toBeEnabled({ timeout: 5_000 });
});
