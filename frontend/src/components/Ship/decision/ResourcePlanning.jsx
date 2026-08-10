import React from 'react';
import { MdGroup, MdSchedule, MdBuildCircle, MdChecklist } from 'react-icons/md';

const Stat = ({ icon: Icon, label, value, color = 'text-gray-900' }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
      <Icon className="text-gray-400 text-base" />
    </div>
    <div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className={`text-base font-black ${color}`}>{value}</div>
    </div>
  </div>
);

const ResourcePlanning = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-6 text-center text-sm text-gray-400">No resource planning data available.</div>;

  return (
    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
      {data.map((p, i) => (
        <div key={i} className="p-5 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-gray-900">{p.project}</h4>
              <span className="text-xs text-gray-400 font-mono">{p.code}</span>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
              p.criticalAssets > 50 ? 'bg-red-50 text-red-700 border-red-200' :
              p.criticalAssets > 20 ? 'bg-orange-50 text-orange-700 border-orange-200' :
              'bg-green-50 text-green-700 border-green-200'
            }`}>
              {p.criticalAssets} critical assets
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat icon={MdGroup} label="Teams Required" value={`${p.teamsRequired} teams`} color="text-green-700" />
            <Stat icon={MdSchedule} label="Est. Time" value={`${p.weeksNeeded} weeks`} />
            <Stat icon={MdBuildCircle} label="Maint. Volume" value={p.maintenanceVolume} />
            <Stat icon={MdChecklist} label="Insp. Volume" value={p.inspectionVolume} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourcePlanning;
