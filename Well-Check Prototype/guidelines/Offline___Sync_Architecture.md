# Offline & Sync Architecture (Universal V4)

## 🎯 Core Mission

Enable "The Core Workflow" to work in dead zones (elevators, basements). The app must never "hang" because of a spinning loading wheel.

## 🛑 Agent Enforcement Rules

- **PRD-UIUX:** Every Zone 1 (Pulse) action must have an "Optimistic" state.
- **Coder Agent:** Use `localStorage` or `IndexedDB` to cache the last 50 locations and the "The Workspace" state.

## 🛠️ Technical Requirements

1. **Local-First Writes:** Mutations hit local storage first, then queue for Supabase sync.
2. **Conflict Policy:** Last-Write-Wins (LWW) is the default unless the Domain Expert specifies "Role-Based Override."
3. **Sync Indicator:** Zone 3 (Ghost) must show a subtle "Syncing..." or "Offline" status icon.