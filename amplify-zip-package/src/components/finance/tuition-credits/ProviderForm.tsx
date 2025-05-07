// src/components/finance/tuition-credits/ProviderForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { 
  Provider, 
  ProviderType, 
  ProviderStatus, 
  ProviderQualityRating,
  PaymentMethod,
  TaxFormType,
  Address,
  VendorStatus,
  VendorType
} from '@/types/finance';

interface ProviderFormProps {
  providerId?: string;
  isEdit?: boolean;
  isOnboarding?: boolean;
  provider?: Provider;
  onSubmit: (providerData: any) => Promise<void>;
}

export default function ProviderForm({ providerId, isEdit = false, isOnboarding = false, provider, onSubmit }: ProviderFormProps) {
  const router = useRouter();
  const { 
    selectedProvider, 
    providersLoading, 
    providerError, 
    fetchProviderById, 
    createProvider, 
    updateProvider,
    startProviderOnboarding,
    completeProviderOnboarding
  } = useFinanceStore();
  
  // Use the provided provider data if available, otherwise use the one from the store
  const providerData = provider || selectedProvider;
  
  // Define a more comprehensive interface for the form state
  interface ProviderFormState {
    // Base Provider fields
    name: string;
    vendorNumber: string;
    type: VendorType;
    status: VendorStatus;
    providerType: ProviderType;
    providerStatus: ProviderStatus;
    licenseNumber: string;
    qualityRating: ProviderQualityRating;
    enrollmentCapacity: number;
    currentEnrollment: number;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    address: {
      street1: string;
      street2?: string; // Make street2 optional to match Address interface
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    bankAccountInfo: {
      accountNumber: string;
      routingNumber: string;
      accountType: 'CHECKING' | 'SAVINGS';
      accountName: string;
    };
    paymentMethod: PaymentMethod;
    paymentTerms: string;
    contractStartDate: Date;
    contractEndDate: Date;
    qualityImprovementGrantEligible: boolean;
    taxIdentification: string;
    taxForm: TaxFormType;
    notes: string;
    website: string;
    
    // Additional fields not in the Provider interface
    taxDocumentVerified: boolean;
    taxDocumentExpirationDate: Date | null;
    taxDocumentUrl: string;
    directDepositVerified: boolean;
    communicationPreference: 'EMAIL' | 'PHONE' | 'MAIL';
    receivesNewsletter: boolean;
    onboardingStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    onboardingStep: number;
    lastContactDate: Date | null;
    contactNotes: string;
    portalAccess: boolean;
    portalUsername: string;
    lastPortalLogin: Date | null;
    qualityImprovementHistory: {date: Date, amount: number, reason: string}[];
  }

  const [formData, setFormData] = useState<ProviderFormState>({
    name: '',
    vendorNumber: '',
    type: "PROVIDER" as VendorType,
    status: isOnboarding ? VendorStatus.PENDING : VendorStatus.ACTIVE,
    providerType: ProviderType.CENTER,
    providerStatus: isOnboarding ? ProviderStatus.PENDING : ProviderStatus.ACTIVE,
    licenseNumber: '',
    qualityRating: ProviderQualityRating.UNRATED,
    enrollmentCapacity: 0,
    currentEnrollment: 0,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    bankAccountInfo: {
      accountNumber: '',
      routingNumber: '',
      accountType: 'CHECKING',
      accountName: ''
    },
    paymentMethod: PaymentMethod.ACH,
    paymentTerms: 'Net 30',
    contractStartDate: new Date(),
    contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    qualityImprovementGrantEligible: false,
    taxIdentification: '',
    taxForm: TaxFormType.W9,
    notes: '',
    website: '',
    // Additional fields for enhanced provider management
    taxDocumentVerified: false,
    taxDocumentExpirationDate: null,
    taxDocumentUrl: '',
    directDepositVerified: false,
    communicationPreference: 'EMAIL',
    receivesNewsletter: true,
    onboardingStatus: isOnboarding ? 'IN_PROGRESS' : 'COMPLETED',
    onboardingStep: isOnboarding ? 1 : 0,
    lastContactDate: null,
    contactNotes: '',
    portalAccess: isOnboarding ? false : true,
    portalUsername: '',
    lastPortalLogin: null,
    qualityImprovementHistory: [],
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(isOnboarding ? 1 : 0);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  // Load provider data if editing and no external provider is provided
  useEffect(() => {
    if (isEdit && providerId && !provider) {
      fetchProviderById(providerId);
    }
  }, [isEdit, providerId, fetchProviderById, provider]);
  
  // Populate form with provider data when it's loaded
  useEffect(() => {
    if ((isEdit && selectedProvider) || provider) {
      const providerToUse = provider || selectedProvider;
      
      // Only access properties that exist in the Provider interface
      // and add our extended form properties separately
      const formState: ProviderFormState = {
        // Base Provider fields
        name: providerToUse?.name || '',
        vendorNumber: providerToUse?.vendorNumber || '',
        type: "PROVIDER" as VendorType,
        status: VendorStatus.ACTIVE,
        providerType: providerToUse?.providerType || ProviderType.CENTER,
        providerStatus: providerToUse?.providerStatus || ProviderStatus.ACTIVE,
        licenseNumber: providerToUse?.licenseNumber || '',
        qualityRating: providerToUse?.qualityRating || ProviderQualityRating.UNRATED,
        enrollmentCapacity: providerToUse?.enrollmentCapacity || 0,
        currentEnrollment: providerToUse?.currentEnrollment || 0,
        contactName: providerToUse?.contactName || '',
        contactEmail: providerToUse?.contactEmail || '',
        contactPhone: providerToUse?.contactPhone || '',
        address: providerToUse?.address || {
          street1: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        } as Address,
        bankAccountInfo: providerToUse?.bankAccountInfo || {
          accountNumber: '',
          routingNumber: '',
          accountType: 'CHECKING',
          accountName: ''
        },
        paymentMethod: providerToUse?.paymentMethod || PaymentMethod.ACH,
        paymentTerms: providerToUse?.paymentTerms || 'Net 30',
        contractStartDate: providerToUse?.contractStartDate || new Date(),
        contractEndDate: providerToUse?.contractEndDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        qualityImprovementGrantEligible: providerToUse?.qualityImprovementGrantEligible || false,
        taxIdentification: providerToUse?.taxIdentification || '',
        taxForm: providerToUse?.taxForm || TaxFormType.W9,
        notes: providerToUse?.notes || '',
        website: providerToUse?.website || '',
        
        // Extended form fields (type-safe accessing with optional chaining and casting)
        taxDocumentVerified: (providerToUse as any)?.taxDocumentVerified || false,
        taxDocumentExpirationDate: (providerToUse as any)?.taxDocumentExpirationDate || null,
        taxDocumentUrl: (providerToUse as any)?.taxDocumentUrl || '',
        directDepositVerified: (providerToUse as any)?.directDepositVerified || false,
        communicationPreference: (providerToUse as any)?.communicationPreference || 'EMAIL',
        receivesNewsletter: (providerToUse as any)?.receivesNewsletter !== undefined ? 
          (providerToUse as any)?.receivesNewsletter : true,
        onboardingStatus: (providerToUse as any)?.onboardingStatus || 'COMPLETED',
        onboardingStep: (providerToUse as any)?.onboardingStep || 0,
        lastContactDate: (providerToUse as any)?.lastContactDate || null,
        contactNotes: (providerToUse as any)?.contactNotes || '',
        portalAccess: (providerToUse as any)?.portalAccess !== undefined ? 
          (providerToUse as any)?.portalAccess : true,
        portalUsername: (providerToUse as any)?.portalUsername || '',
        lastPortalLogin: (providerToUse as any)?.lastPortalLogin || null,
        qualityImprovementHistory: (providerToUse as any)?.qualityImprovementHistory || [],
      };
      
      setFormData(formState);
    }
  }, [isEdit, selectedProvider, provider]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'contractStartDate' || name === 'contractEndDate' || name === 'taxDocumentExpirationDate') {
      setFormData({
        ...formData,
        [name]: value ? new Date(value) : null
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else if (name === 'enrollmentCapacity' || name === 'currentEnrollment') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [name]: value
      }
    });
  };
  
  const handleBankInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      bankAccountInfo: {
        ...formData.bankAccountInfo,
        [name]: value
      }
    });
  };
  
  // Helper function to extract only the properties that exist in the Provider interface
  // and avoid sending extended form properties to the API
  const extractProviderData = (data: ProviderFormState): any => {
    // Set default values for required fields
    // Note: We're using 'any' type to bypass TypeScript errors with the API
    // since we can't change the API function signatures
    const providerData = {
      // Required fields from Vendor
      name: data.name || '',
      vendorNumber: data.vendorNumber || generateProviderNumber(data.name, data.providerType),
      type: data.type || "PROVIDER" as VendorType,
      status: data.status || VendorStatus.ACTIVE,
      // Required fields from Provider
      providerType: data.providerType || ProviderType.CENTER,
      providerStatus: data.providerStatus || ProviderStatus.ACTIVE,
      qualityRating: data.qualityRating || ProviderQualityRating.UNRATED,
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      paymentMethod: data.paymentMethod || PaymentMethod.ACH,
      paymentTerms: data.paymentTerms || 'Net 30',
      qualityImprovementGrantEligible: data.qualityImprovementGrantEligible !== undefined ? 
        data.qualityImprovementGrantEligible : false,
      
      // Optional fields we have values for
      contactName: data.contactName,
      licenseNumber: data.licenseNumber,
      enrollmentCapacity: data.enrollmentCapacity,
      currentEnrollment: data.currentEnrollment,
      address: data.address,
      bankAccountInfo: data.bankAccountInfo,
      contractStartDate: data.contractStartDate,
      contractEndDate: data.contractEndDate,
      taxIdentification: data.taxIdentification,
      taxForm: data.taxForm,
      notes: data.notes,
      website: data.website,
      isProvider: true,
      
      // Mock properties required by the API but that would normally be generated server-side
      // These values will be ignored/overwritten by the API
      createdAt: new Date(),
      updatedAt: new Date(), 
      createdById: 'mock-user-id',
      yearToDatePayments: 0,
      yearToDateCredits: 0
    };
    
    return providerData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {

      // If external onSubmit handler is provided, use it
      if (onSubmit) {
        await onSubmit(formData);
      } else if (isEdit && providerId) {
        // Update existing provider - send only valid Provider properties
        const validProviderData = extractProviderData(formData);
        await updateProvider(providerId, validProviderData);
        router.push(`/finance/tuition-credits/providers/${providerId}`);
      } else if (isOnboarding) {
        // Handle onboarding flow
        const validProviderData = extractProviderData(formData);
        // Ensure the vendor number is set, generating one if needed
        const providerData = {
          ...validProviderData,
          vendorNumber: formData.vendorNumber || generateProviderNumber(formData.name, formData.providerType),
          isProvider: true,
        };
        
        if (currentStep < 4) {
          // Since we don't have a providerId yet, we need to create the provider first
          // Note: createProvider returns void, so we use providerId if available
          await createProvider(providerData);
          // Since we can't get the new ID, use the existing ID if available
          if (providerId) {
            await startProviderOnboarding(providerId);
          }
          setCurrentStep(currentStep + 1);
        } else {
          // For completing onboarding, we need to have a provider ID
          if (providerId) {
            await completeProviderOnboarding(providerId);
            setOnboardingComplete(true);
            router.push(`/finance/tuition-credits/providers/${providerId}`);
          } else {
            // Create provider if we don't have an ID yet
            await createProvider(providerData);
            // Since we can't get a new ID from createProvider, we'll just go to the providers list
            setOnboardingComplete(true);
            router.push('/finance/tuition-credits/providers');
          }
        }
      } else {
        // Create new provider - send only valid Provider properties
        const validProviderData = extractProviderData(formData);
        // Ensure the vendor number is set, generating one if needed
        const providerData = {
          ...validProviderData,
          vendorNumber: formData.vendorNumber || generateProviderNumber(formData.name, formData.providerType),
          isProvider: true
        };
        
        await createProvider(providerData);
        router.push('/finance/tuition-credits/providers');
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save provider. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSaveProgress = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Use the same helper function to extract valid Provider data
      const validProviderData = extractProviderData(formData);
      const providerData = {
        ...validProviderData,
        vendorNumber: formData.vendorNumber || generateProviderNumber(formData.name, formData.providerType),
        isProvider: true,
        // Note: onboardingStatus and onboardingStep will be handled by the API
      };
      
      // If we have a provider ID, use it; otherwise, create a new provider first
      if (providerId) {
        // Update the existing provider first
        await updateProvider(providerId, providerData);
        // Then start/continue the onboarding process
        await startProviderOnboarding(providerId);
      } else {
        // Create a new provider (note: we can't get the ID back from createProvider)
        await createProvider(providerData);
        // Without an ID, we can't start onboarding, so we'll just redirect to the providers list
      }
      
      router.push('/finance/tuition-credits/providers');
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save progress. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isEdit && providersLoading) {
    return <div className="p-4 text-center">Loading provider data...</div>;
  }
  
  if (isEdit && providerError) {
    return <div className="p-4 text-center text-red-500">Error loading provider: {providerError}</div>;
  }
  
  if (isOnboarding && onboardingComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Onboarding Complete!</h2>
          <p className="text-gray-600 mb-6">The provider has been successfully onboarded into the system.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/finance/tuition-credits/providers')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Return to Provider List
            </button>
            <button
              onClick={() => router.push(`/finance/tuition-credits/providers/${selectedProvider?.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Provider Details
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Onboarding progress indicator
  const renderOnboardingProgress = () => {
    if (!isOnboarding) return null;
    
    const steps = [
      { name: 'Basic Info', status: currentStep >= 1 ? 'complete' : 'current' },
      { name: 'Contact Details', status: currentStep >= 2 ? 'complete' : currentStep === 1 ? 'current' : 'upcoming' },
      { name: 'Payment Info', status: currentStep >= 3 ? 'complete' : currentStep === 2 ? 'current' : 'upcoming' },
      { name: 'Tax Documents', status: currentStep >= 4 ? 'complete' : currentStep === 3 ? 'current' : 'upcoming' },
      { name: 'Review', status: currentStep === 4 ? 'current' : 'upcoming' }
    ];
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === 'complete' ? 'bg-green-500 text-white' :
                  step.status === 'current' ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}
              >
                {step.status === 'complete' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="text-sm mt-2 text-center">{step.name}</div>
            </div>
          ))}
        </div>
        <div className="relative flex items-center mt-2">
          <div className="absolute left-0 top-4 w-full h-0.5 bg-gray-200">
            <div 
              className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the appropriate form step for onboarding
  const renderFormStep = () => {
    if (!isOnboarding) {
      return renderFullForm();
    }
    
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderContactDetailsStep();
      case 3:
        return renderPaymentInfoStep();
      case 4:
        return renderTaxDocumentsStep();
      case 5:
        return renderReviewStep();
      default:
        return renderBasicInfoStep();
    }
  };
  
  const renderBasicInfoStep = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Provider Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Provider Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="vendorNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Provider ID
            </label>
            <input
              type="text"
              id="vendorNumber"
              name="vendorNumber"
              value={formData.vendorNumber}
              onChange={handleInputChange}
              placeholder="Generated automatically if left blank"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
              License Number
            </label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="providerType" className="block text-sm font-medium text-gray-700 mb-1">
              Provider Type *
            </label>
            <select
              id="providerType"
              name="providerType"
              value={formData.providerType}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={ProviderType.CENTER}>Center</option>
              <option value={ProviderType.HOME}>Home</option>
              <option value={ProviderType.SCHOOL}>School</option>
              <option value={ProviderType.OTHER}>Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="qualityRating" className="block text-sm font-medium text-gray-700 mb-1">
              Quality Rating
            </label>
            <select
              id="qualityRating"
              name="qualityRating"
              value={formData.qualityRating}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={ProviderQualityRating.LEVEL_1}>Level 1</option>
              <option value={ProviderQualityRating.LEVEL_2}>Level 2</option>
              <option value={ProviderQualityRating.LEVEL_3}>Level 3</option>
              <option value={ProviderQualityRating.LEVEL_4}>Level 4</option>
              <option value={ProviderQualityRating.LEVEL_5}>Level 5</option>
              <option value={ProviderQualityRating.UNRATED}>Unrated</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="enrollmentCapacity" className="block text-sm font-medium text-gray-700 mb-1">
              Enrollment Capacity
            </label>
            <input
              type="number"
              id="enrollmentCapacity"
              name="enrollmentCapacity"
              value={formData.enrollmentCapacity}
              onChange={handleInputChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="currentEnrollment" className="block text-sm font-medium text-gray-700 mb-1">
              Current Enrollment
            </label>
            <input
              type="number"
              id="currentEnrollment"
              name="currentEnrollment"
              value={formData.currentEnrollment}
              onChange={handleInputChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="qualityImprovementGrantEligible"
                name="qualityImprovementGrantEligible"
                checked={formData.qualityImprovementGrantEligible}
                onChange={(e) => setFormData({...formData, qualityImprovementGrantEligible: e.target.checked})}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="qualityImprovementGrantEligible" className="ml-2 block text-sm text-gray-700">
                Eligible for Quality Improvement Grants
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderContactDetailsStep = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="communicationPreference" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Communication Method
              </label>
              <select
                id="communicationPreference"
                name="communicationPreference"
                value={formData.communicationPreference}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="EMAIL">Email</option>
                <option value="PHONE">Phone</option>
                <option value="MAIL">Mail</option>
              </select>
            </div>
            
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="receivesNewsletter"
                name="receivesNewsletter"
                checked={formData.receivesNewsletter}
                onChange={(e) => setFormData({...formData, receivesNewsletter: e.target.checked})}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="receivesNewsletter" className="ml-2 block text-sm text-gray-700">
                Subscribe to newsletter and updates
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="street1" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                id="street1"
                name="street1"
                value={formData.address.street1}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="street2" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address Line 2
              </label>
              <input
                type="text"
                id="street2"
                name="street2"
                value={formData.address.street2 || ''}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.address.state}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.address.zipCode}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.address.country}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderPaymentInfoStep = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value={PaymentMethod.ACH}>ACH</option>
                <option value={PaymentMethod.CHECK}>Check</option>
                <option value={PaymentMethod.WIRE}>Wire Transfer</option>
                <option value={PaymentMethod.OTHER}>Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <select
                id="paymentTerms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="contractStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                Contract Start Date
              </label>
              <input
                type="date"
                id="contractStartDate"
                name="contractStartDate"
                value={formData.contractStartDate ? formData.contractStartDate.toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="contractEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                Contract End Date
              </label>
              <input
                type="date"
                id="contractEndDate"
                name="contractEndDate"
                value={formData.contractEndDate ? formData.contractEndDate.toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Bank Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <input
                type="text"
                id="accountName"
                name="accountName"
                value={formData.bankAccountInfo.accountName}
                onChange={handleBankInfoChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <select
                id="accountType"
                name="accountType"
                value={formData.bankAccountInfo.accountType}
                onChange={handleBankInfoChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.bankAccountInfo.accountNumber}
                onChange={handleBankInfoChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Routing Number
              </label>
              <input
                type="text"
                id="routingNumber"
                name="routingNumber"
                value={formData.bankAccountInfo.routingNumber}
                onChange={handleBankInfoChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="md:col-span-2 mt-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="directDepositVerified"
                  name="directDepositVerified"
                  checked={formData.directDepositVerified}
                  onChange={(e) => setFormData({...formData, directDepositVerified: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="directDepositVerified" className="ml-2 block text-sm text-gray-700">
                  Direct deposit information has been verified
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Check this box only after verifying the banking information provided above.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderTaxDocumentsStep = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Tax Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="taxIdentification" className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID (EIN/SSN) *
            </label>
            <input
              type="text"
              id="taxIdentification"
              name="taxIdentification"
              value={formData.taxIdentification}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="taxForm" className="block text-sm font-medium text-gray-700 mb-1">
              Tax Form *
            </label>
            <select
              id="taxForm"
              name="taxForm"
              value={formData.taxForm}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={TaxFormType.W9}>W-9</option>
              <option value={TaxFormType.W8BEN}>W-8BEN</option>
              <option value={TaxFormType.W8BENE}>W-8BEN-E</option>
              <option value={TaxFormType.FORM_1099}>1099</option>
              <option value={TaxFormType.OTHER}>Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="taxDocumentExpirationDate" className="block text-sm font-medium text-gray-700 mb-1">
              Tax Document Expiration Date
            </label>
            <input
              type="date"
              id="taxDocumentExpirationDate"
              name="taxDocumentExpirationDate"
              value={formData.taxDocumentExpirationDate ? formData.taxDocumentExpirationDate.toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="taxDocumentUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Tax Document URL
            </label>
            <input
              type="text"
              id="taxDocumentUrl"
              name="taxDocumentUrl"
              value={formData.taxDocumentUrl}
              onChange={handleInputChange}
              placeholder="Link to uploaded tax document"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="md:col-span-2 mt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="taxDocumentVerified"
                name="taxDocumentVerified"
                checked={formData.taxDocumentVerified}
                onChange={(e) => setFormData({...formData, taxDocumentVerified: e.target.checked})}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="taxDocumentVerified" className="ml-2 block text-sm text-gray-700">
                Tax documents have been verified
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Check this box only after verifying the tax information provided above.
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">Portal Access</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="portalAccess"
                name="portalAccess"
                checked={formData.portalAccess}
                onChange={(e) => setFormData({...formData, portalAccess: e.target.checked})}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="portalAccess" className="ml-2 block text-sm text-gray-700">
                Enable provider portal access
              </label>
            </div>
            
            {formData.portalAccess && (
              <div>
                <label htmlFor="portalUsername" className="block text-sm font-medium text-gray-700 mb-1">
                  Portal Username
                </label>
                <input
                  type="text"
                  id="portalUsername"
                  name="portalUsername"
                  value={formData.portalUsername}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used for initial portal setup. Provider will receive an email with instructions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderReviewStep = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Review Provider Information</h3>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium mb-2">Basic Information</h4>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Provider Name</dt>
                <dd className="text-sm text-gray-900">{formData.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Provider Type</dt>
                <dd className="text-sm text-gray-900">{formatProviderType(formData.providerType)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">License Number</dt>
                <dd className="text-sm text-gray-900">{formData.licenseNumber || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Quality Rating</dt>
                <dd className="text-sm text-gray-900">{formatQualityRating(formData.qualityRating)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Enrollment</dt>
                <dd className="text-sm text-gray-900">{formData.currentEnrollment} / {formData.enrollmentCapacity || 'Unlimited'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Grant Eligible</dt>
                <dd className="text-sm text-gray-900">{formData.qualityImprovementGrantEligible ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium mb-2">Contact Information</h4>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                <dd className="text-sm text-gray-900">{formData.contactName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{formData.contactEmail}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{formData.contactPhone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="text-sm text-gray-900">{formData.website || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Preferred Communication</dt>
                <dd className="text-sm text-gray-900">{formData.communicationPreference}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Newsletter</dt>
                <dd className="text-sm text-gray-900">{formData.receivesNewsletter ? 'Subscribed' : 'Not subscribed'}</dd>
              </div>
            </dl>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium mb-2">Address</h4>
            <address className="not-italic text-sm text-gray-900">
              {formData.address.street1}<br />
              {formData.address.street2 && <>{formData.address.street2}<br /></>}
              {formData.address.city}, {formData.address.state} {formData.address.zipCode}<br />
              {formData.address.country}
            </address>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium mb-2">Payment Information</h4>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="text-sm text-gray-900">{formatPaymentMethod(formData.paymentMethod)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Terms</dt>
                <dd className="text-sm text-gray-900">{formData.paymentTerms}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contract Period</dt>
                <dd className="text-sm text-gray-900">
                  {formData.contractStartDate && formData.contractEndDate ? (
                    `${formatDate(formData.contractStartDate)} - ${formatDate(formData.contractEndDate)}`
                  ) : 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Direct Deposit Verified</dt>
                <dd className="text-sm text-gray-900">{formData.directDepositVerified ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium mb-2">Tax Information</h4>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
                <dd className="text-sm text-gray-900">{formData.taxIdentification}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tax Form</dt>
                <dd className="text-sm text-gray-900">{formData.taxForm}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tax Document Verified</dt>
                <dd className="text-sm text-gray-900">{formData.taxDocumentVerified ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Portal Access</dt>
                <dd className="text-sm text-gray-900">{formData.portalAccess ? 'Enabled' : 'Disabled'}</dd>
              </div>
              {formData.portalAccess && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Portal Username</dt>
                  <dd className="text-sm text-gray-900">{formData.portalUsername}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    );
  };
  
  const renderFullForm = () => {
    return (
      <>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Provider Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Provider Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="vendorNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Provider ID
              </label>
              <input
                type="text"
                id="vendorNumber"
                name="vendorNumber"
                value={formData.vendorNumber}
                onChange={handleInputChange}
                placeholder="Generated automatically if left blank"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="providerType" className="block text-sm font-medium text-gray-700 mb-1">
                Provider Type *
              </label>
              <select
                id="providerType"
                name="providerType"
                value={formData.providerType}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value={ProviderType.CENTER}>Center</option>
                <option value={ProviderType.HOME}>Home</option>
                <option value={ProviderType.SCHOOL}>School</option>
                <option value={ProviderType.OTHER}>Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="providerStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="providerStatus"
                name="providerStatus"
                value={formData.providerStatus}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value={ProviderStatus.ACTIVE}>Active</option>
                <option value={ProviderStatus.INACTIVE}>Inactive</option>
                <option value={ProviderStatus.PENDING}>Pending</option>
                <option value={ProviderStatus.SUSPENDED}>Suspended</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="qualityRating" className="block text-sm font-medium text-gray-700 mb-1">
                Quality Rating
              </label>
              <select
                id="qualityRating"
                name="qualityRating"
                value={formData.qualityRating}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value={ProviderQualityRating.LEVEL_1}>Level 1</option>
                <option value={ProviderQualityRating.LEVEL_2}>Level 2</option>
                <option value={ProviderQualityRating.LEVEL_3}>Level 3</option>
                <option value={ProviderQualityRating.LEVEL_4}>Level 4</option>
                <option value={ProviderQualityRating.LEVEL_5}>Level 5</option>
                <option value={ProviderQualityRating.UNRATED}>Unrated</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="enrollmentCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Capacity
              </label>
              <input
                type="number"
                id="enrollmentCapacity"
                name="enrollmentCapacity"
                value={formData.enrollmentCapacity}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="currentEnrollment" className="block text-sm font-medium text-gray-700 mb-1">
                Current Enrollment
              </label>
              <input
                type="number"
                id="currentEnrollment"
                name="currentEnrollment"
                value={formData.currentEnrollment}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="qualityImprovementGrantEligible"
                  name="qualityImprovementGrantEligible"
                  checked={formData.qualityImprovementGrantEligible}
                  onChange={(e) => setFormData({...formData, qualityImprovementGrantEligible: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="qualityImprovementGrantEligible" className="ml-2 block text-sm text-gray-700">
                  Eligible for Quality Improvement Grants
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="communicationPreference" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Communication Method
              </label>
              <select
                id="communicationPreference"
                name="communicationPreference"
                value={formData.communicationPreference}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="EMAIL">Email</option>
                <option value="PHONE">Phone</option>
                <option value="MAIL">Mail</option>
              </select>
            </div>
            
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="receivesNewsletter"
                name="receivesNewsletter"
                checked={formData.receivesNewsletter}
                onChange={(e) => setFormData({...formData, receivesNewsletter: e.target.checked})}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="receivesNewsletter" className="ml-2 block text-sm text-gray-700">
                Subscribe to newsletter and updates
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="street1" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                id="street1"
                name="street1"
                value={formData.address.street1}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="street2" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address Line 2
              </label>
              <input
                type="text"
                id="street2"
                name="street2"
                value={formData.address.street2 || ''}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.address.state}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.address.zipCode}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.address.country}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value={PaymentMethod.ACH}>ACH</option>
                <option value={PaymentMethod.CHECK}>Check</option>
                <option value={PaymentMethod.WIRE}>Wire Transfer</option>
                <option value={PaymentMethod.OTHER}>Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <select
                id="paymentTerms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="contractStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                Contract Start Date
              </label>
              <input
                type="date"
                id="contractStartDate"
                name="contractStartDate"
                value={formData.contractStartDate ? formData.contractStartDate.toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="contractEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                Contract End Date
              </label>
              <input
                type="date"
                id="contractEndDate"
                name="contractEndDate"
                value={formData.contractEndDate ? formData.contractEndDate.toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="taxIdentification" className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID (EIN/SSN)
              </label>
              <input
                type="text"
                id="taxIdentification"
                name="taxIdentification"
                value={formData.taxIdentification}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="taxForm" className="block text-sm font-medium text-gray-700 mb-1">
                Tax Form
              </label>
              <select
                id="taxForm"
                name="taxForm"
                value={formData.taxForm}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value={TaxFormType.W9}>W-9</option>
                <option value={TaxFormType.W8BEN}>W-8BEN</option>
                <option value={TaxFormType.W8BENE}>W-8BEN-E</option>
                <option value={TaxFormType.FORM_1099}>1099</option>
                <option value={TaxFormType.OTHER}>Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="taxDocumentExpirationDate" className="block text-sm font-medium text-gray-700 mb-1">
                Tax Document Expiration Date
              </label>
              <input
                type="date"
                id="taxDocumentExpirationDate"
                name="taxDocumentExpirationDate"
                value={formData.taxDocumentExpirationDate ? formData.taxDocumentExpirationDate.toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="md:col-span-2 flex items-center gap-4 mt-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="taxDocumentVerified"
                  name="taxDocumentVerified"
                  checked={formData.taxDocumentVerified}
                  onChange={(e) => setFormData({...formData, taxDocumentVerified: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="taxDocumentVerified" className="ml-2 block text-sm text-gray-700">
                  Tax documents verified
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="directDepositVerified"
                  name="directDepositVerified"
                  checked={formData.directDepositVerified}
                  onChange={(e) => setFormData({...formData, directDepositVerified: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="directDepositVerified" className="ml-2 block text-sm text-gray-700">
                  Direct deposit verified
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="portalAccess"
                  name="portalAccess"
                  checked={formData.portalAccess}
                  onChange={(e) => setFormData({...formData, portalAccess: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="portalAccess" className="ml-2 block text-sm text-gray-700">
                  Portal access enabled
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Bank Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <input
                type="text"
                id="accountName"
                name="accountName"
                value={formData.bankAccountInfo.accountName}
                onChange={handleBankInfoChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <select
                id="accountType"
                name="accountType"
                value={formData.bankAccountInfo.accountType}
                onChange={handleBankInfoChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.bankAccountInfo.accountNumber}
                onChange={handleBankInfoChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Routing Number
              </label>
              <input
                type="text"
                id="routingNumber"
                name="routingNumber"
                value={formData.bankAccountInfo.routingNumber}
                onChange={handleBankInfoChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Additional Information</h3>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mt-3">
            <label htmlFor="contactNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Contact History Notes
            </label>
            <textarea
              id="contactNotes"
              name="contactNotes"
              value={formData.contactNotes}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Document interactions and communications with this provider"
            />
          </div>
        </div>
      </>
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}
      
      {isOnboarding && renderOnboardingProgress()}
      
      {renderFormStep()}
      
      <div className="flex justify-end gap-4">
        {isOnboarding && currentStep > 1 && (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
        )}
        
        {isOnboarding && currentStep < 4 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
          >
            Next
          </button>
        ) : isOnboarding ? (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded shadow-sm hover:bg-green-700 disabled:bg-green-300"
          >
            {isSubmitting ? 'Completing...' : 'Complete Onboarding'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {isOnboarding && (
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 hover:bg-gray-50"
              >
                Save Progress
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Provider' : 'Create Provider'}
            </button>
          </>
        )}
      </div>
    </form>
  );
}

// Helper function to generate a provider number if not provided
function generateProviderNumber(name: string, type: ProviderType): string {
  const prefix = type === ProviderType.CENTER ? 'CTR' : 
    type === ProviderType.HOME ? 'HOM' : 
    type === ProviderType.SCHOOL ? 'SCH' : 'PRV';
  
  const nameInitials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);
  
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefix}-${nameInitials}-${randomDigits}`;
}

// Helper functions for formatting
function formatProviderType(type: ProviderType): string {
  switch (type) {
    case ProviderType.CENTER:
      return 'Child Care Center';
    case ProviderType.HOME:
      return 'Family Child Care Home';
    case ProviderType.SCHOOL:
      return 'School-Based Program';
    case ProviderType.OTHER:
      return 'Other Provider Type';
    default:
      return type;
  }
}

function formatQualityRating(rating: ProviderQualityRating): string {
  switch (rating) {
    case ProviderQualityRating.LEVEL_1:
      return 'Level 1';
    case ProviderQualityRating.LEVEL_2:
      return 'Level 2';
    case ProviderQualityRating.LEVEL_3:
      return 'Level 3';
    case ProviderQualityRating.LEVEL_4:
      return 'Level 4';
    case ProviderQualityRating.LEVEL_5:
      return 'Level 5';
    case ProviderQualityRating.UNRATED:
      return 'Unrated';
    default:
      return rating;
  }
}

function formatPaymentMethod(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.ACH:
      return 'ACH Transfer';
    case PaymentMethod.CHECK:
      return 'Check';
    case PaymentMethod.WIRE:
      return 'Wire Transfer';
    case PaymentMethod.CREDIT_CARD:
      return 'Credit Card';
    case PaymentMethod.CASH:
      return 'Cash';
    case PaymentMethod.OTHER:
      return 'Other';
    default:
      return method;
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}