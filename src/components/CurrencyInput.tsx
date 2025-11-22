import { useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function CurrencyInput({ value, onChange, placeholder = "0", className = "", required = false }: Props) {
  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numbers and dots
    if (inputValue === '' || /^[0-9.]*$/.test(inputValue.replace(/\./g, ''))) {
      const formatted = formatNumber(inputValue);
      onChange(formatted);
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      required={required}
    />
  );
}