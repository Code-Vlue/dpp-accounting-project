// src/app/finance/tuition-credits/providers/portal/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from '@/store/finance-store';

export default function ProviderPortalPage() {
  const router = useRouter();
  const { providers, fetchProviders, providersLoading } = useFinanceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);
  
  // Filter providers based on search term and status filter
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = searchTerm === '' || 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (provider.portalUsername && provider.portalUsername.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ENABLED' && provider.portalAccess) || 
      (statusFilter === 'DISABLED' && !provider.portalAccess);
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Provider Portal Management</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Portal Access Overview</CardTitle>
          <CardDescription>Manage provider access to the self-service portal</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Providers</p>
            <p className="text-3xl font-bold">{providers.length}</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Portal Access Enabled</p>
            <p className="text-3xl font-bold text-green-600">
              {providers.filter(p => p.portalAccess).length}
            </p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Portal Access Disabled</p>
            <p className="text-3xl font-bold text-gray-500">
              {providers.filter(p => !p.portalAccess).length}
            </p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Active Portal Users</p>
            <p className="text-3xl font-bold text-blue-600">
              {providers.filter(p => p.portalAccess && p.lastPortalLogin).length}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Provider Portal Access</CardTitle>
          <CardDescription>Manage provider portal access and credentials</CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="ALL">All Providers</option>
              <option value="ENABLED">Portal Access Enabled</option>
              <option value="DISABLED">Portal Access Disabled</option>
            </select>
            <Button
              onClick={() => router.push("/finance/tuition-credits/providers/portal/activity")}
            >
              Portal Activity Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {providersLoading ? (
            <div className="p-4 text-center">Loading providers...</div>
          ) : filteredProviders.length === 0 ? (
            <div className="p-4 text-center">No providers found matching the filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Provider</th>
                    <th className="py-2 px-4 border-b text-left">Contact</th>
                    <th className="py-2 px-4 border-b text-left">Portal Status</th>
                    <th className="py-2 px-4 border-b text-left">Last Activity</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-gray-500">ID: {provider.vendorNumber}</div>
                      </td>
                      <td className="py-2 px-4 border-b">
                        <div className="text-sm">{provider.contactName}</div>
                        <div className="text-sm text-blue-600">{provider.contactEmail}</div>
                      </td>
                      <td className="py-2 px-4 border-b">
                        {provider.portalAccess ? (
                          <div>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Enabled</span>
                            {provider.portalUsername && (
                              <div className="text-sm mt-1">Username: {provider.portalUsername}</div>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Disabled</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {provider.lastPortalLogin ? (
                          <div className="text-sm">
                            {new Date(provider.lastPortalLogin).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Never</div>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="text-sm"
                            onClick={() => router.push(`/finance/tuition-credits/providers/${provider.id}`)}
                          >
                            View
                          </Button>
                          {provider.portalAccess ? (
                            <Button
                              variant="outline"
                              className="text-sm"
                              onClick={() => {
                                // Implementation would go here
                                alert("Reset password email sent to " + provider.contactEmail);
                              }}
                            >
                              Reset Password
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="text-sm text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => {
                                // Implementation would go here
                                alert("Portal access enabled for " + provider.name);
                              }}
                            >
                              Enable Access
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}