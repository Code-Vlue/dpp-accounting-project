'use client';

// src/components/dashboard/BudgetExpenseChart.tsx
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Generate sample data
const generateSampleData = () => {
  const categories = [
    'Administrative',
    'Tuition Credits',
    'Program Services',
    'Marketing',
    'Professional Development',
    'Provider Support',
    'Facilities',
    'Technology'
  ];
  
  const budgetData = categories.map(() => Math.floor(Math.random() * 100000) + 50000);
  const actualData = budgetData.map(budget => {
    // Random variance between -15% and +10% of budget
    const variance = budget * (Math.random() * 0.25 - 0.15);
    return Math.max(0, Math.floor(budget + variance));
  });
  
  return {
    categories,
    budgetData,
    actualData
  };
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
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
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            compactDisplay: 'short'
          }).format(value);
        }
      }
    }
  },
};

interface BudgetExpenseChartProps {
  title?: string;
  fiscalYear?: string;
}

export default function BudgetExpenseChart({
  title = "Budget vs. Actual Expenses",
  fiscalYear = "2024-2025"
}: BudgetExpenseChartProps) {
  const [viewType, setViewType] = useState<'all' | 'top5'>('all');
  const { categories, budgetData, actualData } = generateSampleData();
  
  // Create combined data for sorting by variance
  const combinedData = categories.map((category, index) => ({
    category,
    budget: budgetData[index],
    actual: actualData[index],
    variance: Math.abs(actualData[index] - budgetData[index])
  }));
  
  // Sort and filter based on view type
  let displayData = [...combinedData];
  if (viewType === 'top5') {
    displayData = combinedData
      .sort((a, b) => b.variance - a.variance)
      .slice(0, 5);
  }
  
  const chartData = {
    labels: displayData.map(item => item.category),
    datasets: [
      {
        label: 'Budget',
        data: displayData.map(item => item.budget),
        backgroundColor: 'rgba(0, 84, 184, 0.7)',
      },
      {
        label: 'Actual',
        data: displayData.map(item => item.actual),
        backgroundColor: 'rgba(67, 176, 42, 0.7)',
      },
    ],
  };
  
  // Calculate total budget and actual
  const totalBudget = budgetData.reduce((sum, val) => sum + val, 0);
  const totalActual = actualData.reduce((sum, val) => sum + val, 0);
  const budgetUtilization = Math.round((totalActual / totalBudget) * 100);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-dark-blue">
            {title}
          </h2>
          <p className="text-sm text-gray-500">
            Fiscal Year: {fiscalYear}
          </p>
        </div>
        <div className="flex space-x-2 text-sm">
          <button 
            onClick={() => setViewType('all')}
            className={`px-2 py-1 rounded-md ${
              viewType === 'all' 
                ? 'bg-blue-100 text-primary-blue' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          <button 
            onClick={() => setViewType('top5')}
            className={`px-2 py-1 rounded-md ${
              viewType === 'top5' 
                ? 'bg-blue-100 text-primary-blue' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Top 5 Variances
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Total Budget</p>
          <p className="text-xl font-bold text-primary-blue">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-xl font-bold text-success-green">{formatCurrency(totalActual)}</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Budget Utilization</p>
          <p className={`text-xl font-bold ${
            budgetUtilization > 100 
              ? 'text-red-600' 
              : budgetUtilization > 90 
                ? 'text-amber-600' 
                : 'text-success-green'
          }`}>
            {budgetUtilization}%
          </p>
        </div>
      </div>
      
      <div className="h-64 mt-4">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}