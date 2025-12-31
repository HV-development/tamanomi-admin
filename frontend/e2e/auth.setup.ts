import { test as setup, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'tamanomi-admin@example.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'tamanomi-admin123';
const authFile = '.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
    // コンソールとエラーを監視
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('[Console Error]', msg.text());
        }
    });
    page.on('pageerror', error => console.log('[Page Error]', error.message));
    page.on('request', req => {
        if (req.url().includes('/api/')) {
            console.log('[Request]', req.method(), req.url());
        }
    });
    page.on('response', resp => {
        if (resp.url().includes('/api/')) {
            console.log('[Response]', resp.status(), resp.url());
        }
    });

    console.log('[Auth Setup] Starting...');
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // 入力
    await page.locator('#email').fill(ADMIN_EMAIL);
    await page.locator('#password').fill(ADMIN_PASSWORD);
    
    console.log('[Auth Setup] Form filled, waiting...');
    await page.waitForTimeout(1000);

    // ボタンをクリック
    const button = page.locator('button').filter({ hasText: 'ログイン' }).first();
    console.log('[Auth Setup] Button enabled:', await button.isEnabled());
    
    // ボタンのdisabled属性を確認
    const isDisabled = await button.getAttribute('disabled');
    console.log('[Auth Setup] Button disabled attr:', isDisabled);
    
    // クリック実行
    console.log('[Auth Setup] Clicking...');
    await button.click({ force: true });
    
    // 待機
    console.log('[Auth Setup] Waiting for response...');
    await page.waitForTimeout(5000);

    console.log('[Auth Setup] Final URL:', page.url());
    
    const cookies = await page.context().cookies();
    const accessToken = cookies.find(c => c.name.includes('accessToken'));
    
    if (accessToken || !page.url().includes('/login')) {
        console.log('[Auth Setup] Login successful!');
        await page.context().storageState({ path: authFile });
    } else {
        // スクリーンショットを保存
        await page.screenshot({ path: 'test-results/login-debug.png', fullPage: true });
        throw new Error('[Auth Setup] Login failed - URL: ' + page.url());
    }
});
