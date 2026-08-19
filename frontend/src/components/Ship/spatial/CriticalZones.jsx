import React from 'react';

const CriticalZones = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-6 text-center text-sm text-gray-400">No critical zones detected.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Chainage Range</th>
            <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Issue Density</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Dominant Issue</th>
            <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Priority</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((zone, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 whitespace-nowrap font-mono font-black text-gray-900">
                {zone.chainage}
              </td>
              <td className="px-5 py-3.5 text-center">
                <span className="font-black text-red-600 text-lg">{zone.issueDensity}</span>
              </td>
              <td className="px-5 py-3.5 font-medium text-gray-700">
                {zone.dominantIssue}
              </td>
              <td className="px-5 py-3.5 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                  zone.priority === 'Critical' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {zone.priority}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CriticalZones;
