import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MdUndo, MdEdit, MdHome, MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCarousel from '../components/Rating/ImageCarousel';
import CustomDropdown from '../components/common/CustomDropdown';
import { ratingService } from '../services/rating.service';
import { resolveRemarkRating } from '../utils/remarkRatingResolver';
import leftArrowImg from '../assets/leftarrow.PNG';
import rightArrowImg from '../assets/rightarrow.PNG';

// REMARK_OPTIONS removed in favor of dynamic JSON config
const SKIP_REASONS = [
  'Image does not match Chainage',
  'Wrong Survey Image',
  'Blurred / Low Quality Image',
  'Image Not Available',
  'Asset Not Visible',
  'Asset Covered / Obstructed',
  'Incorrect Asset Category',
  'Duplicate Image',
  'Chainage Mismatch',
  'GPS / Metadata Error',
  'Technical Extraction Error',
  'Safety Concern',
  'Other'
];

const buildInitialRatings = (task) => {
  if (task.ratings && task.ratings.length > 0) {
    const map = {};
    task.ratings.forEach(r => {
      const key = task.category === 'Roadway' ? r.parameterKey : r.masterListId;
      map[key] = { score: String(r.score ?? 10), remark: r.remark || '' };
    });
    return map;
  }
  const map = {};
  (task.parameters || []).forEach(p => {
    map[p._id] = { score: '10', remark: '' };
  });
  return map;
};

