import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './../Navbar';
import Sidebar from './../Sidebar';
import CloneImageCarousel from './CloneImageCarousel';
import CustomDropdown from './../common/CustomDropdown';
import { resolveRemarkRating } from '../../utils/remarkRatingResolver';
import { 
  MdUndo, MdEdit, MdMap, MdTerrain, MdArrowForward, 
  MdEditRoad, MdVerticalAlignBottom, MdGpsFixed,
  MdChevronLeft, MdChevronRight, MdClear, MdSave
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const CloneRatingPage = ({ rowData = {}, config }) => {
  const navigate = useNavigate();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [pageActiveImages, setPageActiveImages] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [remarkMasterConfig, setRemarkMasterConfig] = useState({});

  useEffect(() => {
    fetch('/remarkMaster.json')
      .then(res => res.json())
      .then(data => setRemarkMasterConfig(data))
      .catch(err => console.error('Failed to load remarkMaster.json', err));
  }, []);

  const [globalReviewData, setGlobalReviewData] = useState({});

  const pagesData = config?.pagesData || [];
  const currentPage = pagesData[currentPageIndex] || { images: [], chainageOffset: 0 };
  const images = currentPage.images;

  const storedIndex = pageActiveImages[currentPageIndex];
  const activeImageIndex = Math.max(0, Math.min(storedIndex ?? 1, images.length - 1));

  const handleImageIndexChange = (newIndex) => {
    setPageActiveImages(prev => ({
      ...prev,
      [currentPageIndex]: newIndex
    }));
  };

  const slideConfigs = [
    {
      parameters: [
        { key: 'rutting', title: 'Rutting' },
        { key: 'crack', title: 'Crack' },
        { key: 'pothole', title: 'Pothole' }
      ],
      overrides: { direction: 'LHS', placement: 'Shoulder', chainage: '100' }
    },
    {
      parameters: [
        { key: 'shyness_line', title: 'Shyness Line' },
        { key: 'lane_line', title: 'Lane Line' },
        { key: 'edge_line', title: 'Edge Line' }
      ],
      overrides: { direction: 'RHS', placement: 'Median', chainage: '200' }
    },
    {
      parameters: [
        { key: 'rutting', title: 'Rutting' },
        { key: 'crack', title: 'Crack' },
        { key: 'pothole', title: 'Pothole' }
      ],
      overrides: { direction: 'LHS', placement: 'Shoulder', chainage: '300' }
    }
  ];

  const currentSlideConfig = slideConfigs[activeImageIndex % slideConfigs.length];
  const parameters = currentSlideConfig.parameters;

  const getInitialState = () => {
    const ratings = {};
    const remarks = {};
    parameters.forEach(param => {
      ratings[param.key] = '10';
      remarks[param.key] = '';
    });
    return {
      ratings,
      remarks,
      headerRemarks: { category: '', assetType: '', direction: '', roadType: '', placement: '', chainage: '' }
    };
  };

  const getCurrentData = () => {
    return globalReviewData[currentPageIndex] || getInitialState();
  };

  const updateCurrentData = (field, updater) => {
    setGlobalReviewData(prev => {
      const current = prev[currentPageIndex] || getInitialState();
      
      const currentValue = current[field];
      const nextValue = typeof updater === 'function' ? updater(currentValue) : updater;
      
      return {
        ...prev,
        [currentPageIndex]: { ...current, [field]: nextValue }
      };
    });
  };

  const setRatings = (updater) => updateCurrentData('ratings', updater);
  const setRemarks = (updater) => updateCurrentData('remarks', updater);
  const setHeaderRemarks = (updater) => updateCurrentData('headerRemarks', updater);

  const handleUndo = (key) => {
    setRatings(prev => ({ ...prev, [key]: '10' }));
    setRemarks(prev => ({ ...prev, [key]: '' }));
  };

  const currentData = getCurrentData();
  const ratings = currentData.ratings;
  const remarks = currentData.remarks;
  const headerRemarks = currentData.headerRemarks;

  const currentCategory = currentSlideConfig.overrides.category || rowData.category || 'N/A';
  const categoryRemarks = remarkMasterConfig[currentCategory] || [];
  const remarkOptions = [...categoryRemarks, 'Other'];

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setExpandedCard(null);
  };

  const handleCardClick = (cardName) => {
    if (!isEditMode) return;
    setExpandedCard(expandedCard === cardName ? null : cardName);
  };

  const handlePrevPage = () => {
    setCurrentPageIndex(prev => Math.max(0, prev - 1));
    setExpandedCard(null);
  };

  const handleNextPage = () => {
    setCurrentPageIndex(prev => Math.min(pagesData.length - 1, prev + 1));
    setExpandedCard(null);
  };

  const displayChainage = currentSlideConfig.overrides.chainage || rowData.chainage || '10+000';

  const headers = [
    { key: 'category', label: 'Category', value: currentSlideConfig.overrides.category || rowData.category || 'N/A', icon: MdMap },
    { key: 'assetType', label: 'Asset Type', value: currentSlideConfig.overrides.assetType || rowData.assetType || 'N/A', icon: MdTerrain },
    { key: 'direction', label: 'Direction', value: currentSlideConfig.overrides.direction || rowData.direction || 'N/A', icon: MdArrowForward },
    { key: 'roadType', label: 'Road Type', value: currentSlideConfig.overrides.roadType || rowData.roadType || 'N/A', icon: MdEditRoad },
    { key: 'placement', label: 'Placement', value: currentSlideConfig.overrides.placement || 'Shoulder', icon: MdVerticalAlignBottom },
    { key: 'chainage', label: 'Chainage', value: displayChainage, icon: MdGpsFixed }
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        {!isLargeScreen && <Sidebar />}
        
        {/* Main Content Dashboard */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-6 gap-6 bg-gray-50/50">
          
          {/* Left Information Panel */}
          {!isLargeScreen && (
            <div className="w-full md:w-64 lg:w-72 flex flex-col gap-4 overflow-y-auto shrink-0 pr-1 pb-4 hide-scrollbar">
              {headers.map((header) => {
                const Icon = header.icon;
              const isExpanded = expandedCard === header.key;
              const hasRemark = headerRemarks[header.key] && headerRemarks[header.key].trim() !== '';

              return (
                <div 
                  key={header.key}
                  className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col transition-all duration-300 relative ${isEditMode ? 'cursor-pointer hover:shadow-md' : 'cursor-default'} ${hasRemark ? 'border-red-400' : 'border-gray-100'}`}
                  onClick={() => handleCardClick(header.key)}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${hasRemark ? 'bg-red-500' : 'bg-transparent'}`}></div>
                  
                  {/* Inner Border for Edit Mode */}
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${isEditMode ? `ring-2 ring-inset ${hasRemark ? 'ring-red-500' : 'ring-[#D4AF37]'}` : ''} ${isExpanded && isEditMode ? (hasRemark ? 'bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-[#D4AF37]/5 shadow-[0_0_10px_rgba(212,175,55,0.2)]') : ''}`}></div>

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-green-50/50 flex items-center justify-center shrink-0">
                      <Icon className="text-2xl text-[#2e7d32]" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">{header.label}</div>
                      <div className="font-bold text-gray-800 leading-tight">{header.value}</div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isEditMode && isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <textarea 
                          autoFocus
                          className={`w-full p-3 border ${hasRemark ? 'border-red-400 focus:ring-red-400/50' : 'border-green-200 focus:ring-green-400/50'} rounded-lg focus:ring-2 focus:outline-none resize-y min-h-[80px] text-sm text-gray-800 bg-gray-50`}
                          placeholder={`Enter remark...`}
                          value={headerRemarks[header.key]}
                          onChange={(e) => setHeaderRemarks(prev => ({ ...prev, [header.key]: e.target.value }))}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          )}

          {/* Main Inspection Area Wrapper */}
          <div className="flex-1 relative flex flex-col min-w-0 z-50">
            
            {/* Edit Mode Toggle Absolute - Moved to Wrapper to prevent clipping and scrolling */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-[60] transform -translate-x-1/2 -translate-y-1/2">
              <button 
                onClick={toggleEditMode}
                className={`w-12 h-12 rounded-full border-2 transition-all duration-300 shadow-sm flex items-center justify-center ${isEditMode ? 'border-solid border-[#D4AF37] text-white bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-dashed border-[#5cb85c] text-[#5cb85c] hover:bg-[#5cb85c] hover:text-white bg-white/90 backdrop-blur-sm'}`}
                title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
              >
                <MdEdit className="text-xl" />
              </button>
            </div>

            {/* Main Inspection Area (Image + Ratings) */}
            <div className="flex-1 flex flex-col overflow-y-auto hide-scrollbar pb-6 gap-6 rounded-2xl bg-white shadow-sm border border-gray-100 p-4 md:p-6">
            
              {/* Huge Image Carousel Container */}
            <div className="w-full bg-gray-50/50 rounded-2xl overflow-hidden relative">
              <CloneImageCarousel 
                images={images}
                activeIndex={activeImageIndex} 
                onIndexChange={handleImageIndexChange} 
                isEditMode={isEditMode}
                onEscape={() => {
                  if (isLargeScreen) setIsLargeScreen(false);
                  else navigate(-1);
                }} 
                isLargeScreen={isLargeScreen}
                onToggleLargeScreen={() => setIsLargeScreen(!isLargeScreen)}
              />
            </div>

            {/* Rating Parameters Section */}
            <div className="flex flex-col gap-3 mt-2">
              <h2 className="text-lg font-bold text-gray-800 px-2">Rating Parameters</h2>
              <div className="flex flex-col xl:flex-row gap-4 w-full">
                {parameters.map(param => {
                  const key = param.key;
                  const title = param.title;
                  return (
                    <div key={key} className="flex-1 flex flex-col border border-gray-100 p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800">{title}</h3>
                        <button onClick={() => handleUndo(key)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Clear parameter">
                          <MdUndo className="text-xl" />
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-auto">
                        <div className="flex gap-4 shrink-0">
                          {['0', '1', '5', '10'].map(val => {
                            const isRed = val === '0' || val === '1';
                            const colorClass = isRed 
                              ? 'text-red-500 focus:ring-red-500 accent-red-500' 
                              : 'text-[#5cb85c] focus:ring-[#5cb85c] accent-[#5cb85c]';
                            
                            return (
                              <label key={val} className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                  type="radio" 
                                  name={key} 
                                  value={val}
                                  checked={ratings[key] === val}
                                  onChange={(e) => setRatings(prev => ({ ...prev, [key]: e.target.value }))}
                                  onKeyDown={(e) => e.preventDefault()}
                                  onClick={(e) => e.target.blur()}
                                  className={`w-5 h-5 border-gray-300 ${colorClass} cursor-pointer`} 
                                />
                                <span className="text-base font-semibold text-gray-600 group-hover:text-gray-900">{val}</span>
                              </label>
                            );
                          })}
                        </div>
                        <div className="flex-1 w-full sm:min-w-[150px]">
                          <CustomDropdown 
                            options={remarkOptions}
                            value={remarks[key]}
                            onChange={(val) => {
                              setGlobalReviewData(prevGlobal => {
                                const current = prevGlobal[currentPageIndex] || getInitialState();
                                const newRemarks = { ...current.remarks, [key]: val };
                                const newRatings = { ...current.ratings };
                                
                                const resolvedRating = resolveRemarkRating(currentCategory, val);
                                if (resolvedRating !== null) {
                                  newRatings[key] = resolvedRating;
                                }
                                
                                return {
                                  ...prevGlobal,
                                  [currentPageIndex]: { ...current, remarks: newRemarks, ratings: newRatings }
                                };
                              });
                            }}
                            placeholder="Remark"
                            direction="up"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CloneRatingPage;
