import React from 'react';
import { MdArticle, MdPrint } from 'react-icons/md';

const ExecutiveBrief = ({ data }) => {
  if (!data || !data.sentences?.length) return <div className="text-center text-sm text-gray-400">No brief available.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
            <MdArticle className="text-green-600" /> Executive Network Summary
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Generated {new Date(data.generatedAt).toLocaleString()} · Based on {data.totalProjects} active projects
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <MdPrint /> Print Brief
        </button>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-green-700">{data.overallNetworkHealth}</div>
          <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-0.5">Network Health</div>
        </div>
        <div className={`border rounded-xl p-4 text-center ${data.criticalProjects > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`text-3xl font-black ${data.criticalProjects > 0 ? 'text-red-600' : 'text-gray-400'}`}>{data.criticalProjects}</div>
          <div className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${data.criticalProjects > 0 ? 'text-red-500' : 'text-gray-400'}`}>Critical Projects</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-amber-700">{data.totalCriticalIssues}</div>
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">Critical Issues</div>
        </div>
      </div>

      {/* Sentences */}
      <div className="space-y-3">
        {data.sentences.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
        ⚠ This brief is auto-generated from live inspection data. All figures are traceable to existing HiRATE records.
      </div>
    </div>
  );
};

export default ExecutiveBrief;
