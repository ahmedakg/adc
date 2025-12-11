'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Printer, AlertCircle, Search } from 'lucide-react';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  diagnosis: string;
  medications: Medication[];
  date: string;
  doctorName: string;
  pmcNumber: string;
  warnings: string[];
  notes: string;
}

const DENTAL_CONDITIONS = [
  { id: 'caries', name: 'Dental Caries', tier: 'basic' },
  { id: 'gingivitis', name: 'Gingivitis', tier: 'basic' },
  { id: 'periodontitis', name: 'Periodontitis', tier: 'standard' },
  { id: 'pulpitis', name: 'Pulpitis (Acute)', tier: 'standard' },
  { id: 'abscess', name: 'Dental Abscess', tier: 'complex' },
  { id: 'drySocket', name: 'Dry Socket (Alveolar Osteitis)', tier: 'standard' },
  { id: 'toothache', name: 'Toothache', tier: 'basic' },
  { id: 'sensitivity', name: 'Tooth Sensitivity', tier: 'basic' },
  { id: 'postExtraction', name: 'Post-Extraction Care', tier: 'basic' },
  { id: 'postRCT', name: 'Post-RCT Care', tier: 'standard' },
  { id: 'aphthous', name: 'Aphthous Ulcers', tier: 'basic' },
  { id: 'candidiasis', name: 'Oral Candidiasis', tier: 'standard' },
  { id: 'herpes', name: 'Herpes Labialis', tier: 'standard' },
  { id: 'tmj', name: 'TMJ Disorder', tier: 'complex' },
  { id: 'bruxism', name: 'Bruxism', tier: 'standard' },
  { id: 'pericoronitis', name: 'Pericoronitis', tier: 'standard' },
  { id: 'cellulitis', name: 'Facial Cellulitis', tier: 'complex' },
  { id: 'impacted', name: 'Impacted Wisdom Tooth', tier: 'standard' },
  { id: 'trauma', name: 'Dental Trauma', tier: 'complex' },
  { id: 'xerostomia', name: 'Xerostomia (Dry Mouth)', tier: 'basic' }
];

