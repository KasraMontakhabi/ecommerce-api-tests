import { test, expect } from '@playwright/test';
import { getAccessToken } from '../utils/auth';
import type { APIRequestContext } from '@playwright/test';
import type { LoginResponse } from '../types/auth';
import data from '../data/testData.json';


test.describe('@auth public', () => {
    test('login returns tokens @smoke', async ({ request }) => {
        const res = await request.post('/auth/login', {
            data: {
                username: data.username,
                password: data.password,
            },
        });
        expect(res.ok()).toBeTruthy();
        const body = (await res.json()) as LoginResponse;
        expect(body.id).toEqual(expect.any(Number));
        expect(body.username).toEqual(expect.any(String));
        expect(body.accessToken).toBeTruthy();
        expect(body.refreshToken).toBeTruthy();

    });

    test('/auth/me unauthorized without or with invalid token', async ({ request }) => {
        const noToken = await request.get('/auth/me');
        expect(noToken.status()).toBe(401);

        const bad = await request.get('/auth/me', { headers: { Authorization: 'Bearer not-a-token' } });
        expect([401, 403]).toContain(bad.status());
    });

    test('login supports expiresInMins', async ({ request }) => {
        const res = await request.post('/auth/login', {
            data: {
                username: data.username,
                password: data.password,
                expiresInMins: 30,
            },
        });
        expect(res.ok()).toBeTruthy();
        const body = (await res.json()) as LoginResponse;
        expect(body.accessToken).toBeTruthy();
    });
});

test.describe('@auth authenticated', () => {
    let authApi: APIRequestContext;
    let rToken: string;

    test.beforeAll(async ({ playwright, baseURL }) => {
        const { accessToken, refreshToken } = await getAccessToken();
        rToken = refreshToken;
        authApi = await playwright.request.newContext({
            baseURL,
            extraHTTPHeaders: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

    });

    test.afterAll(async () => {
        await authApi?.dispose();
    });

    test('/auth/me works with Bearer token @smoke', async () => {
        const res = await authApi.get('/auth/me');
        expect(res.ok()).toBeTruthy();
        const me = await res.json();
        expect(me).toMatchObject({ id: expect.any(Number), username: expect.any(String) });
    });

    test('/auth/refresh returns new tokens @smoke', async () => {
        const res = await authApi.post('/auth/refresh', { data: {refreshToken:rToken} });
        expect(res.ok()).toBeTruthy();
        const j = await res.json();
        expect(j.accessToken).toBeTruthy();
        expect(j.refreshToken).toBeTruthy();
    });
});
