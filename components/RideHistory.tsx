import React, { useState } from 'react';
import { Ride } from '../types';
import { mockRides } from '../services/rideService';
import { isCar } from '../services/vehicleService';
import Card from './ui/Card';
import { CarIcon, MotorcycleIcon, CalendarIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, ReceiptIcon } from './Icons';
import { generateRideStory } from '../services/geminiService';
import Button from './ui/Button';
import InvoiceModal from './InvoiceModal';

interface RideHistoryProps {
  isDriver: boolean;
}

const RideHistoryCard: React.FC<{ride: Ride, isDriver: boolean}> = ({ride, isDriver}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [story, setStory] = useState<string | null>(null);
    const [isLoadingStory, setIsLoadingStory] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);

    const handleGenerateStory = async () => {
        setIsLoadingStory(true);
        const generatedStory = await generateRideStory(ride);
        setStory(generatedStory);
        setIsLoadingStory(false);
    }
    
    return (
        <>
            <div className="bg-gray-800 rounded-lg p-4 transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {isCar(ride.vehicleType) ? <CarIcon className="h-6 w-6 text-gray-400" /> : <MotorcycleIcon className="h-6 w-6 text-gray-400" />}
                            <p className="font-bold text-lg">{ride.vehicleType} - {ride.pickupLocation.split(',')[0]} to {ride.dropoffLocation.split(',')[0]}</p>
                        </div>
                        <p className="text-sm text-gray-400">
                            {isDriver ? `Passenger: ${ride.userName}` : `Driver: ${ride.driverName}`}
                        </p>
                         <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{new Date(ride.date).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <p className="text-xl font-bold">${ride.fare.toFixed(2)}</p>
                        {isDriver && <p className="text-sm text-brand-primary">+${ride.incentive?.toFixed(2)} incentive</p>}
                        <button onClick={() => setIsExpanded(!isExpanded)} className="mt-2 text-gray-400 hover:text-white">
                            {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p><strong>From:</strong> {ride.pickupLocation}</p>
                                <p><strong>To:</strong> {ride.dropoffLocation}</p>
                            </div>
                             <div>
                                <p><strong>Status:</strong> <span className="font-semibold text-brand-primary">{ride.status}</span></p>
                                <p><strong>Ride ID:</strong> {ride.id}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-4">
                            {!isDriver && (
                                <>
                                {story ? (
                                    <div className="p-3 bg-brand-dark rounded-lg italic text-gray-300 flex-grow">
                                        <p className="flex items-center gap-2 font-semibold mb-2 text-brand-secondary"><SparklesIcon className="h-5 w-5" /> Your Ride Story</p>
                                        {story}
                                    </div>
                                ) : (
                                    <Button onClick={handleGenerateStory} disabled={isLoadingStory} size="sm" variant="secondary">
                                        {isLoadingStory ? 'Generating...' : 'Generate Ride Story with AI'}
                                    </Button>
                                )}
                                </>
                            )}
                             {isDriver && (
                                <Button onClick={() => setShowInvoice(true)} size="sm" variant="outline">
                                    <ReceiptIcon className="h-4 w-4 mr-2"/>
                                    View Invoice
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {showInvoice && <InvoiceModal ride={ride} onClose={() => setShowInvoice(false)} />}
        </>
    )
}

const RideHistory: React.FC<RideHistoryProps> = ({ isDriver }) => {
  const rides = mockRides.filter(ride => 
    isDriver ? ride.driverId === 'driver01' : ride.userId === 'user01'
  );

  return (
    <Card>
      <h3 className="text-2xl font-bold mb-4">Ride History</h3>
      {rides.length > 0 ? (
        <div className="space-y-4">
          {rides.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(ride => (
            <RideHistoryCard key={ride.id} ride={ride} isDriver={isDriver}/>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No past rides found.</p>
      )}
    </Card>
  );
};

export default RideHistory;