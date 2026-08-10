import React, { useState } from 'react';
import { MdSearch, MdFilterList } from 'react-icons/md';
import CustomDropdown from '../common/CustomDropdown';

const GlobalFilters = ({ selectedProject, setSelectedProject, analyticsView, setAnalyticsView, globalFilters = {}, setGlobalFilters }) => {
  const updateFilter = (key, value) => {
    if (setGlobalFilters) {
      setGlobalFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const viewOptions = [
    { label: 'Executive Overview', value: 'Executive Overview' },
    { label: 'Skip Analytics', value: 'Skip Analytics' },
    { label: 'Inspection Comparison', value: 'Inspection Comparison' }
  ];

  const stateOptions = [
    { label: 'All States', value: '' },
    { label: 'Maharashtra', value: 'MH' },
    { label: 'Karnataka', value: 'KA' },
    { label: 'Tamil Nadu', value: 'TN' },
    { label: 'Uttar Pradesh', value: 'UP' }
  ];

  const projectOptions = [
    { label: 'All Projects', value: '' },
    { label: 'MKTPL', value: 'MKTPL' },
    { label: 'NKTPL', value: 'NKTPL' },
    { label: 'MSHP', value: 'MSHP' }
  ];

  const assetOptions = [
    { label: 'Asset Type', value: '' },
    { label: 'Flexible Pavement', value: 'Flexible' },
    { label: 'Rigid Pavement', value: 'Rigid' },
    { label: 'Structures', value: 'Structure' }
  ];

  const ratingOptions = [
    { label: 'Rating Status', value: '' },
    { label: 'Critical (1 Rating)', value: 'critical' },
    { label: 'Need Attention (5 Rating)', value: 'warning' },
    { label: 'Good (10 Rating)', value: 'good' }
  ];

  const timeOptions = [
    { label: 'Last 30 Days', value: '' },
    { label: 'Jan 26', value: 'jan-26' },
    { label: 'Feb 26', value: 'feb-26' },
    { label: 'June 26', value: 'jun-26' }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md border border-borderColor rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center gap-4 sticky top-0 z-10">
      <div className="flex items-center gap-2 text-gray-500 font-medium shrink-0">
        <MdFilterList className="text-xl text-[#5cb85c]" />
        <span>Filters:</span>
      </div>

      <div className="flex-1 min-w-[200px] relative">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input 
          type="text" 
          placeholder="Search projects, roads, or assets..." 
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5cb85c]/20 focus:border-[#5cb85c] transition-all"
          value={globalFilters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
      </div>

      {selectedProject && (
        <div className="w-[180px] shrink-0 border-r border-gray-200 pr-4">
          <CustomDropdown
            options={viewOptions}
            value={analyticsView}
            onChange={setAnalyticsView}
            placeholder="Analytics View"
          />
        </div>
      )}

      <div className="w-[140px] shrink-0">
        <CustomDropdown
          options={stateOptions}
          value={globalFilters.state || ''}
          onChange={(val) => updateFilter('state', val)}
          placeholder="All States"
        />
      </div>

      <div className="w-[140px] shrink-0">
        <CustomDropdown
          options={projectOptions}
          value={selectedProject || ''}
          onChange={(val) => setSelectedProject(val || null)}
          placeholder="All Projects"
        />
      </div>

      <div className="w-[160px] shrink-0">
        <CustomDropdown
          options={assetOptions}
          value={globalFilters.asset || ''}
          onChange={(val) => updateFilter('asset', val)}
          placeholder="Asset Type"
        />
      </div>

      <div className="w-[180px] shrink-0">
        <CustomDropdown
          options={ratingOptions}
          value={globalFilters.rating || ''}
          onChange={(val) => updateFilter('rating', val)}
          placeholder="Rating Status"
        />
      </div>

      <div className="w-[140px] shrink-0">
        <CustomDropdown
          options={timeOptions}
          value={globalFilters.time || ''}
          onChange={(val) => updateFilter('time', val)}
          placeholder="Last 30 Days"
        />
      </div>
    </div>
  );
};

export default GlobalFilters;
