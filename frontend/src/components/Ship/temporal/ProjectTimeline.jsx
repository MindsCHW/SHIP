import React from 'react';
import { MdCheckCircle, MdSchedule } from 'react-icons/md';

const ProjectTimeline = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-sm text-gray-400 text-center py-6">No historical cycles found.</div>;

  return (
    <div className="flex items-center overflow-x-auto pb-4 pt-2 px-2 scrollbar-thin">
      {data.map((cycle, i) => (
        <div key={i} className="flex items-center">
          
          <div className="flex flex-col items-center relative group cursor-default">
            {/* Cycle Node */}
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center bg-white shadow-sm transition-transform group-hover:scale-110 ${
              cycle.status === 'Current' ? 'border-green-600 text-green-600' : 'border-gray-300 text-gray-400'
            }`}>
              {cycle.status === 'Current' ? <MdSchedule className="text-xl" /> : <MdCheckCircle className="text-xl" />}
            </div>
            
            {/* Label below */}
            <div className="absolute top-14 w-32 text-center">
              <p className={`text-xs font-bold ${cycle.status === 'Current' ? 'text-green-700' : 'text-gray-900'}`}>{cycle.name}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">{cycle.status}</p>
            </div>
          </div>

          {/* Connector Line */}
          {i < data.length - 1 && (
            <div className={`w-24 h-1 rounded-full mx-2 ${
              cycle.status === 'Current' ? 'bg-green-100' : 'bg-gray-200'
            }`}></div>
          )}
          
        </div>
      ))}
    </div>
  );
};

export default ProjectTimeline;
