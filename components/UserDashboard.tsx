import React, { useState } from 'react';
import { User, Ride, VehicleType } from '../types';
import BookingForm from './BookingForm';
import RideStatus from './RideStatus';
import RideHistory from './RideHistory';
import UserVerification from './UserVerification';
import Support from './Support';
import FAQ from './FAQ';
import { simulateRideRequest, findDriverForRide, completeRide } from '../services/mockApi';
import { ChevronDownIcon } from './Icons';

interface UserDashboardProps {
  user: User;
  onUserUpdate: (user: User) => void;
  onLogout: () => void;
}

type UserView = 'BOOKING' | 'HISTORY' | 'SUPPORT' | 'FAQ';

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onUserUpdate, onLogout }) => {
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [view, setView] = useState<UserView>('BOOKING');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleBookRide = async (pickupLocation: string, dropoffLocation: string) => {
    if (!user.vehicleType) {
      alert("Error: Your vehicle type is not set. Please contact support.");
      return;
    }
    const requestedRide = await simulateRideRequest(pickupLocation, dropoffLocation, user.vehicleType);
    setCurrentRide(requestedRide);

    const acceptedRide = await findDriverForRide(requestedRide);
    setCurrentRide(acceptedRide);

    const completedRide = await completeRide(acceptedRide);
    setCurrentRide(completedRide);
  };

  const handleNewRide = () => {
    setCurrentRide(null);
    setView('BOOKING');
  }
  
  const switchView = (newView: UserView) => {
    setView(newView);
    setDropdownOpen(false);
  }

  // If user is not verified, show the verification form instead of the main dashboard.
  if (!user.isVerified) {
    return <UserVerification user={user} onVerificationSuccess={onUserUpdate} />;
  }

  const renderContent = () => {
    if (view === 'BOOKING') {
      return currentRide 
        ? <RideStatus ride={currentRide} onNewRide={handleNewRide} /> 
        : <BookingForm onBookRide={handleBookRide} />;
    }
    switch (view) {
      case 'HISTORY': return <RideHistory isDriver={false} />;
      case 'SUPPORT': return <Support />;
      case 'FAQ': return <FAQ />;
      default: return currentRide ? <RideStatus ride={currentRide} onNewRide={handleNewRide} /> : <BookingForm onBookRide={handleBookRide} />;
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <div className="relative">
             <button onClick={() => setDropdownOpen(prev => !prev)} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-800">
                <div>
                    <h2 className="text-xl font-bold text-left">Welcome, {user.name}!</h2>
                    <p className="text-sm text-gray-400 capitalize text-left">{view.replace('_', ' ').toLowerCase()}</p>
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
             </button>
             {isDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-48 z-10 animate-fade-in-up">
                    <a onClick={() => switchView('BOOKING')} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Book a Ride</a>
                    <a onClick={() => switchView('HISTORY')} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Ride History</a>
                    <a onClick={() => switchView('SUPPORT')} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Support</a>
                    <a onClick={() => switchView('FAQ')} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">FAQ</a>
                    <div className="border-t border-gray-700 my-1"></div>
                    <a onClick={onLogout} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Logout</a>
                </div>
             )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-300">Your Vehicle: <span className="text-brand-primary">{user.vehicleType}</span></p>
        </div>
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default UserDashboard;