import React from 'react';
import { MdDynamicFeed, MdLocationOn } from 'react-icons/md';

const IssueClusterDetection = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-6 text-center text-sm text-gray-400">No multi-asset issue clusters detected.</div>;

  return (
    <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
      {data.map((cluster, i) => (
        <div key={i} className="p-5 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${cluster.priority === 'High Priority' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                <MdDynamicFeed className="text-lg" />
              </div>
              <div>
                <h4 className="font-mono font-black text-gray-900 flex items-center gap-1"><MdLocationOn className="text-gray-400" /> {cluster.chainage}</h4>
                <p className="text-xs text-gray-500 font-medium">Co-occurring failures</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
              cluster.priority === 'High Priority' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200'
            }`}>
              {cluster.priority}
            </span>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Assets Affected</p>
              <div className="flex flex-wrap gap-1.5">
                {cluster.categories.map(c => (
                  <span key={c} className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600 shadow-sm font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-gray-900">{cluster.critical}</div>
              <div className="text-[10px] font-bold text-red-500 uppercase">Critical</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IssueClusterDetection;
