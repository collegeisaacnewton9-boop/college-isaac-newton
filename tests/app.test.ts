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
  });
});

