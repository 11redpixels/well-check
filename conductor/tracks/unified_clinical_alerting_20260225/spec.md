# Specification: Unified Clinical Alerting & Safety Audit Trail

## 1. Overview
This track aims to standardize the alerting and logging mechanism within the Family Shield platform. Currently, alerts are triggered across various services (StitchSync, HardwareMonitor, etc.) with potentially inconsistent data structures. This track will unify these under a single "Clinical Alert" model and a centralized service, providing a reliable safety audit trail.

## 2. Goals
- **Consistency:** Use a single, well-defined data model for all safety alerts.
- **Reliability:** Ensure alerts are persistent and synchronized in real-time to all family monitors.
- **Auditability:** Maintain an immutable record of all safety-related events for future review.
- **Scalability:** Design the service to handle new types of alerts (e.g., medication adherence, falls) without architectural changes.

## 3. Core Components

### 3.1 Unified Alert Model
- `id`: UUID (Primary Key)
- `family_id`: UUID (Reference to families)
- `profile_id`: UUID (Reference to profiles)
- `type`: String (Enum: `fall`, `speeding`, `heart_rate`, `weather`, `inactivity`, `manual`)
- `severity`: String (Enum: `low`, `medium`, `high`, `critical`)
- `message`: String (Human-readable description)
- `metadata`: JSONB (Optional context: e.g., speed value, heart rate value, GPS coordinates)
- `is_resolved`: Boolean (Default: false)
- `created_at`: Timestamp (UTC)

### 3.2 Centralized Alerting Service (`AlertService`)
- Responsible for validating and persisting alerts to Supabase.
- Handles deduplication (e.g., don't spam 10 heart rate alerts in 1 minute).
- Provides a stream of active alerts for the UI.

### 3.3 Safety Audit Trail
- A read-only view/table derived from the `alerts` table.
- Accessible via the "Family Vault" in the UI.

## 4. Acceptance Criteria
- [ ] All existing alert-triggering code (StitchSync, etc.) is refactored to use the new `AlertService`.
- [ ] Alerts are correctly persisted in the `alerts` table in Supabase.
- [ ] Real-time notifications are triggered for high/critical severity alerts.
- [ ] The "Family Vault" correctly displays the historical audit trail of alerts.
- [ ] Unit tests cover alert creation, validation, and deduplication logic.
