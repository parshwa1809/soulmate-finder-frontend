
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/lovable-uploads/21fc3360-870d-4fae-9d8c-b8fb733c5998.png" 
        alt="Aligned Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className={`font-antrokas font-bold text-white ${textSizeClasses[size]} tracking-wide`}>
          Aligned
        </span>
      )}
    </div>
  );
};

export default Logo;
