import { request } from '@playwright/test';
import type { LoginResponse } from '../types/auth';
import data from '../data/testData.json';

export async function getAccessToken(
    { username = data.username, password = data.password, expiresInMins }:
        { username?: string; password?: string; expiresInMins?: number } = {}
) {
    const apiContext = await request.newContext({
        baseURL: 'https://dummyjson.com',
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });

    try {
        const payload: Record<string, unknown> = { username, password };
        if (typeof expiresInMins === 'number') payload.expiresInMins = expiresInMins;

        const res = await apiContext.post('/auth/login', { data: payload });
        if (!res.ok()) throw new Error(`/auth/login failed: ${res.status()} ${await res.text()}`);

        const body = (await res.json()) as LoginResponse;
        if (!body.accessToken) throw new Error('No accessToken in /auth/login response');

        return { accessToken: body.accessToken, refreshToken: body.refreshToken };
    } finally {
        await apiContext.dispose();
    }
}
