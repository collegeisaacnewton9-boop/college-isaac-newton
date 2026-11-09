import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('Service Worker & PWA Integration (Port-au-Prince Offline Reliability)', () => {
  it('should have a valid public/sw.js with critical caching strategies', () => {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    assert.ok(fs.existsSync(swPath), 'public/sw.js must exist');

    const swContent = fs.readFileSync(swPath, 'utf-8');
    assert.ok(swContent.includes('install'), 'Service worker must handle install event');
    assert.ok(swContent.includes('activate'), 'Service worker must handle activate event');
    assert.ok(swContent.includes('fetch'), 'Service worker must handle fetch event');
    assert.ok(swContent.includes('skipWaiting'), 'Service worker should call skipWaiting for immediate activation');
    assert.ok(swContent.includes('clients.claim'), 'Service worker should claim clients');
    assert.ok(swContent.includes('cin-static'), 'Service worker must have static asset cache');
    assert.ok(swContent.includes('cin-images'), 'Service worker must have images cache');
    assert.ok(swContent.includes('cin-api'), 'Service worker must have API fallback cache');
  });

  it('should have a compliant Web App Manifest in public/manifest.json', () => {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'public/manifest.json must exist');

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.equal(manifest.id, '/', 'Manifest id must be "/"');
    assert.equal(manifest.start_url, '/', 'Manifest start_url must be "/"');
    assert.equal(manifest.display, 'standalone', 'Manifest display must be standalone');
    assert.ok(manifest.name.includes('Isaac Newton'), 'Manifest name must include school name');
    assert.ok(manifest.short_name.length <= 12, 'short_name must be <= 12 chars');
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Must include at least 2 icon sizes');

    const has192 = manifest.icons.some((i: any) => i.sizes === '192x192');
    const has512 = manifest.icons.some((i: any) => i.sizes === '512x512');
    assert.ok(has192, 'Manifest must have 192x192 icon');
    assert.ok(has512, 'Manifest must have 512x512 icon');
  });

  it('should have compliant PNG icons for home screen install and apple-touch-icon', () => {
    const pwa192 = path.join(process.cwd(), 'public', 'pwa-192x192.png');
    const pwa512 = path.join(process.cwd(), 'public', 'pwa-512x512.png');
    const appleTouch = path.join(process.cwd(), 'public', 'apple-touch-icon.png');

    assert.ok(fs.existsSync(pwa192), 'pwa-192x192.png must exist');
    assert.ok(fs.existsSync(pwa512), 'pwa-512x512.png must exist');
    assert.ok(fs.existsSync(appleTouch), 'apple-touch-icon.png must exist');

    const pwa192Size = fs.statSync(pwa192).size;
    assert.ok(pwa192Size > 100, 'Icon file size should be valid');
  });

  it('should include link rel="manifest" and iOS tags in index.html', () => {
    const htmlPath = path.join(process.cwd(), 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(htmlContent.includes('rel="manifest"'), 'index.html must reference manifest');
    assert.ok(htmlContent.includes('name="apple-mobile-web-app-capable"'), 'index.html must support apple mobile web app');
    assert.ok(htmlContent.includes('rel="apple-touch-icon"'), 'index.html must have apple-touch-icon');
  });
});
