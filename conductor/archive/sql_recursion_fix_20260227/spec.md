# Specification: SQL Recursion Fix

## Problem
The SQL script for fixing RLS recursion failed with `ERROR: 2BP01: cannot drop function get_my_family_id() because other objects depend on it`. Policies on `vitals_log`, `alerts`, `medications`, `managed_devices`, and `families` depend on it.

## Requirements
- Use `CASCADE` when dropping old functions (e.g., `DROP FUNCTION IF EXISTS get_my_family_id() CASCADE;`).
- Apply the new non-recursive policy (using `public.get_auth_family_id()`) for ALL affected tables: `profiles`, `families`, `medications`, `medication_logs`, `alerts`, `vitals_log`, and `managed_devices`.
- Explicitly include `vitals_log` and `managed_devices`.
- Show the proposed SQL before applying.
