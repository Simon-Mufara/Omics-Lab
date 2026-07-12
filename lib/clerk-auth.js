/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Server-side Clerk session verification
   Shared by api/* routes that must not trust a client-supplied
   identity (e.g. create-checkout, send-email).
   ═══════════════════════════════════════════════════════════════ */
import { verifyToken } from '@clerk/backend';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

export class AuthError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/* Verifies the Authorization: Bearer <clerk-session-jwt> header and
   returns the caller's Clerk user id. Throws AuthError (with an HTTP
   status) on anything short of a valid, current session — callers
   must not fall back to a client-supplied identity on failure. */
export async function requireAuth(req) {
  if (!CLERK_SECRET_KEY) throw new AuthError('Auth not configured', 503);

  const header = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) throw new AuthError('Missing bearer token', 401);

  try {
    const claims = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
    return { clerkId: claims.sub, claims };
  } catch (err) {
    throw new AuthError('Invalid or expired session', 401);
  }
}
