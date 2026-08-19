import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdFullscreen, MdClose, MdZoomIn, MdZoomOut, MdRotateRight, MdRotateLeft, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const ImageCarousel = ({ images = [], activeIndex = 1, onIndexChange, isEditMode = false, baseChainage, onEscape }) => {
  const currentIndex = activeIndex;
  const [fullScreenIndex, setFullScreenIndex] = useState(null);
  
  // Fullscreen specific states
  const [rotation, setRotation] = useState(0);

  const nextImage = useCallback(() => {
    if (onIndexChange) {
      onIndexChange(Math.min(currentIndex + 1, images.length - 1));
    }
  }, [currentIndex, images.length, onIndexChange]);

  const prevImage = useCallback(() => {
    if (onIndexChange) {
      onIndexChange(Math.max(currentIndex - 1, 0));
    }
  }, [currentIndex, onIndexChange]);

  // Fullscreen navigation
  const nextFsImage = useCallback((e) => {
    if (e) e.stopPropagation();
    if (fullScreenIndex < images.length - 1) {
      setFullScreenIndex(fullScreenIndex + 1);
      setRotation(0);
    }
  }, [fullScreenIndex, images.length]);

  const prevFsImage = useCallback((e) => {
    if (e) e.stopPropagation();
    if (fullScreenIndex > 0) {
      setFullScreenIndex(fullScreenIndex - 1);
      setRotation(0);
    }
  }, [fullScreenIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (fullScreenIndex !== null) {
        if (e.key === 'Escape') setFullScreenIndex(null);
        if (e.key === 'ArrowRight') nextFsImage();
        if (e.key === 'ArrowLeft') prevFsImage();
      } else {
        if (e.key === 'Escape' && onEscape) onEscape();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage, fullScreenIndex, nextFsImage, prevFsImage, onEscape]);

  // Handle swipe gestures
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      if (fullScreenIndex !== null) nextFsImage();
      else nextImage();
    }
    if (isRightSwipe) {
      if (fullScreenIndex !== null) prevFsImage();
      else prevImage();
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="relative w-full max-w-[1400px] mx-auto flex flex-col items-center justify-center mb-0 select-none overflow-hidden pb-0">
        <div className="relative w-full flex items-center justify-center h-[260px] sm:h-[350px] md:h-[450px] lg:h-[500px]">
          {/* Images Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center" 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Fixed Center Frame */}
            <div className="absolute w-[85%] sm:w-[65%] md:w-[60%] aspect-video rounded-[24px] border-[3px] border-green-500 z-40 pointer-events-none shadow-[0_0_20px_rgba(34,197,94,0.25)] ring-4 ring-white/50"></div>

            {images.map((img, index) => {
              const distance = index - currentIndex;
              
              // Calculate transforms based on the distance from the center
              let x = '0%';
              let scale = 1;
              let zIndex = 30;
              let opacity = 1;
              let brightness = 1;

              if (distance === 0) {
                x = '0%';
                scale = 1;
                zIndex = 30;
                opacity = 1;
                brightness = 1;
              } else if (distance < 0) {
                const absDist = Math.abs(distance);
                x = `calc(-105% - ${(absDist - 1) * 105}%)`;
                scale = 0.9;
                zIndex = 20 - absDist;
                opacity = 0.85;
                brightness = 0.85;
              } else if (distance > 0) {
                x = `calc(105% + ${(distance - 1) * 105}%)`;
                scale = 0.9;
                zIndex = 20 - distance;
                opacity = 0.85;
                brightness = 0.85;
              }

              return (
                <motion.div
                  key={img + index}
                  initial={false}
                  animate={{
                    x,
                    scale,
                    zIndex,
                    opacity,
                    filter: `brightness(${brightness})`
                  }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="absolute w-[85%] sm:w-[65%] md:w-[60%] aspect-video bg-white rounded-[24px] border border-gray-200 shadow-[0_16px_50px_rgba(0,0,0,0.12)] group"
                >
                  {/* Chainage Display Above Image */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-gray-800 font-bold text-lg whitespace-nowrap z-50 transition-opacity">
                    {img.chainage || ''}
                  </div>

                  <div 
                    className="w-full h-full overflow-hidden rounded-[24px] cursor-pointer relative"
                    onClick={() => {
                      setFullScreenIndex(index);
                      setRotation(0);
                    }}
                  >
                    <motion.img 
                      src={img.url || img} 
                      alt={`Road view ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      draggable={false}
                    />
                    
                    {/* Fullscreen Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullScreenIndex(index);
                        setRotation(0);
                      }}
                      className="absolute top-4 right-4 z-40 bg-white/90 backdrop-blur hover:bg-white text-gray-700 hover:text-green-600 p-2 rounded-full shadow-md transition-all"
                    >
                      <MdFullscreen className="text-2xl" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullScreenIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          >
            <TransformWrapper
              key={fullScreenIndex}
              initialScale={1}
              minScale={1}
              maxScale={8}
              centerOnInit={true}
              wheel={{ step: 0.02 }}
              doubleClick={{ step: 0.2 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  {/* Top Right Controls */}
                  <div className="absolute top-12 right-6 z-50 flex flex-col gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); zoomIn(0.1); }}
                      className="w-12 h-12 bg-[#4CAF50] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#45a049] hover:scale-105 transition-all text-2xl"
                    >
                      <MdZoomIn />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); zoomOut(0.1); }}
                      className="w-12 h-12 bg-[#4CAF50] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#45a049] hover:scale-105 transition-all text-2xl"
                    >
                      <MdZoomOut />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setRotation(prev => prev + 90); }}
                      className="w-12 h-12 bg-[#4CAF50] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#45a049] hover:scale-105 transition-all text-2xl"
                    >
                      <MdRotateRight />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setRotation(prev => prev - 90); }}
                      className="w-12 h-12 bg-[#4CAF50] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#45a049] hover:scale-105 transition-all text-2xl"
                    >
                      <MdRotateLeft />
                    </button>
                    
                    <div className="w-full h-px bg-white/20 my-1"></div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); resetTransform(); setFullScreenIndex(null); }}
                      className="w-12 h-12 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 hover:scale-105 transition-all text-2xl"
                    >
                      <MdClose />
                    </button>
                  </div>

                  {/* Main Image View */}
                  <div 
                    className="relative w-full h-full flex items-center justify-center"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <motion.img
                        key={`fs-${fullScreenIndex}`}
                        src={images[fullScreenIndex]?.url || images[fullScreenIndex]}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          rotate: rotation
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
                        style={{ originX: 0.5, originY: 0.5 }}
                      />
                    </TransformComponent>
                  </div>
                </>
              )}
            </TransformWrapper>

            {/* Left Nav */}
            <button
              onClick={prevFsImage}
              disabled={fullScreenIndex === 0}
              className="absolute left-6 z-50 w-14 h-14 bg-white/10 hover:bg-white text-white hover:text-gray-900 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg disabled:opacity-20 disabled:pointer-events-none"
            >
              <MdChevronLeft className="text-4xl" />
            </button>

            {/* Right Nav */}
            <button
              onClick={nextFsImage}
              disabled={fullScreenIndex === images.length - 1}
              className="absolute right-auto md:right-28 left-auto right-6 z-50 w-14 h-14 bg-white/10 hover:bg-white text-white hover:text-gray-900 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg disabled:opacity-20 disabled:pointer-events-none"
              style={{ right: 'calc(48px + 3rem + 2rem)' }} // Offset by the tool buttons on the right. Actually, I can just use a fixed right offset, e.g. right-32
            >
              <MdChevronRight className="text-4xl" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageCarousel;
