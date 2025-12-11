'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, DollarSign, Award, Activity } from 'lucide-react';

export default function BusinessIntelligence() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    patients: 0,
    appointments: 0,
    treatmentsCompleted: 0,
    avgTransactionValue: 0,
    topTreatments: [] as Array<{name: string; count: number; revenue: number}>,
    monthlyTrend: [] as Array<{month: string; revenue: number; expenses: number; profit: number}>,
    profitMargin: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = () => {
    const patients = JSON.parse(localStorage.getItem('adc_patients') || '[]');
    const appointments = JSON.parse(localStorage.getItem('adc_appointments') || '[]');
    const billing = JSON.parse(localStorage.getItem('adc_billing') || '[]');
    const expenses = JSON.parse(localStorage.getItem('adc_expenses') || '[]');

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'quarter') {
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStart, 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Filter data by period
    const periodBilling = billing.filter((b: any) => new Date(b.date) >= startDate);
    const periodExpenses = expenses.filter((e: any) => new Date(e.date) >= startDate);
    const periodAppointments = appointments.filter((a: any) => new Date(a.date) >= startDate);

    // Calculate metrics
    const totalRevenue = periodBilling.reduce((sum: number, b: any) => sum + (b.total || 0), 0);
    const totalExpenses = periodExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    const totalProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const completedAppointments = periodAppointments.filter((a: any) => a.status === 'Completed');
    const avgTransactionValue = periodBilling.length > 0 ? totalRevenue / periodBilling.length : 0;

    // Top treatments
    const treatmentCounts: Record<string, {count: number; revenue: number}> = {};
    periodBilling.forEach((bill: any) => {
      bill.items?.forEach((item: any) => {
        if (!treatmentCounts[item.treatmentName]) {
          treatmentCounts[item.treatmentName] = { count: 0, revenue: 0 };
        }
        treatmentCounts[item.treatmentName].count += item.quantity;
        treatmentCounts[item.treatmentName].revenue += item.total;
      });
    });

    const topTreatments = Object.entries(treatmentCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthBilling = billing.filter((b: any) => {
        const bDate = new Date(b.date);
        return bDate >= monthStart && bDate <= monthEnd;
      });

      const monthExpenses = expenses.filter((e: any) => {
        const eDate = new Date(e.date);
        return eDate >= monthStart && eDate <= monthEnd;
      });

      const revenue = monthBilling.reduce((sum: number, b: any) => sum + (b.total || 0), 0);
      const exp = monthExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      monthlyTrend.push({
        month: date.toLocaleDateString('en-PK', { month: 'short', year: '2-digit' }),
        revenue,
        expenses: exp,
        profit: revenue - exp
      });
    }

    setData({
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalProfit,
      patients: patients.length,
      appointments: periodAppointments.length,
      treatmentsCompleted: completedAppointments.length,
      avgTransactionValue,
      topTreatments,
      monthlyTrend,
      profitMargin
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Business Intelligence</h2>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg capitalize ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Total Revenue</div>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <div className="text-3xl font-bold">Rs. {data.revenue.toLocaleString()}</div>
          <div className="text-sm opacity-75 mt-2">This {period}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Net Profit</div>
            <TrendingUp className="w-8 h-8 opacity-50" />
          </div>
          <div className="text-3xl font-bold">Rs. {data.profit.toLocaleString()}</div>
          <div className="text-sm opacity-75 mt-2">{data.profitMargin.toFixed(1)}% margin</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Avg. Transaction</div>
            <Award className="w-8 h-8 opacity-50" />
          </div>
          <div className="text-3xl font-bold">Rs. {Math.round(data.avgTransactionValue).toLocaleString()}</div>
          <div className="text-sm opacity-75 mt-2">Per patient visit</div>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Patients</div>
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.patients}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Appointments</div>
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.appointments}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Completed</div>
            <Activity className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.treatmentsCompleted}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Treatments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Treatments by Revenue</h3>
          <div className="space-y-4">
            {data.topTreatments.map((treatment, index) => (
              <div key={treatment.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">
                    {index + 1}. {treatment.name}
                  </span>
                  <span className="text-gray-600">
                    {treatment.count} × Rs. {Math.round(treatment.revenue / treatment.count).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(treatment.revenue / data.topTreatments[0].revenue) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-blue-600 min-w-[100px] text-right">
                    Rs. {treatment.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {data.topTreatments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No treatment data available</p>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">6-Month Financial Trend</h3>
          <div className="space-y-3">
            {data.monthlyTrend.map(month => {
              const maxValue = Math.max(...data.monthlyTrend.map(m => m.revenue));
              const revenuePercent = maxValue > 0 ? (month.revenue / maxValue) * 100 : 0;
              const profitPercent = maxValue > 0 ? Math.max(0, (month.profit / maxValue) * 100) : 0;

              return (
                <div key={month.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{month.month}</span>
                    <span className="text-gray-600">
                      Rev: Rs. {month.revenue.toLocaleString()} | 
                      Profit: Rs. {month.profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <div
                      className="bg-green-500 h-6 rounded"
                      style={{ width: `${revenuePercent}%` }}
                      title={`Revenue: Rs. ${month.revenue.toLocaleString()}`}
                    />
                    <div
                      className="bg-blue-600 h-6 rounded"
                      style={{ width: `${profitPercent}%` }}
                      title={`Profit: Rs. ${month.profit.toLocaleString()}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded" />
              <span>Profit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {data.profitMargin > 30 && (
            <li>✓ Excellent profit margin of {data.profitMargin.toFixed(1)}% - well above industry average (20-25%)</li>
          )}
          {data.profitMargin < 15 && data.profitMargin > 0 && (
            <li>⚠ Profit margin of {data.profitMargin.toFixed(1)}% is below optimal - consider reviewing expenses</li>
          )}
          {data.avgTransactionValue > 5000 && (
            <li>✓ High average transaction value indicates successful upselling and comprehensive treatment plans</li>
          )}
          {data.topTreatments.length > 0 && (
            <li>✓ Top treatment: {data.topTreatments[0].name} generating Rs. {data.topTreatments[0].revenue.toLocaleString()}</li>
          )}
          {data.treatmentsCompleted > 0 && data.appointments > 0 && (
            <li>✓ Completion rate: {((data.treatmentsCompleted / data.appointments) * 100).toFixed(1)}% - {
              (data.treatmentsCompleted / data.appointments) > 0.8 ? 'Excellent!' : 'Good'
            }</li>
          )}
        </ul>
      </div>
    </div>
  );
}
