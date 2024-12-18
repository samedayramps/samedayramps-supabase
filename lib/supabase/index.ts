import { createClient as createServerClient } from './server';
import { createClient as createBrowserClient } from './client';

export const createClient = typeof window === 'undefined' 
  ? createServerClient 
  : createBrowserClient;

export * from './server';
export * from './client';