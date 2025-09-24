import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminLogin, AdminDashboard } from '@/components';

export const AdminPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? <AdminDashboard /> : <AdminLogin />}
    </div>
  );
};