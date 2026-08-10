import React, { useState, useEffect } from 'react';
import { masterListService } from '../../../services/masterList.service';

const BatchCreationForm = ({ onBatchCreated }) => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [samplingPercentage, setSamplingPercentage] = useState(10);
  const [customPercentage, setCustomPercentage] = useState(10);
  
  const [advancedCategories, setAdvancedCategories] = useState([]);
  const [advancedAssetTypes, setAdvancedAssetTypes] = useState([]);
  const [fullFilteredList, setFullFilteredList] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Lists for dropdowns/chips
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableAssetTypes, setAvailableAssetTypes] = useState([]);

  const [excludePreviouslyInspected, setExcludePreviouslyInspected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available categories when project changes and custom sampling is selected
  useEffect(() => {
    if (selectedProject && samplingPercentage === 'custom') {
      fetchAvailableCategories();
    }
  }, [selectedProject, samplingPercentage]);

  const fetchAvailableCategories = async () => {
    try {
      const res = await masterListService.getCategories(selectedProject);
      if (res.success) setAvailableCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  // Fetch asset types when selected categories change
  useEffect(() => {
    if (selectedProject && samplingPercentage === 'custom') {
      fetchAvailableAssetTypes();
    }
  }, [advancedCategories, selectedProject, samplingPercentage]);

  const fetchAvailableAssetTypes = async () => {
    try {
      const res = await masterListService.getAssetTypes(selectedProject, advancedCategories);
      if (res.success) {
        setAvailableAssetTypes(res.data || []);
        setAdvancedAssetTypes(prev => prev.filter(at => res.data.includes(at)));
      }
    } catch (err) {
      console.error('Failed to fetch asset types', err);
    }
  };

  // Fetch stats and preview
  useEffect(() => {
    if (selectedProject && samplingPercentage === 'custom') {
      fetchPreviewAndStats();
    }
  }, [advancedCategories, advancedAssetTypes, selectedProject, samplingPercentage]);

  const fetchPreviewAndStats = async () => {
    setStatsLoading(true);
    try {
      const filters = { project: selectedProject, status: 'Active' };
      if (advancedCategories.length > 0) filters.category = advancedCategories;
      if (advancedAssetTypes.length > 0) filters.assetType = advancedAssetTypes;
      
      const res = await masterListService.getMasterList(filters);
      if (res.success) {
        setFullFilteredList(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch master list preview', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    setAdvancedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleAssetType = (at) => {
    setAdvancedAssetTypes(prev => 
      prev.includes(at) ? prev.filter(a => a !== at) : [...prev, at]
    );
  };

  const totalMasterQuestions = fullFilteredList.length;
  const uniqueChainagesCount = new Set(fullFilteredList.map(q => q.chainage)).size;
  const estQuestions = Math.ceil((totalMasterQuestions * customPercentage) / 100);
  const estImages = estQuestions;

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await masterListService.getProjects();
      if (res.success) setProjects(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await masterListService.getCategories();
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const finalPercentage = samplingPercentage === 'custom' 
      ? Number(customPercentage) 
      : Number(samplingPercentage);

    const payload = {
      project: selectedProject,
      samplingPercentage: finalPercentage,
      excludePreviouslyInspected
    };

    if (samplingPercentage === 'custom') {
      if (advancedCategories.length > 0) payload.categories = advancedCategories;
      if (advancedAssetTypes.length > 0) payload.assetTypes = advancedAssetTypes;
    }

    try {
      await onBatchCreated(payload);
      // Reset form
      setSelectedProject('');
      setSelectedCategory('');
      setSamplingPercentage(10);
      setCustomPercentage(10);
      setAdvancedCategories([]);
      setAdvancedAssetTypes([]);
    } catch (err) {
      setError(err.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Generate Inspection Batch</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Project Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Sampling Percentage Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampling Strategy (Random)</label>
            <select
              value={samplingPercentage}
              onChange={(e) => {
                setSamplingPercentage(e.target.value);
                if (e.target.value !== 'custom') {
                  setSelectedCategory('');
                }
              }}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value={5}>5%</option>
              <option value={10}>10%</option>
              <option value={15}>15%</option>
              <option value={20}>20%</option>
              <option value="custom">Advanced Sampling (Custom)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedProject || (samplingPercentage === 'custom' && advancedCategories.length === 0)}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors h-[42px]"
          >
            {loading ? 'Generating...' : 'Generate Batch'}
          </button>
        </div>

        {/* Advanced Strategy Configuration Row */}
        {samplingPercentage === 'custom' && (
          <div className="flex flex-col gap-6 p-6 bg-gray-50/50 border border-gray-200 rounded-xl mt-2 shadow-inner">
            <div>
              <h4 className="font-semibold text-gray-800 text-lg mb-1">Advanced Filters</h4>
              <p className="text-sm text-gray-500 mb-4">Dynamically select and preview records from the Master List.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1: Categories */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm col-span-1 md:col-span-2">
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                  Select Categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {availableCategories.length === 0 ? <p className="text-sm text-gray-500 col-span-full">No categories found.</p> : null}
                  {availableCategories.map(cat => {
                    const isSelected = advancedCategories.includes(cat);
                    return (
                      <div
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`cursor-pointer group relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50/50 shadow-md transform -translate-y-1' 
                            : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-200 hover:shadow-sm'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                        <div className="mt-1">
                          <h4 className={`font-semibold text-sm transition-colors ${isSelected ? 'text-blue-800' : 'text-gray-600 group-hover:text-gray-900'}`}>{cat}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Asset Types */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm col-span-1 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
                    Select Asset Types
                  </h3>
                  {availableAssetTypes.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => {
                        if (advancedAssetTypes.length === availableAssetTypes.length) {
                          setAdvancedAssetTypes([]); // Deselect all
                        } else {
                          setAdvancedAssetTypes([...availableAssetTypes]); // Select all
                        }
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full flex items-center gap-1"
                    >
                      {advancedAssetTypes.length === availableAssetTypes.length ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          Deselect All
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Select All
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {availableAssetTypes.length === 0 ? <p className="text-sm text-gray-500">No asset types found.</p> : null}
                  {availableAssetTypes.map(at => {
                    const isSelected = advancedAssetTypes.includes(at);
                    return (
                      <button
                        type="button"
                        key={at}
                        onClick={() => toggleAssetType(at)}
                        className={`px-4 py-2.5 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2.5 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-700'
                        }`}
                      >
                        {isSelected && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        <span className="font-medium">{at}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Sampling Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customPercentage}
                  onChange={(e) => setCustomPercentage(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Stats */}
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Total Master Qs</p>
                  <p className="text-xl font-bold text-gray-900">{totalMasterQuestions}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Unique Chainages</p>
                  <p className="text-xl font-bold text-gray-900">{uniqueChainagesCount}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Est. Inspection Qs</p>
                  <p className="text-xl font-bold text-gray-900">{estQuestions}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Est. Images</p>
                  <p className="text-xl font-bold text-gray-900">{estImages}</p>
                </div>
              </div>
            </div>

            {/* Step 3: Preview Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Question Preview (Filtered)</h3>
                {statsLoading && <span className="text-xs font-medium text-blue-500">Loading...</span>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white text-gray-500 border-b border-gray-100">
                      <th className="p-3 font-medium">Chainage</th>
                      <th className="p-3 font-medium">Category</th>
                      <th className="p-3 font-medium">Asset Type</th>
                      <th className="p-3 font-medium">Parameter</th>
                      <th className="p-3 font-medium">Direction</th>
                      <th className="p-3 font-medium">Road Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullFilteredList.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 whitespace-nowrap text-gray-700">{row.chainage}</td>
                        <td className="p-3 text-gray-700">{row.category}</td>
                        <td className="p-3 text-gray-700">{row.assetType}</td>
                        <td className="p-3 max-w-xs truncate text-gray-700" title={row.parameter}>{row.parameter}</td>
                        <td className="p-3 text-gray-700">{row.direction || '-'}</td>
                        <td className="p-3 text-gray-700">{row.roadType || '-'}</td>
                      </tr>
                    ))}
                    {fullFilteredList.length === 0 && !statsLoading && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-400">No records found matching filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {fullFilteredList.length > 5 && (
                <div className="bg-gray-50 p-2 text-center text-xs text-gray-500 border-t border-gray-100">
                  Showing first 5 of {totalMasterQuestions} records
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="excludeInspected"
            checked={excludePreviouslyInspected}
            onChange={(e) => setExcludePreviouslyInspected(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="excludeInspected" className="text-sm font-medium text-gray-700">
            Exclude Previously Inspected Questions
          </label>
        </div>
      </form>
    </div>
  );
};

export default BatchCreationForm;
