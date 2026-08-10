import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { projectCoordinates } from '../data/projectCoordinates';
import ProjectMap from '../components/ProjectMap';
import DashboardChart from '../components/DashboardChart';
import { MdCalendarToday, MdDirectionsCar, MdLocationCity, MdChevronRight } from 'react-icons/md';
import logoText from '../assets/HIRATE text.PNG';

import GlobalFilters from '../components/dashboard/GlobalFilters';
import KPICards from '../components/dashboard/KPICards';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import InspectorLeaderboard from '../components/dashboard/InspectorLeaderboard';
import RecentActivityTimeline from '../components/dashboard/RecentActivityTimeline';
import SkipAnalytics from '../components/dashboard/SkipAnalytics';
import InspectionComparison from '../components/dashboard/comparison/InspectionComparison';
import LogoCarousel from '../components/dashboard/LogoCarousel';
import AllProjectsMap from '../components/dashboard/AllProjectsMap';

import ExecutiveCards from '../components/dashboard/ExecutiveCards';
import ExecutiveCharts from '../components/dashboard/ExecutiveCharts';
import UserDashboard from '../components/dashboard/UserDashboard';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'Admin' || user.role === 'Administrator' || user.role === 'HO' || user.role === 'SPV');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProject = searchParams.get('project');
  const coordinates = selectedProject ? projectCoordinates[selectedProject] : null;

  const [analyticsView, setAnalyticsView] = React.useState('Executive Overview');
  
  const [globalFilters, setGlobalFilters] = React.useState({
    search: '',
    state: '',
    asset: '',
    rating: '',
    time: ''
  });

  const setSelectedProject = (project) => {
    if (project) {
      setSearchParams({ project });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto flex flex-col custom-scrollbar">
          
          <div className="relative z-50">
            <GlobalFilters 
              selectedProject={selectedProject} 
              setSelectedProject={setSelectedProject} 
              analyticsView={analyticsView}
              setAnalyticsView={setAnalyticsView}
              globalFilters={globalFilters}
              setGlobalFilters={setGlobalFilters}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {!isAdmin ? (
              <UserDashboard />
            ) : !selectedProject ? (
              // GLOBAL VIEW - EXECUTIVE SUMMARY
              <div className="bg-white p-4 shadow-sm border border-gray-300 rounded mb-10">
                {/* Header */}
                <div className="relative flex items-center justify-between bg-white border border-gray-100 rounded-[18px] mb-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden h-[110px]">
                  
                  {/* Background Diagonal SVG */}
                  <svg className="absolute left-0 top-0 h-full w-[260px]" preserveAspectRatio="none" viewBox="0 0 260 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H180L130 80H0V0Z" fill="#166534"/>
                    <path d="M180 0H220L170 80H130L180 0Z" fill="#bbf7d0" opacity="0.6"/>
                  </svg>

                  <div className="flex items-center relative z-10 w-full h-full pr-8">
                    {/* Logo Box container to match diagonal green width */}
                    <div className="w-[170px] flex justify-center shrink-0">
                      <div className="bg-white px-3 py-1.5 rounded shadow-sm flex items-center justify-center">
                         <img src={logoText} alt="HiRATE" className="h-[22px] object-contain" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="hidden sm:flex flex-col justify-center border-l-[1.5px] border-green-800/10 pl-5 h-full ml-4 py-1 shrink-0">
                      <h1 className="text-[15px] font-bold text-[#0f172a] uppercase tracking-wide leading-none">Monthly Performance Summary</h1>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1.5">
                        <MdCalendarToday className="text-green-600" />
                        May 2026
                      </div>
                      <div className="w-12 h-[2px] bg-green-500 mt-1.5 rounded-full"></div>
                    </div>

                    <LogoCarousel />
                  </div>
                </div>

                <h2 className="text-gray-800 font-bold text-sm uppercase tracking-wide border-b border-gray-300 pb-1 mb-4">Executive Summary</h2>
                <ExecutiveCards />
                
                <ExecutiveCharts />

                <div className="mt-4">
                   <AllProjectsMap />
                </div>
                
                <div className="w-full bg-white border border-gray-300 rounded shadow-sm flex flex-col p-6 mt-6">
                  <h2 className="text-gray-500 font-bold text-sm tracking-wide mb-8 uppercase">Roads Status</h2>
                  <div className="flex-1 flex flex-col items-center justify-center -mt-8">
                    <DashboardChart />
                    <div className="text-center mt-2">
                      <span className="font-bold text-gray-700 text-lg">Total Roads : 27</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : analyticsView === 'Skip Analytics' ? (
              <SkipAnalytics selectedProject={selectedProject} globalFilters={globalFilters} />
            ) : analyticsView === 'Inspection Comparison' ? (
              <InspectionComparison selectedProject={selectedProject} globalFilters={globalFilters} />
            ) : (
              // PROJECT SPECIFIC VIEW
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-gray-800 font-bold text-xl tracking-wide flex items-center gap-2">
                    Project Overview: <span className="text-[#5cb85c] bg-green-50 border border-green-200 px-3 py-1 rounded-md">{selectedProject}</span>
                  </h2>
                </div>

                <KPICards selectedProject={selectedProject} />

                {/* Map Section */}
                <div className="p-5 bg-white border border-borderColor rounded-xl shadow-sm mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-gray-700 font-bold text-base tracking-wide uppercase">
                      Interactive Map: <span className="text-[#5cb85c]">{selectedProject}</span>
                    </h2>
                  </div>
                  <ProjectMap project={selectedProject} />
                </div>

                <AnalyticsCharts selectedProject={selectedProject} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                  <div className="lg:col-span-2">
                    <RecentActivityTimeline selectedProject={selectedProject} />
                  </div>
                  <div className="lg:col-span-1">
                    <InspectorLeaderboard selectedProject={selectedProject} />
                  </div>
                </div>
              </>
            )}
            
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
