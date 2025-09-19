import { test, expect } from '@playwright/test';
import type { UsersList } from '../types/users';
import data from '../data/testData.json';

test.describe('@users users', () => {

    test('GET /users default pagination @smoke', async ({ request }) => {
        const res = await request.get('/users');
        expect(res.ok()).toBeTruthy();
        const b = (await res.json()) as UsersList;
        expect(Array.isArray(b.users)).toBe(true);
        expect(b.limit).toBe(30);
        expect(b.skip).toBe(0);
        expect(b.total).toBeGreaterThan(0);
    });

    test('pagination & select', async ({ request }) => {
        const res = await request.get('/users', { params: { limit: 5, skip: 10, select: 'firstName,age' } });
        expect(res.ok()).toBeTruthy();
        const b = (await res.json()) as UsersList;
        expect(b.limit).toBe(5);
        expect(b.skip).toBe(10);
        for (const u of b.users) {
            expect(Object.keys(u)).toEqual(expect.arrayContaining(['id', 'firstName', 'age']));
        }
    });

    test('sort firstName asc', async ({ request }) => {
        const res = await request.get('/users', { params: { sortBy: 'firstName', order: 'asc', limit: 20 } });
        expect(res.ok()).toBeTruthy();
        const b = (await res.json()) as UsersList;
        const names = b.users.map(u => u.firstName);
        const sorted = [...names].sort((a, c) => a.localeCompare(c, undefined, { numeric: true }));
        expect(names).toEqual(sorted);
    });

    test('search John & filter hair.color=Brown', async ({ request }) => {
        const s = await request.get('/users/search', { params: { q: 'John' } });
        expect(s.ok()).toBeTruthy();
        const fs = await request.get('/users/filter', { params: { key: 'hair.color', value: 'Brown' } });
        expect(fs.ok()).toBeTruthy();
    });

    test('GET /users/1 has rich schema', async ({ request }) => {
        const res = await request.get('/users/1');
        expect(res.ok()).toBeTruthy();
        const u = await res.json();
        expect(u).toEqual(expect.objectContaining({
            id: 1,
            address: expect.any(Object),
            company: expect.any(Object),
        }));
    });

    test('/auth/login then /auth/me', async ({ request }) => {
        const login = await request.post('/auth/login', {
            data: {
                username: data.username,
                password: data.password,
            }
        });
        expect(login.ok()).toBeTruthy();
        const { accessToken } = await login.json();
        const me = await request.get('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
        expect(me.ok()).toBeTruthy();
    });

    test('create user is simulated @smoke', async ({ request }) => {
        const create = await request.post('/users/add', { data: { firstName: 'A', lastName: 'Tester' } });
        expect(create.ok()).toBeTruthy();
        const cj = await create.json();
        expect(cj.id).toBeTruthy();
    });

});


