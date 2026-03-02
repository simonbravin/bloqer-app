#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, 'prisma', 'migrations', '20250101000000_initial_schema', 'migration.sql');
const sql = execSync(
  'npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
  { encoding: 'utf8', cwd: __dirname }
);
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Written:', outPath);
