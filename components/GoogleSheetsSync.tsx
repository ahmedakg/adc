'use client';

import { useState } from 'react';
import { Database, Download, Upload, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function GoogleSheetsSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(
    localStorage.getItem('adc_last_sync')
  );
  const [syncStatus, setSyncStatus] = useState<'success' | 'error' | null>(null);

  const exportToJSON = () => {
    const data = {
      patients: JSON.parse(localStorage.getItem('adc_patients') || '[]'),
      appointments: JSON.parse(localStorage.getItem('adc_appointments') || '[]'),
      treatments: JSON.parse(localStorage.getItem('adc_treatments') || '[]'),
      billing: JSON.parse(localStorage.getItem('adc_billing') || '[]'),
      prescriptions: JSON.parse(localStorage.getItem('adc_prescriptions') || '[]'),
      labwork: JSON.parse(localStorage.getItem('adc_labwork') || '[]'),
      inventory: JSON.parse(localStorage.getItem('adc_inventory') || '[]'),
      expenses: JSON.parse(localStorage.getItem('adc_expenses') || '[]'),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ADC-Backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSyncStatus('success');
    setLastSync(new Date().toISOString());
    localStorage.setItem('adc_last_sync', new Date().toISOString());
  };

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (confirm('This will replace all existing data. Continue?')) {
          Object.entries(data).forEach(([key, value]) => {
            if (key !== 'exportDate') {
              localStorage.setItem(`adc_${key}`, JSON.stringify(value));
            }
          });

          setSyncStatus('success');
          setLastSync(new Date().toISOString());
          localStorage.setItem('adc_last_sync', new Date().toISOString());
          alert('Data imported successfully! Please refresh the page.');
        }
      } catch (error) {
        setSyncStatus('error');
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const manualSync = async () => {
    setSyncing(true);
    setSyncStatus(null);

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));

    exportToJSON();
    setSyncing(false);
  };

  const dataStats = {
    patients: JSON.parse(localStorage.getItem('adc_patients') || '[]').length,
    appointments: JSON.parse(localStorage.getItem('adc_appointments') || '[]').length,
    billing: JSON.parse(localStorage.getItem('adc_billing') || '[]').length,
    prescriptions: JSON.parse(localStorage.getItem('adc_prescriptions') || '[]').length,
    labwork: JSON.parse(localStorage.getItem('adc_labwork') || '[]').length,
    inventory: JSON.parse(localStorage.getItem('adc_inventory') || '[]').length,
    expenses: JSON.parse(localStorage.getItem('adc_expenses') || '[]').length
  };

  const totalRecords = Object.values(dataStats).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Data Backup & Sync</h2>
            <p className="text-gray-600">
              Export and import your clinic data for backup or multi-device access
            </p>
          </div>
          <Database className="w-16 h-16 text-blue-600 opacity-20" />
        </div>

        {/* Sync Status */}
        {syncStatus && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            syncStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {syncStatus === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Data synced successfully!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 mr-3" />
                <span>Sync failed. Please try again.</span>
              </>
            )}
          </div>
        )}

        {/* Last Sync Info */}
        {lastSync && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Last Backup:</strong> {new Date(lastSync).toLocaleString('en-PK')}
            </div>
          </div>
        )}

        {/* Data Statistics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Current Data Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dataStats.patients}</div>
              <div className="text-sm text-gray-600">Patients</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{dataStats.appointments}</div>
              <div className="text-sm text-gray-600">Appointments</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{dataStats.billing}</div>
              <div className="text-sm text-gray-600">Invoices</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{dataStats.prescriptions}</div>
              <div className="text-sm text-gray-600">Prescriptions</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{dataStats.labwork}</div>
              <div className="text-sm text-gray-600">Lab Orders</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{dataStats.inventory}</div>
              <div className="text-sm text-gray-600">Inventory Items</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{dataStats.expenses}</div>
              <div className="text-sm text-gray-600">Expenses</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{totalRecords}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
          </div>
        </div>

        {/* Sync Actions */}
        <div className="space-y-4">
          <div className="border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Download className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="text-lg font-semibold">Export Data (Backup)</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Download all your clinic data as a JSON file. Use this for backup or to transfer data to another device.
                </p>
                <button
                  onClick={exportToJSON}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </button>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Upload className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="text-lg font-semibold">Import Data (Restore)</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Restore your clinic data from a previously exported JSON file. 
                  <strong className="text-red-600"> Warning: This will replace all current data!</strong>
                </p>
                <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer w-fit">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={importFromJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <RefreshCw className="w-5 h-5 text-purple-600 mr-2" />
                  <h4 className="text-lg font-semibold">Quick Backup</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Create a quick backup of your current data. Recommended to do this daily.
                </p>
                <button
                  onClick={manualSync}
                  disabled={syncing}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Creating Backup...' : 'Create Backup Now'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-3">💡 Best Practices</h4>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li>• Create daily backups of your data</li>
            <li>• Store backup files in multiple locations (Google Drive, USB drive, etc.)</li>
            <li>• Name backup files with the date for easy identification</li>
            <li>• Test your backups occasionally by importing them on a test device</li>
            <li>• Keep at least 3 recent backups for safety</li>
          </ul>
        </div>

        {/* Google Sheets Instructions */}
        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3">📊 Google Sheets Integration</h4>
          <p className="text-sm text-blue-800 mb-3">
            To use Google Sheets for multi-device sync:
          </p>
          <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
            <li>Export your data using the button above</li>
            <li>Upload the JSON file to Google Drive</li>
            <li>Use Google Apps Script to parse and display the data in Sheets</li>
            <li>On other devices, download the JSON and import it</li>
          </ol>
          <p className="text-xs text-blue-600 mt-3">
            Note: Automatic Google Sheets sync requires Google Apps Script setup. 
            Contact support for detailed instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
