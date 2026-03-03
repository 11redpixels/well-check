// 🛡️ Panic View - Emergency Module
import { AlertTriangle } from 'lucide-react';
import { PanicButton } from '../components/PanicButton';
import { useApp } from '../context/AppContext';

export function PanicView() {
  const { currentUser } = useApp();

  return (
    <div className="min-h-[calc(100vh-180px)] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <AlertTriangle className="w-16 h-16 text-[#FF4444] mx-auto mb-4" />
          <h1 className="text-white font-bold text-4xl mb-2">Panic Button</h1>
          <p className="text-[#94A3B8] text-lg">
            Emergency alert system for family
          </p>
        </div>

        <PanicButton
          userName={currentUser?.name || 'User'}
          onPanicTriggered={(isSilent) => {
            console.log('Panic triggered:', isSilent);
          }}
        />
      </div>
    </div>
  );
}
