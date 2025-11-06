import React, { useState } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import FileInput from './ui/FileInput';
import { addDriverApplication } from '../services/driverService';
import { ArrowLeftIcon, CheckCircleIcon } from './Icons';
import { DriverApplication as DriverApplicationType } from '../types';

interface DriverApplicationProps {
    onBack: () => void;
}

type FormData = Omit<DriverApplicationType, 'id' | 'status'>;

const DriverApplication: React.FC<DriverApplicationProps> = ({ onBack }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        drivingLicenseDoc: null as any,
        addressProofDoc: null as any,
        aadhaarDoc: null as any,
        panDoc: null as any,
        govId: '',
        bankAccountNumber: '',
        bankIfsc: '',
    });

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (name: keyof FormData) => (file: File | null) => {
        setFormData(prev => ({ ...prev, [name]: file }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDriverApplication(formData);
            setStep(2);
        } catch (error) {
            console.error("Failed to submit application", error);
            alert("There was an error submitting your application. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="max-w-md w-full relative">
                <button onClick={onBack} className="absolute top-4 left-4 text-gray-400 hover:text-white">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                {step === 1 ? (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-6">Driver Registration</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4">Personal Details</h3>
                                <div className="space-y-4">
                                    <Input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleTextChange} required />
                                    <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleTextChange} required />
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4">Identity & Verification</h3>
                                <div className="space-y-4">
                                    <FileInput name="drivingLicenseDoc" label="Driving License" onChange={handleFileChange('drivingLicenseDoc')} required />
                                    <FileInput name="addressProofDoc" label="Proof of Address (e.g., Utility Bill)" onChange={handleFileChange('addressProofDoc')} required />
                                    <FileInput name="aadhaarDoc" label="Aadhaar Card" onChange={handleFileChange('aadhaarDoc')} required />
                                    <FileInput name="panDoc" label="PAN Card" onChange={handleFileChange('panDoc')} required />
                                    <Input name="govId" type="text" placeholder="Other Government ID (Optional)" value={formData.govId} onChange={handleTextChange} />
                                </div>
                            </div>

                             <div>
                                <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4">Bank Details</h3>
                                <div className="space-y-4">
                                    <Input name="bankAccountNumber" type="text" placeholder="Bank Account Number" value={formData.bankAccountNumber} onChange={handleTextChange} required />
                                    <Input name="bankIfsc" type="text" placeholder="Bank IFSC Code" value={formData.bankIfsc} onChange={handleTextChange} required />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" size="lg">Submit Application</Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <CheckCircleIcon className="h-16 w-16 text-brand-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                        <p className="text-gray-400">Thank you for applying. We will review your application and notify you via email within 3-5 business days.</p>
                        <Button onClick={onBack} className="mt-6">Back to Home</Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DriverApplication;
