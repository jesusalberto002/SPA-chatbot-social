"use client"

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, ArrowUpRight, ArrowDownRight, DollarSign, Gem, Star } from "lucide-react";
import api from '../../../api/axios';
import { useModal } from '../../../context/modalContext';
import DatePickerModal from './datePicker';

const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '365d', label: 'Last Year' },
];

export default function SubscriptionsReports() {
  const { showModal, hideModal } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalMetrics, setTotalMetrics] = useState({ totalCount: 0, totalRevenue: 0, newDatedSubscriptions: 0, totalDatedSubscriptions: 0 });
  const [tierMetrics, setTierMetrics] = useState({});
  const [chartData, setChartData] = useState([]);
  const [dataType, setDataType] = useState('total');
  const [selectedTier, setSelectedTier] = useState('BRONZE');
  const [timeRange, setTimeRange] = useState('30d');
  const [growthPercentage, setGrowthPercentage] = useState(0);
  const [customDateRange, setCustomDateRange] = useState({ startDate: null, endDate: null });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [displayDateRange, setDisplayDateRange] = useState('');
  const [visibleLines, setVisibleLines] = useState({
    Overall: true,
    Bronze: true,
    Platinum: true,
  });

  const getSubscriptionData = async () => {
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

      const [metricsResponse, chartResponse, prevMetricsResponse] = await Promise.all([
        api.get(`/admin/subs/metrics?days=${days}`),
        api.get(`/admin/subs/chart-data?${chartApiParams.toString()}`),
        api.get(`/admin/subs/metrics?days=${days * 2}`)
      ]);
      
      const currentNewSubs = metricsResponse.data.totalMetrics.newDatedSubscriptions || 0;
      const totalNewSubsInDoublePeriod = prevMetricsResponse.data.totalMetrics.newDatedSubscriptions || 0;
      const previousPeriodNewSubs = totalNewSubsInDoublePeriod - currentNewSubs;

      setTierMetrics(metricsResponse.data.tierMetrics || {});
      setTotalMetrics(metricsResponse.data.totalMetrics || { totalCount: 0, totalRevenue: 0, newDatedSubscriptions: 0, totalDatedSubscriptions: 0 });
      setChartData(chartResponse.data || []);

      if (previousPeriodNewSubs > 0) {
        const growth = ((currentNewSubs - previousPeriodNewSubs) / previousPeriodNewSubs) * 100;
        setGrowthPercentage(growth.toFixed(1));
      } else {
        setGrowthPercentage(currentNewSubs > 0 ? 100 : 0);
      }

      if (timeRange === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const start = new Date(customDateRange.startDate).toLocaleDateString('en-US', options);
        const end = new Date(customDateRange.endDate).toLocaleDateString('en-US', options);
        setDisplayDateRange(`${start} - ${end}`);
      } else {
        const selectedOption = DATE_RANGE_OPTIONS.find(opt => opt.value === timeRange);
        setDisplayDateRange(selectedOption?.label || `Last ${days} days`);
      }
    } catch (err) {
      setError("Could not load subscription data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSubscriptionData();
  }, [timeRange, customDateRange]);

  const dynamicTierOptions = useMemo(() => {
    return Object.keys(tierMetrics).map(tierName => ({
      value: tierName,
      label: tierName.charAt(0).toUpperCase() + tierName.slice(1).toLowerCase(),
    }));
  }, [tierMetrics]);

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

  const handleLegendClick = (e) => {
    setVisibleLines(prev => ({ ...prev, [e.value]: !prev[e.value] }));
  };

  if (isLoading) return <div className="text-center main-text py-10">Loading subscription reports...</div>;
  if (error) return <div className="text-center status-error py-10">{error}</div>;

  const currentTierPerformance = tierMetrics[selectedTier] || { count: 0, revenue: 0 };

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* --- CHANGE IS HERE --- */}
          <div className="card-secondary p-6 rounded-lg">
            <h3 className="text-lg font-semibold main-text mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 brand-green" />
              Overall Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="tertiary-text">Total Paid Subscriptions</span>
                <span className="font-bold main-text text-2xl">{totalMetrics.totalCount.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="tertiary-text">Total Revenue</span>
                <span className="font-bold brand-green text-2xl">${totalMetrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* --- CHANGE IS HERE --- */}
          <div className="card-secondary p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold main-text">Performance by Tier</h3>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="form-input px-3 py-1 text-sm"
              >
                {dynamicTierOptions.map(tier => (
                  <option key={tier.value} value={tier.value}>{tier.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="tertiary-text">{dynamicTierOptions.find(t => t.value === selectedTier)?.label} Subscriptions</span>
                <span className="font-bold main-text text-2xl">{currentTierPerformance.count.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="tertiary-text">{dynamicTierOptions.find(t => t.value === selectedTier)?.label} Revenue</span>
                <span className="font-bold brand-green text-2xl">${currentTierPerformance.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            {/* --- CHANGE IS HERE --- */}
            <div className="card-secondary p-6 rounded-lg">
              <div className="pb-4">
                  <label className="text-sm font-medium secondary-text">Metric Type</label>
                  <div className="mt-2 grid grid-cols-2 gap-2 p-1 rounded-md" style={{ backgroundColor: 'var(--background-tertiary)' }}>
                    <button onClick={() => setDataType('total')} className={`px-3 py-1.5 text-sm rounded-md transition ${dataType === 'total' ? 'button-primary' : 'text-primary hover-interactive'}`}>Total</button>
                    <button onClick={() => setDataType('new')} className={`px-3 py-1.5 text-sm rounded-md transition ${dataType === 'new' ? 'button-primary' : 'text-primary hover-interactive'}`}>New</button>
                  </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium secondary-text">Date Range</label>
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={timeRange === 'custom' ? '' : timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="w-full flex-grow form-input px-3 py-1.5 text-sm transition"
                    >
                      {timeRange === 'custom' && <option>Custom Range</option>}
                      {DATE_RANGE_OPTIONS.map((option) => (
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
            {/* --- CHANGE IS HERE --- */}
            <div className="card-secondary p-6 rounded-lg">
              <h3 className="text-lg font-semibold main-text mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="tertiary-text">New Subscriptions</span>
                  <span className="font-bold main-text text-lg">{totalMetrics.newDatedSubscriptions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="tertiary-text">Growth</span>
                  <span className={`font-bold text-lg flex items-center gap-1 ${growthPercentage < 0 ? 'status-error' : 'status-success'}`}>
                    {growthPercentage < 0 ? <ArrowDownRight className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4"/>}
                    {growthPercentage}%
                  </span>
                </div>
                  <div className="flex justify-between items-center">
                  <span className="tertiary-text">Cancellations</span>
                  <span className="font-bold text-lg flex items-center gap-1 status-error">
                    <ArrowDownRight className="w-4 h-4"/> 3
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* --- CHANGE IS HERE --- */}
          <div className="lg:col-span-2 card-secondary p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold main-text capitalize">{dataType} Subscriptions Over Time</h3>
                <p className="text-3xl font-bold brand-purple mt-2">{dataType === "new" ? totalMetrics.newDatedSubscriptions : totalMetrics.totalDatedSubscriptions}</p>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: 'var(--background-tertiary)' }}>
                <Calendar className="w-5 h-5 tertiary-text"/>
                <span className="text-sm main-text">{displayDateRange}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                    <XAxis dataKey="date" stroke="var(--text-tertiary)" />
                    <YAxis stroke="var(--text-tertiary)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background-modal)', borderColor: 'var(--border-primary)' }} labelStyle={{ color: 'var(--text-primary)' }}/>
                    <Legend onClick={handleLegendClick} wrapperStyle={{ color: 'var(--text-secondary)', cursor: 'pointer' }}/>
                    
                    <Line 
                        hide={!visibleLines.Overall}
                        type="monotone" 
                        name="Overall" 
                        dataKey={dataType === 'total' ? 'totalSubscriptions' : 'newSubscriptions'} 
                        stroke="var(--brand-purple)" 
                        strokeWidth={2} 
                    />
                    <Line 
                        hide={!visibleLines.Bronze}
                        type="monotone" 
                        name="Bronze" 
                        dataKey={dataType === 'total' ? 'BRONZE_total' : 'BRONZE_new'} 
                        stroke="var(--brand-amber)" 
                        strokeWidth={2} 
                    />
                    <Line 
                        hide={!visibleLines.Platinum}
                        type="monotone" 
                        name="Platinum" 
                        dataKey={dataType === 'total' ? 'PLATINUM_total' : 'PLATINUM_new'} 
                        stroke="var(--text-tertiary)" 
                        strokeWidth={2} 
                    />
                </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}