import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { MdBuild, MdTimer } from 'react-icons/md';

const RectificationEffectiveness = ({ data }) => {
  if (!data || !data.trend || data.trend.length === 0) return <div className="p-6 text-sm text-gray-400 text-center">No rectification data available.</div>;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Top Stats */}
      <div className="flex justify-between items-end">
        <div>
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Total Fixed</div>
          <div className="text-3xl font-black text-green-600">{data.totalRectified}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Avg Time</div>
          <div className="text-xl font-bold text-gray-700 flex items-center gap-1"><MdTimer /> {data.avgTime}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Still Recurring</div>
          <div className="text-3xl font-black text-red-600">{data.totalRecurring}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] -ml-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFixed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorRecur" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <RechartsTooltip />
            <Area type="monotone" dataKey="criticalsFixed" name="Rectified" stackId="1" stroke="#16a34a" fill="url(#colorFixed)" />
            <Area type="monotone" dataKey="recurring" name="Recurring" stackId="1" stroke="#ef4444" fill="url(#colorRecur)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="text-center text-xs font-bold text-gray-400 mt-2">
        Higher green area indicates successful maintenance campaigns between inspection cycles.
      </div>
    </div>
  );
};

export default RectificationEffectiveness;
