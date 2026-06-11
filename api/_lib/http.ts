export function json(res: any, status: number, body: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function methodNotAllowed(res: any, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '));
  json(res, 405, { error: `Method not allowed. Use ${allowed.join(', ')}.` });
}

export async function readBody<T = Record<string, unknown>>(req: any): Promise<T> {
  if (req.body && typeof req.body === 'object') return req.body as T;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) as T : {} as T;
}

export function requireSupabase(res: any, client: unknown) {
  if (client) return true;
  json(res, 503, {
    error: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY in Vercel.',
  });
  return false;
}
