
import { Ride, VehicleType } from '../types';
import { mockUser } from './userService';
import { mockDriver } from './driverService';

export const mockRides: Ride[] = [
  {
    id: 'ride01',
    userId: 'user01',
    userName: 'Alex Johnson',
    driverId: 'driver01',
    driverName: 'Ben Carter',
    pickupLocation: '123 Oak St, Cityville',
    dropoffLocation: '789 Pine Ave, Townburg',
    vehicleType: 'Sedan',
    status: 'COMPLETED',
    fare: 45.50,
    incentive: 5.00,
    date: '2023-10-26T22:30:00Z',
  },
  {
    id: 'ride02',
    userId: 'user01',
    userName: 'Alex Johnson',
    driverId: 'driver02',
    driverName: 'Chloe Davis',
    pickupLocation: '456 Maple Dr, Cityville',
    dropoffLocation: '101 Birch Rd, Suburbia',
    vehicleType: 'Standard',
    status: 'COMPLETED',
    fare: 22.00,
    incentive: 2.50,
    date: '2023-10-24T23:00:00Z',
  },
];


export const simulateRideRequest = (pickupLocation: string, dropoffLocation: string, vehicleType: VehicleType): Promise<Ride> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newRide: Ride = {
                id: `ride${Math.floor(Math.random() * 1000)}`,
                userId: mockUser.id,
                userName: mockUser.name,
                pickupLocation,
                dropoffLocation,
                vehicleType,
                status: 'REQUESTED',
                fare: Math.floor(Math.random() * 30) + 20,
                date: new Date().toISOString(),
            };
            resolve(newRide);
        }, 1000);
    });
};

export const findDriverForRide = (ride: Ride): Promise<Ride> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                ...ride,
                status: 'ACCEPTED',
                driverId: mockDriver.id,
                driverName: mockDriver.name,
            });
        }, 3000);
    });
}

export const completeRide = (ride: Ride): Promise<Ride> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                ...ride,
                status: 'COMPLETED',
                incentive: ride.fare * 0.1,
            });
        }, 5000);
    });
}
