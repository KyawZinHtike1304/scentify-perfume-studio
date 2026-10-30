<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Scentify Perfume Studio

This project uses Supabase for authentication and persistence.

## Supabase setup

1. Copy `.env.example` to `.env.local` and set your Supabase project URL and publishable key.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). This creates the profile/order tables, row-level security policies, and a profile creation trigger.
3. In **Authentication → Providers**, enable Email and Google as needed. Add the local and deployed app URLs to **Authentication → URL Configuration**. For Google sign-in, configure the OAuth provider credentials in Supabase.
4. To grant admin access, create the account with Supabase Auth, then run this in the SQL Editor, replacing the email:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where lower(email) = lower('admin@example.com');
   ```

   Sign out and back in so the new role is included in the session. The browser app does not use a secret/service-role key.

Do not expose a Supabase secret/service-role key in the browser or commit it to source control. Accounts and data from any previous provider are not automatically imported; users must sign up again unless you separately migrate those records.

## Run locally

Prerequisite: Node.js.

```sh
npm install
npm run dev
```
