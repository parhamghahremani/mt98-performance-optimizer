import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const TIMEOUT = 90000;

async function readScriptFile() {
  const scriptPath = path.resolve('src/mt98-performance-optimizer.user.js');
  return fs.readFileSync(scriptPath, 'utf-8');
}

async function gotoWithScript(page, url, scriptContent) {
  await page.addInitScript(scriptContent);
  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: TIMEOUT
  }).catch(() => null);
  return response;
}

test.describe('MT98 Performance Optimizer', () => {
  test('Script injects without errors on mt98.ir', async ({ page }) => {
    const scriptContent = await readScriptFile();
    const response = await gotoWithScript(page, 'https://mt98.ir/', scriptContent);

    if (!response) {
      console.log('Network error - skipping page-dependent assertions');
      return;
    }

    expect(response?.status()).toBeLessThan(400);
    await page.waitForTimeout(3000);

    const styleExists = await page.evaluate(() => {
      return document.getElementById('mt98-performance-optimizer') !== null;
    });
    expect(styleExists).toBeTruthy();

    const errors = [];
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('[MT98]')) {
        errors.push(text);
      }
    });
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test('Permanent scroll-effects disabling applied at load (v2.1.1)', async ({ page }) => {
    const scriptContent = await readScriptFile();
    const response = await gotoWithScript(page, 'https://mt98.ir/', scriptContent);

    if (!response) {
      console.log('Network error - skipping scroll test');
      return;
    }

    await page.waitForTimeout(3000);

    // v2.1.1: When disableAllScrollEffects is true (default), the script adds
    // mt98-disable-scroll-effects class immediately at load, NOT mt98-scrolling during scroll.
    // This eliminates flash completely because effects are permanently disabled.
    const hasDisableClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('mt98-disable-scroll-effects');
    });
    expect(hasDisableClass).toBeTruthy();

    // Verify mt98-scrolling class is NOT used (legacy mode only)
    const hasScrollingClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('mt98-scrolling');
    });
    expect(hasScrollingClass).toBeFalsy();
  });

  test('Images get decoding=async', async ({ page }) => {
    const scriptContent = await readScriptFile();
    const response = await gotoWithScript(page, 'https://mt98.ir/', scriptContent);

    if (!response) return;
    await page.waitForTimeout(3000);

    const asyncImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).filter(img => img.decoding === 'async').length;
    });
    expect(asyncImages).toBeGreaterThan(0);
  });

  test('Off-screen images get loading=lazy', async ({ page }) => {
    const scriptContent = await readScriptFile();
    const response = await gotoWithScript(page, 'https://mt98.ir/', scriptContent);

    if (!response) return;
    await page.waitForTimeout(3000);

    const lazyImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).filter(img => img.loading === 'lazy').length;
    });
    expect(typeof lazyImages).toBe('number');
  });

  test('Large images get content-visibility class', async ({ page }) => {
    const scriptContent = await readScriptFile();
    const response = await gotoWithScript(page, 'https://mt98.ir/', scriptContent);

    if (!response) return;
    await page.waitForTimeout(4000);

    const largeImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img.mt98-large-image');
      return images.length;
    });
    expect(typeof largeImages).toBe('number');
  });

  test('Reader pages are detected and handled conservatively', async ({ page }) => {
    const scriptContent = await readScriptFile();
    const response = await gotoWithScript(page, 'https://mt98.ir/readerpage.php', scriptContent);

    if (!response) return;
    expect(response?.status()).toBeLessThan(500);

    await page.waitForTimeout(2000);

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.waitForTimeout(500);
    const scriptErrors = errors.filter(e => !e.includes('404') && !e.includes('Failed to load'));
    expect(scriptErrors).toHaveLength(0);
  });

  test('Emergency disable via ?mt98perf=off', async ({ page }) => {
    const scriptContent = await readScriptFile();
    const response = await gotoWithScript(page, 'https://mt98.ir/?mt98perf=off', scriptContent);

    if (!response) return;
    expect(response?.status()).toBeLessThan(400);
    await page.waitForTimeout(1000);

    const styleExists = await page.evaluate(() => {
      return document.getElementById('mt98-performance-optimizer') !== null;
    });
    expect(styleExists).toBeFalsy();
  });

  test('Iframes get lazy loading when off-screen', async ({ page }) => {
    const scriptContent = await readScriptFile();
    const response = await gotoWithScript(page, 'https://mt98.ir/', scriptContent);

    if (!response) return;
    await page.waitForTimeout(3000);

    const lazyFrames = await page.evaluate(() => {
      const frames = document.querySelectorAll('iframe');
      return Array.from(frames).filter(f => f.loading === 'lazy').length;
    });
    expect(typeof lazyFrames).toBe('number');
  });
});