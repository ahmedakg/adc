'use client';

import { useState, useEffect } from 'react';
import { Beaker, Plus, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

interface LabWork {
  id: string;
  patientId: string;
  patientName: string;
  labName: string;
  workType: string;
  description: string;
  dateOrdered: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: 'Ordered' | 'In Progress' | 'Ready' | 'Delivered' | 'Delayed';
  cost: number;
  notes: string;
  shadeDetails?: string;
  teeth?: string;
}

const PESHAWAR_LABS = [
  {
    name: 'Khyber Dental Laboratory',
    address: 'Phase 5, Hayatabad',
    phone: '091-5817700',
    specialties: ['Crowns', 'Bridges', 'Dentures', 'Implants']
  },
  {
    name: 'Peshawar Dental Lab',
    address: 'Saddar Road',
    phone: '091-2214455',
    specialties: ['Orthodontics', 'Prosthetics', 'Ceramics']
  },
  {
    name: 'Modern Dental Laboratory',
    address: 'University Road',
    phone: '091-5703322',
    specialties: ['CAD/CAM', 'Zirconia', 'E-max']
  },
  {
    name: 'Prime Dental Lab',
    address: 'Hayatabad Phase 4',
    phone: '091-5861234',
    specialties: ['Removable Prosthetics', 'Orthodontic Appliances']
  },
  {
    name: 'Quality Dental Laboratory',
    address: 'Cantt Area',
    phone: '091-2276688',
    specialties: ['All Types', 'Express Service Available']
  }
];

const WORK_TYPES = [
  { name: 'Crown (PFM)', cost: 8000, days: 7 },
  { name: 'Crown (Zirconia)', cost: 15000, days: 10 },
  { name: 'Crown (E-max)', cost: 18000, days: 10 },
  { name: 'Bridge (3-unit PFM)', cost: 22000, days: 10 },
  { name: 'Bridge (3-unit Zirconia)', cost: 40000, days: 14 },
  { name: 'Complete Denture', cost: 15000, days: 14 },
  { name: 'Partial Denture (Acrylic)', cost: 12000, days: 10 },
  { name: 'Partial Denture (Cast)', cost: 20000, days: 14 },
  { name: 'Orthodontic Retainer', cost: 5000, days: 5 },
  { name: 'Night Guard', cost: 6000, days: 5 },
  { name: 'Implant Crown', cost: 20000, days: 10 },
  { name: 'Temporary Crown', cost: 2000, days: 1 },
  { name: 'Maryland Bridge', cost: 18000, days: 10 },
  { name: 'Veneer (Composite)', cost: 12000, days: 7 },
  { name: 'Veneer (Porcelain)', cost: 20000, days: 10 }
];

export default function LabWorkTracking() {
  const [labWorks, setLabWorks] = useState<LabWork[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [formData, setFormData] = useState<Partial<LabWork>>({
    patientId: '',
    labName: '',
    workType: '',
    description: '',
    dateOrdered: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    status: 'Ordered',
    cost: 0,
    notes: '',
    shadeDetails: '',
    teeth: ''
  });

  useEffect(() => {
    loadData();
    checkOverdueLabs();
  }, []);

  const loadData = () => {
    setLabWorks(JSON.parse(localStorage.getItem('adc_labwork') || '[]'));
    setPatients(JSON.parse(localStorage.getItem('adc_patients') || '[]'));
  };

  const checkOverdueLabs = () => {
    const works = JSON.parse(localStorage.getItem('adc_labwork') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    works.forEach((work: LabWork) => {
      if (work.expectedDelivery < today && work.status !== 'Delivered' && work.status !== 'Delayed') {
        work.status = 'Delayed';
      }
    });
    
    localStorage.setItem('adc_labwork', JSON.stringify(works));
    setLabWorks(works);
  };

  const handleWorkTypeSelect = (workType: string) => {
    const type = WORK_TYPES.find(t => t.name === workType);
    if (type) {
      const orderDate = new Date(formData.dateOrdered || new Date());
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + type.days);
      
      setFormData({
        ...formData,
        workType: type.name,
        cost: type.cost,
        expectedDelivery: deliveryDate.toISOString().split('T')[0]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const patient = patients.find(p => p.id === formData.patientId);
    if (!patient) {
      alert('Please select a patient');
      return;
    }

    const newLabWork: LabWork = {
      ...formData as LabWork,
      id: `LAB-${Date.now()}`,
      patientName: patient.name
    };

    const updated = [newLabWork, ...labWorks];
    localStorage.setItem('adc_labwork', JSON.stringify(updated));
    setLabWorks(updated);

    await generateLabOrderPDF(newLabWork, patient);
    resetForm();
  };

  const generateLabOrderPDF = async (lab: LabWork, patient: any) => {
    const { jsPDF } = await import('jspdf');
    require('jspdf-autotable');
    const doc = new jsPDF() as any;

    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('LAB WORK ORDER', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Abdullah Dental Care', 105, 30, { align: 'center' });
    doc.text('Dr. Ahmed | PMC: 7071-D', 105, 36, { align: 'center' });
    doc.text('Hayatabad, Peshawar | 091-5844533', 105, 41, { align: 'center' });

    doc.setTextColor(0, 0, 0);

    // Order details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Order #: ${lab.id}`, 20, 55);
    doc.text(`Date: ${new Date(lab.dateOrdered).toLocaleDateString('en-PK')}`, 20, 61);
    doc.text(`Expected: ${new Date(lab.expectedDelivery).toLocaleDateString('en-PK')}`, 20, 67);

    // Laboratory info
    const selectedLab = PESHAWAR_LABS.find(l => l.name === lab.labName);
    doc.setFont('helvetica', 'bold');
    doc.text('TO:', 130, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(lab.labName, 130, 61);
    if (selectedLab) {
      doc.text(selectedLab.address, 130, 67);
      doc.text(selectedLab.phone, 130, 73);
    }

    // Patient info box
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 80, 170, 25);
    
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 25, 87);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Name: ${patient.name}`, 25, 94);
    doc.text(`Age: ${patient.age} | Gender: ${patient.gender}`, 25, 99);
    doc.text(`Patient ID: ${patient.id}`, 120, 94);
    doc.text(`Phone: ${patient.phone}`, 120, 99);

    // Work details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('WORK DETAILS', 20, 115);

    const workDetails = [
      ['Work Type', lab.workType],
      ['Description', lab.description || '-'],
      ['Teeth', lab.teeth || '-'],
      ['Shade Details', lab.shadeDetails || '-'],
      ['Cost', `Rs. ${lab.cost.toLocaleString()}`]
    ];

    doc.autoTable({
      startY: 120,
      head: [['Item', 'Details']],
      body: workDetails,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 120 }
      }
    });

    let yPos = doc.lastAutoTable.finalY + 15;

    // Special instructions
    if (lab.notes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('SPECIAL INSTRUCTIONS:', 20, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(lab.notes, 170);
      doc.text(splitNotes, 20, yPos);
      yPos += splitNotes.length * 5 + 10;
    }

    // Signature
    yPos = Math.max(yPos, 240);
    doc.setFontSize(9);
    doc.text('_______________________', 30, yPos);
    doc.text("Dentist's Signature", 40, yPos + 6);
    doc.text('Dr. Ahmed', 50, yPos + 11);

    doc.text('_______________________', 130, yPos);
    doc.text('Lab Received By', 140, yPos + 6);
    doc.text('Name & Signature', 137, yPos + 11);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(128, 128, 128);
    doc.text('Please contact us immediately if there are any issues with this order', 105, 285, { align: 'center' });
    doc.text('Abdullah Dental Care | 091-5844533', 105, 290, { align: 'center' });

    doc.save(`Lab-Order-${lab.id}.pdf`);
  };

  const updateStatus = (id: string, status: LabWork['status']) => {
    const updated = labWorks.map(lab => {
      if (lab.id === id) {
        const updates: Partial<LabWork> = { status };
        if (status === 'Delivered') {
          updates.actualDelivery = new Date().toISOString().split('T')[0];
        }
        return { ...lab, ...updates };
      }
      return lab;
    });
    
    localStorage.setItem('adc_labwork', JSON.stringify(updated));
    setLabWorks(updated);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      labName: '',
      workType: '',
      description: '',
      dateOrdered: new Date().toISOString().split('T')[0],
      expectedDelivery: '',
      status: 'Ordered',
      cost: 0,
      notes: '',
      shadeDetails: '',
      teeth: ''
    });
    setShowForm(false);
  };

  const getDaysRemaining = (expectedDate: string) => {
    const today = new Date();
    const expected = new Date(expectedDate);
    const diffTime = expected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredLabWorks = labWorks.filter(lab =>
    filterStatus === 'All' || lab.status === filterStatus
  );

  const stats = {
    total: labWorks.length,
    pending: labWorks.filter(l => ['Ordered', 'In Progress'].includes(l.status)).length,
    delayed: labWorks.filter(l => l.status === 'Delayed').length,
    ready: labWorks.filter(l => l.status === 'Ready').length
  };

  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Ready</div>
          <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Delayed</div>
          <div className="text-2xl font-bold text-red-600">{stats.delayed}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {['All', 'Ordered', 'In Progress', 'Ready', 'Delivered', 'Delayed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Lab Order
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 my-8">
            <h3 className="text-xl font-bold mb-4">Create Lab Work Order</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Patient *</label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Laboratory *</label>
                  <select
                    required
                    value={formData.labName}
                    onChange={(e) => setFormData({...formData, labName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select lab...</option>
                    {PESHAWAR_LABS.map(lab => (
                      <option key={lab.name} value={lab.name}>
                        {lab.name} - {lab.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Work Type *</label>
                  <select
                    required
                    value={formData.workType}
                    onChange={(e) => handleWorkTypeSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select work type...</option>
                    {WORK_TYPES.map(type => (
                      <option key={type.name} value={type.name}>
                        {type.name} - Rs. {type.cost.toLocaleString()} ({type.days} days)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cost (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Ordered *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOrdered}
                    onChange={(e) => setFormData({...formData, dateOrdered: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Delivery *</label>
                  <input
                    type="date"
                    required
                    value={formData.expectedDelivery}
                    onChange={(e) => setFormData({...formData, expectedDelivery: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teeth Numbers</label>
                  <input
                    type="text"
                    placeholder="e.g., 11, 21, 36-37"
                    value={formData.teeth}
                    onChange={(e) => setFormData({...formData, teeth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shade Details</label>
                  <input
                    type="text"
                    placeholder="e.g., A2, B3"
                    value={formData.shadeDetails}
                    onChange={(e) => setFormData({...formData, shadeDetails: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Additional work details..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Special Instructions</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Any special requirements for the lab..."
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
                  Create Order & Generate PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredLabWorks.map(lab => {
          const daysRemaining = getDaysRemaining(lab.expectedDelivery);
          const isOverdue = daysRemaining < 0 && lab.status !== 'Delivered';
          
          return (
            <div key={lab.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{lab.workType}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      lab.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      lab.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                      lab.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                      lab.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lab.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Order #:</span> {lab.id}
                    </div>
                    <div>
                      <span className="text-gray-600">Patient:</span> {lab.patientName}
                    </div>
                    <div>
                      <span className="text-gray-600">Laboratory:</span> {lab.labName}
                    </div>
                    <div>
                      <span className="text-gray-600">Cost:</span> Rs. {lab.cost.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-gray-600">Ordered:</span> {new Date(lab.dateOrdered).toLocaleDateString('en-PK')}
                    </div>
                    <div className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                      <span className="text-gray-600">Expected:</span> {new Date(lab.expectedDelivery).toLocaleDateString('en-PK')}
                      {isOverdue && ' (OVERDUE)'}
                    </div>
                    {lab.teeth && (
                      <div>
                        <span className="text-gray-600">Teeth:</span> {lab.teeth}
                      </div>
                    )}
                    {lab.shadeDetails && (
                      <div>
                        <span className="text-gray-600">Shade:</span> {lab.shadeDetails}
                      </div>
                    )}
                  </div>

                  {lab.description && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Description:</span> {lab.description}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {lab.status !== 'Delivered' && (
                    <>
                      {lab.status === 'Ordered' && (
                        <button
                          onClick={() => updateStatus(lab.id, 'In Progress')}
                          className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {lab.status === 'In Progress' && (
                        <button
                          onClick={() => updateStatus(lab.id, 'Ready')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Mark Ready
                        </button>
                      )}
                      {(lab.status === 'Ready' || lab.status === 'Delayed') && (
                        <button
                          onClick={() => updateStatus(lab.id, 'Delivered')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => generateLabOrderPDF(lab, patients.find(p => p.id === lab.patientId))}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    PDF
                  </button>
                </div>
              </div>

              {lab.status !== 'Delivered' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center text-sm">
                    {isOverdue ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-red-600 font-semibold">
                          Overdue by {Math.abs(daysRemaining)} day(s)
                        </span>
                      </>
                    ) : daysRemaining === 0 ? (
                      <>
                        <Clock className="w-4 h-4 text-orange-600 mr-2" />
                        <span className="text-orange-600 font-semibold">Due today</span>
                      </>
                    ) : daysRemaining <= 2 ? (
                      <>
                        <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-yellow-600">Due in {daysRemaining} day(s)</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="text-gray-600">{daysRemaining} days remaining</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {lab.actualDelivery && (
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Delivered on {new Date(lab.actualDelivery).toLocaleDateString('en-PK')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredLabWorks.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          No lab work orders found for this status
        </div>
      )}
    </div>
  );
}
