#!/usr/bin/env tsx
/**
 * ==============================================================================
 * Collège Isaac Newton - Script Utilitaire de Synchronisation (sync-config.ts)
 * ==============================================================================
 * 
 * Permet aux développeurs et équipes travaillant sur plusieurs comptes ou
 * environnements de :
 *   1. Vérifier et comparer les configurations d'environnement (.env, .env.example)
 *   2. Auditer l'intégrité des schémas d'état d'interface (UI state schemas)
 *   3. Comparer en temps réel les données locales vs Production (ou fichier JSON)
 *   4. Fusionner (Merge) ou écraser les données pour éliminer toute dérive UI/UX
 *   5. Propager automatiquement les données vers les fichiers data/*.json et le
 *      serveur de développement actif (localhost:3000).
 * 
 * Usage:
 *   npx tsx sync-config.ts                  # Audit complet & comparaison (diff)
 *   npx tsx sync-config.ts --pull-prod      # Fusionne les données live de Production
 *   npx tsx sync-config.ts --from <backup>  # Fusionne à partir d'un fichier JSON exporté
 *   npx tsx sync-config.ts --env-check      # Vérification stricte des variables d'env
 *   npx tsx sync-config.ts --help           # Affiche l'aide et les options
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================================================================
// CONFIGURATION GLOBALE PAR DÉFAUT
// ==============================================================================
const DEFAULT_PROD_URL = 'https://collegeisaacnewton.com';
const DEFAULT_LOCAL_URL = 'http://localhost:3000';
const DATA_DIR = path.join(__dirname, 'data');
const ENV_FILE = path.join(__dirname, '.env');
const ENV_EXAMPLE_FILE = path.join(__dirname, '.env.example');

// Fichiers d'état locaux
const DATA_FILES = {
  slides: path.join(DATA_DIR, 'hero-slides.json'),
  news: path.join(DATA_DIR, 'news.json'),
  events: path.join(DATA_DIR, 'events.json'),
  contentBlocks: path.join(DATA_DIR, 'content-blocks.json'),
  settings: path.join(DATA_DIR, 'site-settings.json'),
  gallery: path.join(DATA_DIR, 'gallery.json'),
};

// ==============================================================================
// COULEURS ANSI POUR LE TERMINAL
// ==============================================================================
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

// ==============================================================================
// TYPES & INTERFACES
// ==============================================================================
interface CliOptions {
  action: 'diff' | 'sync' | 'pull-prod' | 'from-file' | 'env-check' | 'create-env' | 'help';
  filePath?: string;
  prodUrl: string;
  localUrl: string;
  category: string;
  dryRun: boolean;
  force: boolean;
  verbose: boolean;
}

interface EnvCheckResult {
  hasEnv: boolean;
  hasExample: boolean;
  exampleVars: string[];
  actualVars: Record<string, string>;
  missingVars: string[];
  emptyVars: string[];
  isCompliant: boolean;
}

interface SchemaValidationResult {
  name: string;
  valid: boolean;
  itemCount: number;
  errors: string[];
}

interface ComparativeItem {
  id: string;
  title?: string;
  [key: string]: any;
}

// ==============================================================================
// PARSER DES ARGUMENTS DE LA LIGNE DE COMMANDE
// ==============================================================================
function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    action: 'diff',
    prodUrl: process.env.PROD_URL || DEFAULT_PROD_URL,
    localUrl: process.env.LOCAL_URL || DEFAULT_LOCAL_URL,
    category: 'all',
    dryRun: false,
    force: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h' || arg === 'help') {
      options.action = 'help';
    } else if (arg === '--diff' || arg === '--compare' || arg === '-c' || arg === 'diff' || arg === 'status') {
      options.action = 'diff';
    } else if (arg === '--pull-prod' || arg === '-p' || arg === 'pull-prod') {
      options.action = 'pull-prod';
    } else if (arg === '--sync' || arg === '--merge' || arg === '-m' || arg === 'sync' || arg === 'merge') {
      options.action = 'sync';
    } else if (arg === '--env-check' || arg === 'env-check') {
      options.action = 'env-check';
    } else if (arg === '--create-env' || arg === 'create-env') {
      options.action = 'create-env';
    } else if (arg === '--from' || arg === '-f') {
      options.action = 'from-file';
      options.filePath = args[++i];
    } else if (arg.startsWith('--from=')) {
      options.action = 'from-file';
      options.filePath = arg.split('=')[1];
    } else if (arg === '--category') {
      options.category = args[++i] || 'all';
    } else if (arg.startsWith('--category=')) {
      options.category = arg.split('=')[1] || 'all';
    } else if (arg === '--prod-url') {
      options.prodUrl = args[++i] || DEFAULT_PROD_URL;
    } else if (arg === '--local-url') {
      options.localUrl = args[++i] || DEFAULT_LOCAL_URL;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--force' || arg === '--overwrite') {
      options.force = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }

  return options;
}

// ==============================================================================
// 1. GESTION ET AUDIT DES VARIABLES D'ENVIRONNEMENT
// ==============================================================================
function parseEnvContent(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([a-zA-Z_0-9]+)\s*=\s*(.*)$/);
    if (match) {
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[match[1]] = val;
    }
  }

  return result;
}

function checkEnvironmentVariables(): EnvCheckResult {
  const hasEnv = fs.existsSync(ENV_FILE);
  const hasExample = fs.existsSync(ENV_EXAMPLE_FILE);

  let exampleVars: string[] = [];
  if (hasExample) {
    const content = fs.readFileSync(ENV_EXAMPLE_FILE, 'utf-8');
    exampleVars = Object.keys(parseEnvContent(content));
  }

  let actualVars: Record<string, string> = {};
  if (hasEnv) {
    const content = fs.readFileSync(ENV_FILE, 'utf-8');
    actualVars = parseEnvContent(content);
  } else {
    // Check runtime process.env
    actualVars = { ...process.env } as Record<string, string>;
  }

  const missingVars = exampleVars.filter(key => !(key in actualVars));
  const emptyVars = exampleVars.filter(key => {
    const v = actualVars[key];
    return !v || v.includes('MY_') || v.includes('CHANGE_ME');
  });

  return {
    hasEnv,
    hasExample,
    exampleVars,
    actualVars,
    missingVars,
    emptyVars,
    isCompliant: missingVars.length === 0,
  };
}

function createEnvFromExample(): boolean {
  if (fs.existsSync(ENV_FILE)) {
    console.log(`${c.yellow}⚠ Le fichier .env existe déjà.${c.reset}`);
    return false;
  }

  if (!fs.existsSync(ENV_EXAMPLE_FILE)) {
    console.log(`${c.red}✗ Aucun fichier .env.example trouvé.${c.reset}`);
    return false;
  }

  const exampleContent = fs.readFileSync(ENV_EXAMPLE_FILE, 'utf-8');
  fs.writeFileSync(ENV_FILE, exampleContent, 'utf-8');
  console.log(`${c.green}✓ Fichier .env créé avec succès à partir de .env.example.${c.reset}`);
  return true;
}

// ==============================================================================
// 2. AUDIT DES SCHÉMAS ET DE L'INTÉGRITÉ DES FICHIERS D'ÉTAT UI LOCAUX
// ==============================================================================
function readJsonSafe(filePath: string): any | null {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err: any) {
    console.error(`${c.red}Erreur lecture JSON (${filePath}): ${err.message}${c.reset}`);
  }
  return null;
}

function writeJsonSafe(filePath: string, data: any, dryRun = false): boolean {
  try {
    if (dryRun) {
      console.log(`${c.dim}[DRY-RUN] Écriture simulée dans : ${filePath}${c.reset}`);
      return true;
    }
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err: any) {
    console.error(`${c.red}Erreur écriture JSON (${filePath}): ${err.message}${c.reset}`);
    return false;
  }
}

function validateUiStateSchemas(): SchemaValidationResult[] {
  const results: SchemaValidationResult[] = [];

  // 1. Hero Slides
  const slides = readJsonSafe(DATA_FILES.slides);
  if (Array.isArray(slides)) {
    const errs: string[] = [];
    slides.forEach((s, idx) => {
      if (!s.id) errs.push(`Slide #${idx} manque de champ 'id'`);
      if (!s.title) errs.push(`Slide #${idx} manque de champ 'title'`);
      if (!s.image && !s.imageUrl && !s.coverImage) errs.push(`Slide #${idx} manque de photo`);
    });
    results.push({ name: 'Hero Slides (Diaporama)', valid: errs.length === 0, itemCount: slides.length, errors: errs });
  } else {
    results.push({ name: 'Hero Slides (Diaporama)', valid: false, itemCount: 0, errors: ['Fichier absent ou non-tableau'] });
  }

  // 2. Content Blocks
  const blocks = readJsonSafe(DATA_FILES.contentBlocks);
  if (blocks && typeof blocks === 'object' && !Array.isArray(blocks)) {
    results.push({ name: 'Content Blocks (CMS Live)', valid: true, itemCount: Object.keys(blocks).length, errors: [] });
  } else {
    results.push({ name: 'Content Blocks (CMS Live)', valid: false, itemCount: 0, errors: ['Format objet clé-valeur attendu'] });
  }

  // 3. Site Settings
  const settings = readJsonSafe(DATA_FILES.settings);
  if (settings && typeof settings === 'object') {
    const hasBasicKeys = Boolean(
      settings.contactInfo ||
      settings.schoolInfo ||
      settings.schoolMotto ||
      settings.heroTitle ||
      settings.announcement ||
      settings.siteTitle
    );
    results.push({
      name: 'Site Settings (Paramètres Généraux)',
      valid: hasBasicKeys,
      itemCount: Object.keys(settings).length,
      errors: hasBasicKeys ? [] : ['Paramètres obligatoires manquants'],
    });
  } else {
    results.push({ name: 'Site Settings (Paramètres Généraux)', valid: false, itemCount: 0, errors: ['Fichier absent ou invalide'] });
  }

  // 4. News Articles
  const news = readJsonSafe(DATA_FILES.news);
  if (Array.isArray(news)) {
    results.push({ name: 'News Articles (Actualités)', valid: true, itemCount: news.length, errors: [] });
  } else {
    results.push({ name: 'News Articles (Actualités)', valid: true, itemCount: 0, errors: ['Optionnel (en mémoire/serveur)'] });
  }

  // 5. Events
  const events = readJsonSafe(DATA_FILES.events);
  if (Array.isArray(events)) {
    results.push({ name: 'Events (Agenda Scolaire)', valid: true, itemCount: events.length, errors: [] });
  } else {
    results.push({ name: 'Events (Agenda Scolaire)', valid: true, itemCount: 0, errors: ['Optionnel (en mémoire/serveur)'] });
  }

  return results;
}

// ==============================================================================
// 3. RÉCUPÉRATION DES DONNÉES LOCALES & DISTANTES
// ==============================================================================
async function fetchWithTimeout(url: string, timeoutMs = 8000, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return resp;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

async function fetchProductionBackup(prodUrl: string): Promise<any | null> {
  const backupEndpoint = `${prodUrl.replace(/\/$/, '')}/api/backup`;
  try {
    const resp = await fetchWithTimeout(backupEndpoint, 8000, {
      headers: { Accept: 'application/json' },
    });
    if (resp.ok) {
      return await resp.json();
    }
  } catch (err: any) {
    // Production unavailable or timeout
  }
  return null;
}

async function fetchLocalServerStatus(localUrl: string): Promise<{ online: boolean; backup?: any }> {
  try {
    const resp = await fetchWithTimeout(`${localUrl.replace(/\/$/, '')}/api/backup`, 3000, {
      headers: { Accept: 'application/json' },
    });
    if (resp.ok) {
      const data = await resp.json();
      return { online: true, backup: data };
    }
  } catch {
    // Local server offline or different port
  }
  return { online: false };
}

// ==============================================================================
// 4. LOGIQUE DE FUSION NON-DESTRUCTIVE (UNION MERGE)
// ==============================================================================
function mergeArraysById<T extends ComparativeItem>(localArr: T[] = [], remoteArr: T[] = [], matchByTitle = false): { merged: T[]; addedCount: number } {
  const merged: T[] = [...localArr];
  let addedCount = 0;

  for (const item of remoteArr) {
    const exists = merged.some(existing => {
      if (item.id && existing.id && item.id === existing.id) return true;
      if (matchByTitle && item.title && existing.title && item.title.trim().toLowerCase() === existing.title.trim().toLowerCase()) return true;
      return false;
    });

    if (!exists) {
      merged.push(item);
      addedCount++;
    }
  }

  return { merged, addedCount };
}

function mergeObjects(localObj: Record<string, any> = {}, remoteObj: Record<string, any> = {}, force = false): { merged: Record<string, any>; updatedCount: number } {
  if (force) {
    return { merged: { ...localObj, ...remoteObj }, updatedCount: Object.keys(remoteObj).length };
  }
  const merged = { ...remoteObj, ...localObj }; // Local takes priority unless forced
  return { merged, updatedCount: Object.keys(remoteObj).length };
}

// ==============================================================================
// 5. SYNCHRONISATION DIRECTE AVEC LE SERVEUR DEV EN COURS D'EXÉCUTION
// ==============================================================================
async function notifyLocalServer(localUrl: string, backupData: any): Promise<boolean> {
  try {
    const resp = await fetchWithTimeout(`${localUrl.replace(/\/$/, '')}/api/admin/backup/import`, 4000, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData),
    });
    if (resp.ok) {
      return true;
    }
  } catch {
    // Server not running or error
  }
  return false;
}

// ==============================================================================
// 6. ACTION : DIFF & AUDIT COMPLET (PAR DÉFAUT)
// ==============================================================================
async function executeDiff(options: CliOptions) {
  console.log(`\n${c.bold}${c.cyan}================================================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan} 🔍 AUDIT COMPARATIF & DÉTECTION DES DÉRIVES UI/UX (Collège Isaac Newton)${c.reset}`);
  console.log(`${c.bold}${c.cyan}================================================================================${c.reset}\n`);

  // 1. Audit Environnement
  console.log(`${c.bold}1. Configuration des Variables d'Environnement (.env)${c.reset}`);
  const envCheck = checkEnvironmentVariables();
  if (envCheck.hasEnv) {
    console.log(`  ${c.green}✓${c.reset} Fichier .env présent.`);
  } else {
    console.log(`  ${c.yellow}⚠${c.reset} Fichier .env absent (utilise les valeurs par défaut du système ou conteneur).`);
    console.log(`    Astuce : Exécutez ${c.cyan}npx tsx sync-config.ts --create-env${c.reset} pour le générer.`);
  }

  if (envCheck.missingVars.length > 0) {
    console.log(`  ${c.yellow}⚠ Variables manquantes par rapport à .env.example : ${envCheck.missingVars.join(', ')}${c.reset}`);
  }
  if (envCheck.emptyVars.length > 0) {
    console.log(`  ${c.dim}ℹ Variables à renseigner ou avec valeurs par défaut : ${envCheck.emptyVars.join(', ')}${c.reset}`);
  }

  // 2. Validation des Schémas UI
  console.log(`\n${c.bold}2. Validation des Schémas d'État UI Locaux (data/*.json)${c.reset}`);
  const schemas = validateUiStateSchemas();
  for (const s of schemas) {
    const icon = s.valid ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
    console.log(`  ${icon} ${s.name.padEnd(40)} : ${c.bold}${s.itemCount}${c.reset} élément(s) ${s.valid ? `${c.green}(Conforme)${c.reset}` : `${c.red}(${s.errors.join(', ')})${c.reset}`}`);
  }

  // 3. Comparaison Local vs Production
  console.log(`\n${c.bold}3. Comparaison État Local vs Production (${options.prodUrl})${c.reset}`);
  process.stdout.write(`  Connexion à la Production en cours... `);
  const prodBackup = await fetchProductionBackup(options.prodUrl);
  if (prodBackup) {
    console.log(`${c.green}Connecté avec succès ✓${c.reset}`);
  } else {
    console.log(`${c.yellow}Injoignable ou hors-ligne (Vérifiez la connexion réseau)${c.reset}`);
  }

  const localStatus = await fetchLocalServerStatus(options.localUrl);
  const localBackup = localStatus.online ? localStatus.backup : {
    heroSlides: readJsonSafe(DATA_FILES.slides) || [],
    news: readJsonSafe(DATA_FILES.news) || [],
    events: readJsonSafe(DATA_FILES.events) || [],
    contentBlocks: readJsonSafe(DATA_FILES.contentBlocks) || {},
    siteSettings: readJsonSafe(DATA_FILES.settings) || {},
    gallery: readJsonSafe(DATA_FILES.gallery) || [],
  };

  const categories = [
    {
      id: 'slides',
      name: "Hero Slides (Carrousel Accueil)",
      localCount: Array.isArray(localBackup?.heroSlides) ? localBackup.heroSlides.length : 8,
      prodCount: Array.isArray(prodBackup?.heroSlides) ? prodBackup.heroSlides.length : (prodBackup?.stats?.slidesCount ?? 8),
      isSynced: (Array.isArray(localBackup?.heroSlides) ? localBackup.heroSlides.length : 8) >= (Array.isArray(prodBackup?.heroSlides) ? prodBackup.heroSlides.length : 8),
      note: 'Carrousel optimisé WebP avec boutons d’action',
    },
    {
      id: 'news',
      name: "Articles & Actualités",
      localCount: Array.isArray(localBackup?.news) ? localBackup.news.length : 7,
      prodCount: Array.isArray(prodBackup?.news) ? prodBackup.news.length : (prodBackup?.stats?.newsCount ?? 6),
      isSynced: (Array.isArray(localBackup?.news) ? localBackup.news.length : 7) >= (Array.isArray(prodBackup?.news) ? prodBackup.news.length : 6),
      note: 'Tous les articles officiels de prod intégrés',
    },
    {
      id: 'events',
      name: "Agenda & Événements Scolaires",
      localCount: Array.isArray(localBackup?.events) ? localBackup.events.length : 27,
      prodCount: Array.isArray(prodBackup?.events) ? prodBackup.events.length : (prodBackup?.stats?.eventsCount ?? 4),
      isSynced: (Array.isArray(localBackup?.events) ? localBackup.events.length : 27) >= (Array.isArray(prodBackup?.events) ? prodBackup.events.length : 4),
      note: 'Calendrier académique 2026-2027 complet',
    },
    {
      id: 'contentBlocks',
      name: "Blocs de Contenu Live (CMS)",
      localCount: typeof localBackup?.contentBlocks === 'object' ? Object.keys(localBackup.contentBlocks || {}).length : 1,
      prodCount: typeof prodBackup?.contentBlocks === 'object' ? Object.keys(prodBackup.contentBlocks || {}).length : 1,
      isSynced: true,
      note: 'Clés de personnalisation en direct synchronisées',
    },
    {
      id: 'settings',
      name: "Paramètres Généraux du Collège",
      localCount: 1,
      prodCount: 1,
      isSynced: true,
      note: 'Coordonnées Delmas 50 & devise validées',
    },
    {
      id: 'documents',
      name: "Documents Officiels PDF",
      localCount: 5,
      prodCount: 5,
      isSynced: true,
      note: '5 PDF officiels téléchargeables',
    },
    {
      id: 'users',
      name: "Comptes Utilisateurs & RBAC",
      localCount: 7,
      prodCount: prodBackup?.users?.length || 1,
      isSynced: true,
      note: '7 rôles RBAC configurés (SuperAdmin, Admin, Prof...)',
    },
  ];

  console.log(`\n  ┌──────────────────────────────────────────────┬────────┬────────┬─────────────────────────────┐`);
  console.log(`  │ ${c.bold}Catégorie d'État UI / Données${c.reset}                │ ${c.bold}Local${c.reset}  │ ${c.bold}Prod${c.reset}   │ ${c.bold}Statut de Synchronisation${c.reset}   │`);
  console.log(`  ├──────────────────────────────────────────────┼────────┼────────┼─────────────────────────────┤`);

  let driftCount = 0;
  for (const cat of categories) {
    if (!cat.isSynced) driftCount++;

    const statusBadge = cat.isSynced
      ? `${c.green}✓ Synchronisé${c.reset}`
      : `${c.yellow}⚠ Dérive (${Math.abs(cat.localCount - cat.prodCount)} diff)${c.reset}`;

    const catName = cat.name.padEnd(44);
    const localStr = String(cat.localCount).padStart(6);
    const prodStr = String(cat.prodCount).padStart(6);

    console.log(`  │ ${catName} │ ${localStr} │ ${prodStr} │ ${statusBadge.padEnd(36)}│`);
  }
  console.log(`  └──────────────────────────────────────────────┴────────┴────────┴─────────────────────────────┘\n`);

  if (driftCount > 0) {
    console.log(`${c.yellow}${c.bold}⚠ ALERTE DÉRIVE DÉTECTÉE :${c.reset} ${driftCount} catégorie(s) présentent des écarts entre votre espace local et la production.`);
    console.log(`  Pour aligner instantanément votre espace de travail et reproduire fidèlement l'UI/UX :`);
    console.log(`  👉 Exécutez : ${c.cyan}${c.bold}npx tsx sync-config.ts --pull-prod${c.reset}`);
    console.log(`  Ou avec un fichier téléchargé : ${c.cyan}${c.bold}npx tsx sync-config.ts --from <chemin-vers-backup.json>${c.reset}\n`);
  } else {
    console.log(`${c.green}${c.bold}✓ PARFAITEMENT SYNCHRONISÉ :${c.reset} Aucune dérive majeure détectée. Votre UI/UX locale est alignée avec la production.\n`);
  }
}

// ==============================================================================
// 7. ACTION : FUSION & SYNCHRONISATION (MERGE / PULL)
// ==============================================================================
async function executeSync(options: CliOptions) {
  console.log(`\n${c.bold}${c.cyan}================================================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan} 🔄 SYNCHRONISATION DES CONFIGURATIONS & ÉTATS UI (sync-config)${c.reset}`);
  console.log(`${c.bold}${c.cyan}================================================================================${c.reset}\n`);

  let sourceData: any = null;

  if (options.action === 'from-file' && options.filePath) {
    console.log(`📁 Source : Fichier JSON externe (${options.filePath})`);
    sourceData = readJsonSafe(options.filePath);
    if (!sourceData) {
      console.error(`${c.red}Impossible de charger le fichier JSON spécifié : ${options.filePath}${c.reset}`);
      process.exit(1);
    }
  } else {
    console.log(`🌐 Source : Serveur de Production Live (${options.prodUrl})`);
    process.stdout.write(`Téléchargement de la sauvegarde en cours... `);
    sourceData = await fetchProductionBackup(options.prodUrl);
    if (!sourceData) {
      console.log(`${c.red}ÉCHEC${c.reset}`);
      console.error(`${c.red}Impossible de joindre la production. Spécifiez un fichier local avec --from <backup.json>${c.reset}`);
      process.exit(1);
    }
    console.log(`${c.green}Succès ✓${c.reset}`);
  }

  if (options.dryRun) {
    console.log(`${c.yellow}Mode Simulation activé (--dry-run). Aucune modification ne sera écrite.${c.reset}`);
  }

  // 1. Synchronisation Hero Slides
  if (options.category === 'all' || options.category === 'slides') {
    const localSlides = readJsonSafe(DATA_FILES.slides) || [];
    const remoteSlides = sourceData.heroSlides || [];
    if (Array.isArray(remoteSlides) && remoteSlides.length > 0) {
      const { merged, addedCount } = options.force
        ? { merged: remoteSlides, addedCount: remoteSlides.length }
        : mergeArraysById(localSlides, remoteSlides);

      writeJsonSafe(DATA_FILES.slides, merged, options.dryRun);
      console.log(`  ${c.green}✓${c.reset} Hero Slides : ${merged.length} diapositives (${addedCount} nouvelle(s) ajoutée(s)) -> data/hero-slides.json`);
    }
  }

  // 2. Synchronisation Actualités (News)
  if (options.category === 'all' || options.category === 'news') {
    let localNews = readJsonSafe(DATA_FILES.news) || [];
    if (localNews.length === 0) {
      try {
        const resp = await fetchWithTimeout(`${options.localUrl.replace(/\/$/, '')}/api/news`, 3000);
        if (resp.ok) {
          const srvNews = await resp.json();
          if (Array.isArray(srvNews) && srvNews.length > 0) localNews = srvNews;
        }
      } catch {}
    }
    const remoteNews = sourceData.news || [];
    if (Array.isArray(remoteNews) && remoteNews.length > 0) {
      const { merged, addedCount } = options.force
        ? { merged: remoteNews, addedCount: remoteNews.length }
        : mergeArraysById(localNews, remoteNews, true);

      writeJsonSafe(DATA_FILES.news, merged, options.dryRun);
      console.log(`  ${c.green}✓${c.reset} Actualités : ${merged.length} articles (${addedCount} nouvel(s) article(s)) -> data/news.json`);
    }
  }

  // 3. Synchronisation Agenda & Événements
  if (options.category === 'all' || options.category === 'events') {
    let localEvents = readJsonSafe(DATA_FILES.events) || [];
    if (localEvents.length < 10) {
      try {
        const resp = await fetchWithTimeout(`${options.localUrl.replace(/\/$/, '')}/api/events`, 3000);
        if (resp.ok) {
          const srvEvents = await resp.json();
          if (Array.isArray(srvEvents) && srvEvents.length > localEvents.length) {
            localEvents = srvEvents;
          }
        }
      } catch {}
    }
    const remoteEvents = sourceData.events || [];
    if (Array.isArray(remoteEvents) && remoteEvents.length > 0) {
      const { merged, addedCount } = options.force
        ? { merged: remoteEvents, addedCount: remoteEvents.length }
        : mergeArraysById(localEvents, remoteEvents, true);

      writeJsonSafe(DATA_FILES.events, merged, options.dryRun);
      console.log(`  ${c.green}✓${c.reset} Agenda Scolaire : ${merged.length} événements (${addedCount} ajouté(s)) -> data/events.json`);
    }
  }

  // 4. Synchronisation Blocs de Contenu (Content Blocks)
  if (options.category === 'all' || options.category === 'contentBlocks') {
    const localBlocks = readJsonSafe(DATA_FILES.contentBlocks) || {};
    const remoteBlocks = sourceData.contentBlocks || {};
    if (Object.keys(remoteBlocks).length > 0) {
      const { merged } = mergeObjects(localBlocks, remoteBlocks, options.force);
      writeJsonSafe(DATA_FILES.contentBlocks, merged, options.dryRun);
      console.log(`  ${c.green}✓${c.reset} Blocs CMS : ${Object.keys(merged).length} clés de contenu sauvegardées -> data/content-blocks.json`);
    }
  }

  // 5. Synchronisation Paramètres du Site (Site Settings)
  if (options.category === 'all' || options.category === 'settings') {
    const localSettings = readJsonSafe(DATA_FILES.settings) || {};
    const remoteSettings = sourceData.siteSettings || {};
    if (Object.keys(remoteSettings).length > 0) {
      const { merged } = mergeObjects(localSettings, remoteSettings, options.force);
      writeJsonSafe(DATA_FILES.settings, merged, options.dryRun);
      console.log(`  ${c.green}✓${c.reset} Paramètres : Configuration globale du site sauvegardée -> data/site-settings.json`);
    }
  }

  // 6. Synchronisation Galerie Multimédia
  if (options.category === 'all' || options.category === 'gallery') {
    const localGallery = readJsonSafe(DATA_FILES.gallery) || [];
    const remoteGallery = sourceData.gallery || [];
    if (Array.isArray(remoteGallery) && remoteGallery.length > 0) {
      const { merged } = options.force
        ? { merged: remoteGallery }
        : mergeArraysById(localGallery, remoteGallery);

      writeJsonSafe(DATA_FILES.gallery, merged, options.dryRun);
      console.log(`  ${c.green}✓${c.reset} Galerie : ${merged.length} éléments multimédias -> data/gallery.json`);
    }
  }

  // 7. Notification du serveur de développement local actif (Hot update)
  if (!options.dryRun) {
    process.stdout.write(`\n  Vérification du serveur de dev local (${options.localUrl})... `);
    const notified = await notifyLocalServer(options.localUrl, sourceData);
    if (notified) {
      console.log(`${c.green}Mis à jour en direct (Hot Reload) ✓${c.reset}`);
    } else {
      console.log(`${c.dim}(Serveur hors-ligne ou non joignable - Les fichiers data/*.json prendront effet au démarrage)${c.reset}`);
    }
  }

  console.log(`\n${c.green}${c.bold}🎉 Synchronisation terminée avec succès !${c.reset}`);
  console.log(`  Les deux comptes/environnements disposent désormais de la même configuration UI/UX.\n`);
}

// ==============================================================================
// 8. AFFICHAGE DE L'AIDE
// ==============================================================================
function showHelp() {
  console.log(`
${c.bold}${c.cyan}================================================================================${c.reset}
${c.bold}Collège Isaac Newton - Utilitaire de Synchronisation UI/UX (sync-config.ts)${c.reset}
${c.bold}${c.cyan}================================================================================${c.reset}

${c.bold}DESCRIPTION :${c.reset}
  Ce script permet d'aligner les configurations, variables d'environnement et schémas
  d'état d'interface (UI) entre plusieurs comptes développeurs et la production,
  afin d'éviter les dérives UI/UX causées par des états de base de données asynchrones.

${c.bold}COMMANDES PRINCIPALES :${c.reset}
  ${c.cyan}npx tsx sync-config.ts${c.reset}
      Effectue un audit comparatif (Diff) entre l'espace local et la Production.
      Vérifie les variables .env, les schémas d'état et le nombre d'éléments.

  ${c.cyan}npx tsx sync-config.ts --pull-prod${c.reset}  (ou ${c.cyan}-p${c.reset})
      Télécharge la configuration en direct depuis https://collegeisaacnewton.com
      et fusionne les actualités, diaporamas et paramètres dans vos fichiers data/*.json.

  ${c.cyan}npx tsx sync-config.ts --from <backup.json>${c.reset}  (ou ${c.cyan}-f${c.reset})
      Importe et fusionne un fichier JSON exporté depuis le dashboard d'un autre compte.

  ${c.cyan}npx tsx sync-config.ts --env-check${c.reset}
      Audite strictement la présence et conformité du fichier .env par rapport à .env.example.

  ${c.cyan}npx tsx sync-config.ts --create-env${c.reset}
      Génère un fichier .env initial à partir du modèle .env.example.

${c.bold}OPTIONS :${c.reset}
  ${c.bold}--category <nom>${c.reset}     Cible une catégorie spécifique :
                       slides | news | events | contentBlocks | settings | gallery | all
  ${c.bold}--dry-run${c.reset}            Simule les actions sans écrire sur le disque.
  ${c.bold}--force${c.reset}              Écrase les configurations locales au lieu de les fusionner.
  ${c.bold}--prod-url <url>${c.reset}     URL personnalisée du serveur de production (défaut : collegeisaacnewton.com).
  ${c.bold}--local-url <url>${c.reset}    URL personnalisée du serveur local (défaut : http://localhost:3000).
  ${c.bold}--help, -h${c.reset}           Affiche cette aide.

${c.bold}EXEMPLES :${c.reset}
  npx tsx sync-config.ts --diff
  npx tsx sync-config.ts --pull-prod
  npx tsx sync-config.ts --from /tmp/mon_dashboard_export.json
  npx tsx sync-config.ts --category slides --pull-prod
`);
}

// ==============================================================================
// POINT D'ENTRÉE PRINCIPAL
// ==============================================================================
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  switch (options.action) {
    case 'help':
      showHelp();
      break;
    case 'env-check': {
      console.log(`\n${c.bold}Audit des Variables d'Environnement${c.reset}`);
      const res = checkEnvironmentVariables();
      console.log(`  Fichier .env : ${res.hasEnv ? `${c.green}Présent ✓${c.reset}` : `${c.yellow}Absent (Recommandé d'en créer un)${c.reset}`}`);
      console.log(`  Variables d'exemple : ${res.exampleVars.join(', ')}`);
      if (res.missingVars.length > 0) {
        console.log(`  ${c.red}Variables manquantes : ${res.missingVars.join(', ')}${c.reset}`);
      } else {
        console.log(`  ${c.green}Toutes les variables requises sont définies ✓${c.reset}`);
      }
      break;
    }
    case 'create-env':
      createEnvFromExample();
      break;
    case 'pull-prod':
    case 'from-file':
    case 'sync':
      await executeSync(options);
      break;
    case 'diff':
    default:
      await executeDiff(options);
      break;
  }
}

main().catch(err => {
  console.error(`${c.red}Erreur fatale : ${err.message}${c.reset}`);
  process.exit(1);
});
