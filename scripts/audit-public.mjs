import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const allowed = new Set(['.gitignore', 'LICENSE', 'README.md', 'package.json']);
const privatePatterns = [
  /AIza[0-9A-Za-z_-]{20,}/,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/,
  /board\.filipemoreira\.top/i,
  /firebaseapp\.com/i,
  /firebasestorage\.app/i,
  /227428806115/,
  /BETTER_AUTH_SECRET/,
  /SUPABASE_SERVICE_ROLE_KEY/,

  /spawn\(['"]hermes['"]\)/,
  /firebase_uid/,
];

async function walk(dir, prefix = '') {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path.join(dir, entry.name), relative));
    else files.push(relative);
  }
  return files;
}

const files = await walk(root);
for (const file of files) {
  const top = file.split(path.sep)[0];
  if (!allowed.has(file) && !['src', 'test', 'scripts', '.github'].includes(top)) {
    throw new Error(`Arquivo fora da allowlist pública: ${file}`);
  }
  if (file === 'scripts/audit-public.mjs') continue;
  const content = await readFile(path.join(root, file), 'utf8');
  if (privatePatterns.some((pattern) => pattern.test(content))) {
    throw new Error(`Conteúdo privado bloqueado: ${file}`);
  }
}
console.log(`Public audit OK (${files.length} files)`);
