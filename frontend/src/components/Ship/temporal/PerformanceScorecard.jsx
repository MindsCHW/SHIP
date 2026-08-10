import React from 'react';

const PerformanceScorecard = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-6 text-sm text-gray-400 text-center">No scorecard data available.</div>;

  const categories = data.length > 0 ? Object.keys(data[0].categories) : [];

  return (
    <div className="overflow-x-auto max-h-[500px]">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Cycle / Metric</th>
            <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest border-r border-gray-200">Overall</th>
            <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest border-r border-gray-200">Critical</th>
            <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest border-r border-gray-200">Skip %</th>
            {categories.map(c => (
              <th key={c} className="px-5 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.substring(0,8)}...</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((cycle, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 whitespace-nowrap font-bold text-gray-900">{cycle.month}</td>
              <td className="px-5 py-3.5 text-center border-r border-gray-100 bg-gray-50/50">
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-black ${
                  cycle.overall >= 8 ? 'text-green-700 bg-green-100' :
                  cycle.overall >= 5 ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'
                }`}>
                  {cycle.overall}
                </span>
              </td>
              <td className="px-5 py-3.5 text-center border-r border-gray-100 font-black text-red-600 bg-red-50/30">
                {cycle.critical}
              </td>
              <td className="px-5 py-3.5 text-center border-r border-gray-100 font-bold text-gray-600 bg-gray-50/50">
                {cycle.skipPerc}%
              </td>
              {categories.map(c => {
                const val = parseFloat(cycle.categories[c] || 0);
                return (
                  <td key={c} className={`px-5 py-3.5 text-center font-bold ${
                    val >= 8 ? 'text-green-600' : val >= 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {val.toFixed(1)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PerformanceScorecard;
