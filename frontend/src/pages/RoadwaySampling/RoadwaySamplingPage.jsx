import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { masterListService } from '../../services/masterList.service';
import { surveyLibraryService } from '../../services/surveyLibrary.service';
import { inspectionEngineService } from '../../services/inspectionEngine.service';
import Layout from '../../components/Layout';
import { MdAddRoad, MdOutlinePrecisionManufacturing } from 'react-icons/md';

export default function RoadwaySamplingPage() {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  
  const [surveys, setSurveys] = useState([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState('');

  const [startChainage, setStartChainage] = useState('');
  const [endChainage, setEndChainage] = useState('');
  const [intervalMetres, setIntervalMetres] = useState(10);

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchSurveys(selectedProject);
    } else {
      setSurveys([]);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await masterListService.getProjects();
      if (res.success) setProjects(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSurveys = async (project) => {
    try {
      const res = await surveyLibraryService.getLibrary(project);
      if (res.success) setSurveys(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSurveyChange = (e) => {
    const val = e.target.value;
    setSelectedSurveyId(val);
    setPreview(null);
    
    if (val === 'all') {
      if (surveys.length > 0) {
        let min = Infinity;
        let max = -Infinity;
        surveys.forEach(s => {
          if (s.coverage) {
            if (s.coverage.startChainage != null) min = Math.min(min, s.coverage.startChainage);
            if (s.coverage.endChainage != null) max = Math.max(max, s.coverage.endChainage);
          }
        });
        if (min !== Infinity) setStartChainage(min.toFixed(3));
        if (max !== -Infinity) setEndChainage(max.toFixed(3));
      }
    } else if (val !== '') {
      const selected = surveys.find(s => s._id === val);
      if (selected && selected.coverage) {
        if (selected.coverage.startChainage != null) setStartChainage(selected.coverage.startChainage.toFixed(3));
        if (selected.coverage.endChainage != null) setEndChainage(selected.coverage.endChainage.toFixed(3));
      }
    } else {
      setStartChainage('');
      setEndChainage('');
    }
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedSurveyId || !startChainage || !endChainage || !intervalMetres) {
      setError('Please fill in all fields to preview the batch.');
      return;
    }

    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const data = {
        project: selectedProject,
        surveyAssetId: selectedSurveyId,
        startChainage: parseFloat(startChainage),
        endChainage: parseFloat(endChainage),
        intervalMetres: parseInt(intervalMetres, 10)
      };

      const res = await inspectionEngineService.previewRoadwayBatch(data);
      if (res.success) {
        setPreview(res.data);
      } else {
        setError(res.message || 'Failed to preview roadway batch.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = {
        project: selectedProject,
        surveyAssetId: selectedSurveyId,
        startChainage: parseFloat(startChainage),
        endChainage: parseFloat(endChainage),
        intervalMetres: parseInt(intervalMetres, 10)
      };

      const res = await inspectionEngineService.createRoadwayBatch(data);
      if (res.success) {
        navigate('/inspection-engine'); // Navigate to main inspection engine where batches are listed
      } else {
        setError(res.message || 'Failed to create roadway batch.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <MdAddRoad size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Roadway Sampling</h1>
            <p className="text-sm text-gray-500">Continuous sampling based on existing Survey Library images</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex flex-col gap-1 shadow-sm">
            <div className="font-semibold text-sm">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Configuration</h2>
          
          <form className="flex flex-col gap-5" onSubmit={handlePreview}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => {
                    setSelectedProject(e.target.value);
                    setSelectedSurveyId('');
                    setPreview(null);
                  }}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Survey File (From Library)</label>
                <select
                  value={selectedSurveyId}
                  onChange={handleSurveyChange}
                  required
                  disabled={!selectedProject}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Select Survey</option>
                  <option value="all">All Videos</option>
                  {surveys.map(s => (
                    <option key={s._id} value={s._id}>{s.assetName} ({s.roadDirection || 'N/A'}) - {s.surveyType}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Chainage (km)</label>
                <input
                  type="number"
                  step="0.001"
                  value={startChainage}
                  onChange={(e) => {
                    setStartChainage(e.target.value);
                    setPreview(null);
                  }}
                  placeholder="e.g. 180.000"
                  required
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Chainage (km)</label>
                <input
                  type="number"
                  step="0.001"
                  value={endChainage}
                  onChange={(e) => {
                    setEndChainage(e.target.value);
                    setPreview(null);
                  }}
                  placeholder="e.g. 185.000"
                  required
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sampling Interval (m)</label>
                <input
                  type="number"
                  value={intervalMetres}
                  onChange={(e) => {
                    setIntervalMetres(e.target.value);
                    setPreview(null);
                  }}
                  placeholder="e.g. 10"
                  required
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || !selectedSurveyId}
                className="px-6 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
              >
                {loading && !preview ? 'Calculating...' : 'Preview Validation'}
              </button>
            </div>
          </form>
        </div>

        {preview && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold">
              <MdOutlinePrecisionManufacturing size={20} />
              <h3>Validation Preview</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Target Chainages</div>
                <div className="text-2xl font-bold text-gray-800">{preview.matchedImages}</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="text-xs text-green-700 font-medium uppercase tracking-wider mb-1">Images to Reuse</div>
                <div className="text-2xl font-bold text-green-700">{preview.existingImages}</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <div className="text-xs text-orange-700 font-medium uppercase tracking-wider mb-1">New Extractions</div>
                <div className="text-2xl font-bold text-orange-700">{preview.missingExtractionImages}</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="text-xs text-blue-700 font-medium uppercase tracking-wider mb-1">Questions/Img</div>
                <div className="text-2xl font-bold text-blue-700">{preview.questionsPerImage}</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-600">
                This will create <strong>{preview.matchedImages}</strong> Roadway inspection tasks. 
                {preview.existingImages > 0 && <span> <strong>{preview.existingImages}</strong> existing images will be directly reused.</span>}
              </div>
              
              <button
                onClick={handleGenerateBatch}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating Batch...' : 'Generate Roadway Batch'}
              </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
