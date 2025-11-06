
import React, { useState, useEffect } from 'react';
import { User, Role, Ride } from './types';
import { mockUser, mockDriver, mockAdmin, mockRides } from './services/mockApi';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import DriverDashboard from './components/DriverDashboard';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/ui/Header';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (role: Role) => {
    // In a real app, this would involve an API call.
    if (role === 'USER') setCurrentUser(mockUser);
    if (role === 'DRIVER') setCurrentUser(mockDriver);
    if (role === 'ADMIN') setCurrentUser(mockAdmin);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const renderDashboard = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'USER':
        return <UserDashboard user={currentUser} onUserUpdate={setCurrentUser} onLogout={handleLogout} />;
      case 'DRIVER':
        return <DriverDashboard driver={currentUser} onLogout={handleLogout} />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      <Header user={currentUser} onLogout={handleLogout} />
      <main className="p-4 md:p-8">
        {!currentUser ? (
          <Auth onLogin={handleLogin} />
        ) : (
          renderDashboard()
        )}
      </main>
    </div>
  );
};

export default App;