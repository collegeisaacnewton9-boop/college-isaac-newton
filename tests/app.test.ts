import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ROLE_PERMISSIONS } from '../src/data/rolePermissions.ts';
import { DEFAULT_EDUCATIONAL_CYCLES } from '../src/data/cyclesData.ts';

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
});
