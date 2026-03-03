# Security & Multi-Tenancy Contract (Universal V4)

## 🎯 Core Mission

Ensure 100% data isolation. Every row in every table must be scoped to exactly one tenant (Family, Shop, or Org). No user can ever cross the "data border."

## 🛑 Agent Enforcement Rules

- **Chief Architect:** Every Level 2 SQL schema MUST include a `tenant_id` column. If it's missing, the blueprint is rejected.
- **Audit Fixer:** Must verify that `ENABLE ROW LEVEL SECURITY` is present for every new table.

## 🛠️ Technical Requirements

1. **Tenant Identifier:** Every table must have `tenant_id` (UUID).
2. **RLS Policies:** - `SELECT` only if `auth.uid()` matches a member of the `tenant_id`.
   - `INSERT` auto-fills `tenant_id` from the user's JWT.
3. **No Global Queries:** All database functions must include a `WHERE tenant_id = ...` clause as a double-fail-safe.