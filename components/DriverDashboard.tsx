import React, { useState, useEffect } from 'react';
import { User, Ride } from '../types';
import { withdrawFunds, updateDriverStatus } from '../services/driverService';
import { mockRides } from '../services/rideService';
import RideHistory from './RideHistory';
import Support from './Support';
import FAQ from './FAQ';
import Card from './ui/Card';
import { WalletIcon, CheckCircleIcon, MapPinIcon, MapIcon, CashIcon, ChevronDownIcon, ReceiptIcon } from './Icons';
import Button from './ui/Button';
import InvoiceModal from './InvoiceModal';

interface DriverDashboardProps {
  driver: User;
  onLogout: () => void;
}

type DriverView = 'PAYMENTS' | 'HISTORY' | 'INVOICES' | 'SUPPORT' | 'FAQ';

// --- Sub-Components defined within DriverDashboard for co-location ---

const GoOnlineModal: React.FC<{
    onClose: () => void;
    onConfirm: (location: string, radius: number | null) => void;
}> = ({ onClose, onConfirm }) => {
    const [pinnedLocation, setPinnedLocation] = useState('');
    const [selectedRadius, setSelectedRadius] = useState<number|null>(5); // Default to 5km

    const handleConfirm = () => {
        const location = selectedRadius === null ? 'Current GPS Location' : pinnedLocation;
        if (selectedRadius !== null && !location) {
            alert('Please pin a location for the selected radius.');
            return;
        }
        onConfirm(location, selectedRadius);
    }
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full animate-fade-in-up">
                <h3 className="text-2xl font-bold mb-4 text-center">Go Online</h3>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">1. Pin Starting Location</label>
                    <div className="p-4 bg-gray-800 rounded-lg text-center">
                        <MapIcon className="h-16 w-16 text-gray-500 mx-auto mb-3"/>
                        <p className="text-gray-400 mb-3 text-sm">{pinnedLocation || 'Location not set'}</p>
                        <Button variant="outline" onClick={() => setPinnedLocation('123 Downtown Ave, Cityville')}>Pin Location</Button>
                         <p className="text-xs text-gray-500 mt-2">Select 'Anywhere' to use your live GPS location.</p>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">2. Select Service Radius</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[5, 10, 15, 20].map(r => 
                            <Button key={r} variant={selectedRadius === r ? 'primary' : 'secondary'} onClick={() => setSelectedRadius(r)}>{r} km</Button>
                        )}
                        <Button variant={selectedRadius === null ? 'primary' : 'secondary'} className="col-span-2" onClick={() => setSelectedRadius(null)}>Anywhere</Button>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <Button variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
                    <Button onClick={handleConfirm} className="w-full">Confirm & Go Online</Button>
                </div>
            </Card>
        </div>
    );
};

const PaymentsView: React.FC<{ driver: User, onWithdraw: () => void }> = ({ driver, onWithdraw }) => (
    <Card>
        <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-400">Total Income</h3>
            <p className="text-5xl font-bold my-4">${driver.walletBalance?.toFixed(2)}</p>
            <Button onClick={onWithdraw} size="lg" disabled={!driver.walletBalance || driver.walletBalance === 0}>
                <CashIcon className="h-5 w-5 mr-2"/> Withdraw Funds
            </Button>
             <p className="text-xs text-gray-500 mt-4">Withdrawals are processed instantly. Balance will reset to $0.00.</p>
        </div>
    </Card>
);

