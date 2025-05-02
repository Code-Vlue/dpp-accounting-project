// src/components/finance/tuition-credits/ProviderDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { 
  Provider, 
  ProviderQualityRating, 
  TuitionCredit, 
  ProviderPayment 
} from '@/types/finance';

interface ProviderDetailProps {
  providerId: string;
}

export default function ProviderDetail({ providerId }: ProviderDetailProps) {
  const router = useRouter();
  const { 
    selectedProvider, 
    providerTuitionCredits,
    providerPayments,
    providerQualityGrants,
    providersLoading, 
    providerError, 
    fetchProviderById,
    fetchProviderTuitionCredits,
    fetchProviderPayments,
    fetchProviderQualityGrants,
    sendProviderCommunication
  } = useFinanceStore();
  
  const [activeTab, setActiveTab] = useState<'details' | 'credits' | 'payments' | 'grants' | 'communications' | 'portal'>('details');
  const [communicationMessage, setCommunicationMessage] = useState('');
  const [communicationType, setCommunicationType] = useState<'EMAIL' | 'SMS' | 'PORTAL'>('EMAIL');
  const [sendingCommunication, setSendingCommunication] = useState(false);
  const [communicationSent, setCommunicationSent] = useState(false);
  const [communicationError, setCommunicationError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProviderById(providerId);
    fetchProviderTuitionCredits(providerId);
    fetchProviderPayments(providerId);
    fetchProviderQualityGrants(providerId);
  }, [providerId, fetchProviderById, fetchProviderTuitionCredits, fetchProviderPayments, fetchProviderQualityGrants]);
  
  const handleSendCommunication = async () => {
    if (!communicationMessage.trim()) {
      setCommunicationError('Please enter a message');
      return;
    }
    
    setSendingCommunication(true);
    setCommunicationError(null);
    
    try {
      await sendProviderCommunication(providerId, {
        message: communicationMessage,
        type: communicationType,
        sentBy: 'user123', // This would be the current user ID in a real app
        sentAt: new Date()
      });
      
      setCommunicationSent(true);
      setCommunicationMessage('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setCommunicationSent(false);
      }, 3000);
    } catch (error: any) {
      setCommunicationError(error.message || 'Failed to send communication');
    } finally {
      setSendingCommunication(false);
    }
  };
  
  if (providersLoading) {
    return <div className="p-4 text-center">Loading provider data...</div>;
  }
  
  if (providerError) {
    return <div className="p-4 text-center text-red-500">Error loading provider: {providerError}</div>;
  }
  
  if (!selectedProvider) {
    return <div className="p-4 text-center text-amber-500">Provider not found with ID: {providerId}</div>;
  }
  
  const provider = selectedProvider;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{provider.name}</h2>
          <div className="flex items-center mt-1 text-gray-600">
            <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${getProviderTypeColor(provider.providerType)}`}>
              {formatProviderType(provider.providerType)}
            </span>
            <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${getProviderStatusColor(provider.providerStatus)}`}>
              {formatProviderStatus(provider.providerStatus)}
            </span>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getQualityRatingColor(provider.qualityRating)}`}>
              {formatQualityRating(provider.qualityRating)}
            </span>
            {provider.taxDocumentVerified && (
              <span className="inline-block px-2 py-1 text-xs rounded-full ml-2 bg-green-100 text-green-800">
                Tax Verified
              </span>
            )}
            {provider.directDepositVerified && (
              <span className="inline-block px-2 py-1 text-xs rounded-full ml-2 bg-blue-100 text-blue-800">
                ACH Verified
              </span>
            )}
          </div>
        </div>
        
        <div className="space-x-2 mt-2 md:mt-0">
          <Link 
            href={`/finance/tuition-credits/providers/${providerId}/edit`}
            className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700"
          >
            Edit Provider
          </Link>
          <Link 
            href={`/finance/tuition-credits/providers/${providerId}/credits/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
          >
            New Credit
          </Link>
          <Link 
            href={`/finance/tuition-credits/providers/${providerId}/payments/new`}
            className="px-4 py-2 bg-purple-600 text-white rounded shadow-sm hover:bg-purple-700"
          >
            New Payment
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-center border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Provider Details
            </button>
            <button
              onClick={() => setActiveTab('credits')}
              className={`px-6 py-3 text-center border-b-2 font-medium text-sm ${
                activeTab === 'credits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tuition Credits
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 text-center border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('grants')}
              className={`px-6 py-3 text-center border-b-2 font-medium text-sm ${
                activeTab === 'grants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quality Grants
            </button>
            <button
              onClick={() => setActiveTab('communications')}
              className={`px-6 py-3 text-center border-b-2 font-medium text-sm ${
                activeTab === 'communications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Communications
            </button>
            <button
              onClick={() => setActiveTab('portal')}
              className={`px-6 py-3 text-center border-b-2 font-medium text-sm ${
                activeTab === 'portal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Portal Access
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'details' && <ProviderDetails provider={provider} />}
          {activeTab === 'credits' && <ProviderCredits credits={providerTuitionCredits} providerId={providerId} />}
          {activeTab === 'payments' && <ProviderPayments payments={providerPayments} providerId={providerId} />}
          {activeTab === 'grants' && <ProviderGrants grants={providerQualityGrants} providerId={providerId} provider={provider} />}
          {activeTab === 'communications' && (
            <ProviderCommunications 
              providerId={providerId} 
              provider={provider}
              communicationMessage={communicationMessage}
              setCommunicationMessage={setCommunicationMessage}
              communicationType={communicationType}
              setCommunicationType={setCommunicationType}
              sendingCommunication={sendingCommunication}
              communicationSent={communicationSent}
              communicationError={communicationError}
              onSend={handleSendCommunication}
            />
          )}
          {activeTab === 'portal' && <ProviderPortalAccess provider={provider} providerId={providerId} />}
        </div>
      </div>
    </div>
  );
}

// Provider Details Tab
function ProviderDetails({ provider }: { provider: Provider }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Basic Information</h3>
        <dl className="space-y-2">
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Provider ID</dt>
            <dd className="text-sm text-gray-900 col-span-2">{provider.vendorNumber}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">License Number</dt>
            <dd className="text-sm text-gray-900 col-span-2">{provider.licenseNumber || 'Not provided'}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="text-sm text-gray-900 col-span-2">{formatProviderType(provider.providerType)}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="text-sm text-gray-900 col-span-2">{formatProviderStatus(provider.providerStatus)}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Quality Rating</dt>
            <dd className="text-sm text-gray-900 col-span-2">{formatQualityRating(provider.qualityRating)}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Enrollment</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {provider.currentEnrollment || 0} / {provider.enrollmentCapacity || 'Unlimited'}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">YTD Credits</dt>
            <dd className="text-sm text-gray-900 col-span-2">${provider.yearToDateCredits.toLocaleString()}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Grant Eligible</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {provider.qualityImprovementGrantEligible ? 'Yes' : 'No'}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Contract Period</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {provider.contractStartDate && provider.contractEndDate ? (
                `${formatDate(provider.contractStartDate)} - ${formatDate(provider.contractEndDate)}`
              ) : 'Not specified'}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Onboarding Status</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {provider.onboardingStatus === 'COMPLETED' ? (
                <span className="text-green-600">Completed</span>
              ) : provider.onboardingStatus === 'IN_PROGRESS' ? (
                <span className="text-amber-600">In Progress (Step {provider.onboardingStep})</span>
              ) : (
                <span className="text-gray-600">Not Started</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Contact Information</h3>
        <dl className="space-y-2">
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
            <dd className="text-sm text-gray-900 col-span-2">{provider.contactName}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              <a href={`mailto:${provider.contactEmail}`} className="text-blue-600 hover:underline">
                {provider.contactEmail}
              </a>
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              <a href={`tel:${provider.contactPhone}`} className="hover:underline">
                {provider.contactPhone}
              </a>
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Website</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {provider.website ? (
                <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {provider.website}
                </a>
              ) : 'Not provided'}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Preferred Contact</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {provider.communicationPreference || 'Email'}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Newsletter</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {provider.receivesNewsletter ? 'Subscribed' : 'Not subscribed'}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Last Contact</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {provider.lastContactDate ? formatDate(provider.lastContactDate) : 'No recent contact'}
            </dd>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Address</h4>
            <address className="not-italic text-sm text-gray-900">
              {provider.address?.street1}<br />
              {provider.address?.street2 && <>{provider.address.street2}<br /></>}
              {provider.address?.city}, {provider.address?.state} {provider.address?.zipCode}<br />
              {provider.address?.country}
            </address>
          </div>
        </dl>
        
        <h3 className="text-lg font-medium mt-6 mb-3">Payment Information</h3>
        <dl className="space-y-2">
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
            <dd className="text-sm text-gray-900 col-span-2">{formatPaymentMethod(provider.paymentMethod)}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Payment Terms</dt>
            <dd className="text-sm text-gray-900 col-span-2">{provider.paymentTerms}</dd>
          </div>
          {provider.bankAccountInfo && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Account Name</dt>
                <dd className="text-sm text-gray-900 col-span-2">{provider.bankAccountInfo.accountName}</dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {provider.bankAccountInfo.accountType === 'CHECKING' ? 'Checking' : 'Savings'}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {maskAccountNumber(provider.bankAccountInfo.accountNumber)}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Routing Number</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {maskRoutingNumber(provider.bankAccountInfo.routingNumber)}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">ACH Verified</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {provider.directDepositVerified ? 'Yes' : 'No'}
                </dd>
              </div>
            </>
          )}
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {provider.taxIdentification ? maskTaxId(provider.taxIdentification) : 'Not provided'}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Tax Form</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {provider.taxForm}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Tax Verified</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {provider.taxDocumentVerified ? 'Yes' : 'No'}
            </dd>
          </div>
          {provider.taxDocumentExpirationDate && (
            <div className="grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-gray-500">Tax Expiration</dt>
              <dd className="text-sm text-gray-900 col-span-2">
                {formatDate(provider.taxDocumentExpirationDate)}
              </dd>
            </div>
          )}
        </dl>
      </div>
      
      {(provider.notes || provider.contactNotes) && (
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-lg font-medium mb-3">Notes</h3>
          {provider.notes && (
            <div className="p-4 bg-gray-50 rounded-md mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">General Notes</h4>
              <p className="text-sm text-gray-800 whitespace-pre-line">{provider.notes}</p>
            </div>
          )}
          {provider.contactNotes && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-700 mb-1">Contact History Notes</h4>
              <p className="text-sm text-blue-800 whitespace-pre-line">{provider.contactNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Provider Credits Tab
function ProviderCredits({ credits, providerId }: { credits: TuitionCredit[], providerId: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Tuition Credits</h3>
          <p className="text-sm text-gray-500">Total: {credits.length} credits</p>
        </div>
        
        <div className="flex space-x-2">
          <div>
            <input
              type="text"
              placeholder="Search credits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded w-64"
            />
          </div>
          
          <Link 
            href={`/finance/tuition-credits/providers/${providerId}/credits/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
          >
            New Credit
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {credits.length === 0 ? (
          <div className="p-4 text-center bg-gray-50 rounded">No tuition credits found for this provider.</div>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Student</th>
                <th className="py-2 px-4 border-b text-left">Period</th>
                <th className="py-2 px-4 border-b text-left">Credit Amount</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {credits
                .filter(credit => 
                  searchTerm === '' || 
                  credit.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  credit.studentId.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((credit) => (
                  <tr key={credit.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <div className="font-medium">{credit.studentName}</div>
                      <div className="text-sm text-gray-500">ID: {credit.studentId}</div>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="font-medium">{formatDateRange(credit.creditPeriodStart, credit.creditPeriodEnd)}</div>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="font-medium">${credit.creditAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        DPP: ${credit.dppPortion.toLocaleString()} | Family: ${credit.familyPortion.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCreditStatusColor(credit.creditStatus)}`}>
                        {formatCreditStatus(credit.creditStatus)}
                      </span>
                      {credit.isAdjustment && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          Adjustment
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/finance/tuition-credits/credits/${credit.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Provider Payments Tab
function ProviderPayments({ payments, providerId }: { payments: ProviderPayment[], providerId: string }) {
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Provider Payments</h3>
          <p className="text-sm text-gray-500">Total: {payments.length} payments</p>
        </div>
        
        <Link 
          href={`/finance/tuition-credits/providers/${providerId}/payments/new`}
          className="px-4 py-2 bg-purple-600 text-white rounded shadow-sm hover:bg-purple-700"
        >
          New Payment
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        {payments.length === 0 ? (
          <div className="p-4 text-center bg-gray-50 rounded">No payments found for this provider.</div>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Payment Date</th>
                <th className="py-2 px-4 border-b text-left">Amount</th>
                <th className="py-2 px-4 border-b text-left">Method</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Credits</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    <div className="font-medium">{formatDate(payment.date)}</div>
                    <div className="text-sm text-gray-500">Ref: {payment.reference || 'N/A'}</div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="font-medium">${payment.amount.toLocaleString()}</div>
                    {payment.qualityImprovementGrant && payment.grantAmount && (
                      <div className="text-sm text-gray-500">
                        Includes ${payment.grantAmount.toLocaleString()} grant
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="font-medium">{formatPaymentMethod(payment.method)}</div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(payment.status)}`}>
                      {formatPaymentStatus(payment.status)}
                    </span>
                    {payment.paymentPriority !== 'NORMAL' && (
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        payment.paymentPriority === 'HIGH' 
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.paymentPriority === 'HIGH' ? 'High Priority' : 'Urgent'}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="font-medium">{payment.tuitionCreditIds.length}</div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/finance/tuition-credits/payments/${payment.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Provider Quality Improvement Grants Tab
function ProviderGrants({ grants, providerId, provider }: { grants: any[], providerId: string, provider: Provider }) {
  const [showNewGrantForm, setShowNewGrantForm] = useState(false);
  const [grantAmount, setGrantAmount] = useState('');
  const [grantReason, setGrantReason] = useState('');
  
  const handleSubmitGrant = () => {
    // Implementation would go here
    setShowNewGrantForm(false);
    setGrantAmount('');
    setGrantReason('');
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Quality Improvement Grants</h3>
          <p className="text-sm text-gray-500">
            {provider.qualityImprovementGrantEligible 
              ? 'This provider is eligible for quality improvement grants' 
              : 'This provider is not eligible for quality improvement grants'
            }
          </p>
        </div>
        
        {provider.qualityImprovementGrantEligible && (
          <button 
            onClick={() => setShowNewGrantForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700"
            disabled={showNewGrantForm}
          >
            New Grant
          </button>
        )}
      </div>
      
      {showNewGrantForm && (
        <div className="mb-6 p-4 border border-green-200 rounded-md bg-green-50">
          <h4 className="font-medium text-green-800 mb-2">New Quality Improvement Grant</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="grantAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Grant Amount *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="grantAmount"
                  name="grantAmount"
                  value={grantAmount}
                  onChange={e => setGrantAmount(e.target.value)}
                  className="w-full pl-7 p-2 border border-gray-300 rounded"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="grantReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Grant *
              </label>
              <textarea
                id="grantReason"
                name="grantReason"
                value={grantReason}
                onChange={e => setGrantReason(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Explain the purpose of this quality improvement grant..."
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowNewGrantForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitGrant}
              className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700"
              disabled={!grantAmount || !grantReason}
            >
              Submit Grant
            </button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        {grants.length === 0 ? (
          <div className="p-4 text-center bg-gray-50 rounded">
            No quality improvement grants found for this provider.
          </div>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Date</th>
                <th className="py-2 px-4 border-b text-left">Amount</th>
                <th className="py-2 px-4 border-b text-left">Reason</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grants.map((grant, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    <div className="font-medium">{formatDate(grant.date)}</div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="font-medium">${grant.amount.toLocaleString()}</div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="text-sm">{grant.reason}</div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      grant.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      grant.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {grant.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <Link 
                      href={`/finance/tuition-credits/grants/${grant.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Provider Communications Tab
function ProviderCommunications({ 
  providerId, 
  provider, 
  communicationMessage, 
  setCommunicationMessage, 
  communicationType, 
  setCommunicationType,
  sendingCommunication,
  communicationSent,
  communicationError,
  onSend
}: { 
  providerId: string, 
  provider: Provider, 
  communicationMessage: string, 
  setCommunicationMessage: (message: string) => void,
  communicationType: 'EMAIL' | 'SMS' | 'PORTAL',
  setCommunicationType: (type: 'EMAIL' | 'SMS' | 'PORTAL') => void,
  sendingCommunication: boolean,
  communicationSent: boolean,
  communicationError: string | null,
  onSend: () => void
}) {
  const [communications] = useState<any[]>([
    {
      id: '1',
      type: 'EMAIL',
      sentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      sentBy: 'Jane Adams',
      message: 'Monthly newsletter sent with tuition credit updates and quality improvement opportunities.',
      status: 'DELIVERED'
    },
    {
      id: '2',
      type: 'PHONE',
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      sentBy: 'Mark Johnson',
      message: 'Called to verify tax document information. Left voicemail requesting a call back.',
      status: 'COMPLETED'
    },
    {
      id: '3',
      type: 'EMAIL',
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      sentBy: 'Sarah Williams',
      message: 'Sent notification about upcoming quality improvement grant opportunity.',
      status: 'DELIVERED'
    }
  ]);
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Send Communication</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="communicationType" className="block text-sm font-medium text-gray-700 mb-1">
                Communication Method
              </label>
              <select
                id="communicationType"
                value={communicationType}
                onChange={(e) => setCommunicationType(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="EMAIL">Email ({provider.contactEmail})</option>
                <option value="SMS">SMS ({provider.contactPhone})</option>
                {provider.portalAccess && (
                  <option value="PORTAL">Portal Message</option>
                )}
              </select>
            </div>
            
            <div>
              <label htmlFor="communicationMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="communicationMessage"
                value={communicationMessage}
                onChange={(e) => setCommunicationMessage(e.target.value)}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder={`Type your message to ${provider.name} here...`}
              />
            </div>
            
            {communicationError && (
              <div className="text-red-600 text-sm">{communicationError}</div>
            )}
            
            {communicationSent && (
              <div className="text-green-600 text-sm">Communication sent successfully!</div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={onSend}
                disabled={!communicationMessage || sendingCommunication}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
              >
                {sendingCommunication ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Communication History</h3>
        {communications.length === 0 ? (
          <div className="p-4 text-center bg-gray-50 rounded">No communication history available.</div>
        ) : (
          <div className="space-y-4">
            {communications.map((comm) => (
              <div key={comm.id} className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {comm.type === 'EMAIL' ? 'Email' : 
                       comm.type === 'SMS' ? 'SMS' : 
                       comm.type === 'PHONE' ? 'Phone Call' : 
                       comm.type === 'PORTAL' ? 'Portal Message' : 
                       'Other Contact'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(comm.sentAt)} by {comm.sentBy}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      comm.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      comm.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {comm.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-gray-700">{comm.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Provider Portal Access Tab
function ProviderPortalAccess({ provider, providerId }: { provider: Provider, providerId: string }) {
  const [isEnablingPortal, setIsEnablingPortal] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Provider Portal Access</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700 mb-1">
                Status: <span className={`font-medium ${provider.portalAccess ? 'text-green-600' : 'text-red-600'}`}>
                  {provider.portalAccess ? 'Enabled' : 'Disabled'}
                </span>
              </p>
              {provider.portalAccess && provider.portalUsername && (
                <p className="text-sm text-gray-600">
                  Username: {provider.portalUsername}
                </p>
              )}
              {provider.lastPortalLogin && (
                <p className="text-sm text-gray-600">
                  Last login: {formatDate(provider.lastPortalLogin)}
                </p>
              )}
            </div>
            
            <div className="space-x-2">
              {provider.portalAccess ? (
                <>
                  <button
                    onClick={() => setIsResettingPassword(true)}
                    className="px-4 py-2 bg-amber-600 text-white rounded shadow-sm hover:bg-amber-700"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => setIsEnablingPortal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded shadow-sm hover:bg-red-700"
                  >
                    Disable Access
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEnablingPortal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700"
                >
                  Enable Portal Access
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isEnablingPortal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              {provider.portalAccess ? 'Disable Portal Access' : 'Enable Portal Access'}
            </h3>
            
            {provider.portalAccess ? (
              <p className="mb-4 text-gray-700">
                Are you sure you want to disable portal access for {provider.name}? They will no longer be able to log in or view their account information.
              </p>
            ) : (
              <div className="space-y-4 mb-4">
                <p className="text-gray-700">
                  You are about to enable portal access for {provider.name}. They will receive an email with instructions to set up their account.
                </p>
                
                <div>
                  <label htmlFor="portalUsername" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="portalUsername"
                    defaultValue={provider.contactEmail}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be their username for logging in to the portal.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEnablingPortal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Implementation would go here
                  setIsEnablingPortal(false);
                }}
                className={`px-4 py-2 text-white rounded shadow-sm ${
                  provider.portalAccess 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {provider.portalAccess ? 'Disable Access' : 'Enable Access'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isResettingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Reset Provider Password</h3>
            
            <p className="mb-4 text-gray-700">
              Are you sure you want to reset the password for {provider.name}? They will receive an email with instructions to create a new password.
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsResettingPassword(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Implementation would go here
                  setIsResettingPassword(false);
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded shadow-sm hover:bg-amber-700"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-medium mb-4">Portal Activity</h3>
        <div className="p-4 text-center bg-gray-50 rounded mb-4">
          No recent portal activity to display.
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">About the Provider Portal</h4>
          <p className="text-sm text-blue-700 mb-2">
            The Provider Portal gives providers secure access to:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1 mb-2">
            <li>View their tuition credit history</li>
            <li>Track payment status</li>
            <li>Update their contact and banking information</li>
            <li>Access resources for quality improvement</li>
            <li>View and download tax documents</li>
          </ul>
          <p className="text-sm text-blue-700">
            Providers can access the portal at <a href="#" className="underline">https://portal.denverpreschool.org</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatProviderType(type: string): string {
  switch (type) {
    case 'CENTER':
      return 'Child Care Center';
    case 'HOME':
      return 'Family Child Care Home';
    case 'SCHOOL':
      return 'School-Based Program';
    case 'OTHER':
      return 'Other Provider Type';
    default:
      return type;
  }
}

function getProviderTypeColor(type: string): string {
  switch (type) {
    case 'CENTER':
      return 'bg-blue-100 text-blue-800';
    case 'HOME':
      return 'bg-green-100 text-green-800';
    case 'SCHOOL':
      return 'bg-purple-100 text-purple-800';
    case 'OTHER':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatProviderStatus(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'INACTIVE':
      return 'Inactive';
    case 'PENDING':
      return 'Pending';
    case 'SUSPENDED':
      return 'Suspended';
    default:
      return status;
  }
}

function getProviderStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'SUSPENDED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatQualityRating(rating: ProviderQualityRating): string {
  switch (rating) {
    case ProviderQualityRating.LEVEL_1:
      return 'Quality Rating: Level 1';
    case ProviderQualityRating.LEVEL_2:
      return 'Quality Rating: Level 2';
    case ProviderQualityRating.LEVEL_3:
      return 'Quality Rating: Level 3';
    case ProviderQualityRating.LEVEL_4:
      return 'Quality Rating: Level 4';
    case ProviderQualityRating.LEVEL_5:
      return 'Quality Rating: Level 5';
    case ProviderQualityRating.UNRATED:
      return 'Quality Rating: Unrated';
    default:
      return `Quality Rating: ${rating}`;
  }
}

function getQualityRatingColor(rating: ProviderQualityRating): string {
  switch (rating) {
    case ProviderQualityRating.LEVEL_1:
      return 'bg-gray-100 text-gray-800';
    case ProviderQualityRating.LEVEL_2:
      return 'bg-blue-100 text-blue-800';
    case ProviderQualityRating.LEVEL_3:
      return 'bg-teal-100 text-teal-800';
    case ProviderQualityRating.LEVEL_4:
      return 'bg-indigo-100 text-indigo-800';
    case ProviderQualityRating.LEVEL_5:
      return 'bg-purple-100 text-purple-800';
    case ProviderQualityRating.UNRATED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateRange(startDate: Date, endDate: Date): string {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  const end = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${start} - ${end}`;
}

function formatCreditStatus(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'PENDING_APPROVAL':
      return 'Pending Approval';
    case 'APPROVED':
      return 'Approved';
    case 'PROCESSED':
      return 'Processed';
    case 'PAID':
      return 'Paid';
    case 'REJECTED':
      return 'Rejected';
    case 'VOIDED':
      return 'Voided';
    default:
      return status;
  }
}

function getCreditStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'PENDING_APPROVAL':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800';
    case 'PROCESSED':
      return 'bg-indigo-100 text-indigo-800';
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'VOIDED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatPaymentMethod(method: string): string {
  switch (method) {
    case 'ACH':
      return 'ACH Transfer';
    case 'CHECK':
      return 'Check';
    case 'WIRE':
      return 'Wire Transfer';
    case 'CREDIT_CARD':
      return 'Credit Card';
    case 'CASH':
      return 'Cash';
    case 'OTHER':
      return 'Other';
    default:
      return method;
  }
}

function formatPaymentStatus(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'PROCESSING':
      return 'Processing';
    case 'COMPLETED':
      return 'Completed';
    case 'FAILED':
      return 'Failed';
    case 'VOIDED':
      return 'Voided';
    default:
      return status;
  }
}

function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    case 'VOIDED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return '';
  const last4 = accountNumber.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

function maskRoutingNumber(routingNumber: string): string {
  if (!routingNumber) return '';
  const first2 = routingNumber.slice(0, 2);
  const last2 = routingNumber.slice(-2);
  return `${first2}XXXXX${last2}`;
}

function maskTaxId(taxId: string): string {
  if (!taxId) return '';
  if (taxId.length <= 4) return taxId;
  
  const last4 = taxId.slice(-4);
  const prefix = taxId.length === 9 ? 'XX-XXX' : 'XX-XXX-XXX';
  return `${prefix}${last4}`;
}