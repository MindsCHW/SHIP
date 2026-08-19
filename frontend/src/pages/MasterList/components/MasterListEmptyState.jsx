import React from 'react';
import { MdOutlineTableChart } from 'react-icons/md';

const MasterListEmptyState = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center p-16 min-h-[400px]">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-4 border-gray-100">
        <MdOutlineTableChart className="text-4xl text-gray-300" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">No Master List Found</h3>
      
      <p className="text-gray-500 text-center max-w-md mb-8">
        The system has not been configured yet. Upload the official Master List to begin generating inspection batches and powering the Sampling Engine.
      </p>
      
      <button 
        disabled
        className="px-6 py-2.5 bg-green-600/50 text-white font-medium rounded-lg cursor-not-allowed flex flex-col items-center justify-center"
      >
        <span>Import Master List</span>
        <span className="text-[10px] uppercase tracking-widest mt-0.5 opacity-80">Coming Soon</span>
      </button>
    </div>
  );
};

export default MasterListEmptyState;
