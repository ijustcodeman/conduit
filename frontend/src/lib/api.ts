import type { SpecErrorResponse } from '@/types/api';

const API_BASE_URL = '/api';

let tokenProvider: (() => string | null) | null = null;

export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages.join(' '));
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
  }
}

export function setTokenProvider(provider: () => string | null) {
  tokenProvider = provider;
}

export function getErrorMessages(error: unknown): string[] {
  if (error instanceof ApiError) {
    return error.messages;
  }

  if (error instanceof Error) {
    return [error.message];
  }

  return ['Something went wrong. Please try again.'];
}

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  Object.entries(options.query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  const headers = new Headers({
    Accept: 'application/json',
  });

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const token = tokenProvider?.();

  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response
    .json()
    .catch(() => undefined);

  if (!response.ok) {
    throw new ApiError(response.status, parseErrorMessages(data));
  }

  return data as T;
}

function parseErrorMessages(data: unknown): string[] {
  const specError = data as SpecErrorResponse | undefined;
  const messages = specError?.errors?.body;

  if (Array.isArray(messages) && messages.length > 0) {
    return messages;
  }

  return ['Something went wrong. Please try again.'];
}