const MEDICATION_DATABASE: Record<string, Medication[]> = {
  caries: [
    { name: 'Ibuprofen 400mg', dosage: '400mg', frequency: 'TID', duration: '3 days', instructions: 'Take after meals' },
    { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'TID', duration: '3 days', instructions: 'Take with water' }
  ],
  gingivitis: [
    { name: 'Chlorhexidine 0.2% Mouthwash', dosage: '10ml', frequency: 'BID', duration: '7 days', instructions: 'Rinse for 30 seconds, do not swallow' },
    { name: 'Metronidazole 400mg', dosage: '400mg', frequency: 'TID', duration: '5 days', instructions: 'Take after meals' }
  ],
  periodontitis: [
    { name: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'TID', duration: '7 days', instructions: 'Complete full course' },
    { name: 'Metronidazole 400mg', dosage: '400mg', frequency: 'TID', duration: '7 days', instructions: 'Avoid alcohol' },
    { name: 'Ibuprofen 400mg', dosage: '400mg', frequency: 'TID', duration: '5 days', instructions: 'Take with food' },
    { name: 'Chlorhexidine 0.2% Mouthwash', dosage: '10ml', frequency: 'BID', duration: '14 days', instructions: 'Use after brushing' }
  ],
  pulpitis: [
    { name: 'Ibuprofen 400mg', dosage: '400mg', frequency: 'QID', duration: '5 days', instructions: 'Take every 6 hours with food' },
    { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'QID', duration: '5 days', instructions: 'Can alternate with ibuprofen' }
  ],
  abscess: [
    { name: 'Amoxicillin 500mg + Clavulanic Acid 125mg', dosage: '625mg', frequency: 'TID', duration: '7 days', instructions: 'Complete full course' },
    { name: 'Metronidazole 400mg', dosage: '400mg', frequency: 'TID', duration: '7 days', instructions: 'Avoid alcohol completely' },
    { name: 'Ibuprofen 600mg', dosage: '600mg', frequency: 'TID', duration: '5 days', instructions: 'Take with food' },
    { name: 'Chlorhexidine 0.2% Mouthwash', dosage: '10ml', frequency: 'TID', duration: '7 days', instructions: 'Rinse gently' }
  ],
  drySocket: [
    { name: 'Ibuprofen 600mg', dosage: '600mg', frequency: 'TID', duration: '5 days', instructions: 'Take with meals' },
    { name: 'Tramadol 50mg', dosage: '50mg', frequency: 'BID', duration: '3 days', instructions: 'If severe pain persists' },
    { name: 'Chlorhexidine 0.12% Gel', dosage: 'Apply', frequency: 'TID', duration: '7 days', instructions: 'Apply to socket after meals' }
  ],
  postExtraction: [
    { name: 'Ibuprofen 400mg', dosage: '400mg', frequency: 'TID', duration: '3 days', instructions: 'Start immediately after extraction' },
    { name: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'TID', duration: '5 days', instructions: 'If high infection risk' },
    { name: 'Chlorhexidine 0.2% Mouthwash', dosage: '10ml', frequency: 'BID', duration: '7 days', instructions: 'Start 24 hours post-extraction' }
  ],
  postRCT: [
    { name: 'Ibuprofen 400mg', dosage: '400mg', frequency: 'TID', duration: '3 days', instructions: 'For post-operative discomfort' },
    { name: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'TID', duration: '5 days', instructions: 'If periapical infection present' }
  ],
  aphthous: [
    { name: 'Triamcinolone Acetonide 0.1% Oral Paste', dosage: 'Apply', frequency: 'TID', duration: '5 days', instructions: 'Apply thin layer to ulcers' },
    { name: 'Benzydamine HCl 0.15% Mouthwash', dosage: '15ml', frequency: 'TID', duration: '7 days', instructions: 'Rinse and spit' },
    { name: 'Vitamin B Complex', dosage: '1 tab', frequency: 'OD', duration: '30 days', instructions: 'Take after breakfast' }
  ],
  candidiasis: [
    { name: 'Fluconazole 150mg', dosage: '150mg', frequency: 'Once weekly', duration: '2 weeks', instructions: 'Take on same day each week' },
    { name: 'Nystatin Oral Suspension', dosage: '5ml', frequency: 'QID', duration: '14 days', instructions: 'Swish and swallow' },
    { name: 'Chlorhexidine 0.2% Mouthwash', dosage: '10ml', frequency: 'BID', duration: '14 days', instructions: 'For oral hygiene' }
  ],
  herpes: [
    { name: 'Acyclovir 400mg', dosage: '400mg', frequency: 'TID', duration: '5 days', instructions: 'Start at first sign of outbreak' },
    { name: 'Acyclovir 5% Cream', dosage: 'Apply', frequency: '5 times/day', duration: '5 days', instructions: 'Apply to lesions' }
  ],
  tmj: [
    { name: 'Ibuprofen 400mg', dosage: '400mg', frequency: 'TID', duration: '7 days', instructions: 'Take with food' },
    { name: 'Diazepam 5mg', dosage: '5mg', frequency: 'At bedtime', duration: '5 days', instructions: 'For muscle relaxation' },
    { name: 'Hot/Cold Compress', dosage: 'Apply', frequency: 'TID', duration: '14 days', instructions: '15 min each session' }
  ],
  pericoronitis: [
    { name: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'TID', duration: '7 days', instructions: 'Complete course' },
    { name: 'Metronidazole 400mg', dosage: '400mg', frequency: 'TID', duration: '5 days', instructions: 'Avoid alcohol' },
    { name: 'Ibuprofen 400mg', dosage: '400mg', frequency: 'TID', duration: '5 days', instructions: 'For pain and swelling' },
    { name: 'Chlorhexidine 0.2% Mouthwash', dosage: '10ml', frequency: 'TID', duration: '7 days', instructions: 'Gentle rinsing' }
  ],
  cellulitis: [
    { name: 'Amoxicillin 875mg + Clavulanic Acid 125mg', dosage: '1000mg', frequency: 'BID', duration: '10 days', instructions: 'Urgent - complete course' },
    { name: 'Metronidazole 500mg', dosage: '500mg', frequency: 'TID', duration: '7 days', instructions: 'Strict no alcohol' },
    { name: 'Ibuprofen 600mg', dosage: '600mg', frequency: 'TID', duration: '7 days', instructions: 'For inflammation' }
  ]
};

