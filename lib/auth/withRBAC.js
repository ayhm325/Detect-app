// Security: Centralized RBAC wrapper for API route handlers.
// Ensures authentication and role checks, returns proper HTTP codes and JSON responses.

import { NextResponse } from "next/server";
import { verifyAuth } from "./verifyAuth";

export function withRBAC(handler, allowedRoles) {
  return async function (request, ...args) {
    let user;
    try {
      user = verifyAuth(request, allowedRoles);
    } catch (err) {
      const code = err.code;
      if (
        code === "MISSING_TOKEN" ||
        code === "INVALID_TOKEN" ||
        code === "EXPIRED_TOKEN"
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (
        code === "FORBIDDEN_ROLE" ||
        code === "INACTIVE_USER" ||
        code === "DELETED_USER"
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }
    // Patch: unwrap params if present and is a Promise (Next.js App Router dynamic route)
    if (
      args &&
      args.length > 0 &&
      args[0] &&
      typeof args[0].params === "object" &&
      typeof args[0].params.then === "function"
    ) {
      args[0].params = await args[0].params;
    }
    return handler(request, user, ...args);
  };
}
