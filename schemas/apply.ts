import 'dotenv/config';

import fs from 'fs/promises';
import path from 'path';
import Surreal from 'surrealdb';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const args = yargs(hideBin(process.argv))
  .options({
    clean: { type: 'boolean', default: false },
  })
  .parseSync();

const scriptDir = path.dirname(new URL(import.meta.url).pathname);

interface Config {
  endpoint: string;
  namespace: string;
  database: string;
  username: string;
  password: string;
}

const rawConfig = {
  endpoint: process.env.NEXT_PUBLIC_SURREALDB_ENDPOINT,
  namespace: process.env.NEXT_PUBLIC_SURREALDB_NAMESPACE,
  database: process.env.NEXT_PUBLIC_SURREALDB_DATABASE,
  username: process.env.SCHEMA_APPLIER_SURREALDB_USERNAME,
  password: process.env.SCHEMA_APPLIER_SURREALDB_PASSWORD,
};

function validateConfig(cfg: typeof rawConfig): cfg is Config {
  return Object.values(cfg).every(
    (v): v is string => typeof v === 'string' && v.length > 0
  );
}

if (!validateConfig(rawConfig)) {
  console.error(
    'Missing required environment variables:',
    Object.entries(rawConfig)
      .filter(([, value]) => !value)
      .map(([key]) => key)
      .join(', ')
  );
  process.exit(1);
}

const config: Config = rawConfig;

async function main() {
  const db = new Surreal();
  await db.connect(config.endpoint);

  try {
    // try to sign in as a database user
    await db.signin({
      namespace: config.namespace,
      database: config.database,
      username: config.username,
      password: config.password,
    });
  } catch {
    try {
      // try to sign in as a namespace user
      await db.signin({
        namespace: config.namespace,
        username: config.username,
        password: config.password,
      });
    } catch {
      // try to sign in as a root user
      await db.signin({
        username: config.username,
        password: config.password,
      });
    }
  }

  await db.use({
    namespace: config.namespace,
    database: config.database,
  });

  const files = (await fs.readdir(scriptDir)).filter(
    (f) => f.endsWith('.surql') || f.endsWith('.surrealql')
  );

  for (const [i, file] of files.entries()) {
    const table = path.basename(file, path.extname(file));
    console.log(`[${i + 1}/${files.length}] ${table}`);

    if (args.clean) {
      console.log(` => Cleaning...`);
      await db.query(`REMOVE TABLE ${table}`);
    }

    console.log(` => Applying schema...`);
    const query = await fs.readFile(path.join(scriptDir, file), 'utf-8');
    console.log(await db.query(query));
  }

  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
