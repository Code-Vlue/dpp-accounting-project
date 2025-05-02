'use client';

// src/app/finance/reports/custom/[id]/edit/page.tsx
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomReportBuilder from '@/components/finance/reports/CustomReportBuilder';
import { financeService } from '@/lib/finance/finance-service';
import { FinancialReportConfig } from '@/types/finance';

interface EditCustomReportPageProps {
  params: {
    id: string;
  };
}

export default function EditCustomReportPage({ params }: EditCustomReportPageProps) {
  const router = useRouter();
  const { id } = params;

  const handleSubmit = async (reportConfig: Omit<FinancialReportConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await financeService.updateFinancialReportConfig(id, reportConfig);
      router.push('/finance/reports');
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Error updating report. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/finance/reports');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue">Edit Report</h1>
          <p className="text-gray-600">Modify report configuration</p>
        </div>
        <div>
          <Link href="/finance/reports" className="text-primary-blue hover:text-blue-700 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
            </svg>
            Back to Reports
          </Link>
        </div>
      </div>

      <CustomReportBuilder 
        reportId={id}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}