import { test, expect } from '@playwright/test';
import type { Cart } from '../types/carts';
import { recomputeCartTotals } from '../utils/expectHelpers';

test.describe('@carts carts', () => {

    test('GET /carts schema @smoke', async ({ request }) => {
        const res = await request.get('/carts');
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        const carts: Cart[] = body.carts;
        expect(Array.isArray(carts)).toBe(true);
        if (carts.length) {
            const c = carts[0];
            expect(Array.isArray(c.products)).toBe(true);
            expect(c).toEqual(expect.objectContaining({
                total: expect.any(Number),
                discountedTotal: expect.any(Number),
                userId: expect.any(Number),
                totalProducts: expect.any(Number),
                totalQuantity: expect.any(Number),
            }));
        }
    });

    test('GET /carts/1', async ({ request }) => {
        const res = await request.get('/carts/1');
        expect(res.ok()).toBeTruthy();
        const cart = (await res.json()) as Cart;
        expect(cart.id).toBe(1);
        expect(Array.isArray(cart.products)).toBe(true);
    });

    test('GET /carts/user/5', async ({ request }) => {
        const res = await request.get('/carts/user/5');
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        const carts: Cart[] = body.carts;
        for (const c of carts) expect(c.userId).toBe(5);
    });

    test('POST /carts/add computes totals @smoke', async ({ request }) => {
        const res = await request.post('/carts/add', {
            data: { userId: 1, products: [{ id: 1, quantity: 2 }] }
        });
        expect(res.ok()).toBeTruthy();
        const cart = (await res.json()) as Cart;
        expect(cart.id).toBeTruthy();
        const recomputed = recomputeCartTotals(cart.products.map(p => ({
            price: p.price, quantity: p.quantity, discountPercentage: p.discountPercentage as number | undefined
        })));
        expect(cart.totalProducts).toBe(recomputed.totalProducts);
        expect(cart.totalQuantity).toBe(recomputed.totalQuantity);
    });

    test('PUT /carts/1 merge behavior', async ({ request }) => {
        const res = await request.put('/carts/1', {
            data: { merge: true, products: [{ id: 1, quantity: 1 }] }
        });
        expect(res.ok()).toBeTruthy();
        const cart = (await res.json()) as Cart;
        expect(cart.totalProducts).toBeGreaterThan(0);
    });

    test('DELETE /carts/1 marks deleted', async ({ request }) => {
        const res = await request.delete('/carts/1');
        expect(res.ok()).toBeTruthy();
        const j = await res.json();
        expect(j.isDeleted).toBe(true);
        expect(typeof j.deletedOn).toBe('string');
    });

    test('D1 recompute server totals integrity', async ({ request }) => {
        const res = await request.post('/carts/add', {
            data: { userId: 2, products: [{ id: 1, quantity: 1 }, { id: 2, quantity: 3 }] }
        });
        expect(res.ok()).toBeTruthy();
        const cart = (await res.json()) as Cart;
        const recomputed = recomputeCartTotals(cart.products.map(p => ({
            price: p.price, quantity: p.quantity, discountPercentage: p['discountPercentage'] as number | undefined
        })));
        expect(cart.totalQuantity).toBe(recomputed.totalQuantity);
        expect(cart.totalProducts).toBe(recomputed.totalProducts);
    });

});


