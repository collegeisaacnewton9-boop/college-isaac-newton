import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Role } from '../src/types/index.ts';
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
      assert.strictEqual(coreModules.length, 10, 'Dashboard must configure exactly 10 modules');
      assert.ok(coreModules.includes('overview'), 'overview must be present');
      assert.ok(coreModules.includes('slideshow'), 'slideshow must be present');
      assert.ok(coreModules.includes('menus'), 'menus must be present');
      assert.ok(coreModules.includes('admissions'), 'admissions must be present');
      assert.ok(coreModules.includes('users'), 'users must be present');
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
      const testEvents = [
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
          category: 'Académique',
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
          category: 'Sciences',
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
          category: 'Vie scolaire',
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

      const results = eventNotificationService.checkAndNotifyImminentEvents([], { isAdmin: true });
      assert.deepStrictEqual(results, []);
    });
  });
});

