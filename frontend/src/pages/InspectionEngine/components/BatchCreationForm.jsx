import React, { useState, useEffect } from 'react';
import { masterListService } from '../../../services/masterList.service';

const BatchCreationForm = ({ onBatchCreated }) => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [samplingPercentage, setSamplingPercentage] = useState(10);
  const [customPercentage, setCustomPercentage] = useState('');
  const [excludePreviouslyInspected, setExcludePreviouslyInspected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    if (samplingPercentage === 'custom' && selectedCategory) {
      payload.categories = [selectedCategory];
    }

    try {
      await onBatchCreated(payload);
      // Reset form
      setSelectedProject('');
      setSelectedCategory('');
      setSamplingPercentage(10);
      setCustomPercentage('');
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
              <option value="custom">Custom Filters</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedProject}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors h-[42px]"
          >
            {loading ? 'Generating...' : 'Generate Batch'}
          </button>
        </div>

        {/* Custom Strategy Filters Row */}
        {samplingPercentage === 'custom' && (
          <div className="flex flex-col md:flex-row gap-4 items-end p-4 bg-gray-50/50 border border-gray-100 rounded-lg mt-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Filter</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom %</label>
              <input
                type="number"
                min="1"
                max="100"
                value={customPercentage}
                onChange={(e) => setCustomPercentage(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="e.g. 25"
              />
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
