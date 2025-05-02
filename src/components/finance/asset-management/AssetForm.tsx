// src/components/finance/asset-management/AssetForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Asset, 
  AssetType, 
  AssetStatus, 
  DepreciationMethod,
  AssetCategory
} from '@/types/finance';
import { useFinanceStore } from '@/store/finance-store';

interface AssetFormProps {
  assetId?: string;
  initialData?: Partial<Asset>;
}

const AssetForm: React.FC<AssetFormProps> = ({ assetId, initialData }) => {
  const router = useRouter();
  const { 
    createAsset, 
    updateAsset, 
    selectedAsset, 
    fetchAssetById,
    assetCategories,
    fetchAssetCategories,
    vendors,
    fetchVendors,
    accounts,
    fetchAccountsByType
  } = useFinanceStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: '',
    description: '',
    assetNumber: '',
    serialNumber: '',
    type: AssetType.EQUIPMENT,
    status: AssetStatus.PENDING,
    location: '',
    department: '',
    assignedTo: '',
    purchaseDate: new Date(),
    inServiceDate: new Date(),
    purchasePrice: 0,
    residualValue: 0,
    usefulLifeYears: 5,
    usefulLifeMonths: 60,
    depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
    accountId: '',
    accumulatedDepreciationAccountId: '',
    depreciationExpenseAccountId: '',
    warrantyExpirationDate: undefined,
    maintenanceSchedule: '',
    notes: '',
    tags: [],
    barcode: '',
    vendorId: '',
    invoiceNumber: '',
    fundId: '',
    ...initialData
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load asset categories
        await fetchAssetCategories();
        
        // Load vendors
        await fetchVendors();
        
        // Load accounts
        await fetchAccountsByType('ASSET');
        
        // If editing, fetch the asset
        if (assetId) {
          await fetchAssetById(assetId);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [assetId, fetchAssetById, fetchAssetCategories, fetchVendors, fetchAccountsByType]);
  
  useEffect(() => {
    if (assetId && selectedAsset) {
      setFormData({
        ...selectedAsset,
        purchaseDate: new Date(selectedAsset.purchaseDate),
        inServiceDate: new Date(selectedAsset.inServiceDate),
        warrantyExpirationDate: selectedAsset.warrantyExpirationDate 
          ? new Date(selectedAsset.warrantyExpirationDate) 
          : undefined
      });
    }
  }, [assetId, selectedAsset]);
  
  useEffect(() => {
    // Apply asset category defaults when a category is selected
    if (selectedCategory && assetCategories) {
      const category = assetCategories.find(cat => cat.id === selectedCategory);
      if (category) {
        setFormData(prev => ({
          ...prev,
          type: category.defaultType,
          depreciationMethod: category.defaultDepreciationMethod,
          usefulLifeYears: category.defaultUsefulLifeYears,
          usefulLifeMonths: category.defaultUsefulLifeYears * 12,
          accountId: category.defaultAssetAccountId,
          depreciationExpenseAccountId: category.defaultDepreciationAccountId
        }));
      }
    }
  }, [selectedCategory, assetCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'usefulLifeYears') {
      // Update usefulLifeMonths when usefulLifeYears changes
      const years = parseInt(value) || 0;
      setFormData({
        ...formData,
        usefulLifeYears: years,
        usefulLifeMonths: years * 12
      });
    } else if (name === 'usefulLifeMonths') {
      // Update usefulLifeYears when usefulLifeMonths changes
      const months = parseInt(value) || 0;
      setFormData({
        ...formData,
        usefulLifeMonths: months,
        usefulLifeYears: Math.floor(months / 12)
      });
    } else if (name === 'purchasePrice' || name === 'residualValue') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value ? new Date(value) : undefined
    });
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };
  
  const handleTagAdd = () => {
    if (tagInput.trim() && formData.tags) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  const handleTagRemove = (tagToRemove: string) => {
    if (formData.tags) {
      setFormData({
        ...formData,
        tags: formData.tags.filter(tag => tag !== tagToRemove)
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (assetId) {
        // Update existing asset
        await updateAsset(assetId, formData);
        router.push(`/finance/asset-management/assets/${assetId}`);
      } else {
        // Create new asset
        const newAsset = await createAsset(formData as any);
        router.push(`/finance/asset-management/assets/${newAsset?.id}`);
      }
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Failed to save asset. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {assetId ? 'Edit Asset' : 'Add New Asset'}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {assetId ? 'Update asset information' : 'Enter asset information'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="assetCategory" className="block text-sm font-medium text-gray-700">
                Asset Category (Optional)
              </label>
              <select
                id="assetCategory"
                name="assetCategory"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select a category (optional)</option>
                {assetCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                This will pre-fill some fields with category defaults
              </p>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="assetNumber" className="block text-sm font-medium text-gray-700">
                Asset Number *
              </label>
              <input
                type="text"
                name="assetNumber"
                id="assetNumber"
                required
                value={formData.assetNumber}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Asset Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
                Serial Number
              </label>
              <input
                type="text"
                name="serialNumber"
                id="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                Barcode
              </label>
              <input
                type="text"
                name="barcode"
                id="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Asset Type *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {Object.values(AssetType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {Object.values(AssetStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <input
                type="text"
                name="department"
                id="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                Assigned To
              </label>
              <input
                type="text"
                name="assignedTo"
                id="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700">
                Vendor
              </label>
              <select
                id="vendorId"
                name="vendorId"
                value={formData.vendorId}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select a vendor (optional)</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNumber"
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
                Purchase Date *
              </label>
              <input
                type="date"
                name="purchaseDate"
                id="purchaseDate"
                required
                value={formData.purchaseDate ? new Date(formData.purchaseDate).toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="inServiceDate" className="block text-sm font-medium text-gray-700">
                In Service Date *
              </label>
              <input
                type="date"
                name="inServiceDate"
                id="inServiceDate"
                required
                value={formData.inServiceDate ? new Date(formData.inServiceDate).toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="warrantyExpirationDate" className="block text-sm font-medium text-gray-700">
                Warranty Expiration Date
              </label>
              <input
                type="date"
                name="warrantyExpirationDate"
                id="warrantyExpirationDate"
                value={formData.warrantyExpirationDate ? new Date(formData.warrantyExpirationDate).toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
                Purchase Price *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="purchasePrice"
                  id="purchasePrice"
                  required
                  min="0"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="residualValue" className="block text-sm font-medium text-gray-700">
                Residual Value *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="residualValue"
                  id="residualValue"
                  required
                  min="0"
                  step="0.01"
                  value={formData.residualValue}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="usefulLifeYears" className="block text-sm font-medium text-gray-700">
                Useful Life (Years) *
              </label>
              <input
                type="number"
                name="usefulLifeYears"
                id="usefulLifeYears"
                required
                min="0"
                value={formData.usefulLifeYears}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="usefulLifeMonths" className="block text-sm font-medium text-gray-700">
                Useful Life (Months) *
              </label>
              <input
                type="number"
                name="usefulLifeMonths"
                id="usefulLifeMonths"
                required
                min="0"
                value={formData.usefulLifeMonths}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="depreciationMethod" className="block text-sm font-medium text-gray-700">
                Depreciation Method *
              </label>
              <select
                id="depreciationMethod"
                name="depreciationMethod"
                required
                value={formData.depreciationMethod}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {Object.values(DepreciationMethod).map((method) => (
                  <option key={method} value={method}>
                    {method.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                Asset Account *
              </label>
              <select
                id="accountId"
                name="accountId"
                required
                value={formData.accountId}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select an asset account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountNumber} - {account.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="accumulatedDepreciationAccountId" className="block text-sm font-medium text-gray-700">
                Accumulated Depreciation Account *
              </label>
              <select
                id="accumulatedDepreciationAccountId"
                name="accumulatedDepreciationAccountId"
                required
                value={formData.accumulatedDepreciationAccountId}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select an accumulated depreciation account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountNumber} - {account.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="depreciationExpenseAccountId" className="block text-sm font-medium text-gray-700">
                Depreciation Expense Account *
              </label>
              <select
                id="depreciationExpenseAccountId"
                name="depreciationExpenseAccountId"
                required
                value={formData.depreciationExpenseAccountId}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select a depreciation expense account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountNumber} - {account.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="maintenanceSchedule" className="block text-sm font-medium text-gray-700">
                Maintenance Schedule
              </label>
              <input
                type="text"
                name="maintenanceSchedule"
                id="maintenanceSchedule"
                value={formData.maintenanceSchedule}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g., Quarterly servicing, Annual certification"
              />
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleTagAdd}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
              
              {formData.tags && formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {saving ? 'Saving...' : (assetId ? 'Update Asset' : 'Create Asset')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;