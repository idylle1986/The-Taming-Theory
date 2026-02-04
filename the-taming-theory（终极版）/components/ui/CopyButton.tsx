import React, { useState } from 'react';
import { Button } from './Button';

interface CopyButtonProps {
  text: string;
  label?: string;
  successLabel?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
  disabled?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ 
  text, 
  label = '复制', 
  successLabel = '已复制 ✅', 
  variant = 'secondary',
  className = '',
  ...props 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <Button 
      variant={copied ? 'outline' : variant}
      className={`transition-all duration-200 ${copied ? 'bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20' : ''} ${className}`}
      onClick={handleCopy}
      {...props}
    >
      {copied ? successLabel : label}
    </Button>
  );
};
