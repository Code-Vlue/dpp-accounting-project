// src/components/finance/asset-management/AssetDisposalForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AssetDisposalMethod } from '@/types/finance';
import { useFinanceStore } from '@/store/finance-store';

interface AssetDisposalFormProps {
  assetId: string;
}

const AssetDisposalForm: React.FC<AssetDisposalFormProps> = ({ assetId }) => {
  const router = useRouter();
  const { 
    selectedAsset, 
    fetchAssetById,
    disposeAsset,
    customers,
    fetchCustomers
  } = useFinanceStore();
  
  const [loading, setLoading] = useState(true);
  const [disposing, setDisposing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const [formData, setFormData] = useState({
    assetId,
    disposalDate: new Date(),
    disposalMethod: AssetDisposalMethod.SOLD,
    salePrice: 0,
    buyerId: '',
    disposalCosts: 0,
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchAssetById(assetId);
        await fetchCustomers();
      } catch (error) {
        console.error('Error loading asset data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [assetId, fetchAssetById, fetchCustomers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'salePrice' || name === 'disposalCosts') {
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
    
    // Reset buyer ID if not selling the asset
    if (name === 'disposalMethod' && value !== AssetDisposalMethod.SOLD) {
      setFormData(prev => ({
        ...prev,
        disposalMethod: value as AssetDisposalMethod, // Use type assertion to ensure correct type
        buyerId: '',
        salePrice: 0
      }));
    }
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      disposalDate: value ? new Date(value) : new Date()
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };
  
  const confirmDisposal = async () => {
    setDisposing(true);
    
    try {
      await disposeAsset(formData);
      router.push(`/finance/asset-management/assets/${assetId}`);
    } catch (error) {
      console.error('Error disposing asset:', error);
      alert('Failed to dispose asset. Please try again.');
    } finally {
      setDisposing(false);
      setShowConfirmation(false);
    }
  };
  
  const cancelDisposal = () => {
    setShowConfirmation(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  if (!selectedAsset) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Asset not found</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Dispose Asset
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {selectedAsset.name} ({selectedAsset.assetNumber})
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="disposalMethod" className="block text-sm font-medium text-gray-700">
                Disposal Method *
              </label>
              <select
                id="disposalMethod"
                name="disposalMethod"
                required
                value={formData.disposalMethod}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {Object.values(AssetDisposalMethod).map((method) => (
                  <option key={method} value={method}>
                    {method.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="disposalDate" className="block text-sm font-medium text-gray-700">
                Disposal Date *
              </label>
              <input
                type="date"
                id="disposalDate"
                name="disposalDate"
                required
                value={formData.disposalDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            {formData.disposalMethod === AssetDisposalMethod.SOLD && (
              <>
                <div className="sm:col-span-3">
                  <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">
                    Sale Price *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="salePrice"
                      name="salePrice"
                      required
                      min="0"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="buyerId" className="block text-sm font-medium text-gray-700">
                    Buyer
                  </label>
                  <select
                    id="buyerId"
                    name="buyerId"
                    value={formData.buyerId}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a buyer (optional)</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            <div className="sm:col-span-3">
              <label htmlFor="disposalCosts" className="block text-sm font-medium text-gray-700">
                Disposal Costs
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="disposalCosts"
                  name="disposalCosts"
                  min="0"
                  step="0.01"
                  value={formData.disposalCosts}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Any costs associated with disposal (e.g., removal, transport)</p>
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
                placeholder="Additional details about the disposal"
              />
            </div>
            
            <div className="sm:col-span-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Warning:</strong> Disposing of an asset is permanent and will remove it from active assets. 
                      This will also generate appropriate accounting entries to record the disposal.
                    </p>
                  </div>
                </div>
              </div>
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
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Dispose Asset
          </button>
        </div>
      </form>
      
      {showConfirmation && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Confirm Asset Disposal
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to dispose of this asset? This action cannot be undone.
                        The asset will be marked as disposed and removed from active assets.
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        <strong>Asset:</strong> {selectedAsset.name} ({selectedAsset.assetNumber})
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Current Book Value:</strong> ${selectedAsset.currentValue.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Disposal Method:</strong> {formData.disposalMethod.replace(/_/g, ' ')}
                      </p>
                      {formData.disposalMethod === AssetDisposalMethod.SOLD && (
                        <p className="text-sm text-gray-500">
                          <strong>Sale Price:</strong> ${formData.salePrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDisposal}
                  disabled={disposing}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {disposing ? 'Processing...' : 'Confirm Disposal'}
                </button>
                <button
                  type="button"
                  onClick={cancelDisposal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDisposalForm;