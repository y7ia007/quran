'use client';

import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="px-3">
      <div className="relative">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث عن سورة"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg py-2 pr-8 pl-3 text-sm outline-none focus:ring-2 focus:ring-[#1A7A6E]/30 placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
