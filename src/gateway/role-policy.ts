import { isNodeRoleMethod } from "./method-scopes.js";

export const GATEWAY_ROLES = ["operator", "node"] as const;

export type GatewayRole = (typeof GATEWAY_ROLES)[number];

export function parseGatewayRole(roleRaw: unknown): GatewayRole | null {
  if (roleRaw === "operator" || roleRaw === "node") {
    return roleRaw;
  }
  return null;
}

export function roleCanSkipDeviceIdentity(role: GatewayRole, sharedAuthOk: boolean): boolean {
  // Osera fork: allow node-role connections with shared auth only (no device identity).
  // Upstream requires device identity for node role to prevent MitM on untrusted networks.
  // Our deployment uses WireGuard tunnel with a shared gateway token, so shared auth is sufficient.
  // Operator role with shared auth could already do everything node role can (and more),
  // so this doesn't expand the effective attack surface.
  return sharedAuthOk;
}

export function isRoleAuthorizedForMethod(role: GatewayRole, method: string): boolean {
  if (isNodeRoleMethod(method)) {
    return role === "node";
  }
  return role === "operator";
}
