'use client';

// src/components/dashboard/AccountBalanceWidget.tsx
import { useState } from 'react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Generate sample data
const generateSampleData = (days: number) => {
  const labels = Array.from({ length: days }).map((_, i) => 
    format(subDays(new Date(), days - 1 - i), 'MMM d')
  );
  
  // Starting balance
  let balance = 1200000;
  
  // Generate realistic balance fluctuations
  const data = labels.map(() => {
    // Random change between -3% and +3%
    const change = balance * (Math.random() * 0.06 - 0.03);
    balance += change;
    return Math.round(balance);
  });
  
  return { labels, data };
};

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: false,
      ticks: {
        callback: function(value: any) {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumSignificantDigits: 3
          }).format(value);
        }
      }
    }
  },
  elements: {
    line: {
      tension: 0.4
    }
  }
};

interface AccountBalanceWidgetProps {
  title?: string;
  currentBalance?: number;
}

export default function AccountBalanceWidget({ 
  title = "Account Balance", 
  currentBalance = 1234567.89 
}: AccountBalanceWidgetProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Get sample data based on selected time range
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const { labels, data } = generateSampleData(days);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Balance',
        data: data,
        borderColor: '#003087',
        backgroundColor: 'rgba(0, 48, 135, 0.1)',
        fill: true,
      },
    ],
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-dark-blue">
          {title}
        </h2>
        <div className="flex space-x-2 text-sm">
          <button 
            onClick={() => setTimeRange('7d')}
            className={`px-2 py-1 rounded-md ${
              timeRange === '7d' 
                ? 'bg-blue-100 text-primary-blue' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            7D
          </button>
          <button 
            onClick={() => setTimeRange('30d')}
            className={`px-2 py-1 rounded-md ${
              timeRange === '30d' 
                ? 'bg-blue-100 text-primary-blue' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            30D
          </button>
          <button 
            onClick={() => setTimeRange('90d')}
            className={`px-2 py-1 rounded-md ${
              timeRange === '90d' 
                ? 'bg-blue-100 text-primary-blue' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            90D
          </button>
        </div>
      </div>
      
      <p className="text-3xl font-bold text-primary-blue">
        {formatCurrency(currentBalance)}
      </p>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        As of {format(new Date(), 'MMM d, yyyy')}
      </p>
      
      <div className="h-48 mt-4">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}