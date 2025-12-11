'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Calendar, FileText, DollarSign, 
  Beaker, Package, TrendingUp, Database,
  Menu, X, Home as HomeIcon
} from 'lucide-react';
import PatientManagement from '@/components/PatientManagement';
import AppointmentScheduler from '@/components/AppointmentScheduler';
import TreatmentCatalog from '@/components/TreatmentCatalog';
import BillingSystem from '@/components/BillingSystem';
import PrescriptionSystem from '@/components/PrescriptionSystem';
import LabWorkTracking from '@/components/LabWorkTracking';
import InventoryManagement from '@/components/InventoryManagement';
import ExpenseTracking from '@/components/ExpenseTracking';
import BusinessIntelligence from '@/components/BusinessIntelligence';
import GoogleSheetsSync from '@/components/GoogleSheetsSync';

type ModuleType = 'dashboard' | 'patients' | 'appointments' | 'treatments' | 'billing' | 
  'prescriptions' | 'labwork' | 'inventory' | 'expenses' | 'reports' | 'sync';

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingLabWork: 0,
    monthlyRevenue: 0,
    lowStockItems: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = () => {
    const patients = JSON.parse(localStorage.getItem('adc_patients') || '[]');
    const appointments = JSON.parse(localStorage.getItem('adc_appointments') || '[]');
    const labWork = JSON.parse(localStorage.getItem('adc_labwork') || '[]');
    const billing = JSON.parse(localStorage.getItem('adc_billing') || '[]');
    const inventory = JSON.parse(localStorage.getItem('adc_inventory') || '[]');

    const today = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter((a: any) => a.date === today);
    const pendingLab = labWork.filter((l: any) => l.status !== 'Completed');
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyBilling = billing.filter((b: any) => {
      const billDate = new Date(b.date);
      return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
    });
    const revenue = monthlyBilling.reduce((sum: number, b: any) => sum + (b.total || 0), 0);

    const lowStock = inventory.filter((i: any) => i.quantity <= i.reorderLevel);

    setStats({
      totalPatients: patients.length,
      todayAppointments: todayAppts.length,
      pendingLabWork: pendingLab.length,
      monthlyRevenue: revenue,
      lowStockItems: lowStock.length
    });
  };

  const menuItems = [
    { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' },
    { id: 'patients', icon: Users, label: 'Patients' },
    { id: 'appointments', icon: Calendar, label: 'Appointments' },
    { id: 'treatments', icon: FileText, label: 'Treatments' },
    { id: 'billing', icon: DollarSign, label: 'Billing' },
    { id: 'prescriptions', icon: FileText, label: 'Prescriptions' },
    { id: 'labwork', icon: Beaker, label: 'Lab Work' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'expenses', icon: TrendingUp, label: 'Expenses' },
    { id: 'reports', icon: TrendingUp, label: 'Reports' },
    { id: 'sync', icon: Database, label: 'Sync Data' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-blue-900 text-white overflow-hidden`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">Abdullah Dental Care</h1>
          <p className="text-sm text-blue-200">PMC: 7071-D</p>
          <p className="text-xs text-blue-300">Hayatabad, Peshawar</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id as ModuleType)}
                className={`w-full flex items-center px-6 py-3 hover:bg-blue-800 transition-colors ${
                  activeModule === item.id ? 'bg-blue-800 border-l-4 border-white' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h2 className="ml-4 text-xl font-semibold text-gray-800">
                {menuItems.find(m => m.id === activeModule)?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="text-sm text-gray-600">
              Dr. Ahmed | {new Date().toLocaleDateString('en-PK')}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeModule === 'dashboard' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Dashboard Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Patients</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.totalPatients}</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Today's Appointments</p>
                      <p className="text-3xl font-bold text-green-600">{stats.todayAppointments}</p>
                    </div>
                    <Calendar className="w-12 h-12 text-green-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Lab Work</p>
                      <p className="text-3xl font-bold text-orange-600">{stats.pendingLabWork}</p>
                    </div>
                    <Beaker className="w-12 h-12 text-orange-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-purple-600">
                        Rs. {stats.monthlyRevenue.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-12 h-12 text-purple-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Low Stock Items</p>
                      <p className="text-3xl font-bold text-red-600">{stats.lowStockItems}</p>
                    </div>
                    <Package className="w-12 h-12 text-red-600 opacity-20" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveModule('patients')}
                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Add Patient</p>
                  </button>
                  <button
                    onClick={() => setActiveModule('appointments')}
                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Schedule</p>
                  </button>
                  <button
                    onClick={() => setActiveModule('billing')}
                    className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">New Bill</p>
                  </button>
                  <button
                    onClick={() => setActiveModule('prescriptions')}
                    className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Prescribe</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'patients' && <PatientManagement />}
          {activeModule === 'appointments' && <AppointmentScheduler />}
          {activeModule === 'treatments' && <TreatmentCatalog />}
          {activeModule === 'billing' && <BillingSystem />}
          {activeModule === 'prescriptions' && <PrescriptionSystem />}
          {activeModule === 'labwork' && <LabWorkTracking />}
          {activeModule === 'inventory' && <InventoryManagement />}
          {activeModule === 'expenses' && <ExpenseTracking />}
          {activeModule === 'reports' && <BusinessIntelligence />}
          {activeModule === 'sync' && <GoogleSheetsSync />}
        </main>
      </div>
    </div>
  );
}
