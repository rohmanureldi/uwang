import { Search } from 'lucide-react';
import Input from './Input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search..." 
}: SearchInputProps) {
  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      icon={<Search className="w-4 h-4" />}
      variant="search"
    />
  );
}