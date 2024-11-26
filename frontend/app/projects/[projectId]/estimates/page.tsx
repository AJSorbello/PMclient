'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EstimateItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Estimate {
  _id: string;
  title: string;
  amount: number;
  description: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  items: EstimateItem[];
  notes?: string;
  terms?: string;
  validUntil: string;
  rejectionReason?: string;
}

export default function EstimatesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notes: '',
    terms: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEstimates();
  }, [projectId]);

  const fetchEstimates = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/estimates`);
      if (!response.ok) throw new Error('Failed to fetch estimates');
      const data = await response.json();
      setEstimates(data);
    } catch (error) {
      console.error('Error fetching estimates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: keyof EstimateItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      total: field === 'quantity' || field === 'unitPrice'
        ? Number(value) * (field === 'quantity' ? newItems[index].unitPrice : newItems[index].quantity)
        : newItems[index].total,
    };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/create-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          ...formData,
          amount: formData.items.reduce((sum, item) => sum + item.total, 0),
        }),
      });

      if (!response.ok) throw new Error('Failed to create estimate');
      
      await fetchEstimates();
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        notes: '',
        terms: '',
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      });
    } catch (error) {
      console.error('Error creating estimate:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (estimateId: string, status: string, rejectionReason?: string) => {
    try {
      const response = await fetch('/api/create-estimate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estimateId,
          status,
          rejectionReason,
          userId: 'current-user-id', // Replace with actual user ID
        }),
      });

      if (!response.ok) throw new Error('Failed to update estimate');
      
      await fetchEstimates();
    } catch (error) {
      console.error('Error updating estimate:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Estimates</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {showForm ? 'Cancel' : 'Create Estimate'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
          <div className="grid gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={4}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Line Items</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-blue-500 hover:text-blue-600"
                >
                  + Add Item
                </button>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full border rounded px-2 py-1"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full border rounded px-2 py-1"
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                      placeholder="Price"
                      className="w-full border rounded px-2 py-1"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.total}
                      className="w-full border rounded px-2 py-1 bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div className="col-span-1">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-right text-lg font-bold mt-2">
                Total: ${formData.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={2}
              />
            </div>

            <div>
              <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={2}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`${
                submitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
              } text-white px-4 py-2 rounded transition`}
            >
              {submitting ? 'Creating...' : 'Create Estimate'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {estimates.map((estimate) => (
          <div key={estimate._id} className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{estimate.title}</h3>
                <p className="text-gray-500 text-sm">
                  Created on {new Date(estimate.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-500 text-sm">
                  Valid until {new Date(estimate.validUntil).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {estimate.status === 'draft' && (
                  <button
                    onClick={() => handleStatusUpdate(estimate._id, 'sent')}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Send
                  </button>
                )}
                {estimate.status === 'sent' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(estimate._id, 'approved')}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = window.prompt('Enter rejection reason:');
                        if (reason) handleStatusUpdate(estimate._id, 'rejected', reason);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </>
                )}
                <span className={`
                  px-3 py-1 rounded-full text-sm
                  ${estimate.status === 'approved' ? 'bg-green-100 text-green-800' :
                    estimate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    estimate.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                </span>
              </div>
            </div>
            <p className="text-2xl font-bold mb-4">
              ${estimate.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-600 mb-4">{estimate.description}</p>
            
            {estimate.items && estimate.items.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Line Items</h4>
                <div className="space-y-2">
                  {estimate.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 text-sm">
                      <div className="col-span-6">{item.description}</div>
                      <div className="col-span-2">{item.quantity} x</div>
                      <div className="col-span-2">${item.unitPrice.toFixed(2)}</div>
                      <div className="col-span-2 text-right">${item.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {estimate.notes && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-gray-600">{estimate.notes}</p>
              </div>
            )}

            {estimate.terms && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                <p className="text-gray-600">{estimate.terms}</p>
              </div>
            )}

            {estimate.rejectionReason && (
              <div className="mt-4 p-3 bg-red-50 rounded">
                <h4 className="font-semibold text-red-800 mb-1">Rejection Reason</h4>
                <p className="text-red-600">{estimate.rejectionReason}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
