import React, { useState } from 'react';
import { MdCompare, MdArrowForward } from 'react-icons/md';

const BeforeAfterCorridor = ({ data }) => {
  const [sliderVal, setSliderVal] = useState(50);

  if (!data || data.length === 0) return <div className="text-center text-sm text-gray-400">No before/after spatial data available.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest px-2">
        <span>Previous Cycle</span>
        <MdCompare className="text-lg text-gray-400" />
        <span>Current Cycle</span>
      </div>

      <div className="space-y-4">
        {data.map((row, i) => {
          const improved = row.currentCritical < row.previousCritical;
          const worsened = row.currentCritical > row.previousCritical;
          return (
            <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-center relative z-10">
                
                {/* Previous */}
                <div className="text-center flex-1">
                  <div className="text-2xl font-black text-gray-900">{row.previousCritical}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Critical</div>
                  <div className="text-xs font-medium text-gray-400 mt-1">Avg {row.previousAvg}</div>
                </div>

                {/* Center / Chainage */}
                <div className="flex flex-col items-center flex-1 px-4">
                  <div className="font-mono font-black text-gray-900 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm whitespace-nowrap">
                    {row.chainage}
                  </div>
                  <MdArrowForward className={`mt-2 text-xl ${improved ? 'text-green-500' : worsened ? 'text-red-500' : 'text-gray-300'}`} />
                </div>

                {/* Current */}
                <div className="text-center flex-1">
                  <div className="text-2xl font-black text-gray-900">{row.currentCritical}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Critical</div>
                  <div className="text-xs font-medium text-gray-400 mt-1">Avg {row.currentAvg}</div>
                </div>

              </div>
              
              {/* Dynamic Slider Background Effect */}
              <div 
                className={`absolute inset-y-0 left-0 ${improved ? 'bg-green-100/50' : worsened ? 'bg-red-100/50' : 'bg-gray-200/30'} transition-all duration-300 ease-out z-0`}
                style={{ width: `${(row.currentCritical / (row.previousCritical + row.currentCritical || 1)) * 100}%` }}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BeforeAfterCorridor;
