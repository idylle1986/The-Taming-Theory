import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange, name, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-start space-x-3 p-3 rounded-md border cursor-pointer transition-all ${
            value === option.value
              ? 'border-white bg-surfaceHighlight'
              : 'border-border bg-surface hover:bg-surfaceHighlight'
          }`}
        >
          <div className="flex h-5 items-center">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 border-gray-300 text-white focus:ring-white bg-transparent"
            />
          </div>
          <div className="text-sm">
            <span className={`font-medium ${value === option.value ? 'text-white' : 'text-textPrimary'}`}>
              {option.label}
            </span>
            {option.description && (
              <p className="text-textSecondary mt-1 text-xs">{option.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};