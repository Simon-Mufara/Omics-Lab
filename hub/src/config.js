/* Same public, client-safe keys as ../../js/config.js — Hub shares the
   main site's Clerk instance (same publishable key ⇒ same session
   cookie ⇒ signing in on one signs you in on the other) and the same
   Supabase project. Keep these two files in sync if the keys rotate. */
export const CLERK_PUBLISHABLE_KEY = 'pk_live_Y2xlcmsub21pY3NkYXRhbGFiLnRlY2gk';
export const SUPABASE_URL = 'https://gfsuklduvlnpilvretkz.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmc3VrbGR1dmxucGlsdnJldGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTYzMDcsImV4cCI6MjA5ODU5MjMwN30.DvGRkEyiBHRXS4PHSY6be0EDGvcGs1WVJu_kNBpDgqI';

/* Reserved usernames — must match the DB constraint in db/schema.sql
   (users_username_reserved) so the UI rejects these before a round
   trip, not just after. */
export const RESERVED_USERNAMES = ['admin', 'root', 'omicslab', 'support', 'api', 'null', 'undefined'];
export const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
