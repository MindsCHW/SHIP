import React, { useState } from 'react';
import { MdOutlineDateRange, MdWarning, MdArrowUpward, MdArrowDownward } from 'react-icons/md';



const InspectionCard = ({ title, data }) => (
  <div className="flex-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col">
    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
    <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 uppercase tracking-wider text-sm">{title}</h4>
    
    <div className="mb-4 h-[250px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
      {data.image ? (
        <img src={data.image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
      )}
    </div>
    
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 w-20 font-medium uppercase tracking-wide text-xs">Rating</span>
        <span className={`px-3 py-1 rounded-md font-bold text-sm shadow-sm ${
          data.rating === 1 ? 'bg-red-100 text-red-700 border border-red-200' :
          data.rating === 5 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
          'bg-green-100 text-green-700 border border-green-200'
        }`}>{data.rating}</span>
      </div>
      
      <div className="flex gap-3">
        <span className="text-gray-500 w-20 font-medium uppercase tracking-wide text-xs mt-0.5">Remark</span>
        <span className="text-gray-800 flex-1 font-semibold">{data.remark}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-gray-500 w-20 font-medium uppercase tracking-wide text-xs">Date</span>
        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
          <MdOutlineDateRange className="text-blue-500 text-base" />
          <span>{data.date}</span>
        </div>
      </div>
    </div>
  </div>
);

const CriticalIssueComparison = ({ issues }) => {
  if (!issues || issues.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
        <MdWarning className="text-amber-500" /> Section 3: Critical Issue Image Comparison
      </h2>

      <div className="flex flex-col gap-8">
        {issues.map((item, idx) => (
          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Chainage</span>
                <span className="font-mono text-xl font-black text-gray-900">{item.chainage}</span>
              </div>
              <div className="hidden sm:block w-px h-10 bg-gray-200 mx-4"></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Category</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-sm">{item.category}</span>
              </div>
              <div className="hidden sm:block w-px h-10 bg-gray-200 mx-4"></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Asset</span>
                <span className="font-semibold text-gray-800">{item.asset}</span>
              </div>
              <div className="hidden sm:block w-px h-10 bg-gray-200 mx-4"></div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Parameter</span>
                <span className="font-black text-gray-800 text-lg">{item.parameter}</span>
              </div>
            </div>

            {/* Left, Center, Right Metadata */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              <InspectionCard title="Previous Inspection" data={item.prev} />
              
              <div className="flex flex-col items-center justify-center min-w-[140px] py-4 lg:py-0">
                {item.status === 'Improved' ? (
                  <div className="flex flex-col items-center text-green-600 bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm w-full">
                    <MdArrowUpward className="text-4xl mb-2" />
                    <span className="font-black text-sm uppercase tracking-widest">Improved</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm w-full">
                    <MdArrowDownward className="text-4xl mb-2" />
                    <span className="font-black text-sm uppercase tracking-widest">Deteriorated</span>
                  </div>
                )}
              </div>

              <InspectionCard title="Current Inspection" data={item.curr} />
            </div>


          </div>
        ))}
      </div>
    </div>
  );
};

export default CriticalIssueComparison;
