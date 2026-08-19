import React from 'react';
import { MdFilterList, MdSearch } from 'react-icons/md';

const MasterListFilters = ({ filters, setFilters }) => {

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
      <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold border-b border-gray-100 pb-3">
        <MdFilterList className="text-xl text-green-600" />
        <h4>Master List Filters</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        
        {/* Project Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">Project</label>
          <select 
            name="project" 
            value={filters.project || ''} 
            onChange={handleFilterChange}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          >
            <option value="">All Projects</option>
            {/* Populate dynamically later */}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">Category</label>
          <select 
            name="category" 
            value={filters.category || ''} 
            onChange={handleFilterChange}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          >
            <option value="">All Categories</option>
          </select>
        </div>

        {/* Asset Type Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">Asset Type</label>
          <select 
            name="assetType" 
            value={filters.assetType || ''} 
            onChange={handleFilterChange}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          >
            <option value="">All Assets</option>
          </select>
        </div>

        {/* Road Type Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">Road Type</label>
          <select 
            name="roadType" 
            value={filters.roadType || ''} 
            onChange={handleFilterChange}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          >
            <option value="">All Types</option>
            <option value="Main Carriageway">Main Carriageway</option>
            <option value="Service Road">Service Road</option>
            <option value="Slip Road">Slip Road</option>
          </select>
        </div>

        {/* Direction Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">Direction</label>
          <select 
            name="direction" 
            value={filters.direction || ''} 
            onChange={handleFilterChange}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          >
            <option value="">All Directions</option>
            <option value="Increasing">Increasing</option>
            <option value="Decreasing">Decreasing</option>
          </select>
        </div>

        {/* Placement Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">Placement</label>
          <select 
            name="placement" 
            value={filters.placement || ''} 
            onChange={handleFilterChange}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          >
            <option value="">All Placements</option>
            <option value="LHS">LHS</option>
            <option value="RHS">RHS</option>
            <option value="Median">Median</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">Status</label>
          <select 
            name="status" 
            value={filters.status || ''} 
            onChange={handleFilterChange}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default MasterListFilters;
