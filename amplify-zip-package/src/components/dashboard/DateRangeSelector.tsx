'use client';

// src/components/dashboard/DateRangeSelector.tsx
import { useState } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

interface DateRangeSelectorProps {
  onRangeChange: (range: DateRange) => void;
  className?: string;
}

export default function DateRangeSelector({ 
  onRangeChange, 
  className = '' 
}: DateRangeSelectorProps) {
  const today = new Date();
  
  // Predefined date ranges
  const dateRanges: Record<string, DateRange> = {
    '7d': {
      startDate: subDays(today, 7),
      endDate: today,
      label: 'Last 7 Days'
    },
    '30d': {
      startDate: subDays(today, 30),
      endDate: today,
      label: 'Last 30 Days'
    },
    '90d': {
      startDate: subDays(today, 90),
      endDate: today,
      label: 'Last 90 Days'
    },
    'this-month': {
      startDate: startOfMonth(today),
      endDate: today,
      label: 'This Month'
    },
    'last-month': {
      startDate: startOfMonth(subMonths(today, 1)),
      endDate: endOfMonth(subMonths(today, 1)),
      label: 'Last Month'
    },
    'ytd': {
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: today,
      label: 'Year to Date'
    }
  };
  
  const [selectedRange, setSelectedRange] = useState<string>('30d');
  
  // Handle change of date range
  const handleRangeChange = (rangeKey: string) => {
    setSelectedRange(rangeKey);
    onRangeChange(dateRanges[rangeKey]);
  };
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="flex flex-wrap">
        {Object.entries(dateRanges).map(([key, range]) => (
          <button
            key={key}
            onClick={() => handleRangeChange(key)}
            className={`px-3 py-2 text-sm ${
              selectedRange === key
                ? 'bg-blue-50 text-primary-blue font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      
      <div className="px-3 py-2 text-sm border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Selected Range:</span>
          <span className="font-medium text-gray-800">
            {formatDate(dateRanges[selectedRange].startDate)} – {formatDate(dateRanges[selectedRange].endDate)}
          </span>
        </div>
      </div>
    </div>
  );
}