"use client";

// src/components/finance/asset-management/AssetCategoryForm.tsx
import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { AssetCategory, DepreciationMethod, AssetType } from '@/types/finance';

interface AssetCategoryFormProps {
  categoryId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AssetCategoryForm({
  categoryId,
  onSuccess,
  onCancel
}: AssetCategoryFormProps) {
  const { getAssetCategoryById, createAssetCategory, updateAssetCategory } = useFinanceStore();

  // Extend the form data with properties not in the AssetCategory interface
  interface AssetCategoryFormData extends Partial<AssetCategory> {
    defaultSalvageValuePercent?: number;
    isActive?: boolean;
  }

  const [formData, setFormData] = useState<AssetCategoryFormData>({
    name: '',
    description: '',
    defaultUsefulLifeYears: 5,
    defaultDepreciationMethod: DepreciationMethod.STRAIGHT_LINE,
    defaultSalvageValuePercent: 10,
    isActive: true,
    // Required properties from AssetCategory interface that need default values
    defaultType: 'EQUIPMENT' as AssetType, // Using string assertion as a workaround
    defaultDepreciationAccountId: '',
    defaultAssetAccountId: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!categoryId);

  useEffect(() => {
    async function fetchCategory() {
      if (categoryId) {
        try {
          // Fetch the category if editing an existing one
          const category = await getAssetCategoryById(categoryId);
          if (category) {
            setFormData({
              ...category,
              // Set form-specific fields that aren't part of the AssetCategory interface
              defaultSalvageValuePercent: 10, // Default value
              isActive: true,
            });
          }
        } catch (error) {
          console.error('Error fetching asset category:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    fetchCategory();
  }, [categoryId, getAssetCategoryById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name) {
      errors.name = 'Name is required';
    }
    
    if (!formData.defaultUsefulLifeYears || formData.defaultUsefulLifeYears <= 0) {
      errors.defaultUsefulLifeYears = 'Useful life must be greater than 0';
    }
    
    if (!formData.defaultDepreciationMethod) {
      errors.defaultDepreciationMethod = 'Depreciation method is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (categoryId) {
        // Update existing category
        await updateAssetCategory(categoryId, formData as AssetCategory);
      } else {
        // Create new category
        await createAssetCategory(formData as AssetCategory);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving asset category:', error);
      setFormErrors(prev => ({
        ...prev,
        submit: 'Failed to save asset category. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">
          {categoryId ? 'Edit Asset Category' : 'Create Asset Category'}
        </h2>
        
        {formErrors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded">
            {formErrors.submit}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              } shadow-sm px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="defaultDepreciationMethod" className="block text-sm font-medium text-gray-700">
              Depreciation Method *
            </label>
            <select
              id="defaultDepreciationMethod"
              name="defaultDepreciationMethod"
              value={formData.defaultDepreciationMethod || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                formErrors.defaultDepreciationMethod ? 'border-red-500' : 'border-gray-300'
              } shadow-sm px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              <option value={DepreciationMethod.STRAIGHT_LINE}>Straight Line</option>
              <option value={DepreciationMethod.DOUBLE_DECLINING_BALANCE}>Double Declining Balance</option>
              <option value={DepreciationMethod.SUM_OF_YEARS_DIGITS}>Sum of Years Digits</option>
              <option value={DepreciationMethod.UNITS_OF_PRODUCTION}>Units of Production</option>
            </select>
            {formErrors.defaultDepreciationMethod && (
              <p className="mt-1 text-sm text-red-600">{formErrors.defaultDepreciationMethod}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="defaultUsefulLifeYears" className="block text-sm font-medium text-gray-700">
              Default Useful Life (Years) *
            </label>
            <input
              type="number"
              id="defaultUsefulLifeYears"
              name="defaultUsefulLifeYears"
              min="1"
              step="1"
              value={formData.defaultUsefulLifeYears || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                formErrors.defaultUsefulLifeYears ? 'border-red-500' : 'border-gray-300'
              } shadow-sm px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {formErrors.defaultUsefulLifeYears && (
              <p className="mt-1 text-sm text-red-600">{formErrors.defaultUsefulLifeYears}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="defaultSalvageValuePercent" className="block text-sm font-medium text-gray-700">
              Default Salvage Value (%)
            </label>
            <input
              type="number"
              id="defaultSalvageValuePercent"
              name="defaultSalvageValuePercent"
              min="0"
              max="100"
              step="0.01"
              value={formData.defaultSalvageValuePercent || 0}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active Category
            </label>
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
            {isSubmitting ? (
              'Saving...'
            ) : categoryId ? (
              'Update Category'
            ) : (
              'Create Category'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default AssetCategoryForm;