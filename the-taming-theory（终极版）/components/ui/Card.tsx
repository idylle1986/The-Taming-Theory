import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-surface border border-border rounded-lg overflow-hidden shadow-sm ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<{children: React.ReactNode; className?: string}> = ({children, className=''}) => (
    <div className={`mb-4 space-y-1 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{children: React.ReactNode; className?: string}> = ({children, className=''}) => (
    <h3 className={`font-semibold leading-none tracking-tight text-textPrimary ${className}`}>{children}</h3>
);

export const CardContent: React.FC<{children: React.ReactNode; className?: string}> = ({children, className=''}) => (
    <div className={`${className}`}>{children}</div>
);