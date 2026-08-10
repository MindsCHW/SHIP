import React, { useState } from 'react';

const QUADRANT_LABELS = {
  'Healthy': { label: 'Healthy', color: '#16a34a', bg: '#f0fdf4' },
  'Monitor': { label: 'Monitor', color: '#ca8a04', bg: '#fefce8' },
  'Needs Attention': { label: 'Needs Attention', color: '#ea580c', bg: '#fff7ed' },
  'Critical': { label: 'Critical', color: '#dc2626', bg: '#fef2f2' },
};

const colorMap = { green: '#16a34a', yellow: '#ca8a04', orange: '#ea580c', red: '#dc2626' };

const ProjectRiskMatrix = ({ data }) => {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) return <div className="text-center py-6 text-sm text-gray-400">No risk matrix data.</div>;

  // Health (x-axis): 0–10, Risk (y-axis): 0–100
  // Map to % within a 400×320 canvas
  const toX = (h) => `${(h / 10) * 88 + 6}%`;
  const toY = (r) => `${100 - ((r / 100) * 88 + 6)}%`;

  return (
    <div className="h-[380px] flex flex-col gap-4">
      <div className="relative flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        {/* Quadrant backgrounds */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-40">
          <div className="bg-green-100" />
          <div className="bg-amber-100" />
          <div className="bg-orange-100" />
          <div className="bg-red-100" />
        </div>

        {/* Quadrant labels */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-2">
          <div className="flex items-start justify-start p-3 text-[10px] font-bold text-green-600 uppercase tracking-wider">Healthy</div>
          <div className="flex items-start justify-end p-3 text-[10px] font-bold text-amber-600 uppercase tracking-wider">Monitor</div>
          <div className="flex items-end justify-start p-3 text-[10px] font-bold text-orange-600 uppercase tracking-wider">Needs Attention</div>
          <div className="flex items-end justify-end p-3 text-[10px] font-bold text-red-600 uppercase tracking-wider">Critical</div>
        </div>

        {/* Cross-hair lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300/60" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300/60" />
        </div>

        {/* Axis labels */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">← Poor Health · Good Health →</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 uppercase tracking-wider">← Low Risk · High Risk →</div>

        {/* Data points */}
        {data.map((p, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 translate-y-1/2 cursor-pointer z-10 group"
            style={{ left: toX(p.healthScore), bottom: toY(p.riskScore) }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-150"
              style={{ backgroundColor: colorMap[p.color] || '#94a3b8' }}
            />
            {hovered === i && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-lg p-3 text-xs min-w-[160px] z-20 pointer-events-none">
                <div className="font-black text-gray-900 mb-1">{p.project}</div>
                <div className="text-gray-500">Health: <span className="font-bold text-gray-800">{p.healthScore}/10</span></div>
                <div className="text-gray-500">Risk: <span className="font-bold text-gray-800">{p.riskScore}/100</span></div>
                <div className={`mt-1.5 text-xs font-bold px-1.5 py-0.5 rounded inline-block`}
                  style={{ color: QUADRANT_LABELS[p.quadrant]?.color, background: QUADRANT_LABELS[p.quadrant]?.bg }}>
                  {p.quadrant}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center text-xs font-medium text-gray-500 flex-wrap">
        {Object.values(QUADRANT_LABELS).map(q => (
          <span key={q.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: q.color }} />
            {q.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProjectRiskMatrix;
