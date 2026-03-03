// 🛡️ Minor View - Simplified Child Interface
// Reference: prd.md (Minor: High-freq tracking, deactivated medical modules)

import { Baby, MapPin, Users } from 'lucide-react';

export function MinorView() {
  return (
    <div className="min-h-[calc(100vh-180px)] p-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-24 h-24 bg-[#6366F1]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Baby className="w-16 h-16 text-[#6366F1]" />
        </div>
        
        <h1 className="text-white font-bold text-4xl mb-4">Minor View</h1>
        <p className="text-[#94A3B8] text-lg mb-8">
          High-frequency tracking mode with simplified interface
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-[#1E293B] border-2 border-[#334155] rounded-lg">
            <MapPin className="w-12 h-12 text-[#84CC16] mx-auto mb-4" />
            <p className="text-white font-bold text-xl mb-2">Location Tracking</p>
            <p className="text-[#94A3B8] text-sm">
              Your location is shared with family members
            </p>
          </div>

          <div className="p-8 bg-[#1E293B] border-2 border-[#334155] rounded-lg">
            <Users className="w-12 h-12 text-[#FBBF24] mx-auto mb-4" />
            <p className="text-white font-bold text-xl mb-2">Family Network</p>
            <p className="text-[#94A3B8] text-sm">
              3 family members are monitoring you
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-[#6366F1]/10 border border-[#6366F1] rounded-lg">
          <p className="text-[#6366F1] text-sm">
            ℹ️ Medical modules are deactivated for minors. Contact your Family Head for access.
          </p>
        </div>
      </div>
    </div>
  );
}
