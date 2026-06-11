import { methodNotAllowed, json } from '../_lib/http';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  res.setHeader('Set-Cookie', 'kiriro_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return json(res, 200, { ok: true });
}
