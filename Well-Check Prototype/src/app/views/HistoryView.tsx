// 🛡️ V8.7.1 HOTFIX: History View with EmptyState
import { EmptyState } from '../components/EmptyState';

export function HistoryView() {
  // TODO: Replace with actual data fetching from Supabase
  // const { data: events, isLoading } = useHistoryEvents();
  const events: any[] = []; // Placeholder - will be empty initially
  const isLoading = false;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
        <div className="text-white text-lg">Loading history...</div>
      </div>
    );
  }

  // Show empty state if no events
  if (!events || events.length === 0) {
    return (
      <div className="min-h-[calc(100vh-180px)]">
        <EmptyState
          icon="📜"
          title="No History Yet"
          message="Your family's activity history will appear here. Medication logs, doctor visits, and safety events are tracked for 90 days."
        />
      </div>
    );
  }

  // Show history timeline (future implementation)
  return (
    <div className="min-h-[calc(100vh-180px)] p-6">
      <h1 className="text-white font-bold text-3xl mb-6">90-Day Vault</h1>
      {/* TODO: Render history timeline with HistoryVault component */}
      <div className="text-[#94A3B8]">
        {events.length} event(s) in history
      </div>
    </div>
  );
}