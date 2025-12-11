'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, AlertCircle, TrendingDown } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  costPerUnit: number;
  supplier: string;
  expiryDate?: string;
  lastRestocked: string;
  notes: string;
}

const CATEGORIES = [
  'Disposables',
  'Dental Materials',
  'Instruments',
  'Medications',
  'Anesthetics',
  'Sterilization',
  'Office Supplies',
  'Lab Materials'
];

const SUPPLIERS = [
  'Hayat Medical, Peshawar',
  'Pak Dental Suppliers, Saddar',
  'Modern Dental Supply, Hayatabad',
  'Quality Dental, University Road',
  'Metro Medical, Cantt'
];

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'Disposables',
    quantity: 0,
    unit: 'pieces',
    reorderLevel: 10,
    costPerUnit: 0,
    supplier: '',
    expiryDate: '',
    lastRestocked: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    const stored = localStorage.getItem('adc_inventory');
    if (stored) {
      setInventory(JSON.parse(stored));
    } else {
      // Initialize with common items
      const defaultItems: InventoryItem[] = [
        { id: '1', name: 'Disposable Gloves (Box)', category: 'Disposables', quantity: 50, unit: 'boxes', reorderLevel: 10, costPerUnit: 500, supplier: 'Hayat Medical, Peshawar', lastRestocked: '2024-12-01', notes: '' },
        { id: '2', name: 'Face Masks', category: 'Disposables', quantity: 200, unit: 'pieces', reorderLevel: 50, costPerUnit: 15, supplier: 'Hayat Medical, Peshawar', lastRestocked: '2024-12-01', notes: '' },
        { id: '3', name: 'Composite Resin (A2)', category: 'Dental Materials', quantity: 8, unit: 'syringes', reorderLevel: 3, costPerUnit: 2500, supplier: 'Pak Dental Suppliers, Saddar', lastRestocked: '2024-11-20', notes: '' },
        { id: '4', name: 'Lidocaine 2% with Epi', category: 'Anesthetics', quantity: 40, unit: 'cartridges', reorderLevel: 15, costPerUnit: 80, supplier: 'Metro Medical, Cantt', expiryDate: '2025-06-30', lastRestocked: '2024-11-15', notes: '' },
        { id: '5', name: 'Dental Needles 27G', category: 'Disposables', quantity: 100, unit: 'pieces', reorderLevel: 25, costPerUnit: 25, supplier: 'Quality Dental, University Road', lastRestocked: '2024-12-05', notes: '' }
      ];
      localStorage.setItem('adc_inventory', JSON.stringify(defaultItems));
      setInventory(defaultItems);
    }
  };

  const saveInventory = (updated: InventoryItem[]) => {
    localStorage.setItem('adc_inventory', JSON.stringify(updated));
    setInventory(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      const updated = inventory.map(item =>
        item.id === editingItem.id ? { ...formData, id: item.id } as InventoryItem : item
      );
      saveInventory(updated);
    } else {
      const newItem: InventoryItem = {
        ...formData as InventoryItem,
        id: `INV-${Date.now()}`
      };
      saveInventory([...inventory, newItem]);
    }

    resetForm();
  };

  const handleEdit = (item: InventoryItem) => {
    setFormData(item);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this item from inventory?')) {
      saveInventory(inventory.filter(item => item.id !== id));
    }
  };

  const adjustQuantity = (id: string, change: number) => {
    const updated = inventory.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    saveInventory(updated);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Disposables',
      quantity: 0,
      unit: 'pieces',
      reorderLevel: 10,
      costPerUnit: 0,
      supplier: '',
      expiryDate: '',
      lastRestocked: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const filteredInventory = inventory.filter(item =>
    (filterCategory === 'All' || item.category === filterCategory) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel);
  const expiringSoon = inventory.filter(item => {
    if (!item.expiryDate) return false;
    const today = new Date();
    const expiry = new Date(item.expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
  });

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);

  return (
    <div>
      {/* Alert Banners */}
      {lowStockItems.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800">Low Stock Alert</h4>
            <p className="text-sm text-red-700">
              {lowStockItems.length} item(s) below reorder level: {lowStockItems.map(i => i.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {expiringSoon.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <TrendingDown className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-800">Expiring Soon</h4>
            <p className="text-sm text-yellow-700">
              {expiringSoon.length} item(s) expiring within 90 days: {expiringSoon.map(i => i.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Items</div>
          <div className="text-2xl font-bold text-blue-600">{inventory.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Low Stock</div>
          <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Expiring Soon</div>
          <div className="text-2xl font-bold text-yellow-600">{expiringSoon.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-2xl font-bold text-green-600">Rs. {totalValue.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 flex-1">
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="ml-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Item
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>pieces</option>
                    <option>boxes</option>
                    <option>bottles</option>
                    <option>syringes</option>
                    <option>cartridges</option>
                    <option>kg</option>
                    <option>liters</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reorder Level *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cost Per Unit (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({...formData, costPerUnit: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Supplier *</label>
                  <select
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select supplier...</option>
                    {SUPPLIERS.map(sup => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Restocked *</label>
                  <input
                    type="date"
                    required
                    value={formData.lastRestocked}
                    onChange={(e) => setFormData({...formData, lastRestocked: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInventory.map(item => {
              const isLowStock = item.quantity <= item.reorderLevel;
              const totalValue = item.quantity * item.costPerUnit;

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.supplier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustQuantity(item.id, -1)}
                        className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium min-w-[60px] text-center">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={() => adjustQuantity(item.id, 1)}
                        className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isLowStock ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3 h-3" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 w-fit block">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Rs. {item.costPerUnit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    Rs. {totalValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredInventory.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No items found
          </div>
        )}
      </div>
    </div>
  );
}
