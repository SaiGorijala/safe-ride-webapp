
import React from 'react';
import { User } from '../../types';
import { LogoIcon, UserCircleIcon } from '../Icons';
import Button from './Button';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 p-4 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <LogoIcon className="h-8 w-8 text-brand-primary" />
          <h1 className="text-2xl font-bold text-white tracking-tight">SafeRide</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <UserCircleIcon className="h-6 w-6 text-gray-400" />
              <span className="hidden sm:inline">{user.name}</span>
            </div>
            {/* The Logout button is now in the dropdowns within each dashboard */}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;