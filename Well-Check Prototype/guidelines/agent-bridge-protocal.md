# Agent Bridge Protocol — The Source of Truth (V1.0)

## 🎯 Purpose
To prevent "Vibe Drift" between design, system architecture, and code execution. This protocol ensures that all agents are looking at the same map.

## 🌉 The Contract Bridge (Data & Types)
The **Chief Architect** must generate a `contract.ts` (or `schema.sql`) before any coding begins.

1. **Shared Types:** All Coder Agents must import types directly from the schema definitions.
2. **Naming Convention:** Variables must match the PRD's nouns exactly.
3. **Database Law:** If it isn't in the `contract.ts`, the Coder is forbidden from implementing it.

## 🔄 State Machine Sync (UI & Logic)
The **PRD/UX Architect** and **Chief Architect** must align on a single `Status` enum for every entity.

| Feature | PRD/UX Role | Chief Architect Role | Coder Role |
| :--- | :--- | :--- | :--- |
| **Enums** | Define visual states (Pulse/Horizon) | Define database status codes | Implement transitions |
| **Triggers** | Define user interactions | Define API/Backend rules | Handle error/success UI |
| **Validation**| Define error messages | Define schema constraints | Implement "No Silent Failure" |

## 🛠️ The "Handoff" Check
Before a task is considered "Ready for Dev," it must pass this check:
- [ ] Does the `contract.ts` cover all UI states?
- [ ] Does the `status` enum include `loading` and `error` paths?
- [ ] Is the "Atomic Unit of Value" clearly identifiable in the types?


## 📝 BRIDGE COMMANDS (Updated V4.1)

### To Initiate Development
"Generate the `contract.ts` file including all Enums, Interfaces, and the Entity Lifecycle Matrix. Do not delegate to the Coder until this contract is finalized."

### To Validate Sync
"Cross-reference the PRD/UX State-Transition Matrix with the current Data Model. Identify any 'Ghost States' (UI states with no matching data flag)."