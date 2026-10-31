// Imports the student list into the `students` table.
//   cd backend
//   npm run import:students -- path/to/students.csv
// The CSV needs a header row with: email, nim, name (or "nama"). See supabase/students.example.csv.
// Existing students (same email) get their NIM and name updated; nobody is deleted.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const file = process.argv[2];
if (!file) {
  console.error('Pakai: npm run import:students -- path/to/students.csv');
  process.exit(1);
}
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di backend/.env.local');
  process.exit(1);
}

/** Minimal CSV parser: commas or semicolons, quoted fields with "" escapes. */
function parseCsv(text) {
  const firstLine = text.split(/\r?\n/, 1)[0];
  const sep = firstLine.split(';').length > firstLine.split(',').length ? ';' : ',';
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (field += '"'), i++;
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) row.push(field), (field = '');
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field), rows.push(row), (row = []), (field = '');
    } else field += c;
  }
  if (field || row.length) row.push(field), rows.push(row);
  return rows.filter((r) => r.some((f) => f.trim()));
}

const [header, ...lines] = parseCsv(readFileSync(file, 'utf8').replace(/^﻿/, ''));
const col = (...names) => header.findIndex((h) => names.includes(h.trim().toLowerCase()));
const iEmail = col('email', 'e-mail');
const iNim = col('nim');
const iName = col('name', 'nama');
if (iEmail < 0 || iNim < 0 || iName < 0) {
  console.error('Baris pertama CSV harus berisi kolom: email, nim, name');
  process.exit(1);
}

const students = new Map();
const problems = [];
lines.forEach((r, i) => {
  const email = (r[iEmail] ?? '').trim().toLowerCase();
  const nim = (r[iNim] ?? '').trim();
  const name = (r[iName] ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push(`baris ${i + 2}: email tidak valid`);
  else if (nim.length < 6) problems.push(`baris ${i + 2}: NIM kurang dari 6 karakter`);
  else if (!name) problems.push(`baris ${i + 2}: nama kosong`);
  else students.set(email, { email, nim, name });
});
if (problems.length) {
  console.error(`Tidak ada yang diimpor. Perbaiki dulu:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const all = [...students.values()];
for (let i = 0; i < all.length; i += 500) {
  const { error } = await db.from('students').upsert(all.slice(i, i + 500), { onConflict: 'email' });
  if (error) {
    console.error('Gagal mengimpor:', error.message);
    process.exit(1);
  }
}
console.log(`${all.length} mahasiswa diimpor.`);
