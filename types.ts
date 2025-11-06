export type Role = 'USER' | 'DRIVER' | 'ADMIN';

// Represents a URL to the uploaded file in mock data
type MockFile = string; 

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  walletBalance?: number;
  isVerified: boolean;
  
  // User's registered vehicle
  vehicleType?: VehicleType;

  // Verification documents
  aadhaarDoc?: MockFile;
  drivingLicenseDoc?: MockFile;
  carRegistrationDoc?: MockFile; // User specific
  nocDoc?: MockFile;             // User specific
  panDoc?: MockFile;               // Driver specific
  addressProofDoc?: MockFile;      // Driver specific
  
  // Driver specific text fields
  govId?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;

  // Driver specific settings
  serviceRadius?: number | null; // in km, null means 'Anywhere'
  radiusSetAt?: string; // ISO date string
  startLocation?: string; // Pinned location for ride searches
}

export interface DriverApplication {
    id: string;
    name: string;
    email: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';

    // Documents
    drivingLicenseDoc: MockFile | File;
    addressProofDoc: MockFile | File;
    aadhaarDoc: MockFile | File;
    panDoc: MockFile | File;

    // Text fields
    govId: string;
    bankAccountNumber: string;
    bankIfsc: string;
}


// VehicleType is now a generic string. The specific categories and their
// classification (car/bike) are now managed by the vehicleService.
export type VehicleType = string;
export type CarType = string;
export type BikeType = string;

export type RideStatus = 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Ride {
  id: string;
  userId: string;
  userName: string;
  driverId?: string;
  driverName?: string;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: VehicleType;
  status: RideStatus;
  fare: number;
  date: string;
  incentive?: number;
}