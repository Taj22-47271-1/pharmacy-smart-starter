# Architecture notes

```text
Browser (Next.js / React / TypeScript)
              |
              | HTTP JSON, NEXT_PUBLIC_API_URL
              v
NestJS REST API (validation, auth guards, business logic)
              |
              | Prisma Client
              v
PostgreSQL (created and inspected with pgAdmin 4)
```

## Responsibilities
- Frontend: forms, tables, navigation, loading/error/success states.
- NestJS: validation, authorization, API contracts, inventory workflows.
- Prisma: schema, migrations, typed database access.
- PostgreSQL: persistent medicine, supplier, and stock movement data.
- Reorder feature: start with an explainable threshold-based rule; evaluate it with a few representative test cases and explain its limitations.

## Decisions you should make and document
- Which user roles exist and what each role can do.
- Whether medicine SKU is unique and how expiry dates are validated.
- How stock changes are made atomic and audited.
- How you will evaluate false-positive/false-negative low-stock recommendations.
- What data is needed for a sales-based forecast and how little data affects reliability.
