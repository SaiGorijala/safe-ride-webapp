
import React from 'react';

// FIX: Extend HTMLAttributes to allow passing DOM props like onClick to the underlying div.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-gray-900/50 backdrop-blur-lg border border-gray-700 rounded-xl shadow-lg p-6 md:p-8 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
