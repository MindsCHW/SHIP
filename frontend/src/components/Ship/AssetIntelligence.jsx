import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { MdTimeline } from 'react-icons/md';

const AssetIntelligence = ({ chartsData }) => {
  if (!chartsData) return null;

  // Use radarData or treeMapData from chartsData if available
  // radarData has { subject: 'Roadway', A: project, B: global }
  // Let's use radarData to show Global averages
  
  const formattedData = useMemo(() => {
    if (!chartsData.radarData) return [];
    return chartsData.radarData.map(item => ({
      category: item.subject,
      averageRating: parseFloat((item.B / 15).toFixed(1)), // Reversed from B * 15
    })).sort((a, b) => b.averageRating - a.averageRating);
  }, [chartsData]);

  if (formattedData.length === 0) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-3 shadow-lg rounded-lg">
          <p className="font-bold text-gray-800 text-sm mb-1">{payload[0].payload.category}</p>
          <p className="text-green-600 font-black">
            Rating: {payload[0].value} / 10
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-green-600 rounded-full block"></span>
        Asset Intelligence
      </h2>

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="mb-8">
          <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-widest mb-1">Asset Category Performance</h3>
          <p className="text-gray-400 text-sm">Global average rating across all evaluated categories.</p>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 10]} stroke="#cbd5e1" fontSize={12} tickLine={false} />
              <YAxis 
                dataKey="category" 
                type="category" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                width={150}
              />
              <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
              <Bar dataKey="averageRating" radius={[0, 4, 4, 0]} barSize={24}>
                {formattedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.averageRating < 5 ? '#ef4444' : entry.averageRating < 8 ? '#f59e0b' : '#22c55e'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AssetIntelligence;
