"use client"

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from '../../../api/axios';
import { useModal } from '../../../context/modalContext';
import DatePickerModal from './datePicker';

const dateRangeOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '365d', label: 'Last Year' },
];

export default function UsersReports() {
  const { showModal, hideModal } = useModal();
  const [filter, setFilter] = useState('totalUsers');
  const [timeRange, setTimeRange] = useState('7d');
  const [customDateRange, setCustomDateRange] = useState({ startDate: null, endDate: null });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [metrics, setMetrics] = useState({ totalUsers: 0, newUsers: 0, activeUsers: 0 });
  const [chartData, setChartData] = useState([]);
  const [growthPercentage, setGrowthPercentage] = useState(0);
  const [displayDateRange, setDisplayDateRange] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDataUsersCharts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const chartApiParams = new URLSearchParams();
      if (timeRange === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        chartApiParams.append('timeRange', 'custom');
        chartApiParams.append('startDate', new Date(customDateRange.startDate).toISOString());
        chartApiParams.append('endDate', new Date(customDateRange.endDate).toISOString());
      } else {
        chartApiParams.append('timeRange', timeRange);
      }

      let days = timeRange === 'custom' && customDateRange.startDate && customDateRange.endDate
        ? Math.ceil(Math.abs(new Date(customDateRange.endDate) - new Date(customDateRange.startDate)) / (1000 * 60 * 60 * 24))
        : parseInt(timeRange.replace('d', ''));

      const [userMetrics, chartResponse, prevUserMetrics] = await Promise.all([
        api.get(`/admin/user/metrics?days=${days}`),
        api.get(`/admin/user/chart-data?${chartApiParams.toString()}`),
        api.get(`/admin/user/metrics?days=${days * 2}`)
      ]);

      const currentMetrics = userMetrics.data;
      const previousNewUsers = prevUserMetrics.data.newUsers - currentMetrics.newUsers;

      setMetrics(currentMetrics);
      setChartData(chartResponse.data);

      if (previousNewUsers > 0) {
        const growth = ((currentMetrics.newUsers - previousNewUsers) / previousNewUsers) * 100;
        setGrowthPercentage(growth.toFixed(1));
      } else {
        setGrowthPercentage(currentMetrics.newUsers > 0 ? 100 : 0);
      }

      if (timeRange === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const start = new Date(customDateRange.startDate).toLocaleDateString('en-US', options);
        const end = new Date(customDateRange.endDate).toLocaleDateString('en-US', options);
        setDisplayDateRange(`${start} - ${end}`);
      } else {
        const selectedOption = dateRangeOptions.find(opt => opt.value === timeRange);
        setDisplayDateRange(selectedOption?.label || `Last ${days} days`);
      }
    } catch (error) {
      setError("Could not load user data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDataUsersCharts();
  }, [timeRange, customDateRange]);

  const handleCustomDateApply = (dates) => {
    setCustomDateRange(dates);
    setTimeRange('custom');
    hideModal();
  };

  const openDatePicker = () => {
    // Use showModal to open the DatePicker
    showModal(
      <DatePickerModal
        initialRange={customDateRange}
        onApply={handleCustomDateApply}
        onCancel={hideModal}
      />
    );
  };

  if (isLoading) return <div className="text-center main-text py-10">Loading user reports...</div>;
  if (error) return <div className="text-center status-error py-10">{error}</div>;

  return (
    <>
      <AnimatePresence>
        {isDatePickerOpen && (
          <DatePickerModal
            onApply={handleCustomDateApply}
            onCancel={() => hideModal()}
            initialRange={customDateRange}
          />
        )}
      </AnimatePresence>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="card-secondary p-6 rounded-lg">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium secondary-text">User Type</label>
                  <div className="mt-2 grid grid-cols-3 gap-2 p-1 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <button onClick={() => setFilter('totalUsers')} className={`px-3 py-1.5 text-sm rounded-md transition ${filter === 'totalUsers' ? 'button-primary' : 'main-text hover-interactive'}`}>Total</button>
                    <button onClick={() => setFilter('newUsers')} className={`px-3 py-1.5 text-sm rounded-md transition ${filter === 'newUsers' ? 'button-primary' : 'main-text hover-interactive'}`}>New</button>
                    <button onClick={() => setFilter('activeUsers')} className={`px-3 py-1.5 text-sm rounded-md transition ${filter === 'activeUsers' ? 'button-primary' : 'main-text hover-interactive'}`}>Active</button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium secondary-text">Date Range</label>
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={timeRange === 'custom' ? '' : timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="w-full flex-grow form-input px-3 py-1.5 text-sm transition"
                    >
                      {timeRange === 'custom' && <option>Custom Range</option>}
                      {dateRangeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => openDatePicker()}
                      className={`px-4 py-1.5 text-sm rounded-md transition whitespace-nowrap ${timeRange === 'custom' ? 'button-primary' : 'button-secondary'}`}
                    >
                      Custom
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-secondary p-6 rounded-lg">
              <h3 className="text-lg font-semibold main-text mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="tertiary-text">Total Users</span>
                  <span className="font-bold main-text text-lg">{metrics.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="tertiary-text">New Users</span>
                  <span className="font-bold main-text text-lg">{metrics.newUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="tertiary-text">Growth</span>
                  <span className={`font-bold text-lg flex items-center gap-1 ${growthPercentage < 0 ? 'status-error' : 'status-success'}`}>
                    {growthPercentage < 0 ? <ArrowDownRight className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4"/>}
                    {growthPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 card-secondary p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold main-text capitalize">{filter.replace('Users', ' User')} Growth</h3>
                <p className="text-3xl font-bold brand-purple mt-2">{metrics[filter].toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)'}}>
                <Calendar className="w-5 h-5 tertiary-text"/>
                <span className="text-sm main-text">{displayDateRange}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" />
                  <YAxis stroke="var(--text-tertiary)" />
                  <Tooltip
                      contentStyle={{
                          backgroundColor: 'var(--bg-modal)',
                          borderColor: 'var(--border-primary)',
                      }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                  <Line type="monotone" name="Total Users" dataKey="totalUsers" stroke="var(--brand-purple)" strokeWidth={2} />
                  <Line type="monotone" name="New Users" dataKey="newUsers" stroke="var(--brand-teal)" strokeWidth={2} />
                  <Line type="monotone" name="Active Users" dataKey="activeUsers" stroke="var(--brand-amber)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}