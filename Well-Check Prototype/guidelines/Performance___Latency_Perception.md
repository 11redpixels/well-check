# Performance & Perceived Instantaneity (Universal V4)

## 🎯 Core Mission

Zero-latency feeling. The user must never wonder if their action worked. We optimize for "Time to Feedback" (TTF) over "Time to Completion."

## 🛑 Agent Enforcement Rules

- **PRD-UIUX:** Every primary action must have a 0ms visual acknowledgment (Pulse/Haptic).
- **Coder Agent:** Use Server Actions with `useOptimistic` for all state changes. Use Skeleton loaders for Zone 1 (Pulse) content.
- **Chief Architect:** Mandate database indexing for all `tenant_id` and `status` queries.

## 🛠️ Technical Requirements

1. **Optimistic UI:** Update the UI locally before the server responds. If the server fails, roll back gracefully with a `sonner` error.
2. **Asset Pre-fetching:** Predict the user's next move (e.g., if they are in the Family List, pre-fetch the Map coordinates).
3. **Bundle Discipline:** Keep the "Pulse" zone interactive in under 1.5s on 3G connections. No heavy libraries in the critical path.
4. **Image/Media:** All uploads must use client-side compression before hitting the network to ensure speed in low-signal areas.