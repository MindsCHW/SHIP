import React from 'react';
import { MdFlag } from 'react-icons/md';

const ExecutiveTimeline = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-center text-sm text-gray-400">No milestones generated.</div>;

  return (
    <div className="relative pt-4">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100"></div>
      
      <div className="space-y-8 relative z-10">
        {data.map((milestone, idx) => (
          <div key={idx} className="flex gap-6 items-start group">
            <div className="w-12 h-12 rounded-full bg-white border-4 border-green-500 shadow-sm shrink-0 flex items-center justify-center transition-transform group-hover:scale-110">
              <MdFlag className="text-green-600 text-xl" />
            </div>
            
            <div className="flex-1 pt-1.5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{milestone.date}</div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 transition-colors group-hover:bg-green-50 group-hover:border-green-200">
                <h4 className="font-bold text-gray-900 text-base mb-1">{milestone.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{milestone.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveTimeline;
