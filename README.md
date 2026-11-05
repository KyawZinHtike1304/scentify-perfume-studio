<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Scentify Perfume Studio

The frontend is a Vite/React application with client-side routing in
[`frontend/`](./frontend/). The Spring Boot module in [`backend/`](./backend/)
is the replacement API boundary for authentication, persistence, and studio
operations. Supabase schema and Edge Functions live in [`supabase/`](./supabase/)
as shared infrastructure.

## Client-side routes

| Route | View |
| --- | --- |
| `/` | Home |
| `/ingredients` | Ingredient library |
| `/scentify` | Scent builder |
| `/scentify/review` | Fragrance review |
| `/cart` | Shopping cart |
| `/checkout` | Order review |
| `/checkout/payment` | Payment |
| `/profile` | Profile and order history |
| `/customer-care` | Customer care |
| `/about` | About |
| `/journal` | Journal |
| `/admin` | Admin portal |

## Supabase setup

1. Copy [`frontend/.env.example`](./frontend/.env.example) to `frontend/.env.local` and set your Supabase project URL and publishable key.
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

Prerequisites: Node.js, Java 25+, Maven, and PostgreSQL for the Spring
backend.

```sh
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

Run the backend separately after configuring its database and JWT issuer:

```sh
cd backend
mvn spring-boot:run
```

The backend health check is available at `http://localhost:8080/api/health`.
