import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSkipNext, MdClose, MdImage, MdOutlineLocationOn, MdHistory, MdPerson, MdDashboard, MdListAlt, MdMap } from 'react-icons/md';
import { dashboardService } from '../../services/dashboard.service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const formatInspector = (name) => (!name || name === 'undefined undefined') ? 'System / Unknown' : name;

const SkipAnalytics = ({ selectedProject, globalFilters = {} }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedProject, globalFilters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getSkipAnalytics(selectedProject, globalFilters);
      
      // Clean up inspector names directly in data to avoid inline formatting everywhere
      if (res.recentSkips) {
        res.recentSkips = res.recentSkips.map(skip => ({
          ...skip,
          inspector: formatInspector(skip.inspector)
        }));
      }
      if (res.inspectorCounts) {
        res.inspectorCounts = res.inspectorCounts.map(insp => ({
          ...insp,
          inspector: formatInspector(insp.inspector)
        }));
      }

      setData(res);
    } catch (err) {
      console.error('Failed to fetch skip analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMostCommonReason = (inspectorName) => {
    if (!data?.recentSkips) return 'N/A';
    const skips = data.recentSkips.filter(s => s.inspector === inspectorName);
    if (!skips.length) return 'Multiple Reasons';
    const reasonCounts = skips.reduce((acc, skip) => {
      acc[skip.reason] = (acc[skip.reason] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(reasonCounts).reduce((a, b) => reasonCounts[a] > reasonCounts[b] ? a : b);
  };

  if (loading && !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#166534] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 font-medium tracking-wide">Loading Skip Locations...</p>
      </div>
    );
  }

  if (!data) return null;

  // 1. Executive KPIs
  const criticalChainages = data.chainageHotspots?.length || 0;
  const projectsAffected = data.projectCounts?.length || 0;

  // 2. Max Values for Progress Bars
  const maxReasonCount = data.reasonDistribution?.length ? Math.max(...data.reasonDistribution.map(r => r.count)) : 1;
  const maxProjectCount = data.projectCounts?.length ? Math.max(...data.projectCounts.map(p => p.count)) : 1;

  // 3. Interactive Skip Map Data (Scatter Plot acting as Map)
  const mapData = {
    datasets: [{
      label: 'Skip Locations',
      data: data.chainageHotspots?.map((spot, i) => ({
        x: spot.x, // Chainage
        y: selectedProject ? 1 : (i % 3) + 1, // Spread vertically if multiple projects or just random layer
        count: spot.y
      })) || [],
      backgroundColor: 'rgba(22, 101, 52, 0.8)',
      borderColor: '#166534',
      pointRadius: (ctx) => {
        const count = ctx.raw?.count || 1;
        return Math.min(Math.max(count * 3, 6), 15);
      },
      pointHoverRadius: 18
    }]
  };
  
  const mapOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 14,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `Chainage: ${ctx.raw.x} | Total Skips: ${ctx.raw.count}`
        }
      }
    },
    scales: {
      x: { 
        title: { display: true, text: 'Highway Chainage (km)', font: { weight: 'bold' } }, 
        grid: { drawBorder: false } 
      },
      y: { 
        display: false, // Hide Y axis to make it look like a linear map
        min: 0,
        max: 4
      }
    }
  };

  return (
    <div className="bg-[#f8fafc] rounded-xl mb-8 flex flex-col gap-6 font-sans">
      
      {/* 1. Executive KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Skipped', value: data.totalSkipped, color: 'bg-red-500' },
          { label: 'Average Skip Rate', value: `${data.skipRate}%`, color: 'bg-blue-500' },
          { label: 'Projects Affected', value: projectsAffected, color: 'bg-purple-500' },
          { label: 'Critical Skip Locations', value: criticalChainages, color: 'bg-orange-500' }
        ].map((kpi, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${kpi.color}`}></div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 pl-2">{kpi.label}</p>
            <h4 className="text-3xl font-extrabold text-[#0f172a] pl-2">{kpi.value}</h4>
          </motion.div>
        ))}
      </div>

      {/* 2. Image Gallery (Reintroduced) */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <h4 className="text-[13px] font-extrabold text-gray-800 mb-6 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdImage className="text-gray-400 text-lg" /> Recent Skipped Images Gallery
          </div>
          <button 
            onClick={() => navigate(`/skip-gallery?project=${encodeURIComponent(selectedProject || '')}`)}
            className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors text-[10px] px-3 py-1.5 rounded font-bold border border-blue-200 shadow-sm flex items-center gap-1 cursor-pointer"
          >
            IMAGE GALLERY
          </button>
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.recentSkips?.slice(0, 4).map((skip, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
              key={skip._id || idx} 
              className="group relative rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gray-900 cursor-pointer aspect-[4/3] flex flex-col justify-end"
              onClick={() => setLightboxImage(skip)}
            >
              {skip.imageUrl ? (
                <img src={skip.imageUrl} alt="Skipped Asset" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-40" />
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
          {(!data.recentSkips || data.recentSkips.length === 0) && (
            <div className="col-span-full py-10 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <MdImage className="mx-auto text-3xl mb-3 text-gray-300" />
              <p className="font-medium text-sm">No recent skipped images found matching criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Skip Locations (Hero Section) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h4 className="text-[14px] font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <MdListAlt className="text-[#166534] text-xl" /> Skipped Inspection Locations
          </h4>
          <span className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded font-bold border border-red-100 shadow-sm">High Priority</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Location & Project</th>
                <th className="px-6 py-4">Asset Type</th>
                <th className="px-6 py-4">Skip Reason</th>
                <th className="px-6 py-4">Inspector & Time</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentSkips?.slice(0, 5).map((skip, idx) => (
                <motion.tr 
                  key={skip._id || idx} 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.1 }}
                  className="hover:bg-[#f8fafc] transition-colors group bg-white"
                >
                  {/* Thumbnail */}
                  <td className="px-6 py-3 w-[80px]">
                    <div 
                      className="w-16 h-12 bg-gray-200 rounded overflow-hidden cursor-pointer border border-gray-300 shadow-sm relative group-hover:shadow-md transition-all"
                      onClick={() => setLightboxImage(skip)}
                    >
                      {skip.imageUrl ? (
                        <img src={skip.imageUrl} alt="skip" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><MdImage /></div>
                      )}
                    </div>
                  </td>
                  
                  {/* Location & Project */}
                  <td className="px-6 py-3">
                    <div className="font-extrabold text-[#166534] text-sm flex items-center gap-1">
                      <MdOutlineLocationOn /> {skip.chainage || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 font-bold uppercase mt-0.5">{skip.project}</div>
                  </td>
                  
                  {/* Asset Type */}
                  <td className="px-6 py-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                      {skip.assetType || 'N/A'}
                    </span>
                  </td>
                  
                  {/* Reason */}
                  <td className="px-6 py-3">
                    <div className="font-bold text-gray-900 truncate max-w-[200px]">{skip.reason}</div>
                  </td>
                  
                  {/* Inspector & Time */}
                  <td className="px-6 py-3">
                    <div className="font-semibold text-gray-700 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold">
                        {skip.inspector?.charAt(0) || '?'}
                      </div>
                      {skip.inspector}
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium mt-1">
                      {new Date(skip.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  
                  {/* Action */}
                  <td className="px-6 py-3 text-right">
                    <button 
                      onClick={() => setLightboxImage(skip)}
                      className="px-4 py-2 bg-white border border-gray-200 text-[#166534] font-bold text-xs rounded hover:bg-[#166534] hover:text-white transition-colors shadow-sm"
                    >
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
              {(!data.recentSkips || data.recentSkips.length === 0) && (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium">No skip locations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Interactive Skip Map */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <h4 className="text-[13px] font-extrabold text-gray-800 mb-6 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdMap className="text-gray-400 text-lg" /> Interactive Skip Locations Map
          </div>
          <span className="text-xs text-gray-500 font-medium">1D Chainage Plot</span>
        </h4>
        <div className="h-[250px] w-full bg-[#f8fafc] rounded-lg border border-dashed border-gray-200 p-2 relative">
          {data.chainageHotspots?.length > 0 ? (
            <Scatter data={mapData} options={mapOptions} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium text-sm">
              <MdOutlineLocationOn className="mr-2" /> No location markers to plot
            </div>
          )}
        </div>
      </div>

      {/* 4 & 5. Project-wise Skip Ranking */}
      <div className="w-full mb-6">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="text-[13px] font-extrabold text-gray-800 mb-6 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span> Project-wise Skip Ranking
          </h4>
          <div className="space-y-5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {data.projectCounts?.map((p, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{p.project}</span>
                  <span className="font-bold text-gray-900">{p.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${(p.count / maxProjectCount) * 100}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="bg-blue-600 h-full rounded-full relative"
                  ></motion.div>
                </div>
              </div>
            ))}
            {!data.projectCounts?.length && <div className="text-center text-gray-400 py-4 font-medium text-sm">No project data available</div>}
          </div>
        </div>
      </div>

      {/* 6 & 7. Bottom Section: Inspector Table & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 6. Inspector Performance Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h4 className="text-[13px] font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <MdPerson className="text-gray-400 text-lg" /> Inspector Performance
            </h4>
          </div>
          <div className="flex-1 overflow-x-auto bg-gray-50/50">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Inspector</th>
                  <th className="px-6 py-3">Most Common Reason</th>
                  <th className="px-6 py-3 text-right">Total Skips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.inspectorCounts?.map((insp, i) => (
                  <tr key={i} className="hover:bg-white transition-colors group bg-transparent">
                    <td className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shadow-sm ring-1 ring-blue-200">
                        {insp.inspector.charAt(0)}
                      </div>
                      {insp.inspector}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium text-xs truncate max-w-[150px]">
                      {calculateMostCommonReason(insp.inspector)}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-[#0f172a] group-hover:text-red-600 transition-colors">
                      {insp.count}
                    </td>
                  </tr>
                ))}
                {(!data.inspectorCounts || data.inspectorCounts.length === 0) && (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400 font-medium">No inspector data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. Recent Skip Activity (Timeline) */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="text-[13px] font-extrabold text-gray-800 mb-6 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
            <MdHistory className="text-gray-400 text-lg" /> Recent Skip Activity
          </h4>
          <div className="relative border-l-2 border-gray-200 ml-4 py-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
            {data.recentSkips?.map((skip, idx) => (
              <motion.div 
                key={skip._id}
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="relative pl-6 py-3 group"
              >
                {/* Timeline dot */}
                <div className="absolute -left-[9px] top-5 w-4 h-4 rounded-full bg-white border-[4px] border-red-500 group-hover:border-[#166534] transition-colors shadow-sm"></div>
                
                {/* Content Card */}
                <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all group-hover:bg-white cursor-pointer" onClick={() => setLightboxImage(skip)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534] bg-green-50 px-2 py-0.5 rounded border border-green-200">{skip.project}</span>
                    <span className="text-[10px] font-semibold text-gray-400">{new Date(skip.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <h5 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{skip.reason}</h5>
                  <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500 mt-2">
                    <div className="flex items-center gap-1"><MdOutlineLocationOn className="text-[#166534]" /> {skip.chainage || 'N/A'}</div>
                    <div className="flex items-center gap-1"><MdPerson className="text-blue-600" /> {skip.inspector}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox Modal (Unchanged Layout from previous robust version) */}
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

export default SkipAnalytics;
