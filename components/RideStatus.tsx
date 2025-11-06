
import React from 'react';
import { Ride } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { UserCircleIcon, CheckCircleIcon, MapPinIcon, ClockIcon } from './Icons';

interface RideStatusProps {
  ride: Ride;
  onNewRide: () => void;
}

const RideStatus: React.FC<RideStatusProps> = ({ ride, onNewRide }) => {
  const getStatusInfo = () => {
    switch (ride.status) {
      case 'REQUESTED':
        return {
          icon: <ClockIcon className="h-16 w-16 text-brand-secondary animate-spin" />,
          title: 'Searching for a driver...',
          message: 'We are looking for the nearest available driver for you.'
        };
      case 'ACCEPTED':
        return {
            icon: <UserCircleIcon className="h-16 w-16 text-brand-accent" />,
            title: `Driver ${ride.driverName} is on the way!`,
            message: `Your driver will arrive at ${ride.pickupLocation} shortly.`
        };
      case 'IN_PROGRESS':
        return {
            icon: <MapPinIcon className="h-16 w-16 text-brand-primary animate-bounce" />,
            title: 'Ride in Progress',
            message: `Enjoy your safe ride to ${ride.dropoffLocation}.`
        };
      case 'COMPLETED':
        return {
            icon: <CheckCircleIcon className="h-16 w-16 text-brand-primary" />,
            title: 'You have arrived!',
            message: `Your trip has been completed. The fare of $${ride.fare.toFixed(2)} has been charged.`
        };
      default:
        return {
            icon: <ClockIcon className="h-16 w-16 text-gray-500" />,
            title: 'Status Unknown',
            message: 'Waiting for ride update...'
        };
    }
  };

  const { icon, title, message } = getStatusInfo();

  return (
    <Card className="max-w-lg mx-auto text-center">
      <div className="flex justify-center mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 mb-8">{message}</p>
      
      {ride.status === 'COMPLETED' && (
        <div className="mt-8 border-t border-gray-700 pt-6">
          <h4 className="font-semibold text-lg mb-2">Trip Summary</h4>
          <p><strong>From:</strong> {ride.pickupLocation}</p>
          <p><strong>To:</strong> {ride.dropoffLocation}</p>
          <p><strong>Driver:</strong> {ride.driverName}</p>
          <p className="text-2xl font-bold mt-4">Total: ${ride.fare.toFixed(2)}</p>
          <Button onClick={onNewRide} className="mt-6 w-full">
            Book Another Ride
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RideStatus;
