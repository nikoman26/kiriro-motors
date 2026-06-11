import { methodNotAllowed, json } from '../_lib/http';
import { requireAdmin } from '../_lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  return json(res, 200, { profile: admin.profile });
}
