import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config();

function loadLooseCredentialsFile() {
  const file = path.resolve('supabase credentials.md');
  if (!fs.existsSync(file)) return;

  const lines = fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const [key, ...rest] = line.includes('=') ? line.split('=') : ['', line];
    const value = rest.join('=').trim().replace(/^"|"$/g, '');

    if (!process.env.SUPABASE_URL && /^https:\/\/[^\s]+\.supabase\.co/.test(value)) {
      process.env.SUPABASE_URL = value;
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && /^sb_secret_/.test(value)) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = value;
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && /SERVICE_ROLE|SECRET/.test(key)) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = value;
    }

    if (!process.env.SUPABASE_URL && key === 'SUPABASE_URL') {
      process.env.SUPABASE_URL = value;
    }
  }
}

async function findUserByEmail(supabase, email) {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find(item => item.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  loadLooseCredentialsFile();

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  const email = process.env.ADMIN_EMAIL ?? 'admin@kiriromotors.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local or supabase credentials.md.');
  }

  if (!password) {
    throw new Error('Missing ADMIN_PASSWORD. Set it only for this command, not in committed files.');
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let user = await findUserByEmail(supabase, email);

  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  }

  const { error: profileError } = await supabase
    .from('admin_profiles')
    .upsert({
      id: user.id,
      email,
      role: 'owner',
      full_name: 'Kiriro Owner Admin',
      is_active: true,
      updated_at: new Date().toISOString(),
    });

  if (profileError) throw profileError;

  console.log(`Admin user seeded: ${email}`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
