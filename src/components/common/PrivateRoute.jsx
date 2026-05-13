import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function PrivateRoute({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950">
      <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-4 animate-pulse-slow">
        <span className="text-white text-2xl">🌿</span>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading MealSnap...</p>
    </div>
  );
}

export { PrivateRoute as default };
