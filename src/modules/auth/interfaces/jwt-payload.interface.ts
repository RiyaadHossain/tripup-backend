/** Shape of the JWT payload embedded in every access token. */
export interface JwtPayload {
  /** User ID (subject). */
  sub: string;

  /** User's email address. */
  email: string;

  /** Name of the assigned role (e.g. "Super Admin", "Content Manager"). */
  role: string | null;

  /**
   * Flat list of permission strings embedded at login time.
   * Format: `module.action_lowercase` (e.g. `"services.read"`).
   * Stored in the token to avoid DB lookups on every request.
   */
  permissions: string[];
}
