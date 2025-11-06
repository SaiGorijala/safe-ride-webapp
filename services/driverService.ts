import { User, DriverApplication } from '../types';
import { mockAllUsers } from './userService';

let mockAllDrivers: User[] = [
    {
        id: 'driver01',
        name: 'Ben Carter',
        email: 'ben@example.com',
        role: 'DRIVER',
        walletBalance: 150.75,
        isVerified: true,
        drivingLicenseDoc: '/uploads/ben_license.pdf',
        addressProofDoc: '/uploads/ben_address.pdf',
        aadhaarDoc: '/uploads/ben_aadhaar.pdf',
        panDoc: '/uploads/ben_pan.pdf',
        serviceRadius: null,
        radiusSetAt: undefined,
        startLocation: undefined,
    },
    { id: 'driver02', name: 'Ethan Hunt', email: 'ethan@example.com', role: 'DRIVER', walletBalance: 340.50, isVerified: true, serviceRadius: null, radiusSetAt: undefined, startLocation: undefined },
    { id: 'driver03', name: 'Frank Martin', email: 'frank@example.com', role: 'DRIVER', walletBalance: 88.20, isVerified: true, serviceRadius: null, radiusSetAt: undefined, startLocation: undefined },
];

let mockDriverApplications: DriverApplication[] = [
    { 
        id: 'app01', 
        name: 'Charlie Day', 
        email: 'charlie@example.com', 
        drivingLicenseDoc: '/uploads/charlie_license.pdf', 
        govId: 'GID789012',
        addressProofDoc: '/uploads/charlie_address.pdf',
        aadhaarDoc: '/uploads/charlie_aadhaar.pdf',
        panDoc: '/uploads/charlie_pan.pdf',
        bankAccountNumber: '001234567890',
        bankIfsc: 'BANK0001234',
        status: 'PENDING' 
    },
    { 
        id: 'app02', 
        name: 'Diana Prince', 
        email: 'diana@example.com', 
        drivingLicenseDoc: '/uploads/diana_license.pdf',
        govId: 'GID210987',
        addressProofDoc: '/uploads/diana_address.pdf',
        aadhaarDoc: '/uploads/diana_aadhaar.pdf',
        panDoc: '/uploads/diana_pan.pdf',
        bankAccountNumber: '987654321000',
        bankIfsc: 'BANK0005678',
        status: 'PENDING' 
    },
];

export const mockDriver: User = mockAllDrivers[0];

export const getAllDrivers = async (): Promise<User[]> => Promise.resolve([...mockAllDrivers]);
export const getDriverApplications = async (): Promise<DriverApplication[]> => Promise.resolve([...mockDriverApplications]);

const fileToMockUrl = (file: File | string): string => {
    if (typeof file === 'string') return file;
    return `/uploads/${file.name}`;
};

export const addDriverApplication = async (appData: Omit<DriverApplication, 'id' | 'status'>): Promise<DriverApplication> => {
    const newApplication: DriverApplication = {
        ...appData,
        id: `app${Date.now()}`,
        status: 'PENDING',
        drivingLicenseDoc: fileToMockUrl(appData.drivingLicenseDoc),
        addressProofDoc: fileToMockUrl(appData.addressProofDoc),
        aadhaarDoc: fileToMockUrl(appData.aadhaarDoc),
        panDoc: fileToMockUrl(appData.panDoc),
    };
    mockDriverApplications.push(newApplication);
    return Promise.resolve(newApplication);
};

export const approveApplication = async (appId: string): Promise<User> => {
    const appIndex = mockDriverApplications.findIndex(a => a.id === appId);
    if (appIndex === -1) throw new Error("Application not found");

    mockDriverApplications[appIndex].status = 'APPROVED';
    const app = mockDriverApplications[appIndex];

    const newDriver: User = {
        id: `driver${Date.now()}`,
        name: app.name,
        email: app.email,
        role: 'DRIVER',
        isVerified: true,
        walletBalance: 0,
        drivingLicenseDoc: fileToMockUrl(app.drivingLicenseDoc),
        addressProofDoc: fileToMockUrl(app.addressProofDoc),
        aadhaarDoc: fileToMockUrl(app.aadhaarDoc),
        panDoc: fileToMockUrl(app.panDoc),
        govId: app.govId,
        bankAccountNumber: app.bankAccountNumber,
        bankIfsc: app.bankIfsc,
        serviceRadius: null,
        radiusSetAt: undefined,
    };

    mockAllDrivers.push(newDriver);
    mockAllUsers.push(newDriver); // Also add to all users list

    return Promise.resolve(newDriver);
};

export const rejectApplication = async (appId: string): Promise<DriverApplication> => {
     const appIndex = mockDriverApplications.findIndex(a => a.id === appId);
    if (appIndex === -1) throw new Error("Application not found");
    
    mockDriverApplications[appIndex].status = 'REJECTED';
    return Promise.resolve(mockDriverApplications[appIndex]);
}

export const withdrawFunds = async (driverId: string): Promise<User> => {
    const driver = mockAllDrivers.find(d => d.id === driverId);
    if (!driver) throw new Error("Driver not found");
    driver.walletBalance = 0.00; // Reset balance on withdrawal
    return Promise.resolve({...driver});
};

export const updateDriverStatus = async (driverId: string, status: Partial<Pick<User, 'serviceRadius' | 'startLocation' | 'radiusSetAt'>>): Promise<User> => {
    const driverIndex = mockAllDrivers.findIndex(d => d.id === driverId);
    if (driverIndex === -1) throw new Error("Driver not found");

    mockAllDrivers[driverIndex] = { ...mockAllDrivers[driverIndex], ...status };
    return Promise.resolve({ ...mockAllDrivers[driverIndex] });
};