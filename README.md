# Talha Shahid Khan Portfolio API

This repository contains the backend API for my developer portfolio. It provides the content and inquiry endpoints used by the portfolio site, along with an authenticated admin API for managing content and reviewing submissions.

The API is built with NestJS and TypeScript, uses PostgreSQL through Prisma ORM, and publishes interactive OpenAPI documentation with Swagger UI.

## Features

- Serve published blog posts, services, service packages, and portfolio projects.
- Accept contact messages and service inquiries from visitors.
- Manage posts, services, service packages, projects, contacts, and service requests through admin endpoints.
- Secure admin sessions with JWT bearer tokens backed by persisted sessions.
- Support admin password reset and password change with one-time email verification codes.
- Record post events and frontend page visits, with analytics endpoints restricted to admins.
- Validate request bodies and reject unknown fields.

## API Overview

Public endpoints:

| Method | Endpoint            | Purpose                                    |
| ------ | ------------------- | ------------------------------------------ |
| `GET`  | `/posts`            | List published posts                       |
| `GET`  | `/services`         | List published services and their packages |
| `GET`  | `/projects`         | List portfolio projects                    |
| `POST` | `/contacts`         | Submit a contact message                   |
| `POST` | `/service-requests` | Request a service or package               |

Admin endpoints use the `/admin` prefix. They cover authentication, content management, contact and service-request review, and analytics. See the Swagger documentation for the complete route list, request schemas, and examples.

## API Documentation

Start the API locally, then open the interactive Swagger UI at [http://localhost:3000/docs](http://localhost:3000/docs). The raw OpenAPI 3 document is available at [http://localhost:3000/docs-json](http://localhost:3000/docs-json). Use the configured host and port if they differ from the defaults.

In Swagger UI, select **Try it out** to send requests. To use protected admin endpoints, call `POST /admin/login`, copy the returned `accessToken`, select **Authorize**, and enter the token. Swagger UI supplies the `Bearer` prefix. Call `POST /admin/logout` to revoke the session.

## Local Setup

Prerequisites: Node.js, pnpm, and a PostgreSQL database.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env` from `.env.example` and configure `DATABASE_URL`, `JWT_SECRET`, and the SMTP settings used for verification emails.

3. Apply the checked-in database migrations:

   ```bash
   pnpm prisma:migrate:deploy
   ```

4. To create the initial admin account, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then run:

   ```bash
   pnpm prisma:seed
   ```

5. Start the development server:

   ```bash
   pnpm start:dev
   ```

The API listens on port `3000` by default. Set `PORT` to use another port.

## Running in Production

Build the application and start the compiled server:

```bash
pnpm build
pnpm start:prod
```

The project also provides a `vercel-build` script for deployment builds.
