# Global Project Guidelines & Design System (V4.1)

## 🎨 VISUAL ENGINE

- **Palette:** Midnight Slate (BG), Safety Green (Action), Emergency Red (Alert).
- **Typography:** Bold Sans-serif; Monospace for PID and Data values.

## 🛠️ THE TECH STACK CONTRACT

- **Frontend:** Next.js 14 (App Router) + Tailwind 4.
- **Backend:** Supabase (Auth, Postgres, Realtime).
- **Constraint:** NO shadcn/ui. NO complex state libraries (Zustand). Build custom, keep it light.

## 📱 INTERACTION RULES

- **Grease-Mode:** 48x48px touch targets minimum.
- **Zero-Gravity:** 0ms visual/haptic feedback on all taps.

## 🤖 AGENT DIRECTIVES

- **To Coder:** "Enforce 7:1 contrast ratio on all components. Use Tailwind 4 only."
- **To PRD Agent:** "Every screen must adhere to the 3-Zone HUD (Pulse, Horizon, Ghost)."