
import { VehicleType } from '../types';

// These arrays act as our mock database for vehicle types.
let carTypes: string[] = ['Sedan', 'SUV', 'Hatchback', 'Supercar'];
let bikeTypes: string[] = ['Standard', 'Cruiser', 'Sport', 'Superbike'];

export const getCarTypes = async (): Promise<string[]> => {
    // Simulate async API call
    return Promise.resolve([...carTypes]);
};

export const getBikeTypes = async (): Promise<string[]> => {
    // Simulate async API call
    return Promise.resolve([...bikeTypes]);
};

export const addCarType = async (type: string): Promise<string[]> => {
    if (type && !carTypes.includes(type)) {
        carTypes.push(type);
    }
    return Promise.resolve([...carTypes]);
};

export const deleteCarType = async (type: string): Promise<string[]> => {
    carTypes = carTypes.filter(t => t !== type);
    return Promise.resolve([...carTypes]);
};

export const addBikeType = async (type: string): Promise<string[]> => {
    if (type && !bikeTypes.includes(type)) {
        bikeTypes.push(type);
    }
    return Promise.resolve([...bikeTypes]);
};

export const deleteBikeType = async (type: string): Promise<string[]> => {
    bikeTypes = bikeTypes.filter(t => t !== type);
    return Promise.resolve([...bikeTypes]);
};

/**
 * Synchronously checks if a given vehicle type is a car.
 * This is used by UI components to render the correct icons.
 * It works because our "database" is just an in-memory array.
 */
export function isCar(vehicleType: VehicleType): boolean {
    return carTypes.includes(vehicleType);
}
