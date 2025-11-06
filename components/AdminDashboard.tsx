import React, { useState, useEffect } from 'react';
import { DriverApplication, User } from '../types';
import { getDriverApplications, approveApplication, rejectApplication, getAllDrivers } from '../services/driverService';
import { getAllUsers } from '../services/userService';
import { getCarTypes, getBikeTypes, addCarType, deleteCarType, addBikeType, deleteBikeType } from '../services/vehicleService';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { TrashIcon, UsersIcon, WrenchScrewdriverIcon, CogIcon, DocumentTextIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

type AdminView = 'APPLICATIONS' | 'DRIVERS' | 'USERS' | 'VEHICLES';

const NavButton = ({ targetView, currentView, setView, children }: { targetView: AdminView, currentView: AdminView, setView: (view: AdminView) => void, children: React.ReactNode }) => {
  const isActive = targetView === currentView;
  return (
    <button
      onClick={() => setView(targetView)}
      className={`py-2 px-4 font-semibold flex items-center gap-2 whitespace-nowrap ${isActive ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-white'}`}
    >
      {children}
    </button>
  )
};

const DocumentLink: React.FC<{ doc: string | File | undefined }> = ({ doc }) => {
  if (!doc) return <span className="text-gray-500">Not Provided</span>;
  const docName = typeof doc === 'string' ? doc.split('/').pop() : doc.name;
  
  return (
    <button onClick={() => alert(`Showing document: ${docName}`)} className="text-brand-accent hover:underline flex items-center gap-1 text-sm">
      <DocumentTextIcon className="h-4 w-4"/> {docName}
    </button>
  )
}

const UserDetails: React.FC<{user: User}> = ({ user }) => {
  return (
    <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
      {user.aadhaarDoc && <div><strong>Aadhaar:</strong> <DocumentLink doc={user.aadhaarDoc} /></div>}
      {user.drivingLicenseDoc && <div><strong>License:</strong> <DocumentLink doc={user.drivingLicenseDoc} /></div>}
      {user.carRegistrationDoc && <div><strong>Car Reg:</strong> <DocumentLink doc={user.carRegistrationDoc} /></div>}
      {user.nocDoc && <div><strong>NOC:</strong> <DocumentLink doc={user.nocDoc} /></div>}
      {user.panDoc && <div><strong>PAN:</strong> <DocumentLink doc={user.panDoc} /></div>}
      {user.addressProofDoc && <div><strong>Address Proof:</strong> <DocumentLink doc={user.addressProofDoc} /></div>}
      {user.bankAccountNumber && <div className="col-span-full"><strong>Bank:</strong> {user.bankAccountNumber} ({user.bankIfsc})</div>}
    </div>
  )
}

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<AdminView>('APPLICATIONS');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Data state
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [allDrivers, setAllDrivers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [carTypes, setCarTypes] = useState<string[]>([]);
  const [bikeTypes, setBikeTypes] = useState<string[]>([]);
  
  // Vehicle management state
  const [newCarType, setNewCarType] = useState('');
  const [newBikeType, setNewBikeType] = useState('');
  
  const fetchData = async () => {
    setLoading(true);
    const [apps, drivers, users, cars, bikes] = await Promise.all([
      getDriverApplications(),
      getAllDrivers(),
      getAllUsers(),
      getCarTypes(),
      getBikeTypes(),
    ]);
    setApplications(apps);
    setAllDrivers(drivers);
    setAllUsers(users.filter(u => u.role === 'USER')); // Only show users, not drivers in user list
    setCarTypes(cars);
    setBikeTypes(bikes);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecision = async (appId: string, decision: 'APPROVED' | 'REJECTED') => {
    if (decision === 'APPROVED') {
      await approveApplication(appId);
    } else {
      await rejectApplication(appId);
    }
    fetchData(); // Refresh all data
  };

  // Vehicle Management Handlers
  const handleAddCarType = async (e: React.FormEvent) => { e.preventDefault(); if (newCarType) { setCarTypes(await addCarType(newCarType)); setNewCarType(''); } };
  const handleDeleteCarType = async (type: string) => { setCarTypes(await deleteCarType(type)); };
  const handleAddBikeType = async (e: React.FormEvent) => { e.preventDefault(); if (newBikeType) { setBikeTypes(await addBikeType(newBikeType)); setNewBikeType(''); } };
  const handleDeleteBikeType = async (type: string) => { setBikeTypes(await deleteBikeType(type)); };

  const renderView = () => {
    if (loading) return <p className="text-center text-gray-400">Loading...</p>;

    switch (view) {
      case 'APPLICATIONS':
        const pendingApplications = applications.filter(app => app.status === 'PENDING');
        return (
          <Card>
            <h3 className="text-xl font-bold mb-4">Pending Driver Applications ({pendingApplications.length})</h3>
            {pendingApplications.length > 0 ? (
              <div className="space-y-4">
                {pendingApplications.map(app => (
                  <div key={app.id} className="p-4 bg-gray-800 rounded-lg flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div className="flex-grow">
                      <p className="font-bold text-lg">{app.name}</p>
                      <p className="text-sm text-gray-400">{app.email}</p>
                      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                          <div><strong>License:</strong> <DocumentLink doc={app.drivingLicenseDoc} /></div>
                          <div><strong>PAN:</strong> <DocumentLink doc={app.panDoc} /></div>
                          <div><strong>Aadhaar:</strong> <DocumentLink doc={app.aadhaarDoc} /></div>
                          <div><strong>Address Proof:</strong> <DocumentLink doc={app.addressProofDoc} /></div>
                          <div className="sm:col-span-2"><strong>Bank:</strong> {app.bankAccountNumber} ({app.bankIfsc})</div>
                          <div><strong>Gov ID:</strong> {app.govId}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-2 flex-shrink-0">
                      <Button onClick={() => handleDecision(app.id, 'APPROVED')} size="sm" className="w-full">Approve</Button>
                      <Button onClick={() => handleDecision(app.id, 'REJECTED')} variant="destructive" size="sm" className="w-full">Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No pending applications.</p>
            )}
          </Card>
        );

      case 'DRIVERS':
      case 'USERS':
        const list = view === 'DRIVERS' ? allDrivers : allUsers;
        return (
          <Card>
            <h3 className="text-xl font-bold mb-4">All {view === 'DRIVERS' ? `Drivers (${allDrivers.length})` : `Users (${allUsers.length})`}</h3>
            <div className="space-y-3">
              {list.map(user => (
                <div key={user.id} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                      <button onClick={() => setExpandedId(expandedId === user.id ? null : user.id)} className="text-gray-400 hover:text-white">
                        {expandedId === user.id ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  {expandedId === user.id && <UserDetails user={user} />}
                </div>
              ))}
            </div>
          </Card>
        );

      case 'VEHICLES':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-xl font-bold mb-4">Car Types</h3>
              <div className="space-y-2 mb-4">
                {carTypes.map(type => (
                  <div key={type} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span>{type}</span>
                    <button onClick={() => handleDeleteCarType(type)} className="text-red-500 hover:text-red-400">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddCarType} className="flex gap-2">
                <Input value={newCarType} onChange={(e) => setNewCarType(e.target.value)} placeholder="Add new car type" />
                <Button type="submit" size="md">Add</Button>
              </form>
            </Card>
            <Card>
              <h3 className="text-xl font-bold mb-4">Bike Types</h3>
              <div className="space-y-2 mb-4">
                {bikeTypes.map(type => (
                  <div key={type} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span>{type}</span>
                    <button onClick={() => handleDeleteBikeType(type)} className="text-red-500 hover:text-red-400">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddBikeType} className="flex gap-2">
                <Input value={newBikeType} onChange={(e) => setNewBikeType(e.target.value)} placeholder="Add new bike type" />
                <Button type="submit" size="md">Add</Button>
              </form>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h2>
      <div className="flex mb-6 border-b border-gray-700 overflow-x-auto">
        <NavButton targetView="APPLICATIONS" currentView={view} setView={setView}>
          <WrenchScrewdriverIcon className="h-5 w-5" /> Applications
        </NavButton>
        <NavButton targetView="DRIVERS" currentView={view} setView={setView}>
          <UsersIcon className="h-5 w-5" /> Drivers
        </NavButton>
        <NavButton targetView="USERS" currentView={view} setView={setView}>
          <UsersIcon className="h-5 w-5" /> Users
        </NavButton>
        <NavButton targetView="VEHICLES" currentView={view} setView={setView}>
          <CogIcon className="h-5 w-5" /> Vehicles
        </NavButton>
      </div>
      <div>
        {renderView()}
      </div>
    </div>
  );
};

export default AdminDashboard;
