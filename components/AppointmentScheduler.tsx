'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit2, Trash2, User, CheckCircle } from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';
  notes: string;
}

export default function AppointmentScheduler() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Partial<Appointment>>({
    patientId: '',
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    type: 'Check-up',
    status: 'Scheduled',
    notes: ''
  });

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  const loadAppointments = () => {
    const stored = localStorage.getItem('adc_appointments');
    if (stored) setAppointments(JSON.parse(stored));
  };

  const loadPatients = () => {
    const stored = localStorage.getItem('adc_patients');
    if (stored) setPatients(JSON.parse(stored));
  };

  const saveAppointments = (updated: Appointment[]) => {
    localStorage.setItem('adc_appointments', JSON.stringify(updated));
    setAppointments(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const patient = patients.find(p => p.id === formData.patientId);
    if (!patient) {
      alert('Please select a patient');
      return;
    }

    if (editingAppt) {
      const updated = appointments.map(a =>
        a.id === editingAppt.id ? { ...formData, id: a.id, patientName: patient.name } as Appointment : a
      );
      saveAppointments(updated);
    } else {
      const newAppt: Appointment = {
        ...formData as Appointment,
        id: `APT-${Date.now()}`,
        patientName: patient.name
      };
      saveAppointments([...appointments, newAppt]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      patientName: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 30,
      type: 'Check-up',
      status: 'Scheduled',
      notes: ''
    });
    setEditingAppt(null);
    setShowForm(false);
  };

  const handleEdit = (appt: Appointment) => {
    setFormData(appt);
    setEditingAppt(appt);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this appointment?')) {
      saveAppointments(appointments.filter(a => a.id !== id));
    }
  };

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    const updated = appointments.map(a =>
      a.id === id ? { ...a, status } : a
    );
    saveAppointments(updated);
  };

  const todayAppointments = appointments.filter(a => a.date === selectedDate);
  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = Math.floor((9 * 60 + i * 30) / 60);
    const minute = (9 * 60 + i * 30) % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-8 h-8 text-blue-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div className="text-sm text-gray-600">
            {todayAppointments.length} appointments
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Appointment
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {editingAppt ? 'Edit Appointment' : 'New Appointment'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Patient *</label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Patient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time *</label>
                  <select
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (min)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Check-up</option>
                    <option>Cleaning</option>
                    <option>Filling</option>
                    <option>Root Canal</option>
                    <option>Extraction</option>
                    <option>Crown/Bridge</option>
                    <option>Emergency</option>
                    <option>Follow-up</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Any special requirements or notes..."
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
                  {editingAppt ? 'Update' : 'Schedule'} Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {todayAppointments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No appointments scheduled for this date
            </div>
          ) : (
            todayAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(appt => (
                <div key={appt.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-2 h-16 rounded mr-4 \${
                      appt.status === 'Completed' ? 'bg-green-500' :
                      appt.status === 'Cancelled' ? 'bg-red-500' :
                      appt.status === 'No-Show' ? 'bg-gray-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center text-lg font-semibold">
                          <Clock className="w-5 h-5 mr-2 text-gray-400" />
                          {appt.time}
                        </div>
                        <div className="text-sm text-gray-600">({appt.duration} min)</div>
                        <div className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {appt.type}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm \${
                          appt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          appt.status === 'No-Show' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {appt.status}
                        </div>
                      </div>
                      <div className="flex items-center text-gray-900">
                        <User className="w-4 h-4 mr-2" />
                        <span className="font-medium">{appt.patientName}</span>
                      </div>
                      {appt.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          {appt.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appt.status === 'Scheduled' && (
                      <button
                        onClick={() => handleStatusChange(appt.id, 'Completed')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Mark as Completed"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(appt)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(appt.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
