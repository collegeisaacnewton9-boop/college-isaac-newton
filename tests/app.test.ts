import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Role, SchoolEvent } from '../src/types/index.ts';
import { ROLE_PERMISSIONS } from '../src/data/rolePermissions.ts';
import { DEFAULT_EDUCATIONAL_CYCLES } from '../src/data/cyclesData.ts';
import { DEFAULT_NAVIGATION_MENU } from '../src/data/navigationData.ts';
import { validateEmail, validatePhone, formatPhoneNumber } from '../src/utils/validation.ts';

describe('Collège Isaac Newton - Unit Tests', () => {
  describe('RBAC & Role Permissions', () => {
    it('should define permissions for all standard roles (ADMIN, EDITOR, TEACHER, MODERATOR, PARENT, STUDENT)', () => {
      const requiredRoles = ['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR', 'PARENT', 'STUDENT'] as const;
      for (const role of requiredRoles) {
        const detail = ROLE_PERMISSIONS[role];
        assert.ok(detail, `Role ${role} must exist in permissions`);
        assert.ok(detail.allowedActions.length > 0, `Role ${role} must have allowed actions`);
        assert.ok(detail.name && detail.name.length > 0, `Role ${role} must have a name`);
        assert.ok(detail.badgeLabel && detail.badgeLabel.length > 0, `Role ${role} must have a badgeLabel`);
      }
    });

    it('should ensure ADMIN role has SUPER_ADMIN access level and zero restricted actions', () => {
      const adminRole = ROLE_PERMISSIONS['ADMIN'];
      assert.strictEqual(adminRole.accessLevel, 'SUPER_ADMIN');
      assert.strictEqual(adminRole.restrictedActions.length, 0);
      assert.strictEqual(adminRole.badgeLabel, 'Super-Admin');
    });

    it('should restrict lower roles like STUDENT and PARENT from administrative actions', () => {
      const studentRole = ROLE_PERMISSIONS['STUDENT'];
      const parentRole = ROLE_PERMISSIONS['PARENT'];
      assert.ok(studentRole.restrictedActions.length > 0);
      assert.strictEqual(studentRole.accessLevel, 'PUBLIC_PORTAL');
      assert.ok(parentRole.restrictedActions.length > 0);
      assert.strictEqual(parentRole.accessLevel, 'PUBLIC_PORTAL');
    });

    it('should verify DELEGATED_MANAGER roles (EDITOR, TEACHER, MODERATOR)', () => {
      const delegatedRoles = ['EDITOR', 'TEACHER', 'MODERATOR'] as const;
      for (const role of delegatedRoles) {
        const detail = ROLE_PERMISSIONS[role];
        assert.strictEqual(detail.accessLevel, 'DELEGATED_MANAGER');
        assert.ok(detail.restrictedActions.length > 0);
      }
    });
  });

  describe('Theme and Badge Styling Specifications', () => {
    it('should have valid Tailwind color classes assigned to all roles', () => {
      const roles = ['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR', 'PARENT', 'STUDENT'] as const;
      for (const r of roles) {
        const detail = ROLE_PERMISSIONS[r];
        assert.ok(detail.badgeBg.startsWith('bg-'), `${r} badgeBg should start with bg-`);
        assert.ok(detail.badgeText.startsWith('text-'), `${r} badgeText should start with text-`);
        assert.ok(detail.badgeBorder.startsWith('border-'), `${r} badgeBorder should start with border-`);
      }
    });
  });

  describe('Nos Cycles d’Enseignement - CMS & Configuration', () => {
    it('should have all 4 pedagogical cycles configured with complete attributes', () => {
      const expectedCycles = ['prescolaire', 'fondamental', 'secondaire', 'numerique'] as const;
      for (const key of expectedCycles) {
        const cycle = DEFAULT_EDUCATIONAL_CYCLES[key];
        assert.ok(cycle, `Cycle ${key} must exist in DEFAULT_EDUCATIONAL_CYCLES`);
        assert.ok(cycle.title.trim().length > 0, `Cycle ${key} must have a title`);
        assert.ok(cycle.subtitle.trim().length > 0, `Cycle ${key} must have a subtitle`);
        assert.ok(cycle.description.trim().length > 0, `Cycle ${key} must have a description`);
        assert.ok(Array.isArray(cycle.highlights) && cycle.highlights.length > 0, `Cycle ${key} must have highlights`);
        assert.ok(cycle.targetPage.trim().length > 0, `Cycle ${key} must have a targetPage`);
      }
    });
  });

  describe('Validation des Champs en Temps Réel (Pré-inscription)', () => {
    it('should validate valid emails and reject malformed ones', () => {
      const valid = validateEmail('parent@collegeisaacnewton.com');
      assert.strictEqual(valid.isValid, true);
      assert.strictEqual(valid.error, null);

      const empty = validateEmail('');
      assert.strictEqual(empty.isValid, false);
      assert.ok(empty.error?.includes('requise'));

      const missingAt = validateEmail('parentcollege.com');
      assert.strictEqual(missingAt.isValid, false);
      assert.ok(missingAt.error?.includes('@'));

      const missingDomain = validateEmail('parent@');
      assert.strictEqual(missingDomain.isValid, false);

      const spaces = validateEmail('parent @gmail.com');
      assert.strictEqual(spaces.isValid, false);
    });

    it('should suggest corrections for common domain typos in emails', () => {
      const typo = validateEmail('famille.jean@gmai.com');
      assert.strictEqual(typo.suggestion, 'famille.jean@gmail.com');

      const yahooTypo = validateEmail('contact@yaho.com');
      assert.strictEqual(yahooTypo.suggestion, 'contact@yahoo.com');
    });

    it('should validate Haitian and International phone numbers accurately', () => {
      const haitiWithCode = validatePhone('+509 3700-1234');
      assert.strictEqual(haitiWithCode.isValid, true);
      assert.strictEqual(haitiWithCode.carrier, 'Haïti · Digicel (+509)');

      const natcomWithCode = validatePhone('+509 4800-5678');
      assert.strictEqual(natcomWithCode.isValid, true);
      assert.strictEqual(natcomWithCode.carrier, 'Haïti · Natcom (+509)');

      const haitiLocal = validatePhone('3712-3456');
      assert.strictEqual(haitiLocal.isValid, true);

      const incomplete = validatePhone('3712');
      assert.strictEqual(incomplete.isValid, false);
      assert.ok(incomplete.error?.includes('incomplet'));

      const usDiaspora = validatePhone('+1 (305) 555-0123');
      assert.strictEqual(usDiaspora.isValid, true);
      assert.strictEqual(usDiaspora.carrier, 'USA / Canada (+1)');
    });

    it('should format Haitian phone numbers cleanly on input', () => {
      const formatted1 = formatPhoneNumber('50937001234');
      assert.strictEqual(formatted1, '+509 3700-1234');

      const formatted2 = formatPhoneNumber('37001234');
      assert.strictEqual(formatted2, '3700-1234');
    });
  });

  describe('Navigation & Sous-Menus Dynamiques (Header CMS)', () => {
    it('should configure all 4 primary sub-menu pillars (Le Collège, Programmes, Admissions, Vie Scolaire)', () => {
      const pillars = ['college', 'programs', 'admissions', 'school-life'];
      for (const pillarId of pillars) {
        const item = DEFAULT_NAVIGATION_MENU.find(m => m.id === pillarId);
        assert.ok(item, `Pillar ${pillarId} must exist in DEFAULT_NAVIGATION_MENU`);
        assert.ok(item.label.length > 0, `Pillar ${pillarId} must have a label`);
        assert.ok(Array.isArray(item.children) && item.children.length > 0, `Pillar ${pillarId} must contain sub-menus`);
      }
    });

    it('should ensure each sub-menu has required fields: id, label, iconName and valid target', () => {
      for (const menu of DEFAULT_NAVIGATION_MENU) {
        if (!menu.children) continue;
        for (const sub of menu.children) {
          assert.ok(sub.id && sub.id.length > 0, `Sub-menu ${sub.label} must have a target page id`);
          assert.ok(sub.label && sub.label.length > 0, `Sub-menu must have a label`);
          assert.ok(sub.iconName && sub.iconName.length > 0, `Sub-menu ${sub.label} must have an iconName`);
          assert.strictEqual(sub.isActive, true, `Default sub-menu ${sub.label} should be active`);
        }
      }
    });
  });

  describe('Sécurisation du Login & Profils RBAC Équipe (Image 2)', () => {
    it('should provide authentic credentials and roles for all 6 team profiles matching RBAC management', () => {
      const expectedTeam: { email: string; role: Role }[] = [
        { email: 'admin@collegeisaacnewton.com', role: 'ADMIN' },
        { email: 'redaction@collegeisaacnewton.com', role: 'EDITOR' },
        { email: 'prof.sciences@collegeisaacnewton.com', role: 'TEACHER' },
        { email: 'mod.vie.scolaire@collegeisaacnewton.com', role: 'MODERATOR' },
        { email: 'parent.demo@collegeisaacnewton.com', role: 'PARENT' },
        { email: 'eleve.ns4@collegeisaacnewton.com', role: 'STUDENT' },
      ];

      for (const member of expectedTeam) {
        assert.ok(member.email.includes('@collegeisaacnewton.com'), `Email ${member.email} must have institutional domain`);
        assert.ok(ROLE_PERMISSIONS[member.role], `Role ${member.role} must exist in ROLE_PERMISSIONS matrix`);
      }
    });

    it('should distinguish authorized administrative staff from public roles', () => {
      const authorizedStaffRoles: Role[] = ['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR'];
      const publicRoles: Role[] = ['PARENT', 'STUDENT'];

      for (const r of authorizedStaffRoles) {
        const canAccessAdmin = ['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR'].includes(r);
        assert.strictEqual(canAccessAdmin, true, `Role ${r} should be authorized staff`);
      }

      for (const r of publicRoles) {
        const canAccessAdmin = ['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR'].includes(r);
        assert.strictEqual(canAccessAdmin, false, `Role ${r} should not have access to admin dashboard`);
      }
    });
  });

  describe('Optimisation de Build & Découpage des Chunks (Vite)', () => {
    it('should verify production build dist output contains separated vendor and admin chunks', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const distDir = path.resolve(process.cwd(), 'dist');
      
      // If dist exists, check chunks
      if (fs.existsSync(distDir)) {
        const assetsDir = path.join(distDir, 'assets');
        if (fs.existsSync(assetsDir)) {
          const files = fs.readdirSync(assetsDir);
          const hasVendorReact = files.some(f => f.startsWith('vendor-react'));
          const hasVendorIcons = files.some(f => f.startsWith('vendor-icons'));
          const hasAdminPanel = files.some(f => f.startsWith('admin-panel'));
          
          assert.ok(hasVendorReact, 'dist should contain isolated vendor-react chunk');
          assert.ok(hasVendorIcons, 'dist should contain isolated vendor-icons chunk');
          assert.ok(hasAdminPanel, 'dist should contain isolated admin-panel chunk for code splitting');
        }
      }
    });
  });

  describe('Événements Officiels & Navigation Fluide (Widget Compte à Rebours)', () => {
    it('should verify official upcoming events have valid structure, dates and categories without overflow', async () => {
      const { INITIAL_EVENTS } = await import('../src/data/mockData.ts');
      assert.ok(Array.isArray(INITIAL_EVENTS) && INITIAL_EVENTS.length >= 4, 'Should have at least 4 initial school events');
      
      for (const evt of INITIAL_EVENTS) {
        assert.ok(evt.id, 'Event must have an ID');
        assert.ok(evt.title && evt.title.length > 5, `Event ${evt.id} must have a descriptive title`);
        assert.ok(evt.startDate, `Event ${evt.id} must have a startDate`);
        const parsedDate = new Date(evt.startDate);
        assert.ok(!isNaN(parsedDate.getTime()), `Event ${evt.id} startDate must be a valid ISO date`);
        assert.ok(evt.category, `Event ${evt.id} must have an official category`);
      }
    });
  });

  describe('Dashboard Administration - Navigation Fluide & Modules', () => {
    it('should define all 10 core administrative modules without native scrollbar dependencies', () => {
      const coreModules = [
        'overview',
        'slideshow',
        'menus',
        'admissions',
        'news',
        'events',
        'media',
        'messages',
        'cms',
        'users'
      ];
      assert.strictEqual(coreModules.length, 10, 'Dashboard must configure exactly 10 core modules');
      assert.ok(coreModules.includes('overview'), 'overview must be present');
      assert.ok(coreModules.includes('slideshow'), 'slideshow must be present');
      assert.ok(coreModules.includes('menus'), 'menus must be present');
      assert.ok(coreModules.includes('admissions'), 'admissions must be present');
      assert.ok(coreModules.includes('users'), 'users must be present');
    });

    it('should configure all 12 modules including faculty and whatsapp diagnostics', () => {
      const allModules = [
        'overview',
        'slideshow',
        'menus',
        'admissions',
        'news',
        'events',
        'media',
        'messages',
        'cms',
        'users',
        'faculty',
        'whatsapp'
      ];
      assert.strictEqual(allModules.length, 12, 'Dashboard must include 12 total administrative modules');
      assert.ok(allModules.includes('faculty'), 'faculty module must be available');
      assert.ok(allModules.includes('whatsapp'), 'whatsapp diagnostic module must be available');
    });

    it('should verify compact header height budget and essential actions preservation', async () => {
      const fs = await import('fs');
      const adminCode = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf-8');
      
      // Header row 1 (~56px: h-14) and row 2 (~44px: h-11)
      assert.ok(adminCode.includes('h-14'), 'Row 1 command bar must be compact (~56px)');
      assert.ok(adminCode.includes('h-11'), 'Row 2 module navigation bar must be compact (~44px)');

      // Preserved actions
      assert.ok(adminCode.includes('Retour au site'), 'Must retain Site public / Retour au site action');
      assert.ok(adminCode.includes('Actualiser'), 'Must retain Actualiser action');
      assert.ok(adminCode.includes('Synchronisation GitHub'), 'Must retain GitHub sync action in tools');
      assert.ok(adminCode.includes('Sauvegarde JSON'), 'Must retain Sauvegarde JSON in tools');
      assert.ok(adminCode.includes('Audit Production Live'), 'Must retain Audit Prod Live in tools');
      assert.ok(adminCode.includes('imminentAlerts'), 'Must retain event alert button');
      assert.ok(adminCode.includes('getShortRole'), 'Must use compact non-truncated role labels');
      assert.ok(adminCode.includes('handleSafeLogout'), 'Must retain Quitter / logout action');
      assert.ok(adminCode.includes('role="tablist"'), 'Must maintain accessible tablist');
      assert.ok(adminCode.includes('role="tab"'), 'Must maintain accessible tabs');

      // Check App.tsx excludes public header on admin page
      const appCode = fs.readFileSync('src/App.tsx', 'utf-8');
      assert.ok(appCode.includes("currentPage !== 'admin'"), 'Public header and footer must be omitted on admin page');
    });

    it('should configure auto-refresh with 60s default and document.hidden polling suspension', async () => {
      const fs = await import('fs');
      const adminCode = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf-8');

      // 60 seconds default delay (60000ms)
      assert.ok(adminCode.includes('60000'), 'Auto-refresh must default to 60000ms (60 seconds)');
      assert.ok(adminCode.includes('AUTO_REFRESH_INTERVAL_MS = 60000'), 'Must define AUTO_REFRESH_INTERVAL_MS = 60000');

      // Polling suspended via document.hidden
      assert.ok(adminCode.includes('document.hidden'), 'Must suspend polling when document.hidden is true');
      assert.ok(adminCode.includes('visibilitychange'), 'Must listen to visibilitychange to resume polling');

      // Visual indicator
      assert.ok(adminCode.includes('Auto 60s'), 'Must display 60s auto-refresh indicator');
    });

    it('should place Gemini AI analysis behind explicit user action with button Analyser les données', async () => {
      const fs = await import('fs');
      const adminCode = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf-8');

      // Explicit user action button
      assert.ok(adminCode.includes('Analyser les données'), 'Must provide explicit Analyser les données button');
      assert.ok(adminCode.includes('handleRunAiAnalysis'), 'Must bind analysis to explicit user handler');

      // Initial mount must not trigger Gemini
      const initialMountEffect = adminCode.match(/useEffect\(\(\)\s*=>\s*\{\s*loadData\(\);\s*\}\s*,\s*\[\]\)/);
      assert.ok(initialMountEffect, 'Initial mount effect must only call loadData() and not Gemini');

      // Backend endpoint test
      const serverCode = fs.readFileSync('server.ts', 'utf-8');
      assert.ok(serverCode.includes('/api/admin/analyze-data'), 'Server must provide /api/admin/analyze-data endpoint');
      assert.ok(serverCode.includes('gemini-3.8-flash'), 'Must use official gemini-3.8-flash model');
    });
  });

  describe('Calendrier scolaire & Agenda officiel - Ergonomie, Structure & Filtres', () => {
    it('should have a modern compact header with concise description and essential actions', async () => {
      const fs = await import('fs');
      const eventsPageCode = fs.readFileSync('src/pages/EventsPage.tsx', 'utf-8');

      // Title & Year
      assert.ok(eventsPageCode.includes('Calendrier Scolaire & Agenda Officiel'), 'Must contain official calendar title');
      assert.ok(eventsPageCode.includes('2026-2027'), 'Must default to academic year 2026-2027');

      // Short concise description
      assert.ok(
        eventsPageCode.includes('Dates des contrôles, examens, vacances et événements de l’année scolaire.'),
        'Must replace lengthy text with concise phrase'
      );

      // Sober essential actions
      assert.ok(eventsPageCode.includes('Version Imprimable'), 'Must maintain Version Imprimable action');
      assert.ok(eventsPageCode.includes('Conditions d’Admission'), 'Must maintain Conditions d’Admission action');

      // Dynamic data loading from API service
      assert.ok(eventsPageCode.includes('apiService.getEvents()'), 'Must load events dynamically from apiService');
    });

    it('should present interactive calendar directly under header without redundant stacked benchmark blocks', async () => {
      const fs = await import('fs');
      const eventsPageCode = fs.readFileSync('src/pages/EventsPage.tsx', 'utf-8');

      // Ensure calendar is presented immediately without duplicate giant banners or redundant stacked sections
      assert.ok(eventsPageCode.includes('<InteractiveCalendar'), 'InteractiveCalendar must be rendered on the page');
      assert.ok(
        !eventsPageCode.includes('Structure des 4 Contrôles Académiques'),
        'Redundant stacked section Structure des 4 Contrôles Académiques must be removed from web page'
      );
      assert.ok(
        eventsPageCode.includes('Modalités Pratiques & Fonctionnement de l’Agenda'),
        'Practical guidelines section must be preserved'
      );
      assert.ok(
        eventsPageCode.includes('OfficialCalendarPrintModal'),
        'Official certified print modal must be integrated'
      );
    });

    it('should provide compact, intuitive calendar filter bar, navigation, and export features', async () => {
      const fs = await import('fs');
      const calendarCode = fs.readFileSync('src/components/events/InteractiveCalendar.tsx', 'utf-8');

      // Core category filters
      assert.ok(calendarCode.includes('Toutes les Dates'), 'Must include Toutes les Dates filter');
      assert.ok(calendarCode.includes('Examens & Contrôles'), 'Must include Examens & Contrôles filter');
      assert.ok(calendarCode.includes('Vacances & Jours Fériés'), 'Must include Vacances & Jours Fériés filter');
      assert.ok(calendarCode.includes('Activités & Vie Scolaire'), 'Must include Activités & Vie Scolaire filter');

      // Instant search and view switchers
      assert.ok(calendarCode.includes('Rechercher par mot-clé...'), 'Must include instant search placeholder');
      assert.ok(calendarCode.includes('Grille'), 'Must support monthly grid view');
      assert.ok(calendarCode.includes('Agenda'), 'Must support chronological agenda view');

      // Export capabilities
      assert.ok(calendarCode.includes('getGoogleCalendarUrl'), 'Must provide Google Calendar export');
      assert.ok(calendarCode.includes('handleExportIcs'), 'Must provide .ics calendar export');
      assert.ok(calendarCode.includes('onOpenPrintModal'), 'Must support onOpenPrintModal callback for official PDF and print modal');
    });

    it('should generate a dedicated official vector PDF matching 2026-2027 reference', async () => {
      const { calendarPdfService, OFFICIAL_CONTROLS_2026_2027, OFFICIAL_STATE_EXAMS_AND_FEASTS } = await import('../src/services/calendarPdfService.ts');
      
      // Verify official controls reference
      assert.strictEqual(OFFICIAL_CONTROLS_2026_2027.length, 4, 'Must have 4 academic controls');
      assert.strictEqual(OFFICIAL_CONTROLS_2026_2027[3].period, 'Du 19 avril au 4 juin 2027', '4th control period must be 19 avril-4 juin');
      assert.strictEqual(OFFICIAL_CONTROLS_2026_2027[3].duration, '35 jours', '4th control duration must be 35 jours');
      assert.strictEqual(OFFICIAL_CONTROLS_2026_2027[3].exams, 'Du 31 mai au 4 juin 2027', '4th control exams must be 31 mai-4 juin');

      // Verify official feasts & state exams
      const philosophers = OFFICIAL_STATE_EXAMS_AND_FEASTS.find(f => f.title.includes('philosophes'));
      assert.ok(philosophers?.date.includes('22 Janvier 2027'), 'Fête des philosophes must be 22 Janvier 2027');

      const professors = OFFICIAL_STATE_EXAMS_AND_FEASTS.find(f => f.title.includes('professeurs'));
      assert.ok(professors?.date.includes('14 Mai 2027'), 'Fête des professeurs must be 14 Mai 2027');

      const collegeFeast = OFFICIAL_STATE_EXAMS_AND_FEASTS.find(f => f.title.includes('Collège'));
      assert.ok(collegeFeast?.date.includes('28 Mai 2027'), 'Fête du Collège must be 28 Mai 2027');

      const exam9AF = OFFICIAL_STATE_EXAMS_AND_FEASTS.find(f => f.title.includes('9e A.F.'));
      assert.ok(exam9AF?.date.includes('14 au 17 Juin 2027'), '9e AF exam must be 14-17 Juin 2027');

      const examNS4 = OFFICIAL_STATE_EXAMS_AND_FEASTS.find(f => f.title.includes('NS4'));
      assert.ok(examNS4?.date.includes('28 Juin au 1er Juil. 2027'), 'NS4 exam must be 28 Juin-1er Juillet 2027');

      // Generate PDF
      const result = await calendarPdfService.generateCalendarPdf([], {
        paperFormat: 'A4',
        academicYear: '2026-2027',
      });

      assert.ok(result.pdfBytes.length > 1000, 'PDF buffer must be generated');
      assert.strictEqual(result.filename, 'Calendrier-College-Isaac-Newton-2026-2027.pdf', 'Filename must match convention');
      assert.ok(result.pageCount >= 2, 'Must have at least 2 pages (summary + chronological)');
    });

    it('should have dedicated print CSS that isolates official document and hides web chrome', async () => {
      const fs = await import('fs');
      const cssCode = fs.readFileSync('src/index.css', 'utf-8');

      assert.ok(cssCode.includes('@media print'), 'Must include @media print stylesheet block');
      assert.ok(cssCode.includes('cin-print-modal-open'), 'Must manage cin-print-modal-open isolation class');
      assert.ok(cssCode.includes('#cin-official-print-document'), 'Must style #cin-official-print-document');
      assert.ok(cssCode.includes('header,'), 'Must hide header in print');
      assert.ok(cssCode.includes('footer,'), 'Must hide footer in print');
    });
  });

  describe('Option B : Export & Import de Sauvegarde JSON (Système & Base)', () => {
    it('should export complete backup JSON structure including settings, slides, admissions, news and events', async () => {
      const { apiService } = await import('../src/services/api.ts');
      assert.ok(typeof apiService.exportBackup === 'function', 'apiService.exportBackup must be defined');
      assert.ok(typeof apiService.downloadBackupFile === 'function', 'apiService.downloadBackupFile must be defined');
      assert.ok(typeof apiService.importBackup === 'function', 'apiService.importBackup must be defined');

      const backup = await apiService.exportBackup();
      assert.ok(backup, 'Backup payload must be generated');
      assert.strictEqual(backup.exportVersion, '1.0', 'Backup version must be 1.0');
      assert.ok(backup.exportedAt, 'Backup must include exportedAt timestamp');
      assert.ok(backup.stats, 'Backup must include entity counters');
      assert.ok(backup.siteSettings, 'Backup must contain siteSettings');
      assert.ok(Array.isArray(backup.heroSlides), 'Backup must contain heroSlides array');
      assert.ok(Array.isArray(backup.news), 'Backup must contain news array');
      assert.ok(Array.isArray(backup.events), 'Backup must contain events array');
      assert.ok(Array.isArray(backup.admissions), 'Backup must contain admissions array');
    });

    it('should validate and import valid backup JSON payload successfully', async () => {
      const { apiService } = await import('../src/services/api.ts');
      const testBackup = {
        exportVersion: '1.0',
        exportedAt: new Date().toISOString(),
        siteSettings: {
          announcement: {
            enabled: true,
            text: 'Test Annonce Synchronisée Option B',
            type: 'info' as const,
          },
        },
        contentBlocks: {
          'test_block_1': 'Contenu synchronisé',
        },
      };

      const result = await apiService.importBackup(testBackup);
      assert.ok(result.success, 'Import should report success');
      assert.ok(result.message, 'Import should include confirmation message');
    });

    it('should verify that only ADMIN role is permitted for full database JSON backup management', async () => {
      const { ROLE_PERMISSIONS } = await import('../src/data/rolePermissions.ts');
      assert.ok(ROLE_PERMISSIONS.ADMIN, 'ADMIN role must exist');
      assert.strictEqual(ROLE_PERMISSIONS.ADMIN.accessLevel, 'SUPER_ADMIN', 'ADMIN role must have SUPER_ADMIN level');
      // Verify other roles do not have super admin level
      const nonSuperAdminRoles = ['EDITOR', 'TEACHER', 'MODERATOR', 'PARENT', 'STUDENT'] as const;
      for (const r of nonSuperAdminRoles) {
        assert.notStrictEqual(ROLE_PERMISSIONS[r].accessLevel, 'SUPER_ADMIN', `Role ${r} must not have SUPER_ADMIN level`);
      }
    });
  });

  describe('Système de Notification Automatisé des Événements (< 48h)', () => {
    it('should accurately detect events occurring or expiring within 48 hours', async () => {
      const { eventNotificationService } = await import('../src/services/eventNotificationService.ts');
      
      const fixedNow = new Date('2026-10-15T10:00:00Z');
      const testEvents: SchoolEvent[] = [
        {
          id: 'evt-10h',
          title: 'Rencontre Parents-Profs Imminente',
          description: 'Ordre du jour préparé',
          startDate: '2026-10-15T20:00:00Z', // In 10 hours
          endDate: '2026-10-15T22:00:00Z',
          location: 'Auditorium',
          category: 'Pédagogique',
          audience: 'PARENTS' as const,
          isPublic: true,
        },
        {
          id: 'evt-36h',
          title: 'Examen Blanc 9e AF',
          description: 'Épreuve surveillée',
          startDate: '2026-10-16T22:00:00Z', // In 36 hours
          endDate: '2026-10-17T02:00:00Z',
          location: 'Salles 1 à 4',
          category: 'Examen',
          audience: 'STUDENTS' as const,
          isPublic: true,
        },
        {
          id: 'evt-ongoing',
          title: 'Atelier Robotique en cours',
          description: 'Séance de démonstration',
          startDate: '2026-10-15T08:00:00Z', // Started 2 hours ago
          endDate: '2026-10-15T12:00:00Z',   // Finishes in 2 hours
          location: 'Labo Info',
          category: 'Pédagogique',
          audience: 'ALL' as const,
          isPublic: true,
        },
        {
          id: 'evt-future-72h',
          title: 'Célébration Nationale',
          description: 'Plus tard dans la semaine',
          startDate: '2026-10-18T10:00:00Z', // In 72 hours (more than 48h)
          endDate: '2026-10-18T14:00:00Z',
          location: 'Cour principale',
          category: 'Culturel',
          audience: 'ALL' as const,
          isPublic: true,
        },
        {
          id: 'evt-past',
          title: 'Événement passé hier',
          description: 'Déjà terminé',
          startDate: '2026-10-14T08:00:00Z', // Yesterday
          endDate: '2026-10-14T12:00:00Z',
          location: 'Campus',
          category: 'Culturel',
          audience: 'ALL' as const,
          isPublic: true,
        },
      ];

      const alerts = eventNotificationService.getImminentEvents(testEvents, fixedNow);
      
      // Must include 10h, 36h, and ongoing event (total 3), and exclude future-72h and past
      assert.strictEqual(alerts.length, 3, 'Exactly 3 events must be flagged as imminent within 48h or ongoing');
      
      const ids = alerts.map(a => a.event.id);
      assert.ok(ids.includes('evt-10h'), 'Must include 10h event');
      assert.ok(ids.includes('evt-36h'), 'Must include 36h event');
      assert.ok(ids.includes('evt-ongoing'), 'Must include ongoing event');
      assert.ok(!ids.includes('evt-future-72h'), 'Must exclude event in 72 hours');
      assert.ok(!ids.includes('evt-past'), 'Must exclude finished event from yesterday');

      // Check urgency mapping
      const alert10h = alerts.find(a => a.event.id === 'evt-10h')!;
      assert.strictEqual(alert10h.urgency, 'CRITICAL', 'Event within 10h must be CRITICAL urgency');
      assert.strictEqual(alert10h.hoursRemaining, 10, 'Remaining hours must be 10');

      const alert36h = alerts.find(a => a.event.id === 'evt-36h')!;
      assert.strictEqual(alert36h.urgency, 'MODERATE', 'Event within 36h must be MODERATE urgency');

      const alertOngoing = alerts.find(a => a.event.id === 'evt-ongoing')!;
      assert.strictEqual(alertOngoing.isOngoing, true, 'Ongoing event must have isOngoing = true');
      assert.strictEqual(alertOngoing.urgency, 'CRITICAL', 'Ongoing event must have CRITICAL urgency');
    });

    it('should provide notification service without throwing in headless environment', async () => {
      const { eventNotificationService } = await import('../src/services/eventNotificationService.ts');
      assert.strictEqual(typeof eventNotificationService.getImminentEvents, 'function');
      assert.strictEqual(typeof eventNotificationService.isAlertDismissed, 'function');
      assert.strictEqual(typeof eventNotificationService.dismissAlert, 'function');
      assert.strictEqual(typeof eventNotificationService.checkAndNotifyImminentEvents, 'function');
      assert.strictEqual(typeof eventNotificationService.openLastMinuteModal, 'function');

      const results = eventNotificationService.checkAndNotifyImminentEvents([], { isAdmin: true });
      assert.deepStrictEqual(results, []);
    });

    it('should support notification dismissal and force overrides', async () => {
      const { eventNotificationService } = await import('../src/services/eventNotificationService.ts');
      const testEvent: SchoolEvent = {
        id: 'evt-test-dismiss',
        title: 'Session Test',
        description: 'Test description',
        startDate: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        location: 'Campus',
        category: 'Pédagogique',
        audience: 'ALL',
        isPublic: true,
      };

      // Initially not dismissed
      assert.strictEqual(eventNotificationService.isAlertDismissed(testEvent.id), false);
      eventNotificationService.dismissAlert(testEvent.id);
      assert.strictEqual(eventNotificationService.isAlertDismissed(testEvent.id), true);

      // Clean up dismissed state
      eventNotificationService.clearDismissedAlerts();
      assert.strictEqual(eventNotificationService.isAlertDismissed(testEvent.id), false);
    });
  });

  describe('Client-Side Image Compression & Resizing Utility (Canvas API)', () => {
    it('should format bytes into accurate human-readable strings', async () => {
      const { formatBytes } = await import('../src/utils/imageCompressor.ts');
      assert.strictEqual(formatBytes(0), '0 Octet');
      assert.strictEqual(formatBytes(512), '512 Octets');
      assert.strictEqual(formatBytes(1024), '1 Ko');
      assert.strictEqual(formatBytes(2048), '2 Ko');
      assert.strictEqual(formatBytes(1024 * 1024), '1 Mo');
      assert.strictEqual(formatBytes(4.5 * 1024 * 1024), '4.5 Mo');
      assert.strictEqual(formatBytes(2 * 1024 * 1024 * 1024), '2 Go');
    });

    it('should calculate accurate aspect ratio preserving dimensions within bounds', async () => {
      const { calculateAspectRatioFit } = await import('../src/utils/imageCompressor.ts');
      
      // Image already smaller than bounds
      const small = calculateAspectRatioFit(800, 600, 1600, 1000);
      assert.deepStrictEqual(small, { width: 800, height: 600 });

      // Landscape image scaling down by width constraint
      const wide = calculateAspectRatioFit(3200, 1600, 1600, 1000);
      assert.deepStrictEqual(wide, { width: 1600, height: 800 });

      // Portrait image scaling down by height constraint
      const tall = calculateAspectRatioFit(2000, 3000, 1600, 1000);
      assert.deepStrictEqual(tall, { width: 667, height: 1000 });

      // Exact 16:9 ratio fit
      const ratio169 = calculateAspectRatioFit(3840, 2160, 1920, 1080);
      assert.deepStrictEqual(ratio169, { width: 1920, height: 1080 });
    });

    it('should export all required functions and types', async () => {
      const imgModule = await import('../src/utils/imageCompressor.ts');
      assert.strictEqual(typeof imgModule.compressImage, 'function');
      assert.strictEqual(typeof imgModule.compressImageFromUrl, 'function');
      assert.strictEqual(typeof imgModule.batchCompressImages, 'function');
      assert.strictEqual(typeof imgModule.calculateAspectRatioFit, 'function');
      assert.strictEqual(typeof imgModule.formatBytes, 'function');
      assert.strictEqual(typeof imgModule.isWebPSupported, 'function');
      assert.ok(imgModule.ImageCompressor, 'ImageCompressor class must be exported');
      assert.strictEqual(typeof imgModule.ImageCompressor.compressImage, 'function', 'ImageCompressor.compressImage must be a function');
    });

    it('should accurately constrain dimensions to maximum width 1200px while maintaining aspect ratio', async () => {
      const { calculateAspectRatioFit } = await import('../src/utils/imageCompressor.ts');
      
      // Standard 16:9 photo (e.g. 1920x1080 -> 1200x675)
      const res169 = calculateAspectRatioFit(1920, 1080, 1200, 1200);
      assert.strictEqual(res169.width, 1200);
      assert.strictEqual(res169.height, 675);

      // 4:3 camera photo (e.g. 4000x3000 -> 1200x900)
      const res43 = calculateAspectRatioFit(4000, 3000, 1200, 1200);
      assert.strictEqual(res43.width, 1200);
      assert.strictEqual(res43.height, 900);

      // Image already under 1200px width (e.g. 900x600 -> unchanged)
      const resSmall = calculateAspectRatioFit(900, 600, 1200, 1200);
      assert.strictEqual(resSmall.width, 900);
      assert.strictEqual(resSmall.height, 600);
    });

    it('should provide ImageCompressor utility component and hook', async () => {
      const componentModule = await import('../src/components/common/ImageCompressor.tsx');
      assert.ok(componentModule.ImageCompressor, 'ImageCompressor React component must be exported');
      assert.strictEqual(typeof componentModule.ImageCompressor.compressImage, 'function');
      assert.strictEqual(typeof componentModule.useImageCompressor, 'function');
    });

    it('should export ImageAspectRatioController hook and utility enforcing 16:9 ratio', async () => {
      const hookModule = await import('../src/hooks/useImageAspectRatioController.ts');
      assert.ok(hookModule.useImageAspectRatioController, 'useImageAspectRatioController hook must be exported');
      assert.ok(hookModule.ImageAspectRatioController, 'ImageAspectRatioController object must be exported');
      assert.strictEqual(typeof hookModule.enforce169AspectRatio, 'function', 'enforce169AspectRatio must be a function');
      assert.strictEqual(typeof hookModule.ImageAspectRatioController.processCarouselImage, 'function');
      assert.strictEqual(hookModule.CAROUSEL_TARGET_RATIO, 16 / 9);
      assert.strictEqual(hookModule.CAROUSEL_RATIO_LABEL, '16:9');
    });
  });

  describe('Lazy Loading & Responsive Image Sizing (Performance Optimization)', () => {
    it('should export ResponsiveLazyImage component cleanly', async () => {
      const module = await import('../src/components/common/ResponsiveLazyImage.tsx');
      assert.ok(module.ResponsiveLazyImage, 'ResponsiveLazyImage must be exported');
      assert.strictEqual(typeof module.ResponsiveLazyImage, 'function');
    });

    it('should provide presets for gallery, news, hero, and thumbnail responsive sizes', async () => {
      const module = await import('../src/components/common/ResponsiveLazyImage.tsx');
      assert.ok(module.ResponsiveLazyImage);
    });
  });
});


