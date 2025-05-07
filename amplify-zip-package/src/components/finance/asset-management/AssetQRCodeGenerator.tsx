"use client";

// src/components/finance/asset-management/AssetQRCodeGenerator.tsx
import React, { useState } from 'react';
import { useFinanceStore } from '@/store/finance-store';

interface AssetQRCodeGeneratorProps {
  assetId: string;
}

export function AssetQRCodeGenerator({ assetId }: AssetQRCodeGeneratorProps) {
  const { getAssetById } = useFinanceStore();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrSize, setQrSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [includeDetails, setIncludeDetails] = useState(true);
  
  // Fetch asset data on component mount
  React.useEffect(() => {
    const fetchAsset = async () => {
      try {
        const assetData = await getAssetById(assetId);
        setAsset(assetData);
      } catch (error) {
        console.error('Error fetching asset:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAsset();
  }, [assetId, getAssetById]);
  
  // This is a placeholder for QR code generation
  // In a real implementation, you would use a library like qrcode.react
  const generateQRCodeURL = () => {
    // In a real implementation, this would generate a QR code
    // For now, we'll just create a placeholder
    const baseSize = qrSize === 'small' ? 100 : qrSize === 'medium' ? 200 : 300;
    const dataString = encodeURIComponent(JSON.stringify({
      id: asset?.id,
      tag: asset?.assetTag,
      serial: asset?.serialNumber,
      details: includeDetails ? {
        name: asset?.name,
        model: asset?.model,
        location: asset?.location?.name,
        department: asset?.department?.name
      } : undefined
    }));
    
    // This URL doesn't actually work, it's just a placeholder
    // In a real app, you'd generate the QR code client-side or have an API endpoint
    return `https://api.qrserver.com/v1/create-qr-code/?size=${baseSize}x${baseSize}&data=${dataString}`;
  };
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Asset QR Code - ${asset?.assetTag || 'Unknown'}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              .container {
                text-align: center;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              .asset-details {
                margin-top: 20px;
                text-align: left;
                display: inline-block;
              }
              table {
                border-collapse: collapse;
              }
              th, td {
                padding: 8px 15px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Asset QR Code</h1>
              <img src="${generateQRCodeURL()}" alt="Asset QR Code" />
              ${includeDetails ? `
                <div class="asset-details">
                  <table>
                    <tr>
                      <th>Asset Tag:</th>
                      <td>${asset?.assetTag || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Name:</th>
                      <td>${asset?.name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Serial Number:</th>
                      <td>${asset?.serialNumber || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Model:</th>
                      <td>${asset?.model || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Location:</th>
                      <td>${asset?.location?.name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Department:</th>
                      <td>${asset?.department?.name || 'N/A'}</td>
                    </tr>
                  </table>
                </div>
              ` : ''}
            </div>
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }
  
  if (!asset) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        Asset not found.
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">QR Code Generator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Size
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="qrSize"
                  value="small"
                  checked={qrSize === 'small'}
                  onChange={() => setQrSize('small')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Small</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="qrSize"
                  value="medium"
                  checked={qrSize === 'medium'}
                  onChange={() => setQrSize('medium')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Medium</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="qrSize"
                  value="large"
                  checked={qrSize === 'large'}
                  onChange={() => setQrSize('large')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Large</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include Asset Details</span>
            </label>
          </div>
          
          <div className="pt-4">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
            >
              Print QR Code
            </button>
          </div>
          
          <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md mt-4">
            <p className="text-sm">
              <strong>Note:</strong> The QR code contains the asset's unique identifier and selected details.
              Scan with any QR code reader to quickly access asset information in the system.
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6">
          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded shadow-sm">
              {/* Placeholder for QR code image */}
              <div
                className={`bg-gray-200 flex items-center justify-center ${qrSize === 'small' ? 'w-32 h-32' : qrSize === 'medium' ? 'w-48 h-48' : 'w-64 h-64'}`}
              >
                <span className="text-gray-500 text-sm">
                  QR Code Preview
                  <br />
                  (Asset Tag: {asset.assetTag})
                </span>
              </div>
            </div>
            
            {includeDetails && (
              <div className="mt-4 text-sm text-gray-700 text-left">
                <p><strong>Asset Tag:</strong> {asset.assetTag}</p>
                <p><strong>Name:</strong> {asset.name}</p>
                <p><strong>Serial Number:</strong> {asset.serialNumber || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetQRCodeGenerator;