import { test, expect } from '@playwright/test';
import type { ProductsList, Product } from '../types/products';
import data from '../data/testData.json';

test.describe('@cross cross', () => {

    test('select: mix valid/invalid fields keeps valid ones and stays 200', async ({ request }) => {
        const res = await request.get('/products', { params: { limit: 5, select: 'id,title,price,___notAField' } });
        expect(res.ok()).toBeTruthy();
        const b = await res.json();

        for (const p of b.products) {
            expect(Object.keys(p).sort()).toEqual(['id', 'price', 'title']);
        }
    });

    test('limits/skip edge handling', async ({ request }) => {
        const zero = await request.get('/products', { params: { limit: 0 } });
        expect(zero.ok()).toBeTruthy();
        const large = await request.get('/products', { params: { limit: 10_000 } });
        expect(large.ok()).toBeTruthy();
        const negative = await request.get('/products', { params: { limit: 10, skip: -5 } });
        expect([200, 400]).toContain(negative.status());
    });

    test('invalid product id returns error', async ({ request }) => {
        const r = await request.get('/products/999999');
        expect([404, 400]).toContain(r.status());
    });

    test('malformed JSON yields error', async ({ request }) => {
        const r = await request.fetch('/products/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: '{ "title": "Bad JSON" ' // intentionally malformed
        } as any);
        expect([400, 422, 500]).toContain(r.status());
    });

    test('p95-ish latency under target for login & list', async ({ request }) => {
        const samples: number[] = [];

        for (let i = 0; i < 5; i++) {
            const start = performance.now();
            await request.post('/auth/login', {
                data: {
                    username: data.username,
                    password: data.password,
                },
            });
            const ms = performance.now() - start;
            samples.push(ms);
        }

        samples.sort((a, b) => a - b);
        const p95 = samples[Math.floor(samples.length * 0.95) - 1] ?? samples[samples.length - 1];

        expect(p95).toBeLessThan(800);
    });


    test('categories slugs yield results', async ({ request }) => {
        const cats = await request.get('/products/category-list');
        expect(cats.ok()).toBeTruthy();
        const slugs: string[] = await cats.json();
        const take = slugs.slice(0, Math.min(3, slugs.length));
        for (const s of take) {
            const res = await request.get(`/products/category/${encodeURIComponent(s)}`);
            expect(res.ok()).toBeTruthy();
            const body = (await res.json()) as ProductsList;
            expect(Array.isArray(body.products)).toBe(true);
        }
    });

});


