// src/components/finance/accounts-receivable/CustomerForm.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinanceStore } from '@/store/finance-store';
import { Customer, CustomerType, CustomerStatus, Address } from '@/types/finance';

interface CustomerFormProps {
  customerId?: string;
  onSuccess?: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customerId, onSuccess }) => {
  const router = useRouter();
  const { 
    fetchCustomerById, 
    selectedCustomer, 
    createCustomer, 
    updateCustomer, 
    customersLoading, 
    customerError, 
    clearErrors 
  } = useFinanceStore();

  const [form, setForm] = useState<{
    name: string;
    customerNumber: string;
    type: CustomerType;
    status: CustomerStatus;
    contactName: string;
    email: string;
    phone: string;
    address: Address;
    website: string;
    billingInstructions: string;
    notes: string;
    paymentTerms: string;
    defaultAccountId: string;
    taxIdentification: string;
    creditLimit: number | undefined;
  }>({
    name: '',
    customerNumber: '',
    type: CustomerType.BUSINESS,
    status: CustomerStatus.ACTIVE,
    contactName: '',
    email: '',
    phone: '',
    address: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    website: '',
    billingInstructions: '',
    notes: '',
    paymentTerms: 'Net 30',
    defaultAccountId: '',
    taxIdentification: '',
    creditLimit: undefined
  });

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    customerNumber?: string;
    email?: string;
    phone?: string;
    creditLimit?: string;
  }>({});

  useEffect(() => {
    clearErrors();
    if (customerId) {
      fetchCustomerById(customerId);
    }
  }, [customerId, fetchCustomerById, clearErrors]);

  useEffect(() => {
    if (selectedCustomer && customerId) {
      setForm({
        name: selectedCustomer.name,
        customerNumber: selectedCustomer.customerNumber,
        type: selectedCustomer.type,
        status: selectedCustomer.status,
        contactName: selectedCustomer.contactName || '',
        email: selectedCustomer.email || '',
        phone: selectedCustomer.phone || '',
        address: selectedCustomer.address || {
          street1: '',
          street2: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        website: selectedCustomer.website || '',
        billingInstructions: selectedCustomer.billingInstructions || '',
        notes: selectedCustomer.notes || '',
        paymentTerms: selectedCustomer.paymentTerms || 'Net 30',
        defaultAccountId: selectedCustomer.defaultAccountId || '',
        taxIdentification: selectedCustomer.taxIdentification || '',
        creditLimit: selectedCustomer.creditLimit
      });
    }
  }, [selectedCustomer, customerId]);

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!form.name.trim()) {
      errors.name = 'Customer name is required';
    }

    if (!form.customerNumber.trim()) {
      errors.customerNumber = 'Customer number is required';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Invalid email format';
    }

    if (form.phone && !/^[0-9()\-+\s]*$/.test(form.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (form.creditLimit !== undefined && form.creditLimit < 0) {
      errors.creditLimit = 'Credit limit cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateCustomerNumber = () => {
    if (form.customerNumber) return;
    
    // Create a customer number based on name and random digits
    const namePrefix = form.name.substring(0, 3).toUpperCase();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setForm(prev => ({
      ...prev,
      customerNumber: `C-${namePrefix}${randomDigits}`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (customerId) {
      // Update existing customer
      await updateCustomer(customerId, {
        name: form.name,
        customerNumber: form.customerNumber,
        type: form.type,
        status: form.status,
        contactName: form.contactName || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address.street1 ? form.address : undefined,
        website: form.website || undefined,
        billingInstructions: form.billingInstructions || undefined,
        notes: form.notes || undefined,
        paymentTerms: form.paymentTerms || undefined,
        defaultAccountId: form.defaultAccountId || undefined,
        taxIdentification: form.taxIdentification || undefined,
        creditLimit: form.creditLimit
      });
    } else {
      // Create new customer
      await createCustomer({
        name: form.name,
        customerNumber: form.customerNumber,
        type: form.type,
        status: form.status,
        contactName: form.contactName || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address.street1 ? form.address : undefined,
        website: form.website || undefined,
        billingInstructions: form.billingInstructions || undefined,
        notes: form.notes || undefined,
        paymentTerms: form.paymentTerms || undefined,
        defaultAccountId: form.defaultAccountId || undefined,
        taxIdentification: form.taxIdentification || undefined,
        creditLimit: form.creditLimit,
        createdById: 'current-user' // This would be replaced with the actual user ID
      });
    }

    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/finance/accounts-receivable/customers');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name === 'creditLimit') {
      setForm(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-6">
        {customerId ? 'Edit Customer' : 'Create New Customer'}
      </h2>

      {customerError && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          Error: {customerError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={generateCustomerNumber}
                className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                placeholder="Enter customer name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customerNumber"
                value={form.customerNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${formErrors.customerNumber ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                placeholder="e.g., C-12345"
              />
              {formErrors.customerNumber && (
                <p className="mt-1 text-sm text-red-500">{formErrors.customerNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {Object.values(CustomerType).map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {Object.values(CustomerStatus).map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
              <input
                type="text"
                name="taxIdentification"
                value={form.taxIdentification}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 12-3456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
              <input
                type="number"
                name="creditLimit"
                value={form.creditLimit === undefined ? '' : form.creditLimit}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border ${formErrors.creditLimit ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                placeholder="Enter credit limit"
              />
              {formErrors.creditLimit && (
                <p className="mt-1 text-sm text-red-500">{formErrors.creditLimit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <select
                name="paymentTerms"
                value={form.paymentTerms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <input
                type="text"
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter contact name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                placeholder="Enter email address"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                placeholder="Enter phone number"
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., https://www.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Account</label>
              <input
                type="text"
                name="defaultAccountId"
                value={form.defaultAccountId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter default account ID"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-medium mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                name="address.street1"
                value={form.address.street1}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address Line 2</label>
              <input
                type="text"
                name="address.street2"
                value={form.address.street2 || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Apt, suite, unit, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="address.city"
                value={form.address.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="City"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={form.address.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="State"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={form.address.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="ZIP code"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="address.country"
                value={form.address.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Country"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Additional Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Instructions</label>
            <textarea
              name="billingInstructions"
              value={form.billingInstructions}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Special billing instructions or requirements"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Additional notes about this customer"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/finance/accounts-receivable/customers')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={customersLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {customersLoading ? 'Processing...' : customerId ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;