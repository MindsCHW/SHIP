import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../utils/cn';
import { MdStarRate, MdPerson, MdChevronLeft, MdChevronRight, MdClose, MdDashboard, MdContentCopy, MdCheck, MdNotifications, MdGroup, MdList, MdOutlinePrecisionManufacturing, MdOutlineVideoCameraFront, MdImageSearch, MdVideoLibrary, MdInsights, MdAddRoad } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { projectService } from '../services/project.service';

const fallbackProjects = [
  'ADTPL', 'APEL', 'BFHL', 'BWHPL', 'DATL', 'DHMEPL', 'FRHL', 'GAEPL',
  'JMTPL', 'JUHPL', 'KETPL', 'KHEPL', 'KMTPL', 'KTIPL', 'MBEL', 'MHPL',
  'MKTPL', 'MSHP', 'NAM', 'NDEPL', 'NKTPL', 'SIPL', 'SMTPL', 'SPPL',
  'WMPTL', 'WUPTL', 'WVEL'
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedProject = searchParams.get('project');
  const [dynamicProjects, setDynamicProjects] = useState(fallbackProjects);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (user && (user.role === 'Admin' || user.role === 'Administrator')) {
          const res = await projectService.getAllProjects();
          const projects = res.data || res || [];
          const projectNames = projects.map(p => typeof p === 'string' ? p : (p.code || p.name || 'UNKNOWN'))
                                       .filter(p => p !== 'UNKNOWN');
          
          if (projectNames.length > 0) {
            setDynamicProjects([...new Set(projectNames)].sort());
          }
        }
      } catch (err) {
        console.error('Failed to fetch projects for sidebar', err);
      }
    };
    fetchProjects();
  }, [user]);

  const projectOptions = useMemo(() => {
    if (!user) return dynamicProjects;
    if (user.role === 'Admin' || user.role === 'Administrator') return dynamicProjects;
    if (user.roadAssignment) {
      return user.roadAssignment
        .split(',')
        .map(p => p.trim().toUpperCase())
        .filter(p => p);
    }
    return [];
  }, [user, dynamicProjects]);

  
  // Sidebar collapsed by default on desktop, but persist user preference
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('hiRateSidebarCollapsed');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem('hiRateSidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);
  
  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Dropdown menu state (opened on double click)
  const [openMenu, setOpenMenu] = useState(null);
  const sidebarRef = useRef(null);

  // Close openMenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = () => setIsMobileOpen(prev => !prev);
    window.addEventListener('toggle-mobile-sidebar', handler);
    return () => window.removeEventListener('toggle-mobile-sidebar', handler);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: MdDashboard, path: '/dashboard', allowedRoles: ['Admin', 'Administrator', 'HO', 'SPV', 'User'] },
    { name: 'Master List', icon: MdList, path: '/master-list', allowedRoles: ['Admin', 'Administrator'] },
    { name: 'Inspection Engine', icon: MdOutlinePrecisionManufacturing, path: '/inspection-engine', allowedRoles: ['Admin', 'Administrator'] },
    { name: 'Roadway Sampling', icon: MdAddRoad, path: '/roadway-sampling', allowedRoles: ['Admin', 'Administrator'] },
    { name: 'Survey Library', icon: MdVideoLibrary, path: '/survey-library', allowedRoles: ['Admin', 'Administrator'] },
    { name: 'Survey Processing', icon: MdOutlineVideoCameraFront, path: '/survey-processing', allowedRoles: ['Admin', 'Administrator'] },
    { name: 'Image Review', icon: MdImageSearch, path: '/image-review', allowedRoles: ['Admin', 'Administrator', 'HO'] },
    { name: 'Rating', icon: MdStarRate, path: '/rating', allowedRoles: ['Admin', 'Administrator', 'HO', 'SPV', 'User'] },
    { name: 'SHIP', icon: MdInsights, path: '/ship', allowedRoles: ['Admin', 'Administrator', 'HO'] },
    { name: 'Reports', icon: MdList, path: '/reports', allowedRoles: ['Admin', 'Administrator', 'HO'] },
    { name: 'Notifications', icon: MdNotifications, path: '/notifications', allowedRoles: ['Admin', 'Administrator', 'HO', 'SPV', 'User'] },
    { name: 'Users', icon: MdGroup, path: '/users', allowedRoles: ['Admin', 'Administrator'] },
    { name: 'Role', icon: MdPerson, path: '/role', allowedRoles: ['Admin', 'Administrator'] },
    { name: 'Clone Page', icon: MdContentCopy, path: '/demo', allowedRoles: ['Admin', 'Administrator'] },
    { name: 'Profile', icon: MdPerson, path: '/profile', allowedRoles: ['HO', 'SPV', 'User'] },
  ];

  // Helper to get active project from either query param or path
  const getCurrentProject = () => {
    const fromQuery = searchParams.get('project');
    if (fromQuery) return fromQuery.toUpperCase();
    
    const pathParts = location.pathname.split('/');
    if (pathParts.length >= 3 && pathParts[1] === 'rating') {
      return pathParts[2].toUpperCase();
    }
    return null;
  };

  const activeProject = getCurrentProject();

  const handleNav = (path, proj) => {
    if (proj) {
      if (path === '/rating') navigate(`${path}/${proj}`);
      else navigate(`${path}?project=${proj}`);
    } else {
      // Always navigate to the root of the tab (home page for that tab)
      navigate(path);
    }
    setIsMobileOpen(false); // Close mobile drawer after navigation
  };

  const clickTimeout = useRef(null);

  const handleSidebarClick = (item) => {
    const isDashboard = item.name === 'Dashboard';
    
    if (isDashboard) {
      if (clickTimeout.current) {
        // Double click detected
        clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
        setOpenMenu(prev => prev === item.name ? null : item.name);
      } else {
        // First click
        clickTimeout.current = setTimeout(() => {
          clickTimeout.current = null;
          handleNav(item.path);
        }, 250); // 250ms delay to wait for second click
      }
    } else {
      handleNav(item.path);
    }
  };

  // The actual Sidebar content component to render for both Desktop and Mobile
  const renderSidebarContent = (isMobile) => (
    <div ref={sidebarRef} className={cn(
      "bg-white rounded-[20px] border border-green-500/30 shadow-[0_4px_24px_rgb(0,0,0,0.06)] flex flex-col relative transition-all duration-300",
      isMobile ? "w-64 h-full" : isCollapsed ? "w-[84px] h-[calc(100vh-80px)]" : "w-64 h-[calc(100vh-80px)]"
    )}>
      
      {/* Desktop Expand/Collapse Toggle Button */}
      {!isMobile && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 -right-[20px] w-5 h-10 bg-white border border-green-500/30 border-l-0 rounded-r-full flex items-center justify-center text-gray-400 hover:text-green-500 hover:border-green-500 z-10 transition-colors cursor-pointer -translate-x-px"
        >
          {isCollapsed ? <MdChevronRight className="text-xl -ml-1" /> : <MdChevronLeft className="text-xl -ml-1" />}
        </button>
      )}

      {/* Mobile Close Button */}
      {isMobile && (
        <div className="flex justify-end p-4 pb-0">
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-green-600 bg-gray-50 rounded-full"
          >
            <MdClose className="text-xl" />
          </button>
        </div>
      )}

      <div className="flex-1 py-6 px-3.5 relative z-50">
        <ul className="flex flex-col gap-3">
          {menuItems.filter(item => !item.allowedRoles || (user && item.allowedRoles.includes(user.role))).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            const isDashboard = item.name === 'Dashboard';
            
            return (
              <li 
                key={item.path} 
                className="relative"
              >
                <button
                  onClick={() => handleSidebarClick(item)}
                  className={cn(
                    "flex w-full items-center gap-3.5 px-3 py-3 rounded-[12px] text-sm font-medium transition-all duration-300 border",
                    isActive 
                      ? "bg-gradient-to-r from-green-500 to-green-400 border-transparent text-white shadow-md shadow-green-500/25" 
                      : "bg-white border-gray-200 text-gray-500 hover:bg-green-50 hover:border-green-400 hover:text-green-600 group"
                  )}
                >
                  <Icon className={cn(
                    "text-[22px] shrink-0 transition-colors duration-300",
                    isActive ? "text-yellow-100" : "text-gray-400 group-hover:text-green-500"
                  )} />
                  
                  <span 
                    className={cn(
                      "whitespace-nowrap transition-all duration-300 overflow-hidden text-left flex-1",
                      !isMobile && isCollapsed ? "opacity-0 w-0 max-w-0" : "opacity-100 w-auto max-w-[200px]"
                    )}
                  >
                    {item.name}
                  </span>
                </button>

                {/* Double-Click Sub-Menu for Dashboard */}
                <AnimatePresence>
                  {openMenu === 'Dashboard' && isDashboard && (
                    <motion.div
                      initial={{ opacity: 0, x: -10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "absolute z-[100] w-56 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden",
                        isMobile ? "left-12 top-14" : "left-[calc(100%+16px)] top-0"
                      )}
                    >
                      <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-100 backdrop-blur-sm flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Project</span>
                        <button onClick={() => setOpenMenu(null)} className="text-gray-400 hover:text-gray-600">
                          <MdClose className="text-sm" />
                        </button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto custom-dropdown-scrollbar py-1.5 flex flex-col px-2 gap-1">
                        {projectOptions.map(proj => {
                          const isSelected = activeProject === proj;
                          return (
                            <button 
                              key={proj} 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNav(item.path, proj);
                                setOpenMenu(null);
                              }}
                              className={cn(
                                "flex items-center justify-between px-3 py-2 text-sm transition-all duration-200 rounded-md relative group",
                                isSelected 
                                  ? "bg-[#5cb85c] text-[#fcefb4] font-medium shadow-sm" 
                                  : "text-gray-800 hover:text-green-700 hover:bg-green-50 font-medium"
                              )}
                            >
                              <span className="relative z-10">{proj}</span>
                              {isSelected && <MdCheck className="text-lg text-[#fcefb4]" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar wrapper */}
      <motion.div 
        initial={false}
        animate={{ width: isCollapsed ? 100 : 272 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="shrink-0 hidden md:flex items-center justify-center pl-4 pr-1 relative z-[999]"
      >
        {renderSidebarContent(false)}
      </motion.div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative p-4 h-full"
            >
              {renderSidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
