# Supabase

This directory contains all Supabase database configuration, migrations, and seed data.

## Structure

```
supabase/
├── config.toml          — Supabase local dev configuration
├── migrations/          — SQL migration files (applied in order)
│   └── YYYYMMDDHHMMSS_description.sql
├── seed/                — Seed data scripts (demo data only)
│   └── 001_demo_data.sql
├── functions/           — Supabase Edge Functions (if used)
└── tests/               — RLS policy tests and constraint tests
```

## Migration Naming Convention

```
YYYYMMDDHHMMSS_description.sql
```

Example:
```
20260825120000_create_organizations.sql
20260825120100_create_users.sql
20260825120200_create_vehicles.sql
```

## Rules

1. **Never edit existing migrations** that have been applied to any environment.
2. **Always create a new migration** for schema changes.
3. **Test migrations** on local and staging before production.
4. **Document rollback** approach for each migration.
5. **RLS required** on every exposed table.

## Local Development

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Check schema
supabase db lint

# Stop
supabase stop
```

## Environments

| Environment | Project |
|-------------|---------|
| local | Local Docker instance |
| development | Dev Supabase project |
| staging | Staging Supabase project |
| production | Production Supabase project |

Never point local development at staging or production databases.
