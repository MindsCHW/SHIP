import React from 'react';

const CorridorIntelligence = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-6 text-gray-400 text-sm text-center">No corridor segments found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Segment</th>
            <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Avg Rating</th>
            <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Critical Issues</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Dominant Category</th>
            <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Observations</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => {
            const score = parseFloat(row.avgRating);
            return (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="font-mono font-black text-gray-900">CH {row.range}</div>
                  <div className="text-xs text-gray-400 mt-0.5">20km block</div>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded font-black ${
                    score >= 8 ? 'bg-green-100 text-green-700' : 
                    score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {row.avgRating}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`font-black ${row.critical > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {row.critical}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-medium text-gray-700">
                  {row.dominantCategory}
                </td>
                <td className="px-5 py-3.5 text-center font-bold text-gray-900">
                  {row.observations}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CorridorIntelligence;
