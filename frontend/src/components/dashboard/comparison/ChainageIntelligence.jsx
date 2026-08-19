import React from 'react';
import { MdFilterList, MdCheckCircle, MdCancel, MdError } from 'react-icons/md';

const ChainageIntelligence = ({ chainages }) => {
  if (!chainages || chainages.length === 0) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Improved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><MdCheckCircle /> Improved</span>;
      case 'Deteriorated':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><MdCancel /> Deteriorated</span>;
      case 'New Observation':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"><MdError /> New</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">No Change</span>;
    }
  };

  const getRatingBadge = (rating) => {
    if (rating === null || rating === undefined) return <span className="text-gray-400 font-medium">-</span>;
    return (
      <span className={`px-3 py-1 rounded font-bold text-sm shadow-sm ${
        rating === 1 ? 'bg-red-100 text-red-700' :
        rating === 5 ? 'bg-orange-100 text-orange-700' :
        'bg-green-100 text-green-700'
      }`}>{rating}</span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">
          Section 6: Chainage Changes
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 cursor-not-allowed">
          <MdFilterList className="text-lg text-blue-500" />
          Filters Disabled in Mock
        </div>
      </div>

      <div className="overflow-auto border border-gray-200 rounded-lg shadow-inner flex-1 bg-gray-50">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-white sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Chainage</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Category</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Parameter</th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Previous Rating</th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Current Rating</th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Difference</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chainages.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-gray-900">{row.chainage}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-700">{row.category}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">{row.parameter}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{getRatingBadge(row.ratingA)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">{getRatingBadge(row.ratingB)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`font-bold ${row.diff > 0 ? 'text-green-600' : row.diff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {row.diff > 0 ? '+' : ''}{row.diff}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(row.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChainageIntelligence;
