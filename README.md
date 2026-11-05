<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Scentify Perfume Studio

## Team

| Student ID | Name |
| --- | --- |
| 6831503006 | Htoo Myat Aung |
| 6831503011 | Kyaw Zin Htike |
| 6831502020 | Ei Thandar Kyaw |
| 6831503029 | Thuta Naing |
| 6831503087 | Saw Keh Blu |

This project is a Spring Boot perfume-studio web application for the course
assignment. It demonstrates five related JPA entities, searchable ingredient
listing, CRUD operations, order management, customer support messaging, and a
React frontend.

### Assignment entities

1. `Profile` - customer account and shipping address.
2. `Ingredient` - searchable perfume ingredient catalog with staff CRUD.
3. `Order` - customer purchase and payment/status workflow.
4. `OrderItem` - products and quantities belonging to an order.
5. `ChatMessage` - customer and staff support messages.

The frontend is a Vite/React application with client-side routing in
[`frontend/`](./frontend/). The Spring Boot module in [`backend/`](./backend/)
is the replacement API boundary for authentication, persistence, and studio
operations. Supabase Auth is configured through the frontend environment
variables and is used only for identity and JWT sessions.

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

## Authentication setup

Supabase Auth remains the identity provider. The application data database for
the assignment is MySQL, either local MySQL or Google Cloud SQL for MySQL.

1. Copy [`frontend/.env.example`](./frontend/.env.example) to `frontend/.env.local` and set your Supabase project URL and publishable key.
2. Configure Supabase Auth and use its JWT issuer URL in the backend.
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

Prerequisites: Node.js, Java 25+, Maven, and MySQL for the Spring backend.

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

The backend defaults to `jdbc:mysql://localhost:3306/scentify`, with username
`root` and password `root`. Override these values with `DATABASE_URL`,
`DATABASE_USERNAME`, and `DATABASE_PASSWORD`. Flyway creates the MySQL schema
on the first startup.

## API examples

The ingredient resource supports the assignment CRUD/search requirements:

```text
GET    /api/ingredients?search=rose
POST   /api/ingredients
PUT    /api/ingredients/{id}
DELETE /api/ingredients/{id}
```

Create, update, and delete operations require a staff or admin Supabase JWT.
Orders and chat use the authenticated customer identity and demonstrate the
relationship between `Profile`, `Order`, `OrderItem`, and `ChatMessage`.

## Google Cloud deployment

Create a Cloud SQL MySQL instance and database named `scentify`, then deploy
the `backend/` directory to Cloud Run using its Dockerfile. Configure the
following Cloud Run variables:

```text
DATABASE_URL=jdbc:mysql://CLOUD_SQL_PUBLIC_IP:3306/scentify?useSSL=true&requireSSL=true
DATABASE_USERNAME=cloudsql-user
DATABASE_PASSWORD=cloudsql-password
JWT_ISSUER_URI=https://YOUR_PROJECT.supabase.co/auth/v1
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server-only-key
CORS_ALLOWED_ORIGINS=https://YOUR_FRONTEND_DOMAIN
```

Never expose `DATABASE_PASSWORD` or `SUPABASE_SERVICE_ROLE_KEY` to the
frontend. Set the frontend `VITE_API_URL` to the deployed Cloud Run URL.
