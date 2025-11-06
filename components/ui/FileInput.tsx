import React, { useState, useRef } from 'react';
import { DocumentTextIcon } from '../Icons';
import Button from './Button';

interface FileInputProps {
  name: string;
  label: string;
  onChange: (file: File | null) => void;
  required?: boolean;
  accept?: string;
}

const FileInput: React.FC<FileInputProps> = ({ name, label, onChange, required, accept = "image/*,application/pdf" }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file ? file.name : null);
    onChange(file);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <div className="flex items-center gap-2">
        <input
          type="file"
          name={name}
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={accept}
          required={required}
        />
        <Button type="button" variant="outline" size="md" onClick={handleButtonClick}>
          Choose File
        </Button>
        <div className="flex-grow p-2 bg-gray-800 border border-gray-600 rounded-md text-sm text-gray-400 truncate">
          {fileName || 'No file selected'}
        </div>
      </div>
    </div>
  );
};

export default FileInput;
