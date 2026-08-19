import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdImage, MdOutlineLocationOn, MdArrowBack, MdPerson } from 'react-icons/md';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { dashboardService } from '../services/dashboard.service';

const formatInspector = (name) => (!name || name === 'undefined undefined') ? 'System / Unknown' : name;

const SkipGalleryPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const project = searchParams.get('project') || '';
  
  const [loading, setLoading] = useState(true);
  const [skips, setSkips] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, [project]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getSkipAnalytics(project, {});
      if (res && res.recentSkips) {
        setSkips(res.recentSkips.map(s => ({
          ...s,
          inspector: formatInspector(s.inspector)
        })));
      }
    } catch (err) {
      console.error('Failed to load gallery', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
              <div>
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-gray-500 hover:text-[#166534] transition-colors text-sm font-bold uppercase tracking-wider mb-2"
                >
                  <MdArrowBack className="text-lg" /> Back to Dashboard
                </button>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                  <MdImage className="text-gray-400" />
                  Image Gallery
                  {project && <span className="bg-green-50 text-[#166534] border border-green-200 px-3 py-1 rounded-md text-sm ml-2">{project}</span>}
                </h1>
                <p className="text-sm text-gray-500 mt-2 font-medium">Viewing skipped inspection images related to the selected scope.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#166534] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 mt-4 font-medium tracking-wide">Loading Image Gallery...</p>
              </div>
            ) : skips.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <MdImage className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No Images Found</h3>
                <p className="text-gray-500 mt-2">There are no skipped images available for this project currently.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {skips.map((skip, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                    key={skip._id || idx} 
                    className="group relative rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gray-900 cursor-pointer aspect-[4/3] flex flex-col justify-end"
                    onClick={() => setLightboxImage(skip)}
                  >
                    {skip.imageUrl ? (
                      <img src={skip.imageUrl} alt="Skipped Asset" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-40" />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-100">
                        <MdImage className="text-4xl mb-2 opacity-30" />
                        <span className="text-xs font-medium">Image Unavailable</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10 p-4 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex justify-between items-start mb-1">
                        <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide border border-white/30">
                          {skip.project}
                        </span>
                        <span className="text-white/80 text-[10px] font-medium flex items-center gap-1">
                          <MdOutlineLocationOn /> {skip.chainage || 'N/A'}
                        </span>
                      </div>
                      <h5 className="text-white font-bold text-sm leading-tight mb-2 line-clamp-2 shadow-black drop-shadow-md">{skip.reason}</h5>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white border border-white/50">{skip.inspector?.charAt(0) || '?'}</div>
                        <span className="text-white text-[10px] font-medium truncate">{skip.inspector}</span>
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md border border-white/40 text-white px-4 py-2 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                      View Details
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col max-h-[90vh] overflow-y-auto border border-gray-800 custom-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full bg-gray-100 relative border-b border-gray-200">
                {lightboxImage.imageUrl ? (
                  <img src={lightboxImage.imageUrl} alt="Skipped" className="w-full h-auto max-h-[65vh] object-contain block" />
                ) : (
                  <div className="text-gray-600 flex flex-col items-center py-20">
                    <MdImage className="text-6xl mb-4 opacity-50" />
                    <p className="font-medium text-sm tracking-wide">Image not available</p>
                  </div>
                )}
              </div>
              <div className="w-full p-6 md:p-8 flex flex-col bg-white">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-wide">Location Details</h3>
                  <button onClick={() => setLightboxImage(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
                    <MdClose />
                  </button>
                </div>
                
                <div className="space-y-4 flex-1">
                  
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Reason for Skip</p>
                    <p className="text-red-900 font-extrabold text-base">{lightboxImage.reason}</p>
                    {lightboxImage.remarks && (
                      <p className="text-red-700 text-sm mt-2 pt-2 border-t border-red-100 font-medium italic">"{lightboxImage.remarks}"</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Project</p>
                      <p className="text-gray-900 font-extrabold text-sm">{lightboxImage.project || 'N/A'}</p>
                    </div>
                    <div className="bg-[#f0fdf4] p-3 rounded-lg border border-green-200 shadow-sm">
                      <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">Chainage Location</p>
                      <p className="text-[#166534] font-extrabold text-lg leading-none">{lightboxImage.chainage || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Asset Type</p>
                      <p className="text-gray-900 font-bold text-sm">{lightboxImage.assetType || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date & Time</p>
                      <p className="text-gray-900 font-bold text-xs">{new Date(lightboxImage.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md ring-2 ring-blue-100">
                        {lightboxImage.inspector?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Inspector</p>
                        <p className="text-gray-900 font-extrabold text-sm">{lightboxImage.inspector}</p>
                      </div>
                    </div>
                  </div>

                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 hidden md:block">
                  <button onClick={() => setLightboxImage(null)} className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-lg shadow-sm transition-colors text-sm uppercase tracking-wide">
                    Close Location
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkipGalleryPage;
