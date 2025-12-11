'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, DollarSign } from 'lucide-react';

interface Treatment {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
}

export default function TreatmentCatalog() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [formData, setFormData] = useState<Partial<Treatment>>({
    name: '',
    category: 'General Dentistry',
    price: 0,
    duration: 30,
    description: ''
  });

  const categories = [
    'All',
    'General Dentistry',
    'Cosmetic Dentistry',
    'Orthodontics',
    'Oral Surgery',
    'Endodontics',
    'Periodontics',
    'Pediatric Dentistry',
    'Preventive Care'
  ];

  useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = () => {
    const stored = localStorage.getItem('adc_treatments');
    if (stored) {
      setTreatments(JSON.parse(stored));
    } else {
      // Initialize with default treatments
      const defaultTreatments: Treatment[] = [
        { id: 'T1', name: 'Dental Checkup', category: 'Preventive Care', price: 1000, duration: 30, description: 'Routine examination' },
        { id: 'T2', name: 'Teeth Cleaning', category: 'Preventive Care', price: 2000, duration: 45, description: 'Professional scaling and polishing' },
        { id: 'T3', name: 'Tooth Filling', category: 'General Dentistry', price: 3000, duration: 60, description: 'Composite filling' },
        { id: 'T4', name: 'Root Canal Treatment', category: 'Endodontics', price: 15000, duration: 90, description: 'Single canal RCT' },
        { id: 'T5', name: 'Tooth Extraction', category: 'Oral Surgery', price: 3000, duration: 30, description: 'Simple extraction' },
        { id: 'T6', name: 'Teeth Whitening', category: 'Cosmetic Dentistry', price: 20000, duration: 60, description: 'Professional bleaching' },
        { id: 'T7', name: 'Dental Crown', category: 'General Dentistry', price: 25000, duration: 120, description: 'Ceramic crown' },
        { id: 'T8', name: 'Dental Bridge', category: 'General Dentistry', price: 60000, duration: 120, description: '3-unit bridge' },
        { id: 'T9', name: 'Braces Consultation', category: 'Orthodontics', price: 1500, duration: 45, description: 'Initial orthodontic assessment' },
        { id: 'T10', name: 'Gum Treatment', category: 'Periodontics', price: 5000, duration: 60, description: 'Deep cleaning' }
      ];
      localStorage.setItem('adc_treatments', JSON.stringify(defaultTreatments));
      setTreatments(defaultTreatments);
    }
  };

  const saveTreatments = (updated: Treatment[]) => {
    localStorage.setItem('adc_treatments', JSON.stringify(updated));
    setTreatments(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTreatment) {
      const updated = treatments.map(t =>
        t.id === editingTreatment.id ? { ...formData, id: t.id } as Treatment : t
      );
      saveTreatments(updated);
    } else {
      const newTreatment: Treatment = {
        ...formData as Treatment,
        id: `T${Date.now()}`
      };
      saveTreatments([...treatments, newTreatment]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'General Dentistry',
      price: 0,
      duration: 30,
      description: ''
    });
    setEditingTreatment(null);
    setShowForm(false);
  };

  const handleEdit = (treatment: Treatment) => {
    setFormData(treatment);
    setEditingTreatment(treatment);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this treatment?')) {
      saveTreatments(treatments.filter(t => t.id !== id));
    }
  };

  const filteredTreatments = treatments.filter(t =>
    (filterCategory === 'All' || t.category === filterCategory) &&
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 flex-1">
          <input
            type="text"
            placeholder="Search treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="ml-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Treatment
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {editingTreatment ? 'Edit Treatment' : 'Add New Treatment'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Treatment Name *</label>
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
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes) *</label>
                  <select
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Treatment details, materials used, etc..."
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
                  {editingTreatment ? 'Update' : 'Save'} Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTreatments.map(treatment => (
          <div key={treatment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{treatment.name}</h3>
                <div className="text-sm text-gray-500 mt-1">{treatment.category}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(treatment)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(treatment.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{treatment.description}</p>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex items-center text-lg font-bold text-blue-600">
                <DollarSign className="w-5 h-5" />
                Rs. {treatment.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                {treatment.duration} min
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTreatments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No treatments found
        </div>
      )}
    </div>
  );
}
