import React from 'react';

const LANE_CONFIG = {
  Critical: { bg: 'bg-red-50',    border: 'border-red-300',    header: 'bg-red-600 text-white',    dot: 'bg-red-600' },
  High:     { bg: 'bg-orange-50', border: 'border-orange-300', header: 'bg-orange-500 text-white', dot: 'bg-orange-500' },
  Medium:   { bg: 'bg-amber-50',  border: 'border-amber-300',  header: 'bg-amber-400 text-white',  dot: 'bg-amber-400' },
  Low:      { bg: 'bg-gray-50',   border: 'border-gray-200',   header: 'bg-gray-400 text-white',   dot: 'bg-gray-400' },
};

const ProjectCard = ({ p, dot }) => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow">
    <div className="flex items-start gap-2 mb-2">
      <div className={`w-2 h-2 rounded-full ${dot} mt-1.5 shrink-0`} />
      <div>
        <div className="font-bold text-gray-900 text-sm leading-tight">{p.project}</div>
        <div className="text-[10px] text-gray-400 font-mono">{p.code}</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-1.5 mt-2">
      <div className="text-[10px]"><span className="text-gray-400 font-bold">Priority:</span> <span className="font-black text-gray-900">{p.priorityScore}</span></div>
      <div className="text-[10px]"><span className="text-gray-400 font-bold">Health:</span> <span className="font-black text-gray-900">{p.healthScore}</span></div>
      <div className="text-[10px]"><span className="text-gray-400 font-bold">Risk:</span> <span className="font-black text-gray-900">{p.riskScore}</span></div>
      <div className="text-[10px]"><span className="text-gray-400 font-bold">Critical:</span> <span className={`font-black ${p.criticalIssues > 0 ? 'text-red-600' : 'text-gray-400'}`}>{p.criticalIssues}</span></div>
    </div>
  </div>
);

const ProjectPriorityBoard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(LANE_CONFIG).map(([lane, conf]) => {
        const projects = data[lane] || [];
        return (
          <div key={lane} className={`rounded-xl border ${conf.border} ${conf.bg} overflow-hidden`}>
            <div className={`px-4 py-2.5 ${conf.header} flex items-center justify-between`}>
              <span className="text-sm font-black tracking-wide">{lane}</span>
              <span className="text-sm font-black opacity-80">{projects.length}</span>
            </div>
            <div className="p-3 space-y-2 min-h-[120px]">
              {projects.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-4">No projects</div>
              ) : (
                projects.map((p, i) => <ProjectCard key={i} p={p} dot={conf.dot} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectPriorityBoard;
