// src/components/finance/accounts-payable/VendorForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { Vendor, VendorType, VendorStatus, TaxFormType, Address } from '@/types/finance';

interface VendorFormProps {
  vendorId?: string;
  isEdit?: boolean;
}

export default function VendorForm({ vendorId, isEdit = false }: VendorFormProps) {
  const router = useRouter();
  const { 
    selectedVendor, 
    vendorsLoading, 
    vendorError, 
    fetchVendorById, 
    createVendor, 
    updateVendor 
  } = useFinanceStore();
  
  // Create a default address that matches the Address interface
  const defaultAddress: Address = {
    street1: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
    // street2 is optional, so we don't need to include it
  };

  const [formData, setFormData] = useState({
    name: '',
    vendorNumber: '',
    type: VendorType.SUPPLIER,
    status: VendorStatus.ACTIVE,
    contactName: '',
    email: '',
    phone: '',
    address: defaultAddress,
    paymentTerms: 'Net 30',
    defaultAccountId: '',
    taxIdentification: '',
    taxForm: TaxFormType.W9,
    notes: '',
    isProvider: false,
    website: '',
    invoicingInstructions: ''
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load vendor data if editing
  useEffect(() => {
    if (isEdit && vendorId) {
      fetchVendorById(vendorId);
    }
  }, [isEdit, vendorId, fetchVendorById]);
  
  // Populate form with vendor data when it's loaded
  useEffect(() => {
    if (isEdit && selectedVendor) {
      setFormData({
        name: selectedVendor.name || '',
        vendorNumber: selectedVendor.vendorNumber || '',
        type: selectedVendor.type || VendorType.SUPPLIER,
        status: selectedVendor.status || VendorStatus.ACTIVE,
        contactName: selectedVendor.contactName || '',
        email: selectedVendor.email || '',
        phone: selectedVendor.phone || '',
        address: selectedVendor.address || defaultAddress,
        paymentTerms: selectedVendor.paymentTerms || 'Net 30',
        defaultAccountId: selectedVendor.defaultAccountId || '',
        taxIdentification: selectedVendor.taxIdentification || '',
        taxForm: selectedVendor.taxForm || TaxFormType.W9,
        notes: selectedVendor.notes || '',
        isProvider: selectedVendor.isProvider || false,
        website: selectedVendor.website || '',
        invoicingInstructions: selectedVendor.invoicingInstructions || ''
      });
    }
  }, [isEdit, selectedVendor]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      if (isEdit && vendorId) {
        // Update existing vendor
        await updateVendor(vendorId, formData);
        router.push(`/finance/accounts-payable/vendors/${vendorId}`);
      } else {
        // Create new vendor
        const { yearToDatePayments, lastPaymentDate, ...newVendorData } = formData as any;
        const vendorData = {
          ...newVendorData,
          vendorNumber: formData.vendorNumber || generateVendorNumber(formData.name, formData.type),
        };
        
        await createVendor(vendorData);
        router.push('/finance/accounts-payable/vendors');
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save vendor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isEdit && vendorsLoading) {
    return <div className="p-4 text-center">Loading vendor data...</div>;
  }
  
  if (isEdit && vendorError) {
    return <div className="p-4 text-center text-red-500">Error loading vendor: {vendorError}</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Vendor Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name *
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
              Vendor ID
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
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={VendorType.PROVIDER}>Provider</option>
              <option value={VendorType.SUPPLIER}>Supplier</option>
              <option value={VendorType.CONTRACTOR}>Contractor</option>
              <option value={VendorType.GOVERNMENT}>Government</option>
              <option value={VendorType.NONPROFIT}>Non-Profit</option>
              <option value={VendorType.OTHER}>Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={VendorStatus.ACTIVE}>Active</option>
              <option value={VendorStatus.INACTIVE}>Inactive</option>
              <option value={VendorStatus.PENDING}>Pending</option>
              <option value={VendorStatus.BLOCKED}>Blocked</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isProvider"
                name="isProvider"
                checked={formData.isProvider}
                onChange={(e) => setFormData({...formData, isProvider: e.target.checked})}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isProvider" className="ml-2 block text-sm text-gray-700">
                This is a preschool provider
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
              Contact Name
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
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
            <label htmlFor="defaultAccountId" className="block text-sm font-medium text-gray-700 mb-1">
              Default Expense Account
            </label>
            <input
              type="text"
              id="defaultAccountId"
              name="defaultAccountId"
              value={formData.defaultAccountId}
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
          
          <div className="md:col-span-2">
            <label htmlFor="invoicingInstructions" className="block text-sm font-medium text-gray-700 mb-1">
              Special Invoicing Instructions
            </label>
            <textarea
              id="invoicingInstructions"
              name="invoicingInstructions"
              value={formData.invoicingInstructions}
              onChange={handleInputChange}
              rows={3}
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
      </div>
      
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Vendor' : 'Create Vendor'}
        </button>
      </div>
    </form>
  );
}

// Helper function to generate a vendor number if not provided
function generateVendorNumber(name: string, type: VendorType): string {
  const prefix = type === VendorType.PROVIDER ? 'PRV' : 
    type === VendorType.SUPPLIER ? 'SUP' : 
    type === VendorType.CONTRACTOR ? 'CON' : 
    type === VendorType.GOVERNMENT ? 'GOV' : 
    type === VendorType.NONPROFIT ? 'NPO' : 'VEN';
  
  const nameInitials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);
  
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefix}-${nameInitials}-${randomDigits}`;
}