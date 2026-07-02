import * as z from 'zod';
import { SpecErrorResponseSchema } from '@/types/api';

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

  if (error instanceof z.ZodError) {
    return error.issues.map(issue => issue.message);
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
  schema: z.ZodType<T>,
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
    return schema.parse(undefined);
  }

  const data: unknown = await response
    .json()
    .catch(() => undefined);

  if (!response.ok) {
    throw new ApiError(response.status, parseErrorMessages(data));
  }

  const result = schema.safeParse(data);

  if (!result.success) {
    console.error('Unexpected API response shape', result.error);
    throw new ApiError(response.status, [
      'Received an unexpected response from the server.',
    ]);
  }

  return result.data;
}

function parseErrorMessages(data: unknown): string[] {
  const result = SpecErrorResponseSchema.safeParse(data);

  if (result.success && result.data.errors.body.length > 0) {
    return result.data.errors.body;
  }

  return ['Something went wrong. Please try again.'];
}
