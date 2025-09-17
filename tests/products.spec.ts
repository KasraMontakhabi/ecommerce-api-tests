import { test, expect } from '@playwright/test';
import type { ProductsList, Product } from '../types/products';

test.describe('@products products', () => {

    test('GET /products default pagination @smoke', async ({ request }) => {
        const res = await request.get('/products');
        expect(res.ok()).toBeTruthy();
        const body = (await res.json()) as ProductsList;
        expect(Array.isArray(body.products)).toBe(true);
        expect(body.limit).toBe(30);
        expect(body.skip).toBe(0);
        expect(body.total).toBeGreaterThan(0);
    });

    test('pagination + select fields; limit=0 returns all', async ({ request }) => {
        const res = await request.get('/products', { params: { limit: 10, skip: 10, select: 'title,price' } });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();

        expect(body.limit).toBe(10);
        expect(body.skip).toBe(10);

        // Assert each product has ONLY id, title, price
        for (const p of body.products) {
            expect(Object.keys(p).sort()).toEqual(['id', 'price', 'title']);
        }

        // limit=0 returns all
        const all = await request.get('/products', { params: { limit: 0 } });
        expect(all.ok()).toBeTruthy();
        const allBody = await all.json();
        expect(allBody.products.length).toBeGreaterThanOrEqual(body.products.length);
    });


    test('sorting by title asc', async ({ request }) => {
        const res = await request.get('/products', { params: { sortBy: 'title', order: 'asc', limit: 20 } });
        expect(res.ok()).toBeTruthy();
        const body = (await res.json()) as ProductsList;
        const titles = body.products.map((p: Product) => p.title);
        const sorted = [...titles].sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        );
        expect(titles).toEqual(sorted);

    });

    test('categories metadata and list', async ({ request }) => {
        const cats1 = await request.get('/products/categories');
        expect(cats1.ok()).toBeTruthy();
        const arr1 = await cats1.json();
        expect(Array.isArray(arr1)).toBe(true);
        expect(arr1[0]).toEqual(expect.objectContaining({ slug: expect.any(String), name: expect.any(String), url: expect.any(String) }));

        const cats2 = await request.get('/products/category-list');
        expect(cats2.ok()).toBeTruthy();
        const arr2 = await cats2.json();
        expect(Array.isArray(arr2)).toBe(true);
        expect(typeof arr2[0]).toBe('string');
    });

    test('products by category smartphones', async ({ request }) => {
        const res = await request.get('/products/category/smartphones');
        expect(res.ok()).toBeTruthy();
        const body = (await res.json()) as ProductsList;
        for (const p of body.products) expect(p.category).toBe('smartphones');
    });

    test('product search q=phone', async ({ request }) => {
        const res = await request.get('/products/search', { params: { q: 'phone' } });
        expect(res.ok()).toBeTruthy();
        const body = (await res.json()) as ProductsList;
        expect(body.total).toBeGreaterThan(0);
    });

    test('create product is simulated', async ({ request }) => {
        const res = await request.post('/products/add', { data: { title: 'iPhone 15', price: 99, category: 'stationery' } });
        expect(res.ok()).toBeTruthy();
        const j = await res.json();
        expect(j.id).toBeTruthy();
        expect(j.title).toBe('iPhone 15');
    });

    test('update product title is echoed back (not persisted)', async ({ request }) => {
        const res = await request.put('/products/1', { data: { title: 'iPhone Galaxy +1' } });
        expect(res.ok()).toBeTruthy();
        const j = await res.json();
        expect(j.title).toBe('iPhone Galaxy +1');
    });

    test('delete product marks isDeleted=true', async ({ request }) => {
        const res = await request.delete('/products/1');
        expect(res.ok()).toBeTruthy();
        const j = await res.json();
        expect(j.isDeleted).toBe(true);
        expect(typeof j.deletedOn).toBe('string');
    });

});


