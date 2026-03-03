// V12.0: Redirect component for /panic-history → /panic
import { Navigate } from 'react-router';

export function RedirectToPanic() {
  return <Navigate to="/panic" replace />;
}
