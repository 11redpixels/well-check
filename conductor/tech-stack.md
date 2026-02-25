# Technology Stack

This document defines the high-level technology choices and architectural components for **Well-Check Family Shield**.

## 1. Programming Languages & Frameworks
- **Dart:** Primary language for cross-platform development.
- **Flutter:** Mobile UI framework used to build native-quality apps for Android and iOS.
- **Node.js/TypeScript:** Used for backend services and Supabase Edge Functions.

## 2. Core Frontend Components
- **State Management:** `flutter_riverpod` for declarative and testable application state.
- **Routing:** `go_router` for structured, type-safe navigation.
- **UI & Theming:** Material Design principles, Google Fonts for consistent typography, and `fl_chart` for data visualizations.

## 3. Backend & Infrastructure
- **Supabase:** Core backend provider providing PostgreSQL, Authentication, Real-time subscriptions, and Edge Functions.
- **Firebase:** Integrated for high-reliability Cloud Messaging (push notifications) and Crashlytics (error reporting).
- **RevenueCat:** Used for subscription management via `purchases_flutter`.

## 4. Storage & Integration
- **Local Storage:** `shared_preferences` for non-sensitive data and `flutter_secure_storage` for sensitive credentials.
- **Hardware Integration:** Background monitoring services for health vitals and location sensors.
- **Clinical Data Handling:** Structured PostgreSQL schema for medical history and real-time vital logs.
