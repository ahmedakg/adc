'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Plus, FileText, Printer, Download } from 'lucide-react';

interface BillItem {
  treatmentId: string;
  treatmentName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  notes: string;
}

export default function BillingSystem() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Pending'>('Paid');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBills(JSON.parse(localStorage.getItem('adc_billing') || '[]'));
    setPatients(JSON.parse(localStorage.getItem('adc_patients') || '[]'));
    setTreatments(JSON.parse(localStorage.getItem('adc_treatments') || '[]'));
  };

  const addItem = (treatmentId: string) => {
    const treatment = treatments.find(t => t.id === treatmentId);
    if (!treatment) return;

    const existingItem = billItems.find(i => i.treatmentId === treatmentId);
    if (existingItem) {
      setBillItems(billItems.map(i =>
        i.treatmentId === treatmentId
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
          : i
      ));
    } else {
      setBillItems([...billItems, {
        treatmentId: treatment.id,
        treatmentName: treatment.name,
        quantity: 1,
        price: treatment.price,
        total: treatment.price
      }]);
    }
  };

  const removeItem = (treatmentId: string) => {
    setBillItems(billItems.filter(i => i.treatmentId !== treatmentId));
  };

  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = 0; // No tax in Pakistan for medical services
    const total = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient || billItems.length === 0) {
      alert('Please select a patient and add at least one item');
      return;
    }

    const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

    const newBill: Bill = {
      id: `BILL-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      date: new Date().toISOString(),
      items: billItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paymentMethod,
      paymentStatus,
      notes
    };

    const updated = [newBill, ...bills];
    localStorage.setItem('adc_billing', JSON.stringify(updated));
    setBills(updated);
    
    // Generate PDF
    generatePDF(newBill, patient);
    
    resetForm();
  };

  const generatePDF = async (bill: Bill, patient: any) => {
    const { jsPDF } = await import('jspdf');
    require('jspdf-autotable');
    
    const doc = new jsPDF() as any;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Abdullah Dental Care', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PMC: 7071-D', 105, 27, { align: 'center' });
    doc.text('Hayatabad, Peshawar, Pakistan', 105, 32, { align: 'center' });
    doc.text('Phone: 091-5844533', 105, 37, { align: 'center' });

    // Invoice details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 105, 50, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${bill.id}`, 20, 60);
    doc.text(`Date: ${new Date(bill.date).toLocaleDateString('en-PK')}`, 20, 66);
    
    doc.text(`Patient: ${patient.name}`, 20, 76);
    doc.text(`Patient ID: ${patient.id}`, 20, 82);
    doc.text(`Phone: ${patient.phone}`, 20, 88);

    // Items table
    const tableData = bill.items.map(item => [
      item.treatmentName,
      item.quantity,
      `Rs. ${item.price.toLocaleString()}`,
      `Rs. ${item.total.toLocaleString()}`
    ]);

    doc.autoTable({
      startY: 100,
      head: [['Treatment', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Totals
    doc.text(`Subtotal:`, 130, finalY);
    doc.text(`Rs. ${bill.subtotal.toLocaleString()}`, 180, finalY, { align: 'right' });
    
    if (bill.discount > 0) {
      doc.text(`Discount:`, 130, finalY + 6);
      doc.text(`-Rs. ${bill.discount.toLocaleString()}`, 180, finalY + 6, { align: 'right' });
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total:`, 130, finalY + 12);
    doc.text(`Rs. ${bill.total.toLocaleString()}`, 180, finalY + 12, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Payment Method: ${bill.paymentMethod}`, 20, finalY + 12);
    doc.text(`Status: ${bill.paymentStatus}`, 20, finalY + 18);

    // Footer
    doc.setFontSize(8);
    doc.text('Thank you for choosing Abdullah Dental Care!', 105, 280, { align: 'center' });
    doc.text('For queries, contact: 091-5844533', 105, 285, { align: 'center' });

    // Save
    doc.save(`Invoice-${bill.id}.pdf`);
  };

  const resetForm = () => {
    setSelectedPatient('');
    setBillItems([]);
    setDiscount(0);
    setPaymentMethod('Cash');
    setPaymentStatus('Paid');
    setNotes('');
    setShowForm(false);
  };

  const { subtotal, discountAmount, total } = calculateTotals();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Billing & Invoices</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Bill
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 my-8">
            <h3 className="text-xl font-bold mb-4">Create New Bill</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Patient *</label>
                  <select
                    required
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Choose patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Add Treatment</label>
                  <select
                    onChange={(e) => { addItem(e.target.value); e.target.value = ''; }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select treatment to add...</option>
                    {treatments.map(t => (
                      <option key={t.id} value={t.id}>{t.name} - Rs. {t.price.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3">Bill Items</h4>
                {billItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items added yet</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-600">
                        <th className="pb-2">Treatment</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2">Price</th>
                        <th className="pb-2">Total</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {billItems.map(item => (
                        <tr key={item.treatmentId} className="border-t">
                          <td className="py-2">{item.treatmentName}</td>
                          <td>{item.quantity}</td>
                          <td>Rs. {item.price.toLocaleString()}</td>
                          <td>Rs. {item.total.toLocaleString()}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeItem(item.treatmentId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Discount (%):</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border rounded"
                    />
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount Amount:</span>
                      <span>-Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Cash</option>
                    <option>Card</option>
                    <option>Bank Transfer</option>
                    <option>JazzCash</option>
                    <option>EasyPaisa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Paid</option>
                    <option>Partial</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Additional notes..."
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
                  Generate Bill & PDF
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bills.map(bill => (
              <tr key={bill.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{bill.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{bill.patientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(bill.date).toLocaleDateString('en-PK')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  Rs. {bill.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{bill.paymentMethod}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    bill.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                    bill.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {bill.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => generatePDF(bill, patients.find(p => p.id === bill.patientId))}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bills.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No bills generated yet
          </div>
        )}
      </div>
    </div>
  );
}
