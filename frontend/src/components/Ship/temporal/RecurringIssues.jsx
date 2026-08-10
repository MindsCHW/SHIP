import React from 'react';
import { MdRepeat } from 'react-icons/md';

const RecurringIssues = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-6 text-sm text-gray-400 text-center">No recurring issues detected across cycles.</div>;

  return (
    <div className="overflow-x-auto max-h-[500px]">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Asset / Chainage</th>
            <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Recurrences</th>
            <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Avg Rating</th>
            <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Priority</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((issue, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 whitespace-nowrap">
                <div className="font-bold text-gray-900">{issue.assetType}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">CH {issue.chainage}</div>
              </td>
              <td className="px-5 py-3.5 text-center">
                <span className="flex items-center justify-center gap-1.5 font-black text-red-600">
                  <MdRepeat /> {issue.frequency}
                </span>
              </td>
              <td className="px-5 py-3.5 text-center">
                <span className="font-black text-gray-900">{issue.avgRating}</span>
              </td>
              <td className="px-5 py-3.5 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                  issue.priority === 'High' ? 'bg-red-600 text-white shadow-sm' : 'bg-orange-100 text-orange-700 border border-orange-200'
                }`}>
                  {issue.priority}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecurringIssues;