export default function PrescriptionSystem() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [customMedication, setCustomMedication] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: 'TID',
    duration: '5 days',
    instructions: ''
  });
  const [notes, setNotes] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPrescriptions(JSON.parse(localStorage.getItem('adc_prescriptions') || '[]'));
    setPatients(JSON.parse(localStorage.getItem('adc_patients') || '[]'));
  };

  const handleDiagnosisSelect = (conditionId: string) => {
    setDiagnosis(conditionId);
    const meds = MEDICATION_DATABASE[conditionId] || [];
    setMedications([...meds]);
    generateWarnings(conditionId);
  };

  const generateWarnings = (conditionId: string) => {
    const patient = patients.find(p => p.id === selectedPatient);
    const newWarnings: string[] = [];

    if (patient) {
      // Check pregnancy
      if (patient.gender === 'Female' && patient.medicalHistory?.toLowerCase().includes('pregnant')) {
        newWarnings.push('⚠️ PREGNANCY: Avoid Metronidazole in first trimester. Consult regarding Ibuprofen.');
      }

      // Check allergies
      if (patient.medicalHistory?.toLowerCase().includes('penicillin allergy')) {
        newWarnings.push('⚠️ ALLERGY: Patient allergic to Penicillin. Avoid Amoxicillin. Use Azithromycin instead.');
      }

      // Age warnings
      if (patient.age < 12) {
        newWarnings.push('⚠️ PEDIATRIC: Adjust dosages for child weight. Avoid Metronidazole under 12 years.');
      }

      if (patient.age > 65) {
        newWarnings.push('⚠️ ELDERLY: Consider reduced dosages. Monitor renal function.');
      }
    }

    // Condition-specific warnings
    if (conditionId === 'abscess' || conditionId === 'cellulitis') {
      newWarnings.push('⚠️ SEVERE INFECTION: Monitor patient closely. Consider hospitalization if spreading.');
    }

    if (conditionId === 'tmj') {
      newWarnings.push('⚠️ CONTROLLED DRUG: Diazepam is habit-forming. Short-term use only.');
    }

    setWarnings(newWarnings);
  };

  const addCustomMedication = () => {
    if (customMedication.name && customMedication.dosage) {
      setMedications([...medications, { ...customMedication }]);
      setCustomMedication({
        name: '',
        dosage: '',
        frequency: 'TID',
        duration: '5 days',
        instructions: ''
      });
    }
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient || medications.length === 0) {
      alert('Please select patient and add at least one medication');
      return;
    }

    const condition = DENTAL_CONDITIONS.find(c => c.id === diagnosis);
    const newPrescription: Prescription = {
      id: `RX-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      diagnosis: condition?.name || 'Custom Diagnosis',
      medications,
      date: new Date().toISOString(),
      doctorName: 'Dr. Ahmed',
      pmcNumber: '7071-D',
      warnings,
      notes
    };

    const updated = [newPrescription, ...prescriptions];
    localStorage.setItem('adc_prescriptions', JSON.stringify(updated));
    setPrescriptions(updated);

    await generatePrescriptionPDF(newPrescription, patient);
    resetForm();
  };

  const generatePrescriptionPDF = async (rx: Prescription, patient: any) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF() as any;

    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPTION', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Abdullah Dental Care', 105, 28, { align: 'center' });
    doc.text('PMC: 7071-D | Hayatabad, Peshawar', 105, 34, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Doctor info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Dr. Ahmed', 20, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('BDS, MPH', 20, 55);
    doc.text('PMC Registration: 7071-D', 20, 60);
    doc.text('Phone: 091-5844533', 20, 65);

    // Date
    doc.text(`Date: ${new Date(rx.date).toLocaleDateString('en-PK')}`, 160, 50);
    doc.text(`Rx #: ${rx.id}`, 160, 55);

    // Patient info box
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 75, 170, 30);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PATIENT INFORMATION', 25, 82);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Name: ${patient.name}`, 25, 90);
    doc.text(`Age: ${patient.age} years`, 25, 95);
    doc.text(`Gender: ${patient.gender}`, 25, 100);
    doc.text(`Patient ID: ${patient.id}`, 120, 90);
    doc.text(`Phone: ${patient.phone}`, 120, 95);

    // Diagnosis
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DIAGNOSIS:', 20, 115);
    doc.setFont('helvetica', 'normal');
    doc.text(rx.diagnosis, 50, 115);

    // Rx Symbol
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Rx', 20, 130);

    // Medications
    let yPos = 140;
    doc.setFontSize(10);
    rx.medications.forEach((med, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${med.name}`, 25, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`   Dosage: ${med.dosage}`, 25, yPos);
      doc.text(`Frequency: ${med.frequency}`, 80, yPos);
      doc.text(`Duration: ${med.duration}`, 135, yPos);
      yPos += 6;
      
      if (med.instructions) {
        doc.text(`   Instructions: ${med.instructions}`, 25, yPos);
        yPos += 6;
      }
      
      yPos += 3;

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });

    // Warnings
    if (rx.warnings.length > 0) {
      yPos += 5;
      doc.setFillColor(255, 243, 205);
      doc.rect(20, yPos - 5, 170, 6 * rx.warnings.length + 5, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(156, 71, 0);
      doc.text('⚠ WARNINGS:', 25, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      rx.warnings.forEach(warning => {
        doc.text(warning, 25, yPos);
        yPos += 5;
      });
      doc.setTextColor(0, 0, 0);
    }

    // Notes
    if (rx.notes) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Additional Notes:', 20, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(rx.notes, 20, yPos, { maxWidth: 170 });
    }

    // Signature
    doc.setFontSize(9);
    doc.text('_______________________', 140, 270);
    doc.text("Dr. Ahmed's Signature", 145, 276);
    doc.text('PMC: 7071-D', 155, 281);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(128, 128, 128);
    doc.text('This is a computer-generated prescription from Abdullah Dental Care', 105, 290, { align: 'center' });

    doc.save(`Prescription-${rx.id}.pdf`);
  };

  const resetForm = () => {
    setSelectedPatient('');
    setDiagnosis('');
    setMedications([]);
    setNotes('');
    setWarnings([]);
    setShowForm(false);
  };

  const filteredPrescriptions = prescriptions.filter(rx =>
    rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="ml-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Prescription
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create Prescription</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Patient *</label>
                  <select
                    required
                    value={selectedPatient}
                    onChange={(e) => {
                      setSelectedPatient(e.target.value);
                      setWarnings([]);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.age}y, {p.gender})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Diagnosis *</label>
                  <select
                    required
                    value={diagnosis}
                    onChange={(e) => handleDiagnosisSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select condition...</option>
                    {DENTAL_CONDITIONS.map(condition => (
                      <option key={condition.id} value={condition.id}>
                        {condition.name} ({condition.tier})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {warnings.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-800 mb-2">Safety Warnings</h4>
                      {warnings.map((warning, i) => (
                        <p key={i} className="text-sm text-yellow-700 mb-1">{warning}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Medications</h4>
                <div className="space-y-3 mb-4">
                  {medications.map((med, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{med.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {med.dosage} | {med.frequency} | {med.duration}
                          </div>
                          {med.instructions && (
                            <div className="text-sm text-gray-500 mt-1 italic">
                              {med.instructions}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="ml-4 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h5 className="text-sm font-medium mb-3">Add Custom Medication</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Medication name"
                      value={customMedication.name}
                      onChange={(e) => setCustomMedication({...customMedication, name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={customMedication.dosage}
                      onChange={(e) => setCustomMedication({...customMedication, dosage: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <select
                      value={customMedication.frequency}
                      onChange={(e) => setCustomMedication({...customMedication, frequency: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="OD">Once Daily (OD)</option>
                      <option value="BID">Twice Daily (BID)</option>
                      <option value="TID">Three times (TID)</option>
                      <option value="QID">Four times (QID)</option>
                      <option value="PRN">As needed (PRN)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Duration (e.g., 5 days)"
                      value={customMedication.duration}
                      onChange={(e) => setCustomMedication({...customMedication, duration: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={customMedication.instructions}
                      onChange={(e) => setCustomMedication({...customMedication, instructions: e.target.value})}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addCustomMedication}
                    className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                  >
                    Add Medication
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Additional Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Any additional instructions for the patient..."
                />
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
                  Generate Prescription
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rx #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medications</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPrescriptions.map(rx => (
              <tr key={rx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{rx.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{rx.patientName}</td>
                <td className="px-6 py-4 text-sm">{rx.diagnosis}</td>
                <td className="px-6 py-4 text-sm">{rx.medications.length} medications</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(rx.date).toLocaleDateString('en-PK')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => generatePrescriptionPDF(rx, patients.find(p => p.id === rx.patientId))}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Printer className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPrescriptions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No prescriptions found
          </div>
        )}
      </div>
    </div>
  );
}
