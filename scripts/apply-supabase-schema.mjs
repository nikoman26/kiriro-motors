import fs from 'node:fs';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });
dotenv.config();

function loadCredentialsText() {
  const parts = [];
  if (fs.existsSync('.env.local')) parts.push(fs.readFileSync('.env.local', 'utf8'));
  if (fs.existsSync('supabase credentials.md')) parts.push(fs.readFileSync('supabase credentials.md', 'utf8'));
  return parts.join('\n');
}

function databaseConfigFromCredentials() {
  const raw = loadCredentialsText();
  const envUrl = process.env.DATABASE_URL;
  const looseUrl = raw.match(/postgresql:\/\/[^\r\n]+/)?.[0];
  const url = envUrl && envUrl.startsWith('postgres') ? envUrl : looseUrl;

  if (!url) throw new Error('Missing DATABASE_URL or raw postgresql:// connection string.');

  const bracketMatch = url.match(/^postgresql:\/\/([^:]+):\[(.+)\]@([^:/]+):(\d+)\/(.+)$/);
  if (bracketMatch) {
    return {
      user: bracketMatch[1],
      password: bracketMatch[2],
      host: bracketMatch[3],
      port: Number(bracketMatch[4]),
      database: bracketMatch[5],
      ssl: { rejectUnauthorized: false },
    };
  }

  return {
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  };
}

async function main() {
  const schema = fs.readFileSync('supabase/schema.sql', 'utf8');
  const client = new pg.Client(databaseConfigFromCredentials());
  await client.connect();
  try {
    await client.query(schema);
  } finally {
    await client.end();
  }

  console.log('Supabase schema applied.');
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
