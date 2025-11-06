
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  const baseClasses = 'w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition';
  
  return (
    <input className={`${baseClasses} ${className}`} {...props} />
  );
};

export default Input;
