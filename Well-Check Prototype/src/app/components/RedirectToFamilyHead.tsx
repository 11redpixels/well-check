// V12.0: Redirect component for /dashboard → /family-head
import { Navigate } from 'react-router';

export function RedirectToFamilyHead() {
  return <Navigate to="/family-head" replace />;
}