const InvoicesView: React.FC = () => {
    const driverRides = mockRides.filter(ride => ride.driverId === 'driver01');
    const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

    return (
        <>
            <Card>
                <h3 className="text-2xl font-bold mb-4">All Invoices</h3>
                <div className="space-y-3">
                    {driverRides.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(ride => (
                        <div key={ride.id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Ride ID: {ride.id}</p>
                                <p className="text-sm text-gray-400">{new Date(ride.date).toLocaleDateString()} - ${ride.fare.toFixed(2)}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSelectedRide(ride)}>
                                <ReceiptIcon className="h-4 w-4 mr-2"/> View Invoice
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
            {selectedRide && <InvoiceModal ride={selectedRide} onClose={() => setSelectedRide(null)} />}
        </>
    );
};

// --- Main DriverDashboard Component ---

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driver, onLogout }) => {
  const [driverData, setDriverData] = useState<User>(driver);
  const [isOnline, setIsOnline] = useState(false);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [view, setView] = useState<DriverView>('PAYMENTS');
  const [showGoOnlineModal, setShowGoOnlineModal] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleOnline = () => {
    if (isOnline) {
      setIsOnline(false);
      setActiveRide(null); // Clear ride when going offline
    } else {
      setShowGoOnlineModal(true);
    }
  };
  
  const handleGoOnlineConfirm = async (location: string, radius: number | null) => {
    const updatedDriver = await updateDriverStatus(driverData.id, {
        startLocation: location,
        serviceRadius: radius,
        radiusSetAt: new Date().toISOString(),
    });
    setDriverData(updatedDriver);
    setIsOnline(true);
    setShowGoOnlineModal(false);
    // Simulate getting a ride request
    setTimeout(() => {
      setActiveRide({
        id: 'ride_new', userId: 'user02', userName: 'Jane Doe',
        pickupLocation: 'The Rusty Anchor Bar', dropoffLocation: '456 Elm Street',
        vehicleType: 'SUV', status: 'REQUESTED', fare: 35.00, date: new Date().toISOString()
      });
    }, 5000);
  };

  const handleWithdraw = async () => {
    const updatedDriver = await withdrawFunds(driverData.id);
    setDriverData(updatedDriver);
    alert("Funds withdrawn successfully!");
  };
  
  const handleRideAction = (accept: boolean) => {
    if (accept) {
      setActiveRide(prev => prev ? {...prev, status: 'ACCEPTED'} : null);
      setTimeout(() => setActiveRide(prev => prev ? {...prev, status: 'IN_PROGRESS'} : null), 3000);
      setTimeout(() => setActiveRide(prev => prev ? {...prev, status: 'COMPLETED'} : null), 10000);
    } else {
      setActiveRide(null);
    }
  };
  
  const handleReturnTrip = () => {
    alert("Finding a return trip booking for you!");
    setActiveRide(null);
  }

  const renderRideContent = () => {
    if (activeRide) {
        return (
             <Card>
                {activeRide.status === 'REQUESTED' && (
                    <>
                        <h3 className="text-2xl font-bold mb-4 text-brand-secondary animate-pulse">New Ride Request!</h3>
                        <div className="space-y-3 text-lg">
                           <p><strong>From:</strong> {activeRide.pickupLocation}</p>
                           <p><strong>To:</strong> {activeRide.dropoffLocation}</p>
                           <p><strong>Fare:</strong> ${activeRide.fare.toFixed(2)}</p>
                        </div>
                        <div className="flex space-x-4 mt-6">
                            <Button onClick={() => handleRideAction(true)} className="w-full">Accept</Button>
                            <Button onClick={() => handleRideAction(false)} variant="destructive" className="w-full">Decline</Button>
                        </div>
                    </>
                )}
                {activeRide.status === 'IN_PROGRESS' && (
                    <div className="text-center">
                        <MapPinIcon className="h-12 w-12 text-brand-accent mx-auto mb-4 animate-bounce"/>
                        <h3 className="text-2xl font-bold mb-2">Ride In Progress</h3>
                        <p className="font-semibold text-lg">{activeRide.dropoffLocation}</p>
                    </div>
                )}
                {activeRide.status === 'COMPLETED' && (
                    <div className="text-center">
                        <CheckCircleIcon className="h-12 w-12 text-brand-primary mx-auto mb-4"/>
                        <h3 className="text-2xl font-bold mb-2">Ride Completed!</h3>
                        <Button onClick={handleReturnTrip} className="mt-6">Book Return Trip</Button>
                    </div>
                )}
             </Card>
        );
    }
    return (
        <Card>
            <p className="text-center text-gray-400">Online and waiting for ride requests...</p>
            <div className="text-center text-sm text-gray-500 mt-4">
                <p><strong>Service Area:</strong> {driverData.startLocation}</p>
                <p><strong>Radius:</strong> {driverData.serviceRadius ? `${driverData.serviceRadius} km` : 'Anywhere'}</p>
            </div>
        </Card>
    );
  }

  const renderOfflineContent = () => {
    switch(view) {
        case 'PAYMENTS': return <PaymentsView driver={driverData} onWithdraw={handleWithdraw} />;
        case 'HISTORY': return <RideHistory isDriver={true} />;
        case 'INVOICES': return <InvoicesView />;
        case 'SUPPORT': return <Support />;
        case 'FAQ': return <FAQ />;
        default: return <PaymentsView driver={driverData} onWithdraw={handleWithdraw} />;
    }
  }
  
  const switchView = (newView: DriverView) => {
    setView(newView);
    setDropdownOpen(false);
  }

  return (
    <div className="container mx-auto">
      {showGoOnlineModal && <GoOnlineModal onClose={() => setShowGoOnlineModal(false)} onConfirm={handleGoOnlineConfirm} />}
      
      {/* Custom Header for Driver */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <div className="relative">
            <button onClick={() => setDropdownOpen(prev => !prev)} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-800">
                <div>
                    <h2 className="text-xl font-bold text-left">{isOnline ? `Online` : `Offline`}</h2>
                    <p className="text-sm text-gray-400 capitalize text-left">{view.toLowerCase()}</p>
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
             {isDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-48 z-10 animate-fade-in-up">
                    <a onClick={() => switchView('PAYMENTS')} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Payments</a>
                    <a onClick={() => switchView('HISTORY')} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Ride History</a>
                    <a onClick={() => switchView('INVOICES')} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Invoices</a>
                    <a onClick={() => switchView('SUPPORT')} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Support</a>
                    <a onClick={() => switchView('FAQ')} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">FAQ</a>
                    <div className="border-t border-gray-700 my-1"></div>
                    <a onClick={onLogout} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Logout</a>
                </div>
             )}
        </div>
        
        <div className="flex items-center gap-3">
            <span className={`font-semibold text-sm ${isOnline ? 'text-brand-primary' : 'text-gray-500'}`}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </span>
            <label htmlFor="toggle" className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" id="toggle" className="sr-only" checked={isOnline} onChange={handleToggleOnline} />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isOnline ? 'transform translate-x-6 bg-brand-primary' : ''}`}></div>
              </div>
            </label>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {isOnline ? renderRideContent() : renderOfflineContent()}
      </div>
    </div>
  );
};

export default DriverDashboard;