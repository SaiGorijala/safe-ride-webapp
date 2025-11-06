import React from 'react';
import { Ride } from '../types';
import Card from './ui/Card';
import { ReceiptIcon } from './Icons';
import Button from './ui/Button';

interface InvoiceModalProps {
  ride: Ride;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ ride, onClose }) => {
  const baseFare = ride.fare;
  const incentive = ride.incentive || 0;
  const total = baseFare + incentive;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <Card 
        className="max-w-md w-full animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <ReceiptIcon className="h-8 w-8 text-brand-primary"/>
                <h2 className="text-2xl font-bold">Ride Invoice</h2>
            </div>
             <Button onClick={onClose} variant="ghost" size="sm">Close</Button>
        </div>
        
        <div className="space-y-3 text-gray-300 border-t border-b border-gray-700 py-4 my-4">
            <p><strong>Ride ID:</strong> {ride.id}</p>
            <p><strong>Date:</strong> {new Date(ride.date).toLocaleString()}</p>
            <p><strong>Passenger:</strong> {ride.userName}</p>
            <p><strong>From:</strong> {ride.pickupLocation}</p>
            <p><strong>To:</strong> {ride.dropoffLocation}</p>
        </div>

        <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-3">Earnings Breakdown</h3>
            <div className="flex justify-between text-lg">
                <span>Base Fare:</span>
                <span>${baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg text-brand-primary">
                <span>Incentive:</span>
                <span>+ ${incentive.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold border-t border-gray-600 pt-3 mt-3">
                <span>Total Earnings:</span>
                <span>${total.toFixed(2)}</span>
            </div>
        </div>

      </Card>
    </div>
  );
};

export default InvoiceModal;