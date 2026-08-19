import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './../Navbar';
import Sidebar from './../Sidebar';
import ImageCarousel from './ImageCarousel';
import CustomDropdown from './../common/CustomDropdown';
import { resolveRemarkRating } from '../../utils/remarkRatingResolver';
import { MdUndo, MdEdit } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import leftArrowImg from '../../assets/leftarrow.PNG';
import rightArrowImg from '../../assets/rightarrow.PNG';

const GenericRatingPage = ({ rowData = {}, config }) => {
  const navigate = useNavigate();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageActiveImages, setPageActiveImages] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [remarkMasterConfig, setRemarkMasterConfig] = useState({});

  // Store data per page and per image
  const [globalReviewData, setGlobalReviewData] = useState({});

  useEffect(() => {
    fetch('/remarkMaster.json')
      .then(res => res.json())
      .then(data => setRemarkMasterConfig(data))
      .catch(err => console.error('Failed to load remarkMaster.json', err));
  }, []);

  const pagesData = config?.pagesData || [];
  const parameters = config?.parameters || [];
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

  const currentCategory = currentPage.overrides?.category || rowData.category || 'N/A';
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

  // Next/prev page navigation
  const handlePrevPage = () => {
    setCurrentPageIndex(prev => Math.max(0, prev - 1));
    setExpandedCard(null); // Close expanded remark box
  };

  const handleNextPage = () => {
    setCurrentPageIndex(prev => Math.min(pagesData.length - 1, prev + 1));
    setExpandedCard(null); // Close expanded remark box
  };

  // Simulate updating chainage based on page
  const displayChainage = rowData.chainage 
    ? `${parseInt(rowData.chainage) || 0 + currentPage.chainageOffset}` // Very simple mock logic
    : `10+${(currentPage.chainageOffset || 0).toString().padStart(3, '0')}`;

  const headers = [
    { key: 'category', label: 'Category', value: currentPage.overrides?.category || rowData.category || 'N/A' },
    { key: 'assetType', label: 'Asset type', value: currentPage.overrides?.assetType || rowData.assetType || 'N/A' },
    { key: 'direction', label: 'Direction', value: currentPage.overrides?.direction || rowData.direction || 'N/A' },
    { key: 'roadType', label: 'Road Type', value: currentPage.overrides?.roadType || rowData.roadType || 'N/A' },
    { key: 'placement', label: 'Placement', value: currentPage.overrides?.placement || 'Shoulder' },
    { key: 'chainage', label: 'Chainage', value: displayChainage }
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded shadow-sm border border-borderColor p-6 pb-24 flex flex-col min-h-full">
            {/* Header Boxes */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-2">
              {headers.map(header => {
                const isExpanded = expandedCard === header.key;
                const hasRemark = headerRemarks[header.key] && headerRemarks[header.key].trim() !== '';
                
                return (
                  <div 
                    key={header.key}
                    className={`border ${hasRemark ? 'border-red-500' : 'border-[#5cb85c]'} p-3 rounded bg-gray-50/30 flex flex-col relative transition-all duration-300 ${isEditMode ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}`}
                    onClick={() => handleCardClick(header.key)}
                  >
                    {/* Inner Border for Edit Mode */}
                    <div className={`absolute inset-0 rounded pointer-events-none transition-all duration-300 ${isEditMode ? `ring-2 ring-inset ${hasRemark ? 'ring-red-500' : 'ring-[#D4AF37]'}` : ''} ${isExpanded && isEditMode ? (hasRemark ? 'bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-[#D4AF37]/5 shadow-[0_0_10px_rgba(212,175,55,0.2)]') : ''}`}></div>
                    
                    <div className="relative z-10">
                      <div className="text-xs text-gray-500 mb-1">{header.label}</div>
                      <div className="font-medium text-gray-800">{header.value}</div>
                    </div>
                    
                    {/* Remark Text Area for Edit Mode */}
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

            {/* Images Carousel and Edit Button */}
            <div className="relative flex items-center justify-between w-full my-4 group">
              
              {/* Previous Page Button */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95, x: [-4, 4, -4, 4, 0] }}
                transition={{ duration: 0.2 }}
                className="z-40 w-14 h-20 sm:w-20 sm:h-32 md:w-24 md:h-40 bg-transparent border-none focus:outline-none outline-none flex items-center justify-center shrink-0 -ml-2 sm:-ml-3"
                onClick={handlePrevPage}
                title="Previous Page"
              >
                <img src={leftArrowImg} className="w-full h-full object-contain mix-blend-multiply drop-shadow-md" alt="Prev Page" draggable={false} />
              </motion.button>

              <div className="flex-1 px-2 md:px-4 min-w-0">
                <ImageCarousel 
                  images={images}
                  activeIndex={activeImageIndex} 
                  onIndexChange={handleImageIndexChange} 
                  isEditMode={isEditMode}
                  baseChainage={displayChainage}
                  onEscape={() => navigate(-1)} 
                />
              </div>

              {/* Next Page Button */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95, x: [-4, 4, -4, 4, 0] }}
                transition={{ duration: 0.2 }}
                className="z-40 w-14 h-20 sm:w-20 sm:h-32 md:w-24 md:h-40 bg-transparent border-none focus:outline-none outline-none flex items-center justify-center shrink-0 -mr-2 sm:-mr-3"
                onClick={handleNextPage}
                title="Next Page"
              >
                <img src={rightArrowImg} className="w-full h-full object-contain mix-blend-multiply drop-shadow-md" alt="Next Page" draggable={false} />
              </motion.button>

              <div className="absolute top-0 right-0 sm:right-2 md:right-4 lg:right-6 z-50 flex flex-col items-center justify-center pointer-events-none">
                <button 
                  onClick={toggleEditMode}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-dashed transition-all duration-300 shadow-sm flex items-center justify-center pointer-events-auto ${isEditMode ? 'border-[#D4AF37] text-white bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-[#5cb85c] text-[#5cb85c] hover:bg-[#5cb85c] hover:text-white bg-white/80 backdrop-blur-sm'}`}
                  aria-label={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
                  title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
                >
                  <MdEdit className="text-xl md:text-2xl" />
                </button>
              </div>
            </div>

            <h2 className="text-lg font-medium text-center mb-2 mt-0 border-b pb-1 text-gray-800">Rating Parameters</h2>

            {/* Parameters Row */}
            <div className="flex flex-col xl:flex-row gap-6 w-full mb-0">
              {parameters.map(param => {
                const key = param.key;
                const title = param.title;
                return (
                  <div key={key} className="flex flex-col border border-borderColor p-4 rounded bg-gray-50/30 shadow-sm flex-1">
                    <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                      <h3 className="font-medium text-lg text-gray-800">{title}</h3>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            name={`rectified-${key}`}
                            value="Rectified"
                            checked={remarks[key] === 'Rectified'}
                            onChange={() => {
                              setRemarks(prev => ({ ...prev, [key]: 'Rectified' }));
                              setRatings(prev => ({ ...prev, [key]: '10' }));
                            }}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Rectified</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            name={`rectified-${key}`}
                            value="Not Rectified"
                            checked={remarks[key] === 'Not Rectified'}
                            onChange={() => {
                              setRemarks(prev => ({ ...prev, [key]: 'Not Rectified' }));
                              setRatings(prev => ({ ...prev, [key]: '5' }));
                            }}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Not Rectified</span>
                        </label>
                        <button onClick={() => handleUndo(key)} className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-1 border-l border-gray-200 pl-3" aria-label={`Undo ${title} changes`} title="Undo changes">
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
                                name={key} 
                                value={val}
                                checked={ratings[key] === val}
                                onChange={(e) => setRatings(prev => ({ ...prev, [key]: e.target.value }))}
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
                        <CustomDropdown 
                          options={remarkOptions}
                          value={remarks[key]}
                          onChange={(val) => {
                            setGlobalReviewData(prevGlobal => {
                              const current = prevGlobal[currentPageIndex] || getInitialState();
                              const newRemarks = { ...current.remarks, [key]: val };
                              const newRatings = { ...current.ratings };
                              
                              if (val && val.toLowerCase() === 'rectified') {
                                newRatings[key] = '10';
                              } else if (val && val.toLowerCase() === 'not rectified') {
                                newRatings[key] = '5';
                              } else {
                                const resolvedRating = resolveRemarkRating(currentCategory, val);
                                if (resolvedRating !== null) {
                                  newRatings[key] = resolvedRating;
                                }
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
  );
};

export default GenericRatingPage;