const InspectorApp = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const startIndex = parseInt(searchParams.get('startIndex'), 10) || 0;
  
  const [tasks, setTasks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allRatings, setAllRatings] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [headerRemarks, setHeaderRemarks] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(1);
  const [customRemarkMode, setCustomRemarkMode] = useState({});
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [skipRemarks, setSkipRemarks] = useState('');
  const [skipGroup, setSkipGroup] = useState(null); // Tracks which Asset Type is being skipped for Roadway
  const [skipping, setSkipping] = useState(false);
  const [remarkMasterConfig, setRemarkMasterConfig] = useState({});

  useEffect(() => {
    fetch('/remarkMaster.json')
      .then(res => res.json())
      .then(data => setRemarkMasterConfig(data))
      .catch(err => console.error('Failed to load remarkMaster.json', err));
  }, []);

  useEffect(() => {
    fetchTasks();
    // In case startIndex changes while mounted
    setCurrentIndex(startIndex);
  }, [batchId, startIndex]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await ratingService.getBatchTasks(batchId);
      const fetchedTasks = res.data || [];
      setTasks(fetchedTasks);
      const initialAllRatings = {};
      fetchedTasks.forEach(t => {
        initialAllRatings[t._id] = buildInitialRatings(t);
      });
      setAllRatings(initialAllRatings);
    } catch (err) {
      console.error(err);
      alert('Failed to load inspection tasks.');
    } finally {
      setLoading(false);
    }
  };

  const currentTask = tasks[currentIndex] || null;
  const taskRatings = currentTask ? (allRatings[currentTask._id] || {}) : {};

  const getRating = (masterListId) => taskRatings[masterListId] || { score: '10', remark: '' };

  const setRating = (masterListId, field, value) => {
    setAllRatings(prev => ({
      ...prev,
      [currentTask._id]: {
        ...prev[currentTask._id],
        [masterListId]: {
          ...(prev[currentTask._id]?.[masterListId] || { score: '10', remark: '' }),
          [field]: value
        }
      }
    }));
  };

  const handleUndo = (masterListId) => {
    setAllRatings(prev => ({
      ...prev,
      [currentTask._id]: {
        ...prev[currentTask._id],
        [masterListId]: { score: '10', remark: '' }
      }
    }));
  };

  const firstParam = currentTask?.parameters?.[0] || {};
  
  const displayAssetType = () => {
    const aType = currentTask?.assetType || firstParam.assetType || '-';
    const subType = currentTask?.assetSubType || firstParam.assetSubType;
    return subType ? `${aType} (${subType})` : aType;
  };

  const metaHeaders = currentTask ? [
    { key: 'category',  label: 'Category',   value: currentTask.category || firstParam.category  || '-' },
    { key: 'assetType', label: 'Asset type', value: displayAssetType() },
    { key: 'direction', label: 'Direction',  value: currentTask.direction || firstParam.direction || '-' },
    { key: 'roadType',  label: 'Road Type',  value: currentTask.roadType || firstParam.roadType  || '-' },
    { key: 'placement', label: 'Placement',  value: currentTask.placement || firstParam.placement || '-' },
    { key: 'chainage',  label: 'Chainage',   value: currentTask.chainage || '-' }
  ] : [];

  const saveCurrentTask = async () => {
    if (!currentTask) return true;
    try {
      setSaving(true);
      let ratingsPayload = [];
      if (currentTask.category === 'Roadway') {
        const skippedGroups = new Set((currentTask.skippedAssetTypes || []).map(s => s.assetType));
        ratingsPayload = (currentTask.ratings || [])
          .filter(p => !skippedGroups.has(p.group))
          .map(p => ({
            parameterKey: p.parameterKey,
            parameterName: p.parameterName,
            group: p.group,
            score: Number(taskRatings[p.parameterKey]?.score ?? 10),
            remark: taskRatings[p.parameterKey]?.remark || ''
          }));
      } else {
        ratingsPayload = (currentTask.parameters || []).map(p => ({
          masterListId: p._id,
          score: Number(taskRatings[p._id]?.score ?? 10),
          remark: taskRatings[p._id]?.remark || ''
        }));
      }
      
      const selectedImageUrl = images[activeImageIndex]?.url;
      
      await ratingService.saveTaskRatings(currentTask._id, ratingsPayload, selectedImageUrl);
      setTasks(prev => {
        const updated = [...prev];
        const taskToUpdate = { ...updated[currentIndex], status: 'COMPLETED', ratings: ratingsPayload };
        if (selectedImageUrl) {
          taskToUpdate.image = { ...taskToUpdate.image, cloudinaryUrl: selectedImageUrl };
        }
        updated[currentIndex] = taskToUpdate;
        return updated;
      });
      return true;
    } catch (err) {
      console.error(err);
      alert('Failed to save ratings. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const ok = await saveCurrentTask();
    if (!ok) return;
    if (currentIndex < tasks.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setActiveImageIndex(1);
      setExpandedCard(null);
    } else {
      alert('All tasks completed! Great job.');
      navigate('/rating');
    }
  };

  const handlePrevious = async () => {
    await saveCurrentTask();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setActiveImageIndex(1);
      setExpandedCard(null);
    }
  };

  const handleSkip = async () => {
    if (!skipReason) {
      alert('Please select a skip reason.');
      return;
    }
    if (skipReason === 'Other' && !skipRemarks.trim()) {
      alert('Please provide remarks for skipping.');
      return;
    }

    try {
      setSkipping(true);
      const payload = {
        category: currentTask.category,
        assetType: currentTask.category === 'Roadway' && skipGroup ? skipGroup : currentTask.assetType,
        skipReason: skipReason,
        remarks: skipRemarks
      };
      
      const updatedTaskResponse = await ratingService.skipTask(currentTask._id, payload);
      const returnedTask = updatedTaskResponse.data || updatedTaskResponse;
      
      setTasks(prev => {
        const updated = [...prev];
        updated[currentIndex] = { ...updated[currentIndex], status: returnedTask.status, skippedAssetTypes: returnedTask.skippedAssetTypes };
        return updated;
      });
      
      setSkipModalOpen(false);
      setSkipReason('');
      setSkipRemarks('');
      setSkipGroup(null);
      
      // If task is fully skipped or completed, move to next
      if (returnedTask.status === 'SKIPPED' || returnedTask.status === 'COMPLETED') {
        if (currentIndex < tasks.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setActiveImageIndex(1);
          setExpandedCard(null);
        } else {
          alert('All tasks completed! Great job.');
          navigate('/rating');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to skip task. Please try again.');
    } finally {
      setSkipping(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(e => !e);
    setExpandedCard(null);
  };

  const handleCardClick = (cardKey) => {
    if (!isEditMode) return;
    setExpandedCard(prev => (prev === cardKey ? null : cardKey));
  };

  // Dynamic Remarks Calculation
  const currentCategory = currentTask?.category || firstParam.category || 'N/A';
  const categoryRemarks = remarkMasterConfig[currentCategory] || [];
  const dynamicRemarkOptions = [...categoryRemarks, 'Other'];

  const images = [];
  if (currentTask?.image?.cloudinaryUrl) {
    const c = parseFloat(currentTask.chainage);
    const currentImg = { url: currentTask.image.cloudinaryUrl, chainage: currentTask.chainage };
    const prevImg = currentTask.image.previousUrl ? { url: currentTask.image.previousUrl, chainage: (c - 0.010).toFixed(3) } : currentImg;
    const nextImg = currentTask.image.nextUrl ? { url: currentTask.image.nextUrl, chainage: (c + 0.010).toFixed(3) } : currentImg;
    images.push(prevImg, currentImg, nextImg);
  }

  const renderParamCard = (param) => {
    const pId = param.parameterKey || param._id;
    const rating = getRating(pId);
    return (
      <div
        key={pId}
        className="flex flex-col border border-borderColor p-4 rounded bg-gray-50/30 shadow-sm flex-1 min-w-[300px]"
      >
        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
          <h3 className="font-medium text-lg text-gray-800">{param.parameterName || param.parameter}</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer group">
              <input
                type="radio"
                name={`rectified-${pId}`}
                value="Rectified"
                checked={rating.remark === 'Rectified'}
                onChange={() => {
                  setRating(pId, 'remark', 'Rectified');
                  setRating(pId, 'score', '10');
                }}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Rectified</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer group">
              <input
                type="radio"
                name={`rectified-${pId}`}
                value="Not Rectified"
                checked={rating.remark === 'Not Rectified'}
                onChange={() => {
                  setRating(pId, 'remark', 'Not Rectified');
                  setRating(pId, 'score', '5');
                }}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Not Rectified</span>
            </label>
            <button
              onClick={() => handleUndo(pId)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-1 border-l border-gray-200 pl-3"
              title="Undo changes"
            >
              <MdUndo className="text-lg" />
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-auto">
          <div className="flex gap-4 shrink-0">
            {['0', '1', '5', '10'].map(val => {
              const isRed = val === '0' || val === '1';
              const colorClass = isRed
                ? 'text-red-500 focus:ring-red-500 accent-red-500'
                : 'text-[#5cb85c] focus:ring-[#5cb85c] accent-[#5cb85c]';
              return (
                <label key={val} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name={`rating-${pId}`}
                    value={val}
                    checked={rating.score === val}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRating(pId, 'score', val);
                    }}
                    onKeyDown={(e) => e.preventDefault()}
                    onClick={(e) => e.target.blur()}
                    className={`w-4 h-4 border-gray-300 ${colorClass}`}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{val}</span>
                </label>
              );
            })}
          </div>
          <div className="flex-1 w-full">
            {customRemarkMode[pId] || (rating.remark && !dynamicRemarkOptions.includes(rating.remark) && rating.remark !== 'Other' && rating.remark !== 'Rectified' && rating.remark !== 'Not Rectified') ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={rating.remark === 'Other' ? '' : rating.remark}
                  onChange={(e) => setRating(pId, 'remark', e.target.value)}
                  placeholder="Enter custom remark..."
                  className="w-full px-3 py-1.5 md:min-h-[38px] bg-white border border-[#5cb85c] rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5cb85c]/20 shadow-sm"
                />
                <button
                  onClick={() => {
                    setRating(pId, 'remark', '');
                    setCustomRemarkMode(prev => ({ ...prev, [pId]: false }));
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Cancel custom remark"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
            ) : (
              <CustomDropdown
                options={dynamicRemarkOptions}
                value={rating.remark}
                onChange={(val) => {
                  if (val === 'Other') {
                    setCustomRemarkMode(prev => ({ ...prev, [pId]: true }));
                    setRating(pId, 'remark', '');
                  } else {
                    setRating(pId, 'remark', val);
                    if (val && val.toLowerCase() === 'rectified') {
                      setRating(pId, 'score', '10');
                    } else if (val && val.toLowerCase() === 'not rectified') {
                      setRating(pId, 'score', '5');
                    } else {
                      const resolvedScore = resolveRemarkRating('', val);
                      if (resolvedScore !== null) {
                        setRating(pId, 'score', resolvedScore);
                      }
                    }
                  }
                }}
                placeholder="Remark"
                direction="up"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#F8FAFC] gap-4">
        <div className="w-10 h-10 border-4 border-[#5cb85c] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading inspection data...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#F8FAFC] gap-4">
        <p className="text-gray-500 text-lg">No approved images found for this batch.</p>
        <button
          onClick={() => navigate('/rating')}
          className="px-5 py-2 bg-[#5cb85c] text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Return to Rating Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">

      {/* Top Header */}
      <div className="bg-white border-b border-[#5cb85c]/30 shadow-sm px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/rating')}
            className="p-2 text-gray-500 hover:text-[#5cb85c] hover:bg-green-50 rounded-full transition-colors"
            title="Back to Rating Dashboard"
          >
            <MdHome className="text-xl" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Rating Interface</h1>
            <p className="text-xs text-gray-500">Task {currentIndex + 1} of {tasks.length}</p>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500">
          Chainage: <span className="text-[#5cb85c] font-bold ml-1">{currentTask.chainage}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white rounded shadow-sm border border-borderColor p-6 pb-24 flex flex-col min-h-full mx-0">

          {/* Metadata Header Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-2">
            {metaHeaders.map(header => {
              const isExpanded = expandedCard === header.key;
              const hasRemark = headerRemarks[header.key] && headerRemarks[header.key].trim() !== '';
              return (
                <div
                  key={header.key}
                  className={`border ${hasRemark ? 'border-red-500' : 'border-[#5cb85c]'} p-3 rounded bg-gray-50/30 flex flex-col relative transition-all duration-300 ${isEditMode ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}`}
                  onClick={() => handleCardClick(header.key)}
                >
                  <div className={`absolute inset-0 rounded pointer-events-none transition-all duration-300 ${isEditMode ? `ring-2 ring-inset ${hasRemark ? 'ring-red-500' : 'ring-[#D4AF37]'}` : ''} ${isExpanded && isEditMode ? (hasRemark ? 'bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-[#D4AF37]/5 shadow-[0_0_10px_rgba(212,175,55,0.2)]') : ''}`}></div>
                  <div className="relative z-10">
                    <div className="text-xs text-gray-500 mb-1">{header.label}</div>
                    <div className="font-medium text-gray-800">{header.value}</div>
                  </div>
                  <AnimatePresence>
                    {isEditMode && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden relative z-10 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <textarea
                          autoFocus
                          className={`w-full p-2 border ${hasRemark ? 'border-red-500 focus:ring-red-500/50' : 'border-[#5cb85c] focus:ring-[#5cb85c]/50'} rounded focus:ring-2 focus:outline-none resize-y min-h-[80px] text-sm text-gray-800 bg-white`}
                          placeholder="Enter remark..."
                          value={headerRemarks[header.key] || ''}
                          onChange={(e) => setHeaderRemarks(prev => ({ ...prev, [header.key]: e.target.value }))}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Image Carousel with Arrow Navigation */}
          <div className="relative flex items-center justify-between w-full my-4 group">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="z-40 w-14 h-20 sm:w-20 sm:h-32 md:w-24 md:h-40 bg-transparent border-none focus:outline-none flex items-center justify-center shrink-0 -ml-2 sm:-ml-3"
              onClick={handlePrevious}
              disabled={currentIndex === 0 || saving}
              title="Previous Task"
            >
              <img
                src={leftArrowImg}
                className={`w-full h-full object-contain mix-blend-multiply drop-shadow-md transition-opacity ${currentIndex === 0 ? 'opacity-30' : 'opacity-100'}`}
                alt="Previous Task"
                draggable={false}
              />
            </motion.button>

            <div className="flex-1 px-2 md:px-4 min-w-0">
              <ImageCarousel
                images={images}
                activeIndex={activeImageIndex}
                onIndexChange={setActiveImageIndex}
                isEditMode={isEditMode}
                baseChainage={currentTask.chainage}
                onEscape={() => navigate('/rating')}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="z-40 w-14 h-20 sm:w-20 sm:h-32 md:w-24 md:h-40 bg-transparent border-none focus:outline-none flex items-center justify-center shrink-0 -mr-2 sm:-mr-3"
              onClick={handleNext}
              disabled={saving}
              title={currentIndex === tasks.length - 1 ? 'Finish' : 'Next Task'}
            >
              <img
                src={rightArrowImg}
                className="w-full h-full object-contain mix-blend-multiply drop-shadow-md"
                alt="Next Task"
                draggable={false}
              />
            </motion.button>

            {/* Edit Mode Toggle */}
            <div className="absolute top-0 right-0 sm:right-2 md:right-4 lg:right-6 z-50 flex flex-col items-center justify-center pointer-events-none">
              <button
                onClick={toggleEditMode}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-dashed transition-all duration-300 shadow-sm flex items-center justify-center pointer-events-auto ${isEditMode ? 'border-[#D4AF37] text-white bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-[#5cb85c] text-[#5cb85c] hover:bg-[#5cb85c] hover:text-white bg-white/80 backdrop-blur-sm'}`}
                aria-label={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
              >
                <MdEdit className="text-xl md:text-2xl" />
              </button>
            </div>
          </div>

          {/* Rating Parameters */}
          <h2 className="text-lg font-medium text-center mb-2 mt-0 border-b pb-1 text-gray-800">
            Rating Parameters
          </h2>

          <div className="flex flex-col gap-6 w-full mb-0">
            {currentTask.category === 'Roadway' ? (
              ['Pavement', 'Shoulder', 'Kerb', 'Pavement Markings'].map(group => {
                const groupParams = (currentTask.ratings || []).filter(p => p.group === group);
                if (groupParams.length === 0) return null;
                const isSkipped = (currentTask.skippedAssetTypes || []).some(s => s.assetType === group);
                return (
                  <div key={group} className={`flex flex-col w-full ${isSkipped ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between mb-3 pb-1 border-b-2 border-gray-200">
                      <h3 className="text-md font-bold text-gray-700">{group} {isSkipped && '(SKIPPED)'}</h3>
                      {!isSkipped && (
                        <button
                          onClick={() => {
                            setSkipGroup(group);
                            setSkipModalOpen(true);
                          }}
                          className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        >
                          Skip Asset
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col xl:flex-row gap-6 w-full flex-wrap">
                       {groupParams.map(param => renderParamCard(param))}
                    </div>
                  </div>
                );
              })
            ) : currentTask.assetType === 'Roadway' ? (
              ['Kerb', 'Shoulder', 'Pavement'].map(group => {
                const groupParams = (currentTask.parameters || []).filter(p => p.assetType === group);
                if (groupParams.length === 0) return null;
                return (
                  <div key={group} className="flex flex-col w-full">
                    <h3 className="text-md font-bold text-gray-700 mb-3 pb-1 border-b-2 border-gray-200">{group}</h3>
                    <div className="flex flex-col xl:flex-row gap-6 w-full flex-wrap">
                       {groupParams.map(param => renderParamCard(param))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col xl:flex-row gap-6 w-full flex-wrap">
                {(currentTask.parameters || []).map(param => renderParamCard(param))}
              </div>
            )}

            {currentTask.category !== 'Roadway' && (!currentTask.parameters || currentTask.parameters.length === 0) && (
              <div className="flex-1 flex items-center justify-center py-12 text-gray-400 border border-dashed border-gray-300 rounded-lg">
                No rating parameters found for this task.
              </div>
            )}
            
            {currentTask.category === 'Roadway' && (!currentTask.ratings || currentTask.ratings.length === 0) && (
              <div className="flex-1 flex items-center justify-center py-12 text-gray-400 border border-dashed border-gray-300 rounded-lg">
                No rating parameters found for this task.
              </div>
            )}
          </div>

          {/* Save / Navigation Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-start z-30 shadow-lg">
            <div className="text-sm text-gray-500">
              Task <span className="font-semibold text-gray-800">{currentIndex + 1}</span> of <span className="font-semibold text-gray-800">{tasks.length}</span>
              {saving || skipping ? (
                <span className="ml-3 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Processing...</span>
              ) : currentTask.status === 'COMPLETED' ? (
                <span className="ml-3 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Saved</span>
              ) : currentTask.status === 'SKIPPED' ? (
                <span className="ml-3 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">Skipped</span>
              ) : null}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => setSkipModalOpen(true)}
                disabled={saving || skipping}
                className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none transition-colors border border-gray-200"
              >
                Skip Question
              </button>
            </div>
          </div>

          {/* Skip Confirmation Modal */}
          <AnimatePresence>
            {skipModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-900">Skip {skipGroup ? skipGroup : 'Question'}</h3>
                    <button
                      onClick={() => {
                        setSkipModalOpen(false);
                        setSkipReason('');
                        setSkipRemarks('');
                        setSkipGroup(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MdClose className="text-xl" />
                    </button>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Please select a reason for skipping this inspection task.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                          Skip Reason <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={skipReason}
                          onChange={(e) => setSkipReason(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5cb85c]/20 focus:border-[#5cb85c] shadow-sm transition-shadow appearance-none cursor-pointer"
                        >
                          <option value="">Select a reason...</option>
                          {SKIP_REASONS.map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                      </div>
                      
                      {skipReason === 'Other' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                            Remarks <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={skipRemarks}
                            onChange={(e) => setSkipRemarks(e.target.value)}
                            placeholder="Please provide details..."
                            rows={3}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5cb85c]/20 focus:border-[#5cb85c] shadow-sm transition-shadow resize-none"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSkipModalOpen(false);
                        setSkipReason('');
                        setSkipRemarks('');
                        setSkipGroup(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSkip}
                      disabled={skipping || !skipReason || (skipReason === 'Other' && !skipRemarks.trim())}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {skipping ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Skipping...
                        </>
                      ) : (
                        'Confirm Skip'
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default InspectorApp;
