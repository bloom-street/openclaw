import { describe, expect, test } from "vitest";
import {
  isRoleAuthorizedForMethod,
  parseGatewayRole,
  roleCanSkipDeviceIdentity,
} from "./role-policy.js";

describe("gateway role policy", () => {
  test("parses supported roles", () => {
    expect(parseGatewayRole("operator")).toBe("operator");
    expect(parseGatewayRole("node")).toBe("node");
    expect(parseGatewayRole("admin")).toBeNull();
    expect(parseGatewayRole(undefined)).toBeNull();
  });

  test("allows device-less bypass for any role with shared auth", () => {
    expect(roleCanSkipDeviceIdentity("operator", true)).toBe(true);
    expect(roleCanSkipDeviceIdentity("operator", false)).toBe(false);
    // Osera fork: node role with shared auth is allowed (WireGuard tunnel)
    expect(roleCanSkipDeviceIdentity("node", true)).toBe(true);
    expect(roleCanSkipDeviceIdentity("node", false)).toBe(false);
  });

  test("authorizes roles against node vs operator methods", () => {
    expect(isRoleAuthorizedForMethod("node", "node.event")).toBe(true);
    expect(isRoleAuthorizedForMethod("node", "status")).toBe(false);
    expect(isRoleAuthorizedForMethod("operator", "status")).toBe(true);
    expect(isRoleAuthorizedForMethod("operator", "node.event")).toBe(false);
  });
});
