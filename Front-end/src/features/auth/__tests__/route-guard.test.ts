/**
 * ResQEarth — Route Guard & Role-Based Access Control Unit Tests
 *
 * Tests role evaluation, redirect URL encoding, role hierarchy,
 * and security invariants for citizen and admin routes.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { UserRole } from "@/types";

/**
 * Pure authorization evaluation function matching ProtectedRoute logic
 */
function isRoleAuthorized(
  userRole: UserRole | null | undefined,
  allowedRoles: UserRole[] = ["citizen", "admin"]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Pure redirect URL generator matching ProtectedRoute logic
 */
function buildLoginRedirectUrl(currentPath: string, basePath = "/login"): string {
  if (!currentPath || currentPath === "/") {
    return basePath;
  }
  return `${basePath}?redirect=${encodeURIComponent(currentPath)}`;
}

/**
 * Role resolver matching AuthContext logic (strict server/profile derivation)
 */
function resolveUserRole(
  profileRole?: UserRole | null,
  hasAuthUser?: boolean
): UserRole | null {
  if (profileRole) return profileRole;
  if (hasAuthUser) return "citizen"; // safe default role for authenticated user
  return null;
}

describe("Role-Based Access Control & Route Guard Logic", () => {
  describe("Role Authorization (isRoleAuthorized)", () => {
    it("allows citizen to access standard protected routes (['citizen', 'admin'])", () => {
      const allowed = isRoleAuthorized("citizen", ["citizen", "admin"]);
      assert.equal(allowed, true);
    });

    it("allows admin to access standard protected routes (['citizen', 'admin'])", () => {
      const allowed = isRoleAuthorized("admin", ["citizen", "admin"]);
      assert.equal(allowed, true);
    });

    it("allows admin to access admin-restricted routes (['admin'])", () => {
      const allowed = isRoleAuthorized("admin", ["admin"]);
      assert.equal(allowed, true);
    });

    it("DENIES citizen access to admin-restricted routes (['admin'])", () => {
      const allowed = isRoleAuthorized("citizen", ["admin"]);
      assert.equal(allowed, false);
    });

    it("DENIES null/unauthenticated user access to standard protected routes", () => {
      const allowed = isRoleAuthorized(null, ["citizen", "admin"]);
      assert.equal(allowed, false);
    });

    it("DENIES undefined user access to admin routes", () => {
      const allowed = isRoleAuthorized(undefined, ["admin"]);
      assert.equal(allowed, false);
    });
  });

  describe("Login Redirect URL Generation (buildLoginRedirectUrl)", () => {
    it("encodes /dashboard redirect target correctly", () => {
      const url = buildLoginRedirectUrl("/dashboard");
      assert.equal(url, "/login?redirect=%2Fdashboard");
    });

    it("encodes /admin redirect target correctly", () => {
      const url = buildLoginRedirectUrl("/admin");
      assert.equal(url, "/login?redirect=%2Fadmin");
    });

    it("encodes /profile redirect target correctly", () => {
      const url = buildLoginRedirectUrl("/profile");
      assert.equal(url, "/login?redirect=%2Fprofile");
    });

    it("encodes /alerts redirect target correctly", () => {
      const url = buildLoginRedirectUrl("/alerts");
      assert.equal(url, "/login?redirect=%2Falerts");
    });

    it("handles root path without appending unnecessary redirect parameter", () => {
      const url = buildLoginRedirectUrl("/");
      assert.equal(url, "/login");
    });

    it("handles paths with complex query parameters safely", () => {
      const url = buildLoginRedirectUrl("/alerts?region=mumbai&severity=HIGH");
      assert.equal(
        url,
        "/login?redirect=%2Falerts%3Fregion%3Dmumbai%26severity%3DHIGH"
      );
    });
  });

  describe("Role Resolution & Security Invariants (resolveUserRole)", () => {
    it("resolves admin role from authenticated Firestore profile", () => {
      const role = resolveUserRole("admin", true);
      assert.equal(role, "admin");
    });

    it("resolves citizen role from authenticated Firestore profile", () => {
      const role = resolveUserRole("citizen", true);
      assert.equal(role, "citizen");
    });

    it("defaults to citizen if authenticated user profile is still hydrating", () => {
      const role = resolveUserRole(null, true);
      assert.equal(role, "citizen");
    });

    it("resolves to null if user is not authenticated", () => {
      const role = resolveUserRole(null, false);
      assert.equal(role, null);
    });
  });
});
