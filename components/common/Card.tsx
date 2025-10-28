
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;
