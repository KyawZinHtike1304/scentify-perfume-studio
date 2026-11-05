# Scentify Spring Boot backend

This module is the replacement API boundary for the browser application. It uses
PostgreSQL, Flyway migrations, and JWT bearer authentication.

## Run locally

Set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and
`JWT_ISSUER_URI`, then run:

```sh
mvn spring-boot:run
```

For a local UI/API smoke test without PostgreSQL or an OAuth issuer, run the
local profile:

```sh
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The unauthenticated health endpoint is available at `GET /api/health`.
Business controllers are protected by Spring Security and require a valid
Supabase Auth JWT.

## Java API

The Spring backend owns the application data APIs and validates Supabase Auth
JWTs:

- `GET|PUT /api/profile`
- `GET /api/orders/mine`
- `GET /api/orders` and `POST /api/orders`
- `PATCH /api/orders/{id}/status`
- `GET|POST /api/chat/messages`
- `GET|POST /api/chat/admin/messages`
- `POST /api/admin/staff`

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on the server when staff
account provisioning is enabled. Never expose the service-role key to the
frontend.
