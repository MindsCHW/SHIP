import React, { useState } from 'react';

const statusColors = {
  Critical: 'bg-red-600 text-white',
  High:     'bg-orange-500 text-white',
  Medium:   'bg-amber-400 text-white',
  Low:      'bg-gray-100 text-gray-600',
};

const ScoreBar = ({ value, max = 100, color = 'bg-green-500' }) => (
  <div className="w-full bg-gray-100 rounded-full h-1.5">
    <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
  </div>
);

const MaintenancePriorityEngine = ({ data }) => {
  const [sortKey, setSortKey] = useState('priorityScore');

  if (!data || data.length === 0) return <div className="p-6 text-center text-gray-400 text-sm">No project data available.</div>;

  const sorted = [...data].sort((a, b) => b[sortKey] - a[sortKey]);

  return (
    <div>
      <div className="flex gap-2 p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto">
        {['priorityScore', 'riskScore', 'healthScore', 'criticalIssues'].map(k => (
          <button key={k} onClick={() => setSortKey(k)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
              sortKey === k ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}>
            Sort: {k.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Project</th>
              <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Priority</th>
              <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Health</th>
              <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Risk</th>
              <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Critical</th>
              <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-bold text-gray-900 text-sm">{p.project}</div>
                  <div className="text-xs text-gray-400 font-mono">{p.code}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-black text-lg text-gray-900">{p.priorityScore}</span>
                    <ScoreBar value={p.priorityScore} color="bg-red-500" />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`font-black text-lg ${p.healthScore >= 8 ? 'text-green-600' : p.healthScore >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {p.healthScore}
                    </span>
                    <ScoreBar value={p.healthScore} max={10} color={p.healthScore >= 8 ? 'bg-green-500' : p.healthScore >= 6 ? 'bg-yellow-400' : 'bg-red-500'} />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-black text-lg text-gray-900">{p.riskScore}</span>
                    <ScoreBar value={p.riskScore} color="bg-orange-500" />
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`font-black text-xl ${p.criticalIssues > 0 ? 'text-red-600' : 'text-gray-300'}`}>{p.criticalIssues}</span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black ${statusColors[p.status] || statusColors.Low}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaintenancePriorityEngine;
