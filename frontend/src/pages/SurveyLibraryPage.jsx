import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { masterListService } from '../services/masterList.service';
import { surveyLibraryService } from '../services/surveyLibrary.service';
import { surveyProcessingService } from '../services/surveyProcessing.service';
import { useNavigate } from 'react-router-dom';
import {
  MdVideoLibrary, MdUploadFile, MdDelete, MdCheckCircle, 
  MdKeyboardArrowDown, MdEdit, MdAdd
} from 'react-icons/md';
import { LuPlay, LuLoader, LuFileText } from 'react-icons/lu';

const SurveyLibraryPage = () => {
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [assets, setAssets] = useState([]);
  const [roadTypes, setRoadTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Extraction State
  const [extracting, setExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  const [countdown, setCountdown] = useState(5);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [assetName, setAssetName] = useState('');
  const [roadDirection, setRoadDirection] = useState('LHS');
  const [roadType, setRoadType] = useState('All Types');
  const [surveyType, setSurveyType] = useState('DAY');
  const [videoFile, setVideoFile] = useState(null);
  const [vttFile, setVttFile] = useState(null);
  const [savingAsset, setSavingAsset] = useState(false);
  const [modalError, setModalError] = useState('');

  const videoInputRef = useRef(null);
  const vttInputRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await masterListService.getProjects();
      const projectList = res.data || [];
      setProjects(projectList);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const loadLibraryForProject = async (projectCode) => {
    try {
      setLoading(true);
      const res = await surveyLibraryService.getLibrary(projectCode);
      setAssets(res.data || []);
    } catch (err) {
      console.error('Failed to load library', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (projectCode) => {
    setSelectedProject(projectCode);
    setIsDropdownOpen(false);
    setExtractionResult(null);
    loadLibraryForProject(projectCode);
    fetchRoadTypes(projectCode);
  };

  const fetchRoadTypes = async (projectCode) => {
    try {
      const res = await masterListService.getRoadTypes(projectCode);
      setRoadTypes(res.data || []);
    } catch (err) {
      console.error('Failed to fetch road types', err);
    }
  };

  const openCreateModal = () => {
    setModalMode('CREATE');
    setEditingAssetId(null);
    setAssetName('');
    setRoadDirection('LHS');
    setRoadType('All Types');
    setSurveyType('DAY');
    setVideoFile(null);
    setVttFile(null);
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (asset) => {
    setModalMode('EDIT');
    setEditingAssetId(asset._id);
    setAssetName(asset.assetName);
    setRoadDirection(asset.roadDirection || 'LHS');
    setRoadType(asset.roadType || 'All Types');
    setSurveyType(asset.surveyType || 'DAY');
    setVideoFile(null); // Clear file selection on edit, meaning keep existing if not changed
    setVttFile(null);
    setModalError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSaveAsset = async () => {
    setModalError('');
    if (!assetName.trim()) {
      setModalError('Asset Name is required.');
      return;
    }

    if (modalMode === 'CREATE') {
      if (!videoFile || !vttFile) {
        setModalError('Video and VTT are both required.\nSurvey Asset cannot be created.');
        return;
      }
    }

    setSavingAsset(true);
    try {
      if (modalMode === 'CREATE') {
        const res = await surveyLibraryService.createAsset(selectedProject, assetName, roadDirection, roadType, surveyType, videoFile, vttFile);
        setAssets(res.data);
      } else {
        const res = await surveyLibraryService.updateAsset(selectedProject, editingAssetId, assetName, roadDirection, roadType, surveyType, videoFile, vttFile);
        setAssets(res.data);
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save asset', err);
      setModalError(err.response?.data?.message || err.message || 'Failed to save asset');
    } finally {
      setSavingAsset(false);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!selectedProject || !window.confirm(`Are you sure you want to delete this Survey Asset completely?`)) return;
    
    try {
      const res = await surveyLibraryService.deleteAsset(selectedProject, assetId);
      setAssets(res.data);
    } catch (err) {
      console.error(`Failed to delete asset`, err);
      alert(`Failed to delete asset`);
    }
  };

  const handleExtract = async () => {
    if (!selectedProject || !assets.length) return;
    
    setExtracting(true);
    setExtractionResult(null);

    try {
      const res = await surveyProcessingService.extractImages(selectedProject);
      setExtractionResult({ type: 'success', message: res.message || 'Extraction started in the background.' });
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setExtractionResult(null);
      }, 5000);
      
    } catch (err) {
      console.error('Extraction failed to start', err);
      setExtractionResult({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to start extraction' });
    } finally {
      setExtracting(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const selectedProjectDisplay = selectedProject ? selectedProject : 'Select a Project...';
  
  // Extraction button is enabled if at least one asset is READY or COMPLETED
  const canExtract = assets.some(a => a.status === 'READY' || a.status === 'COMPLETED');

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-textColor flex items-center gap-2">
                  <MdVideoLibrary className="text-primary" /> Survey Library
                </h1>
                <p className="text-sm text-gray-500 mt-1">Single source of truth for all paired survey media</p>
              </div>
            </div>

            {/* Section 1: Project Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-bold text-textColor mb-3">1. Select Project</h2>
              <div className="relative w-full max-w-md" style={{ zIndex: 50 }}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-textColor font-medium flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{selectedProjectDisplay}</span>
                  <MdKeyboardArrowDown className="text-gray-400 text-base" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-11 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col overflow-hidden max-h-60">
                    <div className="overflow-y-auto divide-y divide-gray-50">
                      {projects.map((p, index) => (
                        <button
                          key={`proj-${p}-${index}`}
                          type="button"
                          onClick={() => handleProjectSelect(p)}
                          className="w-full text-left px-3 py-2.5 text-xs hover:bg-green-50 transition-colors font-medium text-textColor"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedProject && (
              <div className="grid grid-cols-1 gap-6">
                
                {/* Section 2: Survey Assets */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-textColor">2. Survey Assets</h2>
                    <button 
                      onClick={openCreateModal}
                      className="text-xs font-bold text-white bg-primary hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <MdAdd className="text-base"/> Add Survey Asset
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider bg-gray-50/50">
                          <th className="py-3 px-4 font-semibold">Asset Name</th>
                          <th className="py-3 px-4 font-semibold">Direction</th>
                          <th className="py-3 px-4 font-semibold">Road Type</th>
                          <th className="py-3 px-4 font-semibold text-center">Video</th>
                          <th className="py-3 px-4 font-semibold text-center">VTT</th>
                          <th className="py-3 px-4 font-semibold text-center">Pair Status</th>
                          <th className="py-3 px-4 font-semibold text-center">Coverage</th>
                          <th className="py-3 px-4 font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {!assets.length ? (
                          <tr>
                            <td colSpan="6" className="py-8 text-center text-gray-400 text-sm">
                              No survey assets found. Click "+ Add Survey Asset" to upload one.
                            </td>
                          </tr>
                        ) : (
                          assets.map((asset) => (
                            <tr key={asset._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 px-4">
                                <span className="font-bold text-sm text-gray-800">{asset.assetName}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded-md font-medium border border-gray-200">{asset.roadDirection || 'LHS'}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded-md font-medium border border-gray-200">{asset.roadType || 'All Types'}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {asset.video ? <span className="text-green-600 font-bold" title={asset.video.originalName}>✓</span> : <span className="text-red-500 font-bold">✗</span>}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {asset.vtt ? <span className="text-blue-600 font-bold" title={asset.vtt.originalName}>✓</span> : <span className="text-red-500 font-bold">✗</span>}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {asset.status === 'READY' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">Ready</span>}
                                {asset.status === 'COMPLETED' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">Completed</span>}
                                {asset.status === 'PROCESSING' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800"><LuLoader className="animate-spin mr-1"/> Processing</span>}
                                {asset.status === 'PARSING_METADATA' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800"><LuLoader className="animate-spin mr-1"/> Parsing...</span>}
                                {asset.status === 'UPLOADING' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800"><LuLoader className="animate-spin mr-1"/> Uploading</span>}
                                {asset.status === 'DRAFT' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">Draft / Error</span>}
                              </td>
                              <td className="py-3 px-4 text-center text-xs text-gray-600 whitespace-nowrap">
                                {asset.coverage ? (
                                  <div className="flex flex-col">
                                    <span className="font-semibold">CH {asset.coverage.startChainage?.toFixed(3)} - {asset.coverage.endChainage?.toFixed(3)}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-3">
                                  <button onClick={() => openEditModal(asset)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                    <MdEdit className="text-lg" />
                                  </button>
                                  <button onClick={() => handleDeleteAsset(asset._id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                                    <MdDelete className="text-lg" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 3: Extract Button */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center items-center text-center">
                  <h2 className="text-sm font-bold text-textColor mb-2 w-full text-left">3. Extraction</h2>
                  
                  {extracting ? (
                    <div className="w-full flex flex-col items-center py-4">
                      <LuLoader className="animate-spin text-3xl text-primary mb-3" />
                      <p className="text-sm font-bold text-textColor">Starting Extraction...</p>
                    </div>
                  ) : extractionResult ? (
                    <div className={`w-full flex flex-col items-center py-4 animate-in fade-in zoom-in duration-300 ${extractionResult.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                      <MdCheckCircle className="text-4xl mb-2" />
                      <p className={`text-sm font-bold ${extractionResult.type === 'error' ? 'text-red-700' : 'text-green-700'}`}>
                        {extractionResult.message}
                      </p>
                      {extractionResult.type === 'success' && (
                        <p className="text-xs text-gray-500 mt-2">You can navigate away. You will be notified when it completes.</p>
                      )}
                    </div>
                  ) : (
                    <div className="w-full py-6 flex flex-col items-center max-w-xl mx-auto">
                      <p className="text-xs text-gray-500 mb-4 px-4 text-center">
                        Extraction requires at least one Survey Asset to be fully uploaded, parsed, and READY.
                      </p>
                      
                      {!canExtract && (
                        <div className="mb-4 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 w-full text-center">
                          ⚠️ Extraction is currently locked. No READY assets found.
                        </div>
                      )}
                      
                      <button 
                        onClick={handleExtract}
                        disabled={!canExtract}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                          !canExtract
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-green-700 hover:shadow'
                        }`}
                      >
                        <LuPlay className="text-lg" /> Extract Images
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create / Edit Survey Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-gray-100">
            
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                {modalMode === 'CREATE' ? 'Create Survey Asset' : 'Edit Survey Asset'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 font-bold text-lg leading-none">&times;</button>
            </div>

            <div className="p-5 space-y-4">
              
              {modalError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100 whitespace-pre-line">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Project</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 font-medium cursor-not-allowed">
                  {selectedProject}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Asset Name *</label>
                <input 
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g. SIPL_Part_01"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-textColor focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Road Direction *</label>
                <div className="relative">
                  <select
                    value={roadDirection}
                    onChange={(e) => setRoadDirection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-textColor focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 appearance-none bg-white"
                  >
                    <option value="LHS">LHS (Left Hand Side)</option>
                    <option value="RHS">RHS (Right Hand Side)</option>
                  </select>
                  <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Road Type</label>
                <div className="relative">
                  <select
                    value={roadType}
                    onChange={(e) => setRoadType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-textColor focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 appearance-none bg-white"
                  >
                    <option value="All Types">All Types</option>
                    {roadTypes.map((rt) => (
                      <option key={rt} value={rt}>{rt}</option>
                    ))}
                  </select>
                  <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Survey Type *</label>
                <div className="relative">
                  <select
                    value={surveyType}
                    onChange={(e) => setSurveyType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-textColor focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 appearance-none bg-white"
                  >
                    <option value="DAY">DAY (Standard)</option>
                    <option value="NIGHT">NIGHT</option>
                  </select>
                  <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Video {modalMode === 'CREATE' ? '*' : '(Leave empty to keep existing)'}
                </label>
                <input 
                  type="file" 
                  accept=".mp4" 
                  className="hidden" 
                  ref={videoInputRef}
                  onChange={(e) => setVideoFile(e.target.files[0])}
                />
                <button 
                  onClick={() => videoInputRef.current?.click()}
                  className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm transition-colors ${
                    videoFile ? 'border-green-300 bg-green-50 text-green-700 font-medium' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{videoFile ? videoFile.name : 'Choose MP4'}</span>
                  {videoFile && <span className="text-green-600 font-bold ml-2">✓</span>}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  VTT {modalMode === 'CREATE' ? '*' : '(Leave empty to keep existing)'}
                </label>
                <input 
                  type="file" 
                  accept=".vtt" 
                  className="hidden" 
                  ref={vttInputRef}
                  onChange={(e) => setVttFile(e.target.files[0])}
                />
                <button 
                  onClick={() => vttInputRef.current?.click()}
                  className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm transition-colors ${
                    vttFile ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{vttFile ? vttFile.name : 'Choose VTT'}</span>
                  {vttFile && <span className="text-blue-600 font-bold ml-2">✓</span>}
                </button>
              </div>

            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
              <button 
                onClick={closeModal}
                disabled={savingAsset}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAsset}
                disabled={savingAsset}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-green-700 rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {savingAsset && <LuLoader className="animate-spin text-sm" />}
                {modalMode === 'CREATE' ? 'Save Survey Asset' : 'Update Survey Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyLibraryPage;
