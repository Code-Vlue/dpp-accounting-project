// src/components/finance/providers/ProviderCommunicationTools.tsx
'use client';

import React, { useState } from 'react';
import { Provider } from '@/types/finance';

interface ProviderCommunicationToolsProps {
  provider: Provider;
}

type MessageTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

type CommunicationChannel = 'email' | 'sms' | 'portal';

export function ProviderCommunicationTools({ provider }: ProviderCommunicationToolsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [channels, setChannels] = useState<CommunicationChannel[]>(['email']);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentStatus, setSentStatus] = useState<'success' | 'error' | null>(null);
  
  // Message templates - would normally come from the database
  const messageTemplates: MessageTemplate[] = [
    {
      id: 'payment-processed',
      name: 'Payment Processed',
      subject: 'Your Payment Has Been Processed',
      body: `Dear ${provider.name},\n\nWe're pleased to inform you that your payment has been processed and is on its way to your account. You should receive the funds within 3-5 business days.\n\nPayment Details:\n- Amount: $[AMOUNT]\n- Date Processed: [DATE]\n- Reference Number: [REFERENCE]\n\nYou can view the complete payment details in your provider portal.\n\nThank you for your partnership.\n\nBest regards,\nDenver Preschool Program`
    },
    {
      id: 'tuition-credits-approved',
      name: 'Tuition Credits Approved',
      subject: 'Tuition Credits Approved',
      body: `Dear ${provider.name},\n\nWe're pleased to inform you that your tuition credits have been approved. These credits will be included in your next payment cycle.\n\nCredit Details:\n- Number of Credits: [NUMBER]\n- Total Amount: $[AMOUNT]\n- Credit Period: [PERIOD]\n\nYou can view the complete credit details in your provider portal.\n\nThank you for your partnership.\n\nBest regards,\nDenver Preschool Program`
    },
    {
      id: 'quality-improvement-grant',
      name: 'Quality Improvement Grant',
      subject: 'Quality Improvement Grant Approved',
      body: `Dear ${provider.name},\n\nCongratulations! We're pleased to inform you that your application for a Quality Improvement Grant has been approved.\n\nGrant Details:\n- Grant Amount: $[AMOUNT]\n- Purpose: [PURPOSE]\n- Date Approved: [DATE]\n\nThe funds will be disbursed according to the payment schedule we discussed. Please keep all receipts and documentation related to the use of these funds as they will be needed for reporting purposes.\n\nThank you for your commitment to providing quality early childhood education.\n\nBest regards,\nDenver Preschool Program`
    },
    {
      id: 'information-request',
      name: 'Information Request',
      subject: 'Information Request',
      body: `Dear ${provider.name},\n\nWe are currently updating our records and would appreciate your assistance in providing the following information:\n\n[INFORMATION_NEEDED]\n\nPlease submit this information by [DUE_DATE] through your provider portal or by replying to this email.\n\nThank you for your prompt attention to this request.\n\nBest regards,\nDenver Preschool Program`
    },
    {
      id: 'custom',
      name: 'Custom Message',
      subject: '',
      body: ''
    }
  ];
  
  // Handle template selection
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    if (templateId === 'custom') {
      setSubject('');
      setMessage('');
    } else {
      const template = messageTemplates.find(t => t.id === templateId);
      if (template) {
        setSubject(template.subject);
        setMessage(template.body);
      }
    }
  };
  
  // Handle channel selection
  const handleChannelChange = (channel: CommunicationChannel) => {
    setChannels(current => {
      if (current.includes(channel)) {
        return current.filter(c => c !== channel);
      } else {
        return [...current, channel];
      }
    });
  };
  
  // Handle message send
  const handleSend = async () => {
    if (!subject || !message || channels.length === 0) {
      return;
    }
    
    setIsSending(true);
    setSentStatus(null);
    
    try {
      // In a real implementation, this would call an API to send the message
      // For demo purposes, we're just simulating a successful send
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the communication
      console.log('Message sent to:', provider.name);
      console.log('Channels:', channels.join(', '));
      console.log('Subject:', subject);
      console.log('Message:', message);
      
      setSentStatus('success');
      
      // In a production environment, we'd record this communication in the database
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setSentStatus('error');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Provider Communication</h2>
      
      {sentStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded">
          Message sent successfully to {provider.name}!
        </div>
      )}
      
      {sentStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          Failed to send message. Please try again.
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
          Message Template
        </label>
        <select
          id="template"
          value={selectedTemplate}
          onChange={handleTemplateChange}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Select a template...</option>
          {messageTemplates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="channels" className="block text-sm font-medium text-gray-700 mb-1">
          Communication Channels
        </label>
        <div className="flex gap-4 mt-1">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="channel-email"
              checked={channels.includes('email')}
              onChange={() => handleChannelChange('email')}
              className="h-4 w-4 mr-2"
            />
            <label htmlFor="channel-email" className="text-sm text-gray-700">
              Email ({provider.contactEmail || provider.email || 'Not available'})
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="channel-sms"
              checked={channels.includes('sms')}
              onChange={() => handleChannelChange('sms')}
              className="h-4 w-4 mr-2"
            />
            <label htmlFor="channel-sms" className="text-sm text-gray-700">
              SMS ({provider.contactPhone || provider.phone || 'Not available'})
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="channel-portal"
              checked={channels.includes('portal')}
              onChange={() => handleChannelChange('portal')}
              className="h-4 w-4 mr-2"
            />
            <label htmlFor="channel-portal" className="text-sm text-gray-700">
              Provider Portal
            </label>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter message subject"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter your message"
        />
        
        <div className="mt-2 text-sm text-gray-500">
          Use placeholders like [AMOUNT], [DATE], [REFERENCE], etc. which will be replaced with actual values when sent.
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || !subject || !message || channels.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSending ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  );
}