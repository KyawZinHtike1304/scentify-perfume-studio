# Scentify Spring Boot backend

This module is the Spring Boot API boundary for the browser application. It uses
MySQL, Flyway migrations, Spring Data JPA, and Supabase JWT bearer
authentication.

## Run locally

Set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and
`JWT_ISSUER_URI`, then run:

```sh
mvn spring-boot:run
```

For a local UI/API smoke test without MySQL or an OAuth issuer, run the
local profile:

```sh
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The unauthenticated health endpoint is available at `GET /api/health`.
Business controllers are protected by Spring Security and require a valid
Supabase Auth JWT.

The default local database is `jdbc:mysql://localhost:3306/scentify`.
Flyway creates the schema in `src/main/resources/db/migration` on first
startup. The same schema is used by Google Cloud SQL for MySQL.

## Java API

The Spring backend owns the application data APIs and validates Supabase Auth
JWTs:

- `GET|PUT /api/profile`
- `GET /api/ingredients?search=...`
- `POST|PUT|DELETE /api/ingredients`
- `GET /api/orders/mine`
- `GET /api/orders` and `POST /api/orders`
- `PATCH /api/orders/{id}/status`
- `GET|POST /api/chat/messages`
- `GET|POST /api/chat/admin/messages`
- `POST /api/admin/staff`

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on the server when staff
account provisioning is enabled. Never expose the service-role key to the
frontend.

For Cloud Run, also set `CORS_ALLOWED_ORIGINS` to the deployed frontend origin.
The backend Dockerfile is in this directory and listens on the `PORT`
environment variable supplied by Cloud Run.
