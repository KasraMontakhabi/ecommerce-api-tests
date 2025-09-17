import { request } from '@playwright/test';

export async function apiClient(baseURL: string, extraHeaders?: Record<string, string>) {
  return request.newContext({
    baseURL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      ...(extraHeaders || {}),
    },
    ignoreHTTPSErrors: true
  });
}
