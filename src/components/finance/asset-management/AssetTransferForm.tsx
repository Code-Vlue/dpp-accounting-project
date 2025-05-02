"use client";

// src/components/finance/asset-management/AssetTransferForm.tsx
import React, { useState } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { AssetTransfer, Department, User } from '@/types/finance';

interface AssetTransferFormProps {
  assetId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AssetTransferForm({
  assetId,
  onSuccess,
  onCancel
}: AssetTransferFormProps) {
  const { getAssetById, transferAsset } = useFinanceStore();
  const asset = getAssetById(assetId);
  
  const [formData, setFormData] = useState<Partial<AssetTransfer>>({
    assetId,
    transferDate: new Date().toISOString().split('T')[0],
    fromDepartmentId: asset?.departmentId || '',
    toDepartmentId: '',
    fromLocationId: asset?.locationId || '',
    toLocationId: '',
    fromCustodianId: asset?.custodianId || '',
    toCustodianId: '',
    reason: '',
    notes: ''
  });
  
  // Mock data for demonstration
  const departments: Department[] = [
    { id: 'dept1', name: 'Finance' },
    { id: 'dept2', name: 'Operations' },
    { id: 'dept3', name: 'Administration' },
    { id: 'dept4', name: 'IT' }
  ];
  
  const locations = [
    { id: 'loc1', name: 'Main Office' },
    { id: 'loc2', name: 'Satellite Office' },
    { id: 'loc3', name: 'Remote Location' }
  ];
  
  const users: User[] = [
    { id: 'user1', name: 'John Doe', email: 'john@example.com' },
    { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: 'user3', name: 'Bob Johnson', email: 'bob@example.com' }
  ];
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.transferDate) {
      newErrors.transferDate = 'Transfer date is required';
    }
    
    if (!formData.toDepartmentId) {
      newErrors.toDepartmentId = 'Destination department is required';
    }
    
    if (!formData.toLocationId) {
      newErrors.toLocationId = 'Destination location is required';
    }
    
    if (!formData.toCustodianId) {
      newErrors.toCustodianId = 'New custodian is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      await transferAsset(formData as AssetTransfer);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error transferring asset:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to transfer asset. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!asset) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        Asset not found.
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">
          Transfer Asset: {asset.name}
        </h2>
        
        <div className="p-4 mb-6 bg-blue-50 text-blue-800 rounded-md">
          <h3 className="font-medium">Asset Information</h3>
          <p>Tag: {asset.assetTag}</p>
          <p>Serial Number: {asset.serialNumber}</p>
          <p>Current Location: {asset.location?.name || 'Unknown'}</p>
          <p>Current Department: {asset.department?.name || 'Unknown'}</p>
          <p>Current Custodian: {asset.custodian?.name || 'Unknown'}</p>
        </div>
        
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded">
            {errors.submit}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="transferDate" className="block text-sm font-medium text-gray-700">
              Transfer Date *
            </label>
            <input
              type="date"
              id="transferDate"
              name="transferDate"
              value={formData.transferDate || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.transferDate ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2`}
            />
            {errors.transferDate && (
              <p className="mt-1 text-sm text-red-600">{errors.transferDate}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="toDepartmentId" className="block text-sm font-medium text-gray-700">
              New Department *
            </label>
            <select
              id="toDepartmentId"
              name="toDepartmentId"
              value={formData.toDepartmentId || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.toDepartmentId ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2`}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {errors.toDepartmentId && (
              <p className="mt-1 text-sm text-red-600">{errors.toDepartmentId}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="toLocationId" className="block text-sm font-medium text-gray-700">
              New Location *
            </label>
            <select
              id="toLocationId"
              name="toLocationId"
              value={formData.toLocationId || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.toLocationId ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2`}
            >
              <option value="">Select Location</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            {errors.toLocationId && (
              <p className="mt-1 text-sm text-red-600">{errors.toLocationId}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="toCustodianId" className="block text-sm font-medium text-gray-700">
              New Custodian *
            </label>
            <select
              id="toCustodianId"
              name="toCustodianId"
              value={formData.toCustodianId || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.toCustodianId ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2`}
            >
              <option value="">Select Custodian</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {errors.toCustodianId && (
              <p className="mt-1 text-sm text-red-600">{errors.toCustodianId}</p>
            )}
          </div>
          
          <div className="space-y-2 col-span-2">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason for Transfer
            </label>
            <input
              type="text"
              id="reason"
              name="reason"
              value={formData.reason || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2"
              placeholder="Employee reassignment, department restructuring, etc."
            />
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
              placeholder="Additional details about this transfer"
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
            {isSubmitting ? 'Processing...' : 'Transfer Asset'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default AssetTransferForm;