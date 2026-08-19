import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdOutlineMap, MdOutlineCheckCircle, MdOutlineHourglassEmpty, MdOutlineTrendingUp, MdStarRate } from 'react-icons/md';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatCard from '../components/Rating/StatCard';
import SegmentedFilters from '../components/Rating/SegmentedFilters';
import SearchBar from '../components/Rating/SearchBar';
import CompactRoadCard from '../components/Rating/CompactRoadCard';
import HoverPopup from '../components/Rating/HoverPopup';
import EmptyState from '../components/Rating/EmptyState';
import { ratingService } from '../services/rating.service';
import { projectService } from '../services/project.service';
import { useAuth } from '../hooks/useAuth';

const RoadIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 22L9 2M20 22L15 2" />
    <path d="M12 2L12 6M12 10L12 14M12 18L12 22" />
  </svg>
);

const ClipboardCheckIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <circle cx="17" cy="17" r="5" fill="currentColor" stroke="none" />
    <path d="M15 17l1.5 1.5L19 15" stroke="white" strokeWidth="1.75" />
  </svg>
);

const HourglassIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BarrierIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="8" width="18" height="6" rx="1" />
    <path d="M5 14v4M19 14v4" />
    <path d="M5 8V4M19 8V4" />
    <path d="M7 14l6-6M13 14l4-4" />
  </svg>
);

// Removed dummyData

const filters = [
  { id: 'all', label: 'All Roads' },
  { id: 'READY-FOR-RATING', label: 'Ready for Rating' },
  { id: 'IN-PROGRESS', label: 'In Progress' }
];

const RatingPage = () => {
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'Admin' || user.role === 'Administrator' || user.role === 'HO' || user.role === 'SPV');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectsData, setProjectsData] = useState([]);
  const navigate = useNavigate();

  // Hover state for the rich popup
  const [hoveredData, setHoveredData] = useState(null);
  const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  useEffect(() => {
    fetchLiveProjects();
  }, []);

  const fetchLiveProjects = async () => {
    try {
      // Fetch all projects from master list and batches from rating service
      const [allProjectsRes, batches] = await Promise.all([
        isAdmin ? projectService.getAllProjects() : Promise.resolve([]),
        ratingService.getReadyBatches()
      ]);

      const allProjects = allProjectsRes.data || allProjectsRes || [];
      const projectMap = {};

      // Initialize map with all projects as NOT-RATED
      allProjects.forEach(p => {
        const code = typeof p === 'string' ? p : (p.code || p.name || 'UNKNOWN');
        if (code === 'UNKNOWN') return;
        
        projectMap[code] = {
          roadName: code,
          roadFullName: `SPV Name : ${p.fullName || p.name || code}`,
          status: 'NOT-RATED',
          dateCreated: p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A',
          reportedBy: 'System'
        };
      });

      // Ensure batches is an array
      const batchesList = Array.isArray(batches) ? batches : (batches?.data || []);

      // Update status based on batches
      batchesList.forEach(batch => {
        const pName = batch.project || 'UNKNOWN_BATCH_PROJECT';
        if (!projectMap[pName]) {
          // Fallback if project is in batches but not in master list
          projectMap[pName] = {
            roadName: pName,
            roadFullName: `Project: ${pName}`,
            status: 'NOT-RATED',
            dateCreated: new Date(batch.createdAt).toLocaleString(),
            reportedBy: batch.createdBy?.firstName ? `${batch.createdBy.firstName} ${batch.createdBy.lastName}` : 'System'
          };
        }

        // Priority: READY-FOR-RATING > IN-PROGRESS > NOT-RATED
        const currentStatus = projectMap[pName].status;
        if (batch.status === 'READY_FOR_RATING') {
          projectMap[pName].status = 'READY-FOR-RATING';
        } else if (batch.status === 'IN_PROGRESS' && currentStatus !== 'READY-FOR-RATING') {
          projectMap[pName].status = 'IN-PROGRESS';
        }
      });

      setProjectsData(Object.values(projectMap));
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const handleCardHover = (data, rect) => {
    // Add a slight delay so it doesn't flash when moving cursor quickly across grid
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setHoveredData(data);
      setHoverAnchorRect(rect);
    }, 150);
    setHoverTimeout(timeout);
  };

  const handleCardLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHoveredData(null);
    setHoverAnchorRect(null);
  };

  const filteredData = projectsData.filter(road => {
    const matchesFilter = activeFilter === 'all' || road.status === activeFilter;
    const matchesSearch = road.roadName.toLowerCase().startsWith(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => a.roadName.localeCompare(b.roadName));

  const durationBase = 1.0;
  const durationPerVehicle = 0.05;

  const val1 = projectsData.length;
  const dur1 = val1 * durationPerVehicle + durationBase;
  const delay1 = 0;

  const val2 = projectsData.filter(d => d.status === 'READY-FOR-RATING').length;
  const dur2 = val2 * durationPerVehicle + durationBase;
  const delay2 = delay1 + dur1 + 0.15;

  const val3 = projectsData.filter(d => d.status === 'IN-PROGRESS').length;
  const dur3 = val3 * durationPerVehicle + durationBase;
  const delay3 = delay2 + dur2 + 0.15;

  const val4 = 0; // HO Rated (calculated later)
  const dur4 = durationBase;
  const delay4 = delay3 + dur3 + 0.15;

  const val5 = 0; // SPV Rated (calculated later)
  const dur5 = durationBase;
  const delay5 = delay4 + dur4 + 0.15;

  const val6 = projectsData.filter(d => d.status === 'NOT-RATED').length;
  const dur6 = val6 * durationPerVehicle + durationBase;
  const delay6 = delay5 + dur5 + 0.15;



  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        {/* Subtle grid background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Spotlight Overlay */}
        <AnimatePresence>
          {hoveredData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-[#F8FAFC]/40 backdrop-blur-[3px] pointer-events-none"
            />
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-8 pt-6 relative scroll-smooth">
          <div className="max-w-[1800px] mx-auto w-full">

            {/* Quick Stats Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard title="Total Projects" value={val1} icon={RoadIcon} colorClass="bg-blue-500" delay={delay1} duration={dur1} />
              <StatCard title="Ready for Rating" value={val2} icon={ClipboardCheckIcon} colorClass="bg-green-500" delay={delay2} duration={dur2} />
              <StatCard title="In Progress" value={val3} icon={HourglassIcon} colorClass="bg-orange-500" delay={delay3} duration={dur3} />
              <StatCard title="HO Rated" value={val4} icon={StarIcon} colorClass="bg-indigo-500" delay={delay4} duration={dur4} />
              <StatCard title="SPV Rated" value={val5} icon={BarrierIcon} colorClass="bg-purple-500" delay={delay5} duration={dur5} />
              <StatCard title="Not Rated" value={val6} icon={HourglassIcon} colorClass="bg-teal-500" delay={delay6} duration={dur6} />
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6 sticky top-0 bg-[#F8FAFC]/90 backdrop-blur-md py-4 z-40 border-b border-transparent">
              <SegmentedFilters filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* High Density Cards Grid */}
            {filteredData.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-5 pb-20"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.02 } },
                  hidden: {}
                }}
              >
                <AnimatePresence>
                  {filteredData.map((road) => (
                    <motion.div
                      key={road.roadName}
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
                      }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                      layout
                    >
                      <CompactRoadCard
                        data={road}
                        onHover={handleCardHover}
                        onLeave={handleCardLeave}
                        onClick={(data) => navigate(`/rating/${data.roadName}`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <EmptyState />
            )}

          </div>
        </div>

        {/* Floating Hover Information Popup */}
        <HoverPopup data={hoveredData} anchorRect={hoverAnchorRect} />

      </div>
    </div>
  );
};

export default RatingPage;
