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
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
    loadDashboardStats();
  }, []);

  const loadDashboardStats = () => {
    if (typeof window === 'undefined') return;
    
    try {
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
    } catch (error) {
      console.error('Error loading stats:', error);
    }
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

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-blue-900 text-white overflow-hidden flex-shrink-0`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">Abdullah Dental Care</h1>
          <p className="text-sm text-blue-200">PMC: 7071-D</p>
          <p className="text-xs text-blue-300">Hayatabad, Peshawar</p>
        </div>
        
        <nav className="mt-6 overflow-y-auto">
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
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h2 className="ml-4 text-lg md:text-xl font-semibold text-gray-800 truncate">
                {menuItems.find(m => m.id === activeModule)?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="text-xs md:text-sm text-gray-600 flex-shrink-0">
              Dr. Ahmed
            </div>
          </div>
        </header>

        {/* Module Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeModule === 'dashboard' && (
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Dashboard Overview</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Total Patients</p>
                      <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats.totalPatients}</p>
                    </div>
                    <Users className="w-8 h-8 md:w-12 md:h-12 text-blue-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Today&apos;s Appointments</p>
                      <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.todayAppointments}</p>
                    </div>
                    <Calendar className="w-8 h-8 md:w-12 md:h-12 text-green-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Pending Lab Work</p>
                      <p className="text-2xl md:text-3xl font-bold text-orange-600">{stats.pendingLabWork}</p>
                    </div>
                    <Beaker className="w-8 h-8 md:w-12 md:h-12 text-orange-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Monthly Revenue</p>
                      <p className="text-lg md:text-2xl font-bold text-purple-600">
                        Rs. {stats.monthlyRevenue.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 md:w-12 md:h-12 text-purple-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Low Stock Items</p>
                      <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.lowStockItems}</p>
                    </div>
                    <Package className="w-8 h-8 md:w-12 md:h-12 text-red-600 opacity-20" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <h4 className="text-base md:text-lg font-semibold mb-4">Quick Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <button
                    onClick={() => setActiveModule('patients')}
                    className="p-3 md:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs md:text-sm font-medium">Add Patient</p>
                  </button>
                  <button
                    onClick={() => setActiveModule('appointments')}
                    className="p-3 md:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Calendar className="w-6 h-6 md:w-8 md:h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-xs md:text-sm font-medium">Schedule</p>
                  </button>
                  <button
                    onClick={() => setActiveModule('billing')}
                    className="p-3 md:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs md:text-sm font-medium">New Bill</p>
                  </button>
                  <button
                    onClick={() => setActiveModule('prescriptions')}
                    className="p-3 md:p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <FileText className="w-6 h-6 md:w-8 md:h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-xs md:text-sm font-medium">Prescribe</p>
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
