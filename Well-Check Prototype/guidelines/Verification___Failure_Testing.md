# Verification & Failure Architecture (Universal V4)

## 🎯 Core Mission

The app must "Fail Gracefully." We prioritize system availability and data integrity even when the environment is hostile.

## 🛑 Agent Enforcement Rules

- **Audit Fixer:** For every new feature, you must provide a "Chaos Test" snippet (e.g., "What happens if the DB returns null?").
- **Domain Expert:** Define the "Safety Baseline"—what is the minimum info shown when everything else fails?

## 🛠️ Technical Requirements

1. **The "Empty Room" Check:** Every screen must have a designed state for `no_data`, `loading_error`, and `unauthorized`.
2. **Deterministic Retries:** Network requests must use exponential backoff (retry at 1s, 2s, 4s...) before declaring a failure.
3. **Boundary Testing:** - **GPS:** Handle "Indeterminate Location" (show a radius, not a pin).
   - **Time:** Handle "Clock Drift" between phone and server using UTC-only logic.
4. **The "Grandmother" Test:** If a non-technical user encounters an error, the message must be in plain language with a clear "Retry" or "Call Support" button.