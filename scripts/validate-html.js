#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   OmicsLab — HTML validation script
   Checks index.html for common structural issues.
   Used by CI: node scripts/validate-html.js
   Exits 1 if any check fails, 0 if all pass.
   ═══════════════════════════════════════════════════════════════ */

const fs   = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../index.html');
const html     = fs.readFileSync(htmlPath, 'utf8');

let errors   = 0;
let warnings = 0;

function fail(msg)  { console.error(`  ✗ FAIL: ${msg}`);  errors++; }
function warn(msg)  { console.warn(`  ⚠ WARN: ${msg}`);   warnings++; }
function pass(msg)  { console.log(`  ✓ ${msg}`); }

console.log('\nOmicsLab HTML Validator\n' + '─'.repeat(40));

/* ── Required meta tags ──────────────────────────────────────── */
const requiredMeta = [
  ['charset',    /<meta\s+charset=/i],
  ['viewport',   /<meta\s+name="viewport"/i],
  ['og:title',   /<meta\s+property="og:title"/i],
  ['canonical',  /<link\s+rel="canonical"/i],
  ['manifest',   /<link\s+rel="manifest"/i],
  ['theme-color',/<meta\s+name="theme-color"/i],
];
requiredMeta.forEach(([name, re]) => {
  if (re.test(html)) pass(`Meta: ${name}`); else fail(`Missing <meta ${name}>`);
});

/* ── Script load order ───────────────────────────────────────── */
const configPos   = html.indexOf('js/config.js');
const dbPos       = html.indexOf('js/db.js');
const analyticsPos = html.indexOf('js/analytics.js');
const appPos      = html.indexOf('js/app.js');

if (configPos === -1) fail('js/config.js not found in HTML');
else if (dbPos !== -1 && configPos > dbPos) fail('js/config.js must come before js/db.js');
else pass('Script order: config.js before db.js');

if (analyticsPos !== -1 && appPos !== -1 && analyticsPos > appPos) {
  warn('js/analytics.js loads after js/app.js');
} else {
  pass('Script order: analytics.js before app.js');
}

/* ── Required elements ───────────────────────────────────────── */
const requiredIds = ['main-nav', 'a11y-announcer', 'nav-progress'];
requiredIds.forEach(id => {
  if (html.includes(`id="${id}"`)) pass(`Element: #${id}`);
  else fail(`Missing element: #${id}`);
});

/* ── Security: no secret keys hardcoded ──────────────────────── */
const secretPatterns = [
  [/sk_live_[A-Za-z0-9]{20,}/,   'Stripe live secret key'],
  [/sk_test_[A-Za-z0-9]{20,}/,   'Stripe test secret key'],
  [/supabase.*service_role.*eyJ/i,'Supabase service role key'],
  [/PRIVATE_KEY/,                 'PRIVATE_KEY literal'],
];
secretPatterns.forEach(([re, label]) => {
  if (re.test(html)) fail(`Secret exposed in HTML: ${label}`);
  else pass(`No secret: ${label}`);
});

/* ── PWA: service worker registration ────────────────────────── */
if (/serviceWorker/.test(html) || fs.existsSync(path.resolve(__dirname, '../sw.js'))) {
  pass('PWA: service worker present');
} else {
  warn('No service worker found — PWA offline support may be missing');
}

/* ── .env.example exists ─────────────────────────────────────── */
if (fs.existsSync(path.resolve(__dirname, '../.env.example'))) {
  pass('.env.example exists');
} else {
  fail('.env.example missing');
}

/* ── api/ directory has serverless functions ─────────────────── */
const apiDir = path.resolve(__dirname, '../api');
if (fs.existsSync(apiDir)) {
  const apiFns = fs.readdirSync(apiDir).filter(f => f.endsWith('.js'));
  if (apiFns.length > 0) pass(`api/ functions: ${apiFns.join(', ')}`);
  else warn('api/ directory is empty');
} else {
  warn('api/ directory not found — serverless functions not set up');
}

/* ── Summary ─────────────────────────────────────────────────── */
console.log('\n' + '─'.repeat(40));
console.log(`Result: ${errors} error(s), ${warnings} warning(s)\n`);

if (errors > 0) {
  console.error(`Validation FAILED with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('Validation PASSED.');
  process.exit(0);
}
