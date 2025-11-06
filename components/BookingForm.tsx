
import React, { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';

interface BookingFormProps {
  onBookRide: (pickupLocation: string, dropoffLocation: string) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onBookRide }) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupLocation || !dropoffLocation) {
      setError('Please enter both pickup and drop-off locations.');
      return;
    }
    setError('');
    onBookRide(pickupLocation, dropoffLocation);
  };

  return (
    <Card className="max-w-lg mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center">Request a Driver</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="pickup" className="block text-sm font-medium text-gray-300 mb-1">Pickup Location</label>
          <Input 
            id="pickup" 
            type="text" 
            placeholder="e.g., 123 Main St, Cityville"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="dropoff" className="block text-sm font-medium text-gray-300 mb-1">Drop-off Location</label>
          <Input 
            id="dropoff" 
            type="text"
            placeholder="e.g., 456 Oak Ave, Townburg"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
        <Button type="submit" className="w-full" size="lg">Find My Driver</Button>
      </form>
    </Card>
  );
};

export default BookingForm;