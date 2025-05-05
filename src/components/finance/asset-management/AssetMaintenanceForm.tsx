"use client";

// src/components/finance/asset-management/AssetMaintenanceForm.tsx
import React, { useState } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { AssetMaintenance } from '@/types/finance';

interface AssetMaintenanceFormProps {
  assetId: string;
  maintenanceId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AssetMaintenanceForm({
  assetId,
  maintenanceId,
  onSuccess,
  onCancel
}: AssetMaintenanceFormProps) {
  const { getAssetById, addAssetMaintenance, updateAssetMaintenance, getAssetMaintenanceById } = useFinanceStore();
  
  // Initialize with default values
  const [formData, setFormData] = useState<Partial<AssetMaintenance>>({
    assetId,
    date: new Date(), // Use Date object instead of string
    description: '',
    cost: 0,
    maintenanceType: '', // Add required field
    provider: '', // Add required field
    notes: ''
  });
  
  // Load maintenance data if editing
  React.useEffect(() => {
    const loadMaintenance = async () => {
      if (maintenanceId) {
        try {
          const maintenance = await getAssetMaintenanceById(maintenanceId);
          if (maintenance) {
            // Keep date as Date object to match interface
            setFormData({
              ...maintenance
            });
          }
        } catch (error) {
          console.error('Error loading maintenance record:', error);
        }
      }
    };
    
    loadMaintenance();
  }, [maintenanceId, getAssetMaintenanceById]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.cost === undefined || formData.cost < 0) {
      newErrors.cost = 'Cost must be a positive number';
    }
    
    if (!formData.maintenanceType) {
      newErrors.maintenanceType = 'Maintenance type is required';
    }
    
    if (!formData.provider) {
      newErrors.provider = 'Provider is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? new Date(value) : undefined
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (maintenanceId) {
        await updateAssetMaintenance(maintenanceId, formData as AssetMaintenance);
      } else {
        await addAssetMaintenance(formData as AssetMaintenance);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save maintenance record. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">
          {maintenanceId ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
        </h2>
        
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded">
            {errors.submit}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
              onChange={handleDateChange}
              className={`mt-1 block w-full rounded-md border ${errors.date ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
              Cost *
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                id="cost"
                name="cost"
                value={formData.cost || ''}
                onChange={handleChange}
                className={`block w-full rounded-md border ${errors.cost ? 'border-red-500' : 'border-gray-300'} pl-7 pr-12 py-2`}
              />
            </div>
            {errors.cost && (
              <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
            )}
          </div>
          
          <div className="space-y-2 col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="maintenanceType" className="block text-sm font-medium text-gray-700">
              Maintenance Type *
            </label>
            <input
              type="text"
              id="maintenanceType"
              name="maintenanceType"
              required
              value={formData.maintenanceType || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.maintenanceType ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2`}
            />
            {errors.maintenanceType && (
              <p className="mt-1 text-sm text-red-600">{errors.maintenanceType}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
              Provider/Vendor *
            </label>
            <input
              type="text"
              id="provider"
              name="provider"
              required
              value={formData.provider || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.provider ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2`}
            />
            {errors.provider && (
              <p className="mt-1 text-sm text-red-600">{errors.provider}</p>
            )}
          </div>
          
          <div className="space-y-2 col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2"
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : maintenanceId ? 'Update Record' : 'Add Record'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default AssetMaintenanceForm;