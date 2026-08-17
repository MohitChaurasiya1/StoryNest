import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 font-semibold text-slate-600 dark:text-slate-300">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    // Redirect user to their own role-based dashboard if trying to access unauthorized route
    let redirectPath = '/parent';
    if (user.role === 'TEACHER') {
      redirectPath = '/teacher';
    } else if (user.role === 'ADMIN') {
      redirectPath = '/admin';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

export default ProtectedRoute;

