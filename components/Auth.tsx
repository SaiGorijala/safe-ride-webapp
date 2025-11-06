
import React, { useState } from 'react';
import { Role } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import { ShieldCheckIcon, UserIcon, WrenchScrewdriverIcon, ArrowPathIcon } from './Icons';
import DriverApplication from './DriverApplication';

interface AuthProps {
  onLogin: (role: Role) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [showDriverRegistration, setShowDriverRegistration] = useState(false);

  if (showDriverRegistration) {
    return <DriverApplication onBack={() => setShowDriverRegistration(false)} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <ShieldCheckIcon className="h-16 w-16 text-brand-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Welcome to SafeRide</h2>
        <p className="text-gray-400 mb-8">Your car, our driver. Get home safely.</p>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Login As:</h3>
          <Button onClick={() => onLogin('USER')} className="w-full" size="lg">
            <UserIcon className="h-5 w-5 mr-2" />
            User
          </Button>
          <Button onClick={() => onLogin('DRIVER')} className="w-full" variant="secondary" size="lg">
            <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
            Driver
          </Button>
           <Button onClick={() => onLogin('ADMIN')} className="w-full" variant="ghost" size="lg">
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Admin
          </Button>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-6">
          <p className="text-gray-400 mb-4">Want to drive for us?</p>
          <Button onClick={() => setShowDriverRegistration(true)} variant="outline" className="w-full">
            Register as a Driver
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
