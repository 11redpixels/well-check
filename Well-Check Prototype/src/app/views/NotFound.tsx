// 🛡️ 404 Not Found
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-180px)] p-6 flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-24 h-24 text-[#FF4444] mx-auto mb-6" />
        <h1 className="text-white font-bold text-6xl mb-4">404</h1>
        <p className="text-[#94A3B8] text-xl mb-8">Page not found</p>
        <button
          onClick={() => navigate('/')}
          className="h-[60px] px-8 bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-lg hover:bg-[#9FE63C] transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
