// 🛡️ Settings View - Placeholder
import { Settings } from 'lucide-react';

export function SettingsView() {
  return (
    <div className="min-h-[calc(100vh-180px)] p-6 flex items-center justify-center">
      <div className="text-center">
        <Settings className="w-24 h-24 text-[#64748B] mx-auto mb-6" />
        <h1 className="text-white font-bold text-4xl mb-4">Settings</h1>
        <p className="text-[#94A3B8] text-lg">App configuration - Coming Soon</p>
      </div>
    </div>
  );
}
