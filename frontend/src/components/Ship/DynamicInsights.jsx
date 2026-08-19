import React from 'react';
import { motion } from 'framer-motion';

const DynamicInsights = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Dynamic Insights Feed</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Natural language intelligence and anomalies will appear here in Phase 1.5.
        </p>
      </div>
    </div>
  );
};

export default DynamicInsights;
