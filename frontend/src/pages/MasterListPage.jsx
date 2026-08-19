import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { masterListService } from '../services/masterList.service';
import MasterListKPIs from './MasterList/components/MasterListKPIs';
import MasterListFilters from './MasterList/components/MasterListFilters';
import MasterListTable from './MasterList/components/MasterListTable';
import MasterListEmptyState from './MasterList/components/MasterListEmptyState';
import MasterListImportModal from './MasterList/components/MasterListImportModal';
import MasterListProjectFolders from './MasterList/components/MasterListProjectFolders';
import { MdUploadFile, MdFolder, MdList, MdArrowBack } from 'react-icons/md';

const MasterListPage = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // View State: 'folders' or 'table'
  const [viewMode, setViewMode] = useState('folders');
  const [selectedProject, setSelectedProject] = useState('');
  
  const [filters, setFilters] = useState({});
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [filters, viewMode, selectedProject]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listResponse, statsResponse, projectsResponse] = await Promise.all([
        masterListService.getMasterList(viewMode === 'table' && selectedProject ? { ...filters, project: selectedProject } : filters),
        masterListService.getStats(),
        masterListService.getProjects()
      ]);

      if (listResponse.success && statsResponse.success) {
        setData(listResponse.data || []);
        setStats(statsResponse.data);
        setProjects(projectsResponse.data || []);
      } else {
        throw new Error('Failed to fetch master list data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setFilters({ ...filters, project });
    setViewMode('table');
  };

  const handleBackToFolders = () => {
    setSelectedProject('');
    const newFilters = { ...filters };
    delete newFilters.project;
    setFilters(newFilters);
    setViewMode('folders');
  };

  return (
    <Layout title="Master List (Question Bank)">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header with Import Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {viewMode === 'table' && selectedProject && (
              <button 
                onClick={handleBackToFolders}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MdArrowBack />
                Back to Folders
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900 hidden">Master List</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => { setViewMode('folders'); setSelectedProject(''); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'folders' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <MdFolder className="text-lg" />
                Folders
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <MdList className="text-lg" />
                List
              </button>
            </div>
            
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <MdUploadFile className="text-lg" />
              Import Master List
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <MasterListKPIs stats={stats} />

        {/* Filter Section - Only show in table view */}
        {viewMode === 'table' && (
          <MasterListFilters filters={filters} setFilters={setFilters} />
        )}

        {/* Data Presentation (Folder, Table or Empty State) */}
        {error ? (
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center text-red-500">
            <p className="font-semibold mb-2">Error Loading Data</p>
            <p className="text-sm">{error}</p>
            <button onClick={fetchDashboardData} className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
              Try Again
            </button>
          </div>
        ) : viewMode === 'folders' ? (
          <MasterListProjectFolders 
            projects={projects} 
            onSelectProject={handleSelectProject} 
            onProjectDeleted={fetchDashboardData} 
          />
        ) : !loading && data.length === 0 && Object.keys(filters).length === 0 ? (
          <MasterListEmptyState />
        ) : (
          <MasterListTable data={data} loading={loading} onRefresh={fetchDashboardData} />
        )}
      </div>

      {showImportModal && (
        <MasterListImportModal 
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            fetchDashboardData();
          }}
        />
      )}
    </Layout>
  );
};

export default MasterListPage;
