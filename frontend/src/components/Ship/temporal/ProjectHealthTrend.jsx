import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const ProjectHealthTrend = ({ data }) => {
  const [filter, setFilter] = useState('All');
  
  if (!data || data.length === 0) return <div className="text-center py-6 text-sm text-gray-400">No trend data available.</div>;

  let filteredData = [...data];
  if (filter === '3 Months' && data.length > 3) filteredData = data.slice(-3);
  if (filter === '6 Months' && data.length > 6) filteredData = data.slice(-6);
  if (filter === '12 Months' && data.length > 12) filteredData = data.slice(-12);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur border border-gray-200 shadow-xl rounded-lg p-4 min-w-[200px]">
          <p className="font-black text-gray-900 border-b border-gray-100 pb-2 mb-2">{label}</p>
          <div className="space-y-1.5 text-sm">
            <p className="flex justify-between items-center text-green-700">
              <span className="font-bold">Rating:</span>
              <span className="font-black">{payload[0].value.toFixed(1)}</span>
            </p>
            <p className="flex justify-between items-center text-red-600">
              <span className="font-bold">Critical:</span>
              <span className="font-black">{payload[1].value}</span>
            </p>
            <p className="flex justify-between items-center text-gray-600">
              <span className="font-bold">Skip %:</span>
              <span className="font-black">{payload[2].value}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[400px] flex flex-col">
      <div className="flex justify-end gap-2 mb-4">
        {['3 Months', '6 Months', '12 Months', 'All'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filter === f ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex-1 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
            <YAxis yAxisId="left" domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#ef4444' }} />
            
            <RechartsTooltip content={<CustomTooltip />} />
            
            <Area yAxisId="left" type="monotone" dataKey="overallRating" name="Avg Rating" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" />
            <Area yAxisId="right" type="step" dataKey="criticalIssues" name="Critical Issues" stroke="#ef4444" strokeWidth={2} fill="none" />
            <Area yAxisId="right" type="monotone" dataKey="skipPercentage" name="Skip %" stroke="#94a3b8" strokeDasharray="5 5" fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectHealthTrend;
