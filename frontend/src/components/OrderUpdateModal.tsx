import React, { useState } from 'react';
import useTailorProfileStore, { Order, OrderStatus } from '../utils/tailorProfileStore';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export function OrderUpdateModal({ isOpen, onClose, order }: Props) {
  const { updateOrderStatus } = useTailorProfileStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const statusOptions = [
    { value: OrderStatus.PENDING, label: 'Pending' },
    { value: OrderStatus.CONFIRMED, label: 'Confirmed' },
    { value: OrderStatus.IN_PROGRESS, label: 'In Progress' },
    { value: OrderStatus.READY_FOR_FITTING, label: 'Ready for Fitting' },
    { value: OrderStatus.ALTERATIONS, label: 'Alterations' },
    { value: OrderStatus.COMPLETED, label: 'Completed' },
    { value: OrderStatus.DELIVERED, label: 'Delivered' },
    { value: OrderStatus.CANCELLED, label: 'Cancelled' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await updateOrderStatus(order.id, newStatus, note);
      toast.success('Order status updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-900">Update Order Status</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Client: <span className="font-medium">{order.clientName}</span></p>
            <p className="text-sm text-gray-600">Current Status: <span className="font-medium">{order.status.replace(/_/g, ' ')}</span></p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              New Status
            </label>
            <select
              id="status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Add Note (Optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Enter additional details about this status update"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              disabled={isUpdating || newStatus === order.status}
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
