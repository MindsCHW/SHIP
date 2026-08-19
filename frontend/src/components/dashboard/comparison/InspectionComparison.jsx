import React, { useState, useEffect } from 'react';
import ComparisonKPIs from './ComparisonKPIs';
import CriticalIssueComparison from './CriticalIssueComparison';
import CategoryAssetComparison from './CategoryAssetComparison';
import ChainageIntelligence from './ChainageIntelligence';
import ComparisonMap from './ComparisonMap';
import ManagementSummary from './ManagementSummary';
import { mockComparisonData } from '../../../data/mockComparisonData';

const InspectionComparison = ({ selectedProject }) => {
  const [batches, setBatches] = useState([]);
  const [versionA, setVersionA] = useState('');
  const [versionB, setVersionB] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedProject === 'SIPL') {
      setBatches([
        { _id: 'Batch-SIPL-2026-08-04-786', name: 'Batch-SIPL-2026-08-04-786' },
        { _id: 'Batch-SIPL-2026-09-05-812', name: 'Batch-SIPL-2026-09-05-812' }
      ]);
    } else {
      setBatches([]);
      setVersionA('');
      setVersionB('');
    }
  }, [selectedProject]);

  // Simulate loading delay for better UX
  useEffect(() => {
    if (versionA && versionB && versionA !== versionB) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [versionA, versionB]);

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500 font-medium">Please select a project from the global filters to view comparison.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Comparison Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Project</label>
          <div className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium cursor-not-allowed">
            {selectedProject}
          </div>
        </div>
        
        <div className="flex items-center justify-center pb-2 px-2 text-gray-400 font-bold uppercase tracking-widest text-sm">
          Compare
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Version A (Previous)</label>
          <select 
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            value={versionA}
            onChange={(e) => setVersionA(e.target.value)}
          >
            <option value="">Select Batch</option>
            {batches.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Version B (Current)</label>
          <select 
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            value={versionB}
            onChange={(e) => setVersionB(e.target.value)}
          >
            <option value="">Select Batch</option>
            {batches.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 font-medium">Analyzing comparison data...</span>
        </div>
      )}

      {!loading && versionA && versionB && versionA !== versionB && selectedProject === 'SIPL' && (
        <div className="flex flex-col gap-8 animate-fade-in">
          <ComparisonKPIs data={mockComparisonData.kpis} />
          
          <CategoryAssetComparison 
            categories={mockComparisonData.categories}
            topImprovements={mockComparisonData.topImprovements}
            topDeteriorations={mockComparisonData.topDeteriorations}
          />

          <CriticalIssueComparison issues={mockComparisonData.criticalIssues} />
          
          <ChainageIntelligence chainages={mockComparisonData.chainages} />
          
          <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-gray-800 font-bold text-base tracking-wide uppercase">
                 Interactive Comparison Map
               </h2>
             </div>
             <ComparisonMap mapPoints={mockComparisonData.mapPoints} />
          </div>
          
          <ManagementSummary insights={mockComparisonData.insights} />
        </div>
      )}
      
      {!loading && (!versionA || !versionB || versionA === versionB) && (
        <div className="flex items-center justify-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">Select two different versions above to generate the comparison.</p>
        </div>
      )}
      
      {!loading && selectedProject !== 'SIPL' && versionA && versionB && (
        <div className="flex items-center justify-center p-12 bg-red-50 rounded-xl border border-dashed border-red-300">
          <p className="text-red-500 font-medium">Mock data is only available for the SIPL project.</p>
        </div>
      )}
    </div>
  );
};

export default InspectionComparison;
