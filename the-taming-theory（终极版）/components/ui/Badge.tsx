import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick,
  active = false
}) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  let variantStyles = "";
  
  if (variant === 'default') {
    variantStyles = "bg-white text-black hover:bg-gray-200 border-transparent";
  } else if (variant === 'secondary') {
      variantStyles = active 
        ? "bg-white text-black border-transparent" 
        : "bg-surfaceHighlight text-textPrimary border-transparent hover:bg-gray-700";
  } else {
    variantStyles = "text-textPrimary border border-border hover:bg-surfaceHighlight";
  }

  return (
    <div 
      className={`${baseStyles} ${variantStyles} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};