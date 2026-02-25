# Implementation Plan: Unified Clinical Alerting & Safety Audit Trail

This plan follows the Test-Driven Development (TDD) approach outlined in `workflow.md`.

## Phase 1: Foundation & Data Models

- [x] Task: Define `Alert` model and `AlertSeverity`/`AlertType` enums in Dart (f169ff1)
    - [ ] Write Tests: Define expected serialization and validation for `Alert` model
    - [ ] Implement Feature: Create the model classes and enums
- [x] Task: Create `AlertService` interface and base implementation (fd20f2b)
    - [ ] Write Tests: Define the contract for triggering alerts and fetching streams
    - [ ] Implement Feature: Create the service scaffold
- [ ] Task: Conductor - User Manual Verification 'Foundation' (Protocol in workflow.md)

## Phase 2: Backend Integration & Logic

- [ ] Task: Implement Supabase persistence in `AlertService`
    - [ ] Write Tests: Mock Supabase client and verify `insert` calls on alert trigger
    - [ ] Implement Feature: Connect service to the `alerts` table
- [ ] Task: Implement Alert Deduplication Logic
    - [ ] Write Tests: Define criteria for avoiding redundant alerts (e.g., time-based window)
    - [ ] Implement Feature: Add deduplication logic to `triggerAlert`
- [ ] Task: Conductor - User Manual Verification 'Backend Integration' (Protocol in workflow.md)

## Phase 3: Refactoring Existing Services

- [ ] Task: Refactor `StitchSyncService` to use `AlertService`
    - [ ] Write Tests: Update existing sync tests to verify `AlertService` interaction
    - [ ] Implement Feature: Replace manual `notifier.triggerAlert` calls with `AlertService.trigger`
- [ ] Task: Refactor `HardwareMonitorService` and `InactivityMonitorService`
    - [ ] Write Tests: Verify hardware/inactivity alerts use the new unified service
    - [ ] Implement Feature: Standardize alert triggers in background monitors
- [ ] Task: Conductor - User Manual Verification 'Refactoring' (Protocol in workflow.md)

## Phase 4: UI Integration & Vault

- [ ] Task: Implement `ActiveAlertsProvider` for real-time monitoring
    - [ ] Write Tests: Verify stream emitting updates when database changes
    - [ ] Implement Feature: Create Riverpod provider for real-time alerts
- [ ] Task: Update "Family Vault" (HistoryView) to display Unified Audit Trail
    - [ ] Write Tests: Verify the UI correctly renders the alert list with appropriate icons/colors
    - [ ] Implement Feature: Connect `HistoryView` to the new audit trail data source
- [ ] Task: Conductor - User Manual Verification 'UI Integration' (Protocol in workflow.md)
