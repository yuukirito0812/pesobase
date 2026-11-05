import { createHandler } from './handler.mjs';
Deno.serve(createHandler({
  url: Deno.env.get('SUPABASE_URL') || '',
  publishableKey: Deno.env.get('SUPABASE_ANON_KEY') || '',
}));
