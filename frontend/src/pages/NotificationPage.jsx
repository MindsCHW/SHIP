import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { workAssignmentService } from '../services/workAssignment.service';
import { masterListService } from '../services/masterList.service';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LuUsers,
  LuUserCheck,
  LuClock,
  LuCircleCheck,
  LuClipboardPlus,
  LuSearch,
  LuChevronLeft,
  LuChevronRight,
  LuCircleAlert,
  LuChevronDown,
  LuSend,
  LuEye,
  LuPen,
  LuTrash2,
  LuCheck,
  LuLoader,
  LuPlay
} from 'react-icons/lu';

// Helper to format date into "DD MMM YYYY"
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper to format current date and time
const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const day = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${day}, ${time}`;
};

const categories = [
  'Roadway',
  'Road Signage and Furniture',
  'Project Facilities',
  'Structures',
  'ATMS',
  'TMS',
  'Landscaping'
];

const NotificationPage = () => {
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === 'Administrator' || authUser?.role === 'Admin';
  const navigate = useNavigate();

  // ── Live API States ──────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [readyBatches, setReadyBatches] = useState([]);
  const [stats, setStats] = useState({ assignedToday: 0, pendingTasks: 0, completedToday: 0, totalUsers: 0, availableUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [masterProjects, setMasterProjects] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [usersData, batchesData, assignmentsData, statsData, masterProjectsData] = await Promise.all([
          workAssignmentService.getUsers({ role: 'User' }),
          workAssignmentService.getBatchesReady(),
          workAssignmentService.getAll(),
          workAssignmentService.getStats(),
          masterListService.getProjects()
        ]);
        setUsers(usersData || []);
        setReadyBatches(batchesData || []);
        setAssignments(assignmentsData || []);
        setStats(statsData || { assignedToday: 0, pendingTasks: 0, completedToday: 0, totalUsers: 0, availableUsers: 0 });
        setMasterProjects(masterProjectsData?.data || masterProjectsData || []);
      } else {
        const assignmentsData = await workAssignmentService.getMine();
        const assignments = assignmentsData || [];
        setAssignments(assignments);
        
        const now = new Date();
        const pendingCount = assignments.filter(a => a.status !== 'Completed').length;
        const completedCount = assignments.filter(a => a.status === 'Completed').length;
        const assignedToday = assignments.filter(a => {
          const created = new Date(a.createdAt);
          return created.getDate() === now.getDate() && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;
        const completedToday = assignments.filter(a => {
          if (a.status !== 'Completed') return false;
          const completedDate = a.completedTime ? new Date(a.completedTime) : new Date(a.updatedAt);
          return completedDate.getDate() === now.getDate() && completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
        }).length;

        setStats({
          assignedToday,
          pendingTasks: pendingCount,
          completedToday,
          totalAssigned: assignments.length,
          overdueTasks: assignments.filter(a => a.status === 'Overdue').length
        });
      }
    } catch (error) {
      console.error("Failed to fetch notification page data:", error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build Route/Section options using the same project list as RatingPage (from master list).
  // Deduplicate by code first to prevent duplicate key warnings.
  const uniqueMasterProjects = masterProjects.reduce((acc, p) => {
    const code = typeof p === 'string' ? p : (p.code || p.name || 'UNKNOWN');
    if (!acc.some(x => {
      const xCode = typeof x === 'string' ? x : (x.code || x.name || 'UNKNOWN');
      return xCode === code;
    })) {
      acc.push(p);
    }
    return acc;
  }, []);

  const ratingProjects = uniqueMasterProjects.map((p, idx) => {
    const code = typeof p === 'string' ? p : (p.code || p.name || 'UNKNOWN');
    const fullName = typeof p === 'string' ? p : (p.fullName || code);
    // Find the most recent in-progress batch for this project
    const matchingBatch = readyBatches.find(b => b.project === code);
    return {
      id: matchingBatch ? matchingBatch._id : `no-batch-${code}-${idx}`,
      displayName: `${code} — ${fullName}`,
      fullName: `${code} — ${fullName}`,
      project: code,
      hasBatch: !!matchingBatch,
      totalPages: matchingBatch?.uniqueChainagesCount || 0
    };
  });

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 5;

  // Selected User ID state
  const [selectedUserId, setSelectedUserId] = useState('');

  const selectedEmployee = users.find(u => (u._id || u.id) === selectedUserId);

  // Form State
  const [formData, setFormData] = useState({
    roadProject: '',
    routeSection: '',
    category: 'Roadway',
    subSection: '',
    priority: 'Medium',
    dueDate: '',
    remarks: ''
  });

  // Searchable combobox dropdown states - Road / Project
  const [isProjDropdownOpen, setIsProjDropdownOpen] = useState(false);
  const [projDropdownSearch, setProjDropdownSearch] = useState('');
  const [projActiveIndex, setProjActiveIndex] = useState(-1);
  const projDropdownRef = useRef(null);

  // Searchable combobox dropdown states - Route / Section
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [activeRouteIndex, setActiveRouteIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // Filter route sections
  const filteredProjects = ratingProjects.filter(p =>
    p.displayName.toLowerCase().includes(dropdownSearch.toLowerCase())
  );



  // Key handlers for Route / Section
  const handleRouteKeyDown = (e) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        setIsDropdownOpen(true);
        setActiveRouteIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveRouteIndex(prev => (prev + 1) % filteredProjects.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveRouteIndex(prev => (prev - 1 + filteredProjects.length) % filteredProjects.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeRouteIndex >= 0 && activeRouteIndex < filteredProjects.length) {
        const selected = filteredProjects[activeRouteIndex];
        setFormData(prev => ({ 
          ...prev, 
          routeSection: selected.id,
          subSection: `Pages 1-${selected.totalPages}` // Auto-populate pages
        }));
        setIsDropdownOpen(false);
        setDropdownSearch('');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      setDropdownSearch('');
    }
  };

  // Reset active index when search changes or dropdown opens
  useEffect(() => {
    setActiveRouteIndex(-1);
  }, [isDropdownOpen]);

  // Get active selected project details
  const activeSelectedProject = ratingProjects.find(p => p.id === formData.routeSection);
  const routeSectionDisplayValue = activeSelectedProject ? activeSelectedProject.fullName : 'Select Route / Section';

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (isDropdownOpen && activeRouteIndex >= 0) {
      const el = document.getElementById(`route-opt-${activeRouteIndex}`);
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeRouteIndex, isDropdownOpen]);

  // Duplicate Error and Modal States
  const [duplicateError, setDuplicateError] = useState(null);
  const [activeTimelineAssignment, setActiveTimelineAssignment] = useState(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);

  // --- Bulk Assignment Feature States ---
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkFormData, setBulkFormData] = useState({
    roadProject: 'HO PROCESS',
    routeSection: 'APFI',
    category: 'Roadway',
    totalPages: '',
    autoSplit: true,
    selectedUserIds: []
  });

  const [isBulkRouteOpen, setIsBulkRouteOpen] = useState(false);
  const [bulkRouteSearch, setBulkRouteSearch] = useState('');
  const [bulkRouteActiveIndex, setBulkRouteActiveIndex] = useState(-1);
  const bulkRouteDropdownRef = useRef(null);

  // Bulk options filters
  const bulkFilteredProjects = ratingProjects.filter(p =>
    p.displayName.toLowerCase().includes(bulkRouteSearch.toLowerCase())
  );

  // Keyboard navigation key handlers for Bulk dropdowns


  const handleBulkRouteKeyDown = (e) => {
    if (!isBulkRouteOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsBulkRouteOpen(true);
        setBulkRouteActiveIndex(0);
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBulkRouteActiveIndex(prev => (prev + 1) % bulkFilteredProjects.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBulkRouteActiveIndex(prev => (prev - 1 + bulkFilteredProjects.length) % bulkFilteredProjects.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (bulkRouteActiveIndex >= 0 && bulkRouteActiveIndex < bulkFilteredProjects.length) {
        const selected = bulkFilteredProjects[bulkRouteActiveIndex];
        setBulkFormData(prev => ({ 
          ...prev, 
          routeSection: selected.id,
          totalPages: selected.totalPages?.toString() || ''
        }));
        setIsBulkRouteOpen(false);
        setBulkRouteSearch('');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsBulkRouteOpen(false);
    }
  };

  // Close bulk dropdowns click-outside
  useEffect(() => {
    const handleBulkOutsideClick = (e) => {
      if (bulkRouteDropdownRef.current && !bulkRouteDropdownRef.current.contains(e.target)) {
        setIsBulkRouteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleBulkOutsideClick);
    return () => document.removeEventListener('mousedown', handleBulkOutsideClick);
  }, []);

  useEffect(() => {
    if (isBulkRouteOpen && bulkRouteActiveIndex >= 0) {
      const el = document.getElementById(`bulk-route-opt-${bulkRouteActiveIndex}`);
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [bulkRouteActiveIndex, isBulkRouteOpen]);

  const bulkSelectedRouteProject = ratingProjects.find(p => p.id === bulkFormData.routeSection);
  const bulkRouteDisplayValue = bulkSelectedRouteProject ? bulkSelectedRouteProject.displayName : 'Select Route / Section';

  // Calculations for auto-splitting or full pages allocation
  const activeBulkUsers = users.filter(u => u.status === 'Active' && u.role.toLowerCase() === 'user');
  const selectedBulkUsers = activeBulkUsers.filter(u => bulkFormData.selectedUserIds.includes(u.id || u.email));
  const totalPagesNum = parseInt(bulkFormData.totalPages) || 0;
  const bulkPreviewList = [];

  if (selectedBulkUsers.length > 0 && totalPagesNum > 0) {
    if (bulkFormData.autoSplit) {
      const U = selectedBulkUsers.length;
      const basePages = Math.floor(totalPagesNum / U);
      let currentStart = 1;
      for (let i = 0; i < U; i++) {
        let end = currentStart + basePages - 1;
        if (i === U - 1) {
          end = totalPagesNum;
        }
        const rangeStr = currentStart === end ? `Page ${currentStart}` : `Pages ${currentStart}-${end}`;
        bulkPreviewList.push({
          user: selectedBulkUsers[i],
          range: rangeStr
        });
        currentStart = end + 1;
      }
    } else {
      selectedBulkUsers.forEach(u => {
        bulkPreviewList.push({
          user: u,
          range: totalPagesNum === 1 ? `Page 1` : `Pages 1-${totalPagesNum}`
        });
      });
    }
  }

  // Handle bulk assignment submission
  const handleBulkAssign = async (e) => {
    e.preventDefault();

    if (!bulkFormData.routeSection) {
      alert("Please select a valid Project and Route Section.");
      return;
    }
    if (selectedBulkUsers.length === 0) {
      alert("Please select at least one active user.");
      return;
    }

    setSaving(true);
    try {
      await workAssignmentService.bulkCreate({
        batchId: bulkFormData.routeSection,
        priority: 'Medium', // default priority
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // default due: 7 days later
        category: bulkFormData.category,
        assignments: bulkPreviewList.map(item => ({
          userId: item.user._id || item.user.id,
          pages: item.range
        }))
      });
      await fetchData();

      // Reset bulk states
      setIsBulkOpen(false);
      setBulkFormData({
        roadProject: '',
        routeSection: '',
        category: 'Roadway',
        totalPages: '',
        autoSplit: true,
        selectedUserIds: []
      });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to create bulk assignments.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle user selection in bulk list
  const toggleBulkUser = (userId) => {
    setBulkFormData(prev => {
      const alreadySelected = prev.selectedUserIds.includes(userId);
      const nextList = alreadySelected
        ? prev.selectedUserIds.filter(id => id !== userId)
        : [...prev.selectedUserIds, userId];
      return { ...prev, selectedUserIds: nextList };
    });
  };

  // Select all active users
  const handleSelectAllBulkUsers = () => {
    setBulkFormData(prev => {
      const allActiveIds = activeBulkUsers.map(u => u._id);
      const isAllSelected = prev.selectedUserIds.length === allActiveIds.length;
      return {
        ...prev,
        selectedUserIds: isAllSelected ? [] : allActiveIds
      };
    });
  };

  // Page input change validation handler
  const handlePagesChange = (e) => {
    const val = e.target.value;
    // Allow only digits, commas, hyphens, spaces, and letters (P,a,g,e,s)
    const cleanVal = val.replace(/[^0-9a-zA-Z\s,-]/g, '');
    setFormData(prev => ({ ...prev, subSection: cleanVal }));

    // Custom HTML5 validity validation check
    const stripped = cleanVal.replace(/pages?/gi, '');
    const isValid = /^[0-9\s,-]*$/.test(stripped);
    if (!isValid) {
      e.target.setCustomValidity("Please enter page numbers using valid format (e.g. Page 1, Pages 10-20, 1-15). Only numbers, commas, hyphens, and the word Page/Pages are allowed.");
    } else {
      e.target.setCustomValidity("");
    }
  };

  // Reset form to defaults
  const handleResetForm = () => {
    setFormData({
      roadProject: '',
      routeSection: '',
      category: 'Roadway',
      subSection: '',
      priority: 'Medium',
      dueDate: '',
      remarks: ''
    });
  };

  // Handle Assign Work form submission
  const handleAssignWork = async (e) => {
    e.preventDefault();

    if (!selectedEmployee) {
      alert("Please select a user from the table first.");
      return;
    }
    if (!formData.routeSection) {
      alert("Please select an Inspection Batch.");
      return;
    }

    setSaving(true);
    try {
      if (editingAssignmentId) {
        await workAssignmentService.edit(editingAssignmentId, {
          priority: formData.priority,
          dueDate: new Date(formData.dueDate).toISOString(),
          category: formData.category,
          pages: formData.subSection,
          remarks: formData.remarks
        });
      } else {
        await workAssignmentService.create({
          batchId: formData.routeSection,
          assignedTo: selectedEmployee._id,
          priority: formData.priority,
          dueDate: new Date(formData.dueDate).toISOString(),
          category: formData.category,
          pages: formData.subSection,
          remarks: formData.remarks
        });
      }
      
      await fetchData();
      setEditingAssignmentId(null);
      handleResetForm();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to assign work.');
    } finally {
      setSaving(false);
    }
  };

  // Handle deleting assignment record
  const handleDeleteAssignment = async (id) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      try {
        await workAssignmentService.deleteAssignment(id);
        await fetchData();
      } catch (err) {
        alert("Failed to delete assignment");
      }
    }
  };

  // Handle marking assignment completed (or updating status)
  const handleCompleteAssignment = async (id) => {
    if (confirm("Mark this assignment as Completed?\n\n[Cancel]   [Mark Completed]")) {
      try {
        await workAssignmentService.updateStatus(id, 'Completed');
        await fetchData();
      } catch (err) {
        alert("Failed to update status");
      }
    }
  };

  // Filter users based on query and filters
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.username && user.username.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query));
    
    // Convert boolean isActive to matching 'Active' or 'Inactive' string
    const statusStr = user.isActive ? 'Active' : 'Inactive';
    const matchesStatus = !statusFilter || statusStr === statusFilter;
    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

  useEffect(() => {
    setUserPage(1);
  }, [searchQuery, statusFilter, roleFilter]);

  // Helper to render Avatar
  const renderAvatar = (user) => {
    if (user.photo) {
      return (
        <img
          src={user.photo}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover shrink-0 shadow-inner"
        />
      );
    }
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U';
    return (
      <div className={`w-8 h-8 rounded-full ${user.avatarColor || 'bg-green-600'} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
        {initials}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-pageBg">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-textColor">
                {isAdmin ? "Notification & Work Assignment" : "My Assignments"}
              </h1>
              <p className="text-muted text-sm mt-1">
                {isAdmin 
                  ? "Assign highway rating tasks to users and monitor assignment progress."
                  : "Monitor and start your assigned highway rating tasks."}
              </p>
            </div>
            
            {isAdmin && (
              <button
                onClick={() => setIsBulkOpen(true)}
                className="px-5 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                Bulk Assignment
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 shrink-0">
            {isAdmin ? (
              <>
                {/* Admin Stat Cards */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
                  <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-xl shrink-0">
                    <LuUsers />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Users</span>
                    <span className="text-xl font-extrabold text-gray-900 mt-1 block">
                      {loading ? <LuLoader className="animate-spin text-gray-400 text-sm" /> : stats.totalUsers}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium block">All Registered Users</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                    <LuUserCheck />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Available Users</span>
                    <span className="text-xl font-extrabold text-gray-900 mt-1 block">
                      {loading ? <LuLoader className="animate-spin text-gray-400 text-sm" /> : stats.availableUsers}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium block">Ready for Assignment</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* User Stat Cards */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                    <LuClipboardPlus />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Assigned</span>
                    <span className="text-xl font-extrabold text-gray-900 mt-1 block">
                      {loading ? <LuLoader className="animate-spin text-gray-400 text-sm" /> : stats.totalAssigned}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium block">Lifetime Tasks</span>
                  </div>
                </div>
              </>
            )}

            {/* Shared Stat Cards (For both Admin & User, but stats have different meanings contextually) */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
                <LuClipboardPlus />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assigned Today</span>
                <span className="text-xl font-extrabold text-gray-900 mt-1 block">
                  {loading ? <LuLoader className="animate-spin text-gray-400 text-sm" /> : stats.assignedToday}
                </span>
                <span className="text-[10px] text-gray-400 font-medium block">New Tasks</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
                <LuClock />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pending Tasks</span>
                <span className="text-xl font-extrabold text-gray-900 mt-1 block">
                  {loading ? <LuLoader className="animate-spin text-gray-400 text-sm" /> : stats.pendingTasks}
                </span>
                <span className="text-[10px] text-gray-400 font-medium block">Requires Action</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                <LuCircleCheck />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Completed Today</span>
                <span className="text-xl font-extrabold text-gray-900 mt-1 block">
                  {loading ? <LuLoader className="animate-spin text-gray-400 text-sm" /> : stats.completedToday}
                </span>
                <span className="text-[10px] text-gray-400 font-medium block">Tasks Finished</span>
              </div>
            </div>
          </div>

          {/* Split Layout: Left Card (All Users) / Right Card (Assign Work Panel) */}
          {isAdmin && (
            <div className="grid grid-cols-[48fr_52fr] gap-6 items-stretch">
            
            {/* Left Card: All Users User List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[520px] justify-between">
              <div>
                {/* Header & Filters */}
                <div className="p-5 border-b border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-md font-bold text-gray-900">All Users</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                      <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, username or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-textColor placeholder-gray-400 transition-colors"
                      />
                    </div>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-10 px-3 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 font-semibold focus:outline-none focus:border-green-600 cursor-pointer shrink-0"
                    >
                      <option value="">Status: All</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>

                    {/* Role Filter */}
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="h-10 px-3 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 font-semibold focus:outline-none focus:border-green-600 cursor-pointer shrink-0"
                    >
                      <option value="">Role: All</option>
                      <option value="User">User</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto min-h-[300px]">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/50 sticky top-0 z-10">
                        <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center w-12" />
                        <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">USER</th>
                        <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">ROLE</th>
                        <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">STATUS</th>
                        <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((user) => {
                          const currentId = user._id || user.id;
                          const isSelected = selectedUserId === currentId;
                          const isActive = user.isActive;
                          return (
                            <tr
                              key={currentId}
                              onClick={() => {
                                if (isActive) {
                                  setSelectedUserId(currentId);
                                }
                              }}
                              className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                                isSelected ? 'bg-green-50/40 border-l-[3px] border-l-green-600' : 'border-l-[3px] border-l-transparent'
                              }`}
                            >
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="radio"
                                  name="selectedUserRadio"
                                  checked={isSelected}
                                  disabled={!isActive}
                                  onChange={() => setSelectedUserId(currentId)}
                                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-1 cursor-pointer disabled:opacity-40"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  {renderAvatar(user)}
                                  <div className="min-w-0">
                                    <span className="font-semibold text-gray-800 text-sm block truncate leading-normal">{user.name}</span>
                                    <span className="text-[11px] text-gray-400 block truncate leading-normal">@{user.username || 'user'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-xs font-semibold text-gray-500">{user.role}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  isActive 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                    : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                  {isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isActive) {
                                      setSelectedUserId(currentId);
                                    }
                                  }}
                                  disabled={!isActive}
                                  className={`px-4 py-1.5 border rounded-lg text-xs font-bold transition-all duration-200 ${
                                    !isActive
                                      ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
                                      : isSelected 
                                        ? 'bg-green-600 text-white border-green-600 shadow-sm cursor-pointer' 
                                        : 'border-green-600 text-green-600 hover:bg-green-50/50 bg-white cursor-pointer'
                                  }`}
                                  title={!isActive ? "Inactive users cannot receive assignments." : "Assign"}
                                >
                                  Assign
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-sm text-gray-400">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <LuCircleAlert className="text-xl" />
                              <span>No employees match filters.</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Left Pagination */}
              {totalUserPages > 1 && (
                <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    Showing {(userPage - 1) * USERS_PER_PAGE + 1} to {Math.min(userPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setUserPage(prev => Math.max(prev - 1, 1))}
                      disabled={userPage === 1}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <LuChevronLeft className="text-sm" />
                    </button>
                    {Array.from({ length: totalUserPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setUserPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 border cursor-pointer ${
                          userPage === p 
                            ? 'bg-green-600 text-white border-green-600' 
                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setUserPage(prev => Math.min(prev + 1, totalUserPages))}
                      disabled={userPage === totalUserPages}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <LuChevronRight className="text-sm" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Card: Assign Work Panel */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-[520px] flex flex-col justify-between">
              
              {/* Header & Subtitle displaying selected employee info */}
              <div>
                <h2 className="text-md font-bold text-gray-900 leading-none">
                  {editingAssignmentId 
                    ? `Edit Assignment For: ${selectedEmployee ? selectedEmployee.name : ''}` 
                    : (selectedEmployee ? `Assign Work To:  ${selectedEmployee.name}` : 'Assign Work')}
                </h2>
                {selectedEmployee ? (
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">
                    {selectedEmployee.role}  •  {selectedEmployee.email}  •  {selectedEmployee.id || '1234201'}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">No employee selected</p>
                )}
              </div>

              {/* Form Layout replicated exactly from the design mockup */}
              <form onSubmit={handleAssignWork} className="space-y-4 mt-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  
                  {/* Route / Section */}
                  <div className="grid grid-cols-1 gap-4">

                    {/* Route / Section (Searchable Combobox Component) */}
                    <div className="flex flex-col gap-1.5" ref={dropdownRef}>
                      <label className="text-xs font-bold text-textColor">
                        Route / Section <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          onKeyDown={handleRouteKeyDown}
                          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600 text-textColor font-medium flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">{routeSectionDisplayValue}</span>
                          <LuChevronDown className="text-gray-400 text-base" />
                        </button>
                        
                        {isDropdownOpen && (
                          <div className="absolute top-11 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60">
                            {/* Dropdown Search Box */}
                            <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                              <LuSearch className="text-gray-400 text-sm shrink-0" />
                              <input
                                type="text"
                                placeholder="Search road or project..."
                                value={dropdownSearch}
                                onChange={(e) => {
                                  setDropdownSearch(e.target.value);
                                  setActiveRouteIndex(0);
                                }}
                                onKeyDown={handleRouteKeyDown}
                                className="w-full bg-transparent text-xs focus:outline-none placeholder-gray-400 text-textColor"
                              />
                            </div>
                            
                            {/* Dropdown Options List */}
                            <div className="overflow-y-auto divide-y divide-gray-50">
                              {Array.from(new Map(filteredProjects.map(p => [p.code, p])).values()).length > 0 ? (
                                Array.from(new Map(filteredProjects.map(p => [p.code, p])).values()).map((p, index) => (
                                  <button
                                    key={`proj-opt-${p.code}-${index}`}
                                    id={`route-opt-${index}`}
                                    type="button"
                                    disabled={!p.hasBatch}
                                    onClick={() => {
                                      if (!p.hasBatch) return;
                                      setFormData(prev => ({ ...prev, routeSection: p.id }));
                                      setIsDropdownOpen(false);
                                      setDropdownSearch('');
                                    }}
                                    className={`w-full text-left px-3 py-2.5 text-xs transition-colors font-medium flex items-center justify-between gap-2 ${
                                      !p.hasBatch
                                        ? 'opacity-40 cursor-not-allowed text-gray-400'
                                        : formData.routeSection === p.id 
                                          ? 'bg-green-50 text-green-600' 
                                          : activeRouteIndex === index 
                                            ? 'bg-gray-50 text-textColor'
                                            : 'hover:bg-green-50/50 text-textColor'
                                    }`}
                                  >
                                    <span className="truncate">{p.displayName}</span>
                                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p.hasBatch ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                      {p.hasBatch ? 'Active' : 'No Batch'}
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <div className="p-3 text-center text-xs text-gray-400 font-medium">No roads found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category & Sub Section */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-textColor">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-textColor font-medium cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sub Section / Pages */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-textColor">
                        Sub Section / Pages <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subSection}
                        onChange={handlePagesChange}
                        placeholder="Enter Page Number(s)"
                        className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-textColor font-medium"
                      />
                    </div>
                  </div>

                  {/* Priority & Due Date */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Priority */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-textColor">
                        Priority <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-4 mt-2">
                        {['Low', 'Medium', 'High'].map((p) => {
                          const isChecked = formData.priority === p;
                          return (
                            <label key={p} className="flex items-center gap-1.5 text-sm text-textColor font-semibold cursor-pointer">
                              <input
                                type="radio"
                                name="priorityRadio"
                                checked={isChecked}
                                onChange={() => setFormData(prev => ({ ...prev, priority: p }))}
                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-1 cursor-pointer"
                              />
                              {p}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Due */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-textColor">
                        Due <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-textColor font-semibold"
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-textColor">
                      Instructions / Remarks <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Please complete the rating for the HO process images. Ensure accuracy and submit before the due date."
                      className="h-20 p-3.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-textColor placeholder-gray-400 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Bottom Buttons - Reset/Cancel on left, Assign/Update on right */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {editingAssignmentId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAssignmentId(null);
                        handleResetForm();
                      }}
                      className="px-5 h-10 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-5 h-10 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}

                  {editingAssignmentId ? (
                    <button
                      type="submit"
                      className="px-6 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      Update Assignment
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LuSend className="text-sm" />
                      Assign Work
                    </button>
                  )}
                </div>
              </form>
            </div>

          </div>
          )}

          {/* Bottom Table Section: Recent Assigned Tasks */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-bold text-gray-900">{isAdmin ? "Recent Assigned Tasks" : "My Assignments"}</h2>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
              >
                View All Assignments <span className="text-[10px]">&gt;</span>
              </a>
            </div>

            {/* Assignments Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-textColor">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">USER</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">PROJECT</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">CATEGORY</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">ROUTE / SECTION</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">SUB SECTION / PAGES</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">PRIORITY</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">STATUS</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">DUE</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">ASSIGNED ON</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center w-36">ACTION</th>
                  </tr>
                </thead>
                    <tbody className="divide-y divide-gray-100">
                      {assignments.length > 0 ? (
                        assignments.map((item, index) => {
                          const userName = item.assignedTo?.name;
                          const project = item.project;
                          const routeSectionName = item.batchId 
                            ? `${item.batchId.project} - ${new Date(item.batchId.dateOfSurvey || item.batchId.createdAt).toLocaleDateString()}`
                            : item.project;
                          const subSection = item.pages;
                          const category = item.category || 'Roadway';

                          return (
                            <tr
                              key={item._id}
                              id={item._id}
                              className={`hover:bg-gray-50/30 transition-colors duration-500 ${
                                editingAssignmentId === item._id
                                  ? 'bg-green-50/80 border-l-[3px] border-l-green-600 border-y border-y-green-100/50'
                                  : item.status === 'Completed'
                                    ? 'bg-green-50/20'
                                    : index % 2 === 0
                                      ? 'bg-white'
                                      : 'bg-[#F4F8FB]/50'
                              }`}
                            >
                              <td className="py-3.5 px-4 font-semibold text-gray-800">{userName}</td>
                              <td className="py-3.5 px-4 font-medium text-gray-600">{project}</td>
                              <td className="py-3.5 px-4 text-gray-600">{category}</td>
                              <td className="py-3.5 px-4 text-gray-600 max-w-[200px] truncate" title={routeSectionName}>
                                {routeSectionName}
                              </td>
                              <td className="py-3.5 px-4 text-gray-600 font-semibold">{subSection}</td>
                              
                              {/* Priority Badge */}
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                  item.priority === 'High' || item.priority === 'Critical'
                                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                                    : item.priority === 'Medium'
                                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                  {item.priority}
                                </span>
                              </td>

                              {/* Status Badge */}
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                  item.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : item.status === 'In Progress'
                                      ? 'bg-green-50 text-green-600 border-green-100'
                                      : item.status === 'Pending' || item.status === 'Overdue'
                                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                                        : 'bg-purple-50 text-purple-600 border-purple-100' // Assigned badge color
                                }`}>
                                  {item.status === 'Completed' ? '✅ Completed' : item.status}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-gray-600 font-semibold whitespace-nowrap">
                                {formatDate(item.dueDate)}
                              </td>
                              <td className="py-3.5 px-4 text-gray-400 text-xs whitespace-nowrap">
                                {formatDate(item.createdAt)}
                              </td>

                              {/* Actions (View, Edit, Delete) */}
                              <td className="py-3.5 px-4 text-center">
                                {isAdmin ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setActiveTimelineAssignment(item)}
                                      className="w-7 h-7 rounded-full border border-green-100 bg-green-50/50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors cursor-pointer"
                                      title="View Assignment Details"
                                    >
                                      <LuEye className="text-xs" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingAssignmentId(item._id);
                                        setFormData({
                                          roadProject: project,
                                          routeSection: item.batchId?._id || '',
                                          category: 'Roadway',
                                          subSection: subSection,
                                          priority: item.priority,
                                          dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
                                          remarks: ''
                                        });
                                        if (item.assignedTo?._id) {
                                          setSelectedUserId(item.assignedTo._id);
                                        }
                                      }}
                                      className="w-7 h-7 rounded-full border border-green-100 bg-green-50/50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors cursor-pointer"
                                      title="Edit Assignment"
                                    >
                                      <LuPen className="text-xs" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAssignment(item._id)}
                                      className="w-7 h-7 rounded-full border border-red-100 bg-red-50/50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                                      title="Delete Assignment"
                                    >
                                      <LuTrash2 className="text-xs" />
                                    </button>
                                    {item.status === 'Completed' ? (
                                      <button
                                        type="button"
                                        disabled
                                        className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 text-gray-400 flex items-center justify-center cursor-not-allowed"
                                        title="Completed"
                                      >
                                        <LuCheck className="text-xs" />
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleCompleteAssignment(item._id)}
                                        className="w-7 h-7 rounded-full border border-green-200 bg-green-50/50 hover:bg-green-600 text-green-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Mark as Completed"
                                      >
                                        <LuCheck className="text-xs" />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/rating?batchId=${item.batchId?._id}`)}
                                      className="h-8 px-3 rounded-lg border border-green-600 bg-green-600 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-green-700 transition-colors"
                                    >
                                      <LuPlay className="text-xs" />
                                      Start Rating
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-sm text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <LuCircleAlert className="text-xl" />
                          <span>No recent assignments found.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Duplicate Warning Dialog Modal */}
      {duplicateError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-500 border-b border-gray-100 pb-3">
              <span className="text-xl">⚠</span>
              <h3 className="text-md font-bold text-gray-900">Duplicate Assignment</h3>
            </div>
            
            <p className="text-xs text-gray-500 font-medium">This work has already been assigned.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-xs border border-gray-100 text-gray-700">
              <div>
                <span className="font-bold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Assigned To:</span>
                <span className="font-semibold text-sm text-gray-800">{duplicateError.userName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Project:</span>
                  <span className="font-semibold text-gray-800">{duplicateError.project}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Category:</span>
                  <span className="font-semibold text-gray-800">{duplicateError.category}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Pages:</span>
                  <span className="font-semibold text-gray-800">{duplicateError.subSection}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Status:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${
                    duplicateError.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : duplicateError.status === 'In Progress'
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : duplicateError.status === 'Pending'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-purple-50 text-purple-600 border-purple-100'
                  }`}>
                    {duplicateError.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDuplicateError(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setDuplicateError(null);
                  const el = document.getElementById(duplicateError.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Visual flashing effect on row
                    el.classList.add('!bg-amber-100/50');
                    setTimeout(() => {
                      el.classList.remove('!bg-amber-100/50');
                    }, 2000);
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                View Existing Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Timeline right-side drawer */}
      {activeTimelineAssignment && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={() => setActiveTimelineAssignment(null)}
          />
          
          {/* Inject dynamic self-contained styles for slide-in animation */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-slide-in-right {
              animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}} />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Assignment Timeline</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">Task history for {activeTimelineAssignment.assignedTo?.name}</p>
              </div>
              <button
                onClick={() => setActiveTimelineAssignment(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Project Details Info Grid */}
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Project</span>
                <span className="font-semibold text-gray-800">{activeTimelineAssignment.batchId?.project || 'Unknown'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Category</span>
                <span className="font-semibold text-gray-800">Roadway</span>
              </div>
              <div className="col-span-2">
                <span className="font-bold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Route / Section</span>
                <span className="font-semibold text-gray-800 block truncate" title={activeTimelineAssignment.batchId?.project}>
                  {activeTimelineAssignment.batchId?.project} - {activeTimelineAssignment.batchId?.dateOfSurvey ? new Date(activeTimelineAssignment.batchId.dateOfSurvey).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>

            {/* Timeline Vertical Path */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTimelineAssignment.timeline && activeTimelineAssignment.timeline.length > 0 ? (
                <div className="relative border-l border-gray-200 ml-3 pl-6 space-y-6 py-2">
                  {activeTimelineAssignment.timeline.map((event, idx) => {
                    const isCompleted = event.action.includes('Completed');
                    const isAssigned = event.action.includes('Assigned');
                    const isOpened = event.action.includes('Opened');
                    return (
                      <div key={idx} className="relative">
                        {/* Circle marker */}
                        <span className={`absolute -left-[32px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                          isCompleted 
                            ? 'border-emerald-500 text-emerald-500' 
                            : isAssigned 
                              ? 'border-green-500 text-green-500'
                              : isOpened
                                ? 'border-amber-500 text-amber-500'
                                : 'border-purple-500 text-purple-500'
                        }`} />
                        
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-bold text-gray-900">{event.action}</span>
                            <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap pt-0.5">
                              {formatDateTime(event.timestamp)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            By {event.performedBy?.name || 'Unknown'}
                          </div>
                          {event.remarks && (
                            <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-100 text-xs text-gray-600 leading-relaxed font-medium">
                              {event.remarks}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-gray-400 font-medium">No timeline events recorded.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assignment Modal Panel */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsBulkOpen(false)}
          />

          {/* Modal Box */}
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-100 max-w-2xl w-full p-6 space-y-4 z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bulk Work Assignment</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">Assign ranges of pages to multiple active users simultaneously.</p>
              </div>
              <button
                onClick={() => setIsBulkOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleBulkAssign} className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Form Controls Grid */}
              <div className="grid grid-cols-1 gap-4">

                {/* Route / Section Dropdown */}
                <div className="flex flex-col gap-1.5" ref={bulkRouteDropdownRef}>
                  <label className="text-xs font-bold text-textColor">
                    Route / Section <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsBulkRouteOpen(!isBulkRouteOpen)}
                      onKeyDown={handleBulkRouteKeyDown}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600 text-textColor font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{bulkRouteDisplayValue}</span>
                      <LuChevronDown className="text-gray-400 text-base" />
                    </button>
                    
                    {isBulkRouteOpen && (
                      <div className="absolute top-11 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col overflow-hidden max-h-48">
                        <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                          <LuSearch className="text-gray-400 text-sm shrink-0" />
                          <input
                            type="text"
                            placeholder="Search road or project..."
                            value={bulkRouteSearch}
                            onChange={(e) => {
                              setBulkRouteSearch(e.target.value);
                              setBulkRouteActiveIndex(0);
                            }}
                            onKeyDown={handleBulkRouteKeyDown}
                            className="w-full bg-transparent text-xs focus:outline-none placeholder-gray-400 text-textColor"
                          />
                        </div>
                        <div className="overflow-y-auto divide-y divide-gray-50">
                          {bulkFilteredProjects.map((p, index) => (
                            <button
                              key={p.id}
                              id={`bulk-route-opt-${index}`}
                              type="button"
                              onClick={() => {
                                setBulkFormData(prev => ({ ...prev, routeSection: p.id }));
                                setIsBulkRouteOpen(false);
                                setBulkRouteSearch('');
                              }}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-green-50/50 transition-colors font-medium ${
                                bulkFormData.routeSection === p.id 
                                  ? 'bg-green-50 text-green-600 font-bold' 
                                  : bulkRouteActiveIndex === index 
                                    ? 'bg-gray-50 text-textColor'
                                    : 'text-textColor'
                              }`}
                            >
                              {p.displayName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-textColor">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={bulkFormData.category}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-textColor font-medium cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Total Pages Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-textColor">
                    Total Pages <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Enter total pages (e.g. 100)"
                    value={bulkFormData.totalPages}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, totalPages: e.target.value }))}
                    className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-textColor font-medium"
                  />
                </div>
              </div>

              {/* Checkbox: Auto Split */}
              <div className="flex items-center gap-2 py-1.5 border-y border-gray-100 bg-gray-50/50 px-3 rounded-lg">
                <input
                  type="checkbox"
                  id="autoSplitPagesCheck"
                  checked={bulkFormData.autoSplit}
                  onChange={(e) => setBulkFormData(prev => ({ ...prev, autoSplit: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                />
                <label htmlFor="autoSplitPagesCheck" className="text-xs font-bold text-textColor cursor-pointer select-none">
                  Auto Split Pages Equally
                </label>
              </div>

              {/* Multi-select Users */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <label className="text-xs font-bold text-textColor">
                    Select Active Users ({bulkFormData.selectedUserIds.length} selected) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllBulkUsers}
                    className="text-[10px] font-bold text-green-600 hover:text-green-700 transition-colors"
                  >
                    {bulkFormData.selectedUserIds.length === activeBulkUsers.length ? 'Deselect All' : 'Select All Active'}
                  </button>
                </div>
                
                <div className="border border-gray-100 rounded-lg divide-y divide-gray-50 max-h-40 overflow-y-auto bg-white p-1">
                  {activeBulkUsers.length > 0 ? (
                    activeBulkUsers.map(user => {
                      const uId = user.id || user.email;
                      const isChecked = bulkFormData.selectedUserIds.includes(uId);
                      return (
                        <div 
                          key={uId}
                          onClick={() => toggleBulkUser(uId)}
                          className="flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {renderAvatar(user)}
                            <div>
                              <span className="font-semibold text-gray-800 text-xs block">{user.name}</span>
                              <span className="text-[10px] text-gray-400 block">@{user.username || 'user'} • {user.role}</span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by click
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 pointer-events-none"
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400 font-medium">No active users found</div>
                  )}
                </div>
              </div>

              {/* Preview Table Display */}
              {bulkPreviewList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-textColor block">Allocation Preview</span>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="py-2 px-3 font-semibold text-gray-500 uppercase tracking-wider text-[9px]">User</th>
                          <th className="py-2 px-3 font-semibold text-gray-500 uppercase tracking-wider text-[9px]">Calculated Range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bulkPreviewList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-2 px-3 font-medium text-gray-700">{item.user.name}</td>
                            <td className="py-2 px-3 font-semibold text-green-600 bg-green-50/20">{item.range}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="px-5 h-10 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedBulkUsers.length === 0 || totalPagesNum <= 0}
                  className="px-6 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                >
                  Assign Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default NotificationPage;
