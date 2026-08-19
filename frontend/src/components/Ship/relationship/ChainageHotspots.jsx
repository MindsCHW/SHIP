import React from 'react';
import { MdLocationOn, MdWarning, MdReportProblem, MdArrowForward } from 'react-icons/md';

const RiskBadge = ({ risk }) => {
  const map = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-blue-100 text-blue-700 border-blue-200'
  };
  const iconMap = {
    High: <MdReportProblem className="text-sm" />,
    Medium: <MdWarning className="text-sm" />,
    Low: null
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${map[risk]}`}>
      {iconMap[risk]} {risk} Risk
    </span>
  );
};

const ChainageHotspots = ({ data, projectCode }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No critical hotspot chainages detected for this project.
      </div>
    );
  }

  const highRisk = data.filter(h => h.risk === 'High');
  const others = data.filter(h => h.risk !== 'High');

  return (
    <div>
      {highRisk.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-700 font-medium">
          <MdReportProblem />
          {highRisk.length} high-risk chainage zone{highRisk.length > 1 ? 's' : ''} detected — immediate attention required.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Chainage</th>
              <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Critical Issues</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Categories Affected</th>
              <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Risk</th>
              <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Map</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((hotspot, idx) => (
              <tr key={idx} className={`hover:bg-gray-50 transition-colors ${hotspot.risk === 'High' ? 'bg-red-50/30' : ''}`}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <MdLocationOn className={`text-lg ${hotspot.risk === 'High' ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className="font-mono font-black text-gray-900">{hotspot.chainage}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`text-xl font-black ${hotspot.risk === 'High' ? 'text-red-600' : 'text-gray-800'}`}>
                    {hotspot.criticalCount}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {hotspot.categories.map((cat, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-medium border border-gray-200">
                        {cat}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <RiskBadge risk={hotspot.risk} />
                </td>
                <td className="px-5 py-3.5 text-center">
                  {hotspot.lat && hotspot.lng ? (
                    <a
                      href={`https://www.google.com/maps?q=${hotspot.lat},${hotspot.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold hover:underline"
                    >
                      View <MdArrowForward className="text-sm" />
                    </a>
                  ) : (
                    <span className="text-gray-300 text-xs">No GPS</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChainageHotspots;
