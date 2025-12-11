# Abdullah Dental Care - Clinic Management System

## Overview
Complete dental clinic management system for Abdullah Dental Care, PMC: 7071-D, Hayatabad, Peshawar, Pakistan.

## Features
- ✅ Patient Management
- ✅ Appointment Scheduling
- ✅ Treatment Catalog
- ✅ Billing System (with JazzCash/EasyPaisa)
- ✅ Prescription System (35+ conditions)
- ✅ Lab Work Tracking (5 Peshawar labs)
- ✅ Inventory Management
- ✅ Expense Tracking
- ✅ Business Intelligence Dashboard
- ✅ Google Sheets Sync

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Storage**: Local Storage (browser-based)
- **Deployment**: Vercel

## Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd adc-project
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for Production
```bash
npm run build
npm start
```

## Deployment to Vercel

### Method 1: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

### Method 2: GitHub Integration
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy automatically

## Project Structure
```
adc-project/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard
│   └── globals.css         # Global styles
├── components/
│   ├── PatientManagement.tsx
│   ├── AppointmentScheduler.tsx
│   ├── TreatmentCatalog.tsx
│   ├── BillingSystem.tsx
│   ├── PrescriptionSystem.tsx
│   ├── LabWorkTracking.tsx
│   ├── InventoryManagement.tsx
│   ├── ExpenseTracking.tsx
│   ├── BusinessIntelligence.tsx
│   └── GoogleSheetsSync.tsx
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## Data Storage
- All data stored in browser LocalStorage
- Keys: `adc_patients`, `adc_appointments`, `adc_treatments`, `adc_billing`, etc.
- Use Google Sheets Sync for backup and multi-device access

## Default Credentials
- Dentist: Dr. Ahmed (PMC: 7071-D)
- Assistant: Naveed
- Clinic: Abdullah Dental Care, Hayatabad, Peshawar

## Customization

### Update Clinic Info
Edit `app/page.tsx` lines 120-123:
```typescript
<h1 className="text-2xl font-bold mb-2">Abdullah Dental Care</h1>
<p className="text-sm text-blue-200">PMC: 7071-D</p>
<p className="text-xs text-blue-300">Hayatabad, Peshawar</p>
```

### Update Colors
Edit `tailwind.config.js` to change theme colors.

### Add Treatments
Use the Treatment Catalog module to add/edit treatments.

### Configure Labs
Edit `LabWorkTracking.tsx` to add/remove labs.

## Browser Requirements
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- LocalStorage enabled
- Minimum 1280x720 resolution

## Support
For issues or questions:
- Email: [your-email]
- Phone: [your-phone]

## License
Proprietary - Abdullah Dental Care

## Version
2.0.0 - Complete System (December 2025)
