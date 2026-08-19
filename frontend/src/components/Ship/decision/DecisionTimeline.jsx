import React, { useState } from 'react';
import { MdFlag, MdCheck, MdRadioButtonUnchecked } from 'react-icons/md';

const STAGES = ['Generated', 'Approved', 'Assigned', 'Completed', 'Verified'];

const PRIORITY_COLORS = {
  Critical: 'bg-red-600 text-white',
  High:     'bg-orange-500 text-white',
  Medium:   'bg-amber-400 text-white',
  Low:      'bg-gray-200 text-gray-600',
};

const DecisionTimeline = ({ data }) => {
  const [decisions, setDecisions] = useState(() =>
    (data || []).map(d => ({ ...d, currentStageIdx: 0 }))
  );

  if (!data || data.length === 0) return <div className="text-center text-sm text-gray-400">No decisions to track.</div>;

  const advance = (i) => {
    setDecisions(prev => prev.map((d, j) => {
      if (j !== i || d.currentStageIdx >= STAGES.length - 1) return d;
      return { ...d, currentStageIdx: d.currentStageIdx + 1 };
    }));
  };

  return (
    <div className="space-y-5">
      {decisions.map((dec, i) => (
        <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-gray-400 font-mono">{dec.id}</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black ${PRIORITY_COLORS[dec.priority] || PRIORITY_COLORS.Low}`}>
                  {dec.priority}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm leading-tight">{dec.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{dec.project}</p>
            </div>
            {dec.currentStageIdx < STAGES.length - 1 && (
              <button
                onClick={() => advance(i)}
                className="shrink-0 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap"
              >
                → Advance
              </button>
            )}
            {dec.currentStageIdx === STAGES.length - 1 && (
              <span className="shrink-0 text-xs font-black text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">✓ Done</span>
            )}
          </div>

          {/* Stage tracker */}
          <div className="flex items-center gap-0">
            {STAGES.map((stage, si) => {
              const isDone = si < dec.currentStageIdx;
              const isActive = si === dec.currentStageIdx;
              return (
                <React.Fragment key={si}>
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 transition-all ${
                      isDone ? 'bg-green-600 border-green-600 text-white' :
                      isActive ? 'bg-white border-green-600 text-green-600' :
                      'bg-white border-gray-200 text-gray-300'
                    }`}>
                      {isDone ? <MdCheck /> : isActive ? <MdFlag className="text-xs" /> : <MdRadioButtonUnchecked className="text-xs" />}
                    </div>
                    <span className={`text-[9px] font-bold mt-1 ${isActive ? 'text-green-700' : isDone ? 'text-gray-500' : 'text-gray-300'}`}>
                      {stage}
                    </span>
                  </div>
                  {si < STAGES.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 transition-colors ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DecisionTimeline;
