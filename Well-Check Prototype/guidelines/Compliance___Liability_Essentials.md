# Compliance & Liability Essentials (Universal V4)

## 🎯 Core Mission

Protect the provider and user with an immutable "Black Box" recorder of all safety-critical events.

## 🛑 Agent Enforcement Rules

- **Domain Expert:** Identify which actions need "Immutable Logs" (e.g., Panic Trigger, Ping Reply).
- **Chief Architect:** Must include an `audit_logs` table that is **Append-Only** (No UPDATE or DELETE allowed).

## 🛠️ Technical Requirements

1. **Immutable Trail:** Log `user_id`, `event_type`, `old_value`, `new_value`, and `server_timestamp`.
2. **Digital Handshake:** Use clickwrap for Family Code acceptance. Store the IP address and User Agent of the person joining.
3. **Media Provenance:** Photos/Audio uploaded during "Panic Mode" must have a SHA-256 hash stored in the DB to prevent tampering.