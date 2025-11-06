import { User } from '../types';

// The main user is now 'let' to allow for modification in the verification flow.
export let mockUser: User = {
  id: 'user01',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  role: 'USER',
  isVerified: false, 
};

export const mockAdmin: User = {
  id: 'admin01',
  name: 'Admin',
  email: 'admin@saferide.com',
  role: 'ADMIN',
  isVerified: true,
};

export let mockAllUsers: User[] = [
    mockUser, 
    { id: 'user02', name: 'Casey Becker', email: 'casey@example.com', role: 'USER', isVerified: true, vehicleType: 'SUV', aadhaarDoc: '/uploads/casey_aadhaar.pdf', drivingLicenseDoc: '/uploads/casey_license.pdf', carRegistrationDoc: '/uploads/casey_car_reg.pdf' },
    { id: 'user03', name: 'Dana Scully', email: 'dana@example.com', role: 'USER', isVerified: true, vehicleType: 'Sedan', aadhaarDoc: '/uploads/dana_aadhaar.pdf', drivingLicenseDoc: '/uploads/dana_license.pdf', carRegistrationDoc: '/uploads/dana_car_reg.pdf' }
];

export const getAllUsers = async (): Promise<User[]> => {
    return Promise.resolve([...mockAllUsers]);
}

export const getUserById = async (id: string): Promise<User | undefined> => {
    return Promise.resolve(mockAllUsers.find(u => u.id === id));
}

// Helper to convert File to a mock URL
const fileToMockUrl = (file: File | null): string | undefined => {
    return file ? `/uploads/${file.name}` : undefined;
}

export const updateUserVerification = async (userId: string, details: { [key: string]: File | null | string }): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = mockAllUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                const updatedDetails = {
                    aadhaarDoc: fileToMockUrl(details.aadhaarDoc as File),
                    drivingLicenseDoc: fileToMockUrl(details.drivingLicenseDoc as File),
                    carRegistrationDoc: fileToMockUrl(details.carRegistrationDoc as File),
                    nocDoc: fileToMockUrl(details.nocDoc as File),
                    vehicleType: details.vehicleType as string,
                    isVerified: true,
                };
                
                // Update the user in the main array
                mockAllUsers[userIndex] = { ...mockAllUsers[userIndex], ...updatedDetails };
                
                // If it's the current mockUser, update it as well
                if (mockAllUsers[userIndex].id === mockUser.id) {
                    mockUser = mockAllUsers[userIndex];
                }

                resolve(mockAllUsers[userIndex]);
            } else {
                reject(new Error("User not found"));
            }
        }, 1000);
    });
};