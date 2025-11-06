import React, { useState, useEffect } from 'react';
import { User, VehicleType } from '../types';
import { updateUserVerification } from '../services/userService';
import { getCarTypes, getBikeTypes } from '../services/vehicleService';
import Card from './ui/Card';
import Button from './ui/Button';
import FileInput from './ui/FileInput';
import { CheckCircleIcon, ShieldCheckIcon, CarIcon, MotorcycleIcon, SparklesIcon } from './Icons';

interface UserVerificationProps {
    user: User;
    onVerificationSuccess: (updatedUser: User) => void;
}

const UserVerification: React.FC<UserVerificationProps> = ({ user, onVerificationSuccess }) => {
    const [formData, setFormData] = useState({
        aadhaarDoc: null as File | null,
        drivingLicenseDoc: null as File | null,
        carRegistrationDoc: null as File | null,
        nocDoc: null as File | null,
    });
    const [category, setCategory] = useState<'CAR' | 'BIKE' | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
    const [carCategories, setCarCategories] = useState<string[]>([]);
    const [bikeCategories, setBikeCategories] = useState<string[]>([]);
    
    const [namesMatch, setNamesMatch] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const fetchVehicleTypes = async () => {
            setCarCategories(await getCarTypes());
            setBikeCategories(await getBikeTypes());
        };
        fetchVehicleTypes();
    }, []);

    const handleFileChange = (name: keyof typeof formData) => (file: File | null) => {
        setFormData(prev => ({ ...prev, [name]: file }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.aadhaarDoc || !formData.drivingLicenseDoc || !formData.carRegistrationDoc) {
            setError('Please upload all required documents.');
            return;
        }
        if (!selectedVehicle) {
            setError('Please select your vehicle type.');
            return;
        }
        if (!namesMatch && !formData.nocDoc) {
            setError('NOC is required if names do not match.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const fullFormData = { ...formData, vehicleType: selectedVehicle };
            const updatedUser = await updateUserVerification(user.id, fullFormData);
            setIsSubmitted(true);
            setTimeout(() => onVerificationSuccess(updatedUser), 2000); // Give user time to see success message
        } catch (err) {
            setError('There was an error submitting your documents. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderVehicleTypeButton = (type: VehicleType) => {
        const isSuper = type.toLowerCase().includes('super');
        const isSelected = selectedVehicle === type;
        const baseClasses = 'p-2 rounded-md border text-sm transition w-full flex items-center justify-center gap-1';
        const selectedClasses = 'bg-brand-primary border-brand-primary text-white';
        const unselectedClasses = `bg-gray-800 border-gray-600 hover:border-gray-500 ${isSuper ? 'text-brand-secondary border-brand-secondary/50 hover:bg-brand-secondary/10' : ''}`;
        return (
           <button key={type} type="button" onClick={() => setSelectedVehicle(type)} className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}>
            {isSuper && <SparklesIcon className="h-4 w-4" />} {type}
          </button>
        );
    };

    if (isSubmitted) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <Card className="max-w-md w-full text-center">
                    <CheckCircleIcon className="h-16 w-16 text-brand-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Verification Submitted!</h2>
                    <p className="text-gray-400">Your documents have been received. You will now be redirected to the dashboard.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="max-w-lg w-full">
                <div className="text-center">
                    <ShieldCheckIcon className="h-12 w-12 text-brand-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">User & Vehicle Verification</h2>
                    <p className="text-gray-400 mb-6">Before you can book a driver, we need to verify your identity and vehicle.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                   <FileInput name="aadhaarDoc" label="Aadhaar Card" onChange={handleFileChange('aadhaarDoc')} required />
                   <FileInput name="drivingLicenseDoc" label="Driving License" onChange={handleFileChange('drivingLicenseDoc')} required />
                   <FileInput name="carRegistrationDoc" label="Car/Bike Registration Document" onChange={handleFileChange('carRegistrationDoc')} required />
                    
                   <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Select Your Vehicle</label>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <button type="button" onClick={() => { setCategory('CAR'); setSelectedVehicle(null); }} className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition ${category === 'CAR' ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-600 bg-gray-800'}`}>
                                <CarIcon className="h-8 w-8 mb-2" /> <span className="font-semibold">Car</span>
                            </button>
                            <button type="button" onClick={() => { setCategory('BIKE'); setSelectedVehicle(null); }} className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition ${category === 'BIKE' ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-600 bg-gray-800'}`}>
                                <MotorcycleIcon className="h-8 w-8 mb-2" /> <span className="font-semibold">Bike</span>
                            </button>
                        </div>
                        {category === 'CAR' && <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{carCategories.map(renderVehicleTypeButton)}</div>}
                        {category === 'BIKE' && <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{bikeCategories.map(renderVehicleTypeButton)}</div>}
                   </div>
                    
                    <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-md">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-brand-primary focus:ring-brand-primary" checked={namesMatch} onChange={(e) => setNamesMatch(e.target.checked)} />
                            <span className="text-sm text-gray-300">The name on my documents matches my vehicle registration.</span>
                        </label>
                    </div>

                    {!namesMatch && (
                         <div className="animate-fade-in">
                            <FileInput name="nocDoc" label="No-Objection Certificate (NOC)" onChange={handleFileChange('nocDoc')} required />
                            <p className="text-xs text-gray-400 mt-2">Please provide an NOC since the names on the documents do not match.</p>
                        </div>
                    )}
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default UserVerification;