import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdClear, MdOutlineFileDownload } from 'react-icons/md';
import Pagination from '../components/Pagination';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SegmentedFilters from '../components/Rating/SegmentedFilters';
import CustomDropdown from '../components/common/CustomDropdown';
import { ratingService } from '../services/rating.service';
import { masterListService } from '../services/masterList.service';

const RoadSummaryPage = () => {
  const { roadId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('Roadway');
  const [direction, setDirection] = useState('Choose Direction');
  const [roadType, setRoadType] = useState('Choose Road Type');
  const [paramType, setParamType] = useState('Choose');
  const [minChainage, setMinChainage] = useState('');
  const [maxChainage, setMaxChainage] = useState('');
  const [concernedItems, setConcernedItems] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState('');
  
  const [appliedFilters, setAppliedFilters] = useState({
    category: 'Roadway',
    minChainage: '',
    maxChainage: '',
    direction: 'Choose Direction',
    roadType: 'Choose Road Type',
    paramType: 'Choose',
    concernedItems: false,
  });
  
  const [version, setVersion] = useState('Choose');
  const [projectBatches, setProjectBatches] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const batchesRes = await ratingService.getReadyBatches();
        const batches = Array.isArray(batchesRes) ? batchesRes : (batchesRes?.data || []);
        
        const projectBatches = batches.filter(b => b.project === roadId && (b.status === 'READY_FOR_RATING' || b.status === 'IN_PROGRESS'));
        if (projectBatches.length > 0) {
          projectBatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setProjectBatches(projectBatches);
          
          const latestBatch = projectBatches[0];
          setActiveBatchId(latestBatch._id);
          setVersion(new Date(latestBatch.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
          
          const data = await ratingService.getBatchTasks(latestBatch._id);
          const fetchedTasks = Array.isArray(data) ? data : (data?.data || []);
          
          const tasksAsAssets = fetchedTasks.map((task, globalIndex) => {
            const firstParam = task.parameters?.[0] || {};
            return {
              _id: task._id,
              assetId: (task._id || '').toString().slice(-6).toUpperCase(),
              project: task.project || firstParam.project,
              category: task.category || firstParam.category || '-',
              assetType: task.assetSubType ? `${task.assetType} (${task.assetSubType})` : (task.assetType || firstParam.assetType || '-'),
              chainage: task.chainage,
              parameterCount: task.category === 'Roadway' ? (task.ratings?.length || 0) : (task.parameters?.length || 0),
              taskGlobalIndex: globalIndex,
              status: task.status,
              createdAt: task.createdAt,
              direction: task.direction || firstParam.direction || '-',
              roadType: task.roadType || firstParam.roadType || '-'
            };
          });
          setQuestions(tasksAsAssets);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (roadId) {
      fetchTasks();
    }
  }, [roadId]);

  useEffect(() => {
    if (version !== 'Choose' && projectBatches.length > 0) {
      const selectedBatch = projectBatches.find(b => 
        new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) === version
      ) || projectBatches[0];
      
      if (selectedBatch && selectedBatch._id !== activeBatchId) {
        setActiveBatchId(selectedBatch._id);
        setLoading(true);
        ratingService.getBatchTasks(selectedBatch._id)
          .then(data => {
            const fetchedTasks = Array.isArray(data) ? data : (data?.data || []);
            const tasksAsAssets = fetchedTasks.map((task, globalIndex) => {
              const firstParam = task.parameters?.[0] || {};
              return {
                _id: task._id,
                assetId: (task._id || '').toString().slice(-6).toUpperCase(),
                project: task.project || firstParam.project,
                category: task.category || firstParam.category || '-',
                assetType: task.assetSubType ? `${task.assetType} (${task.assetSubType})` : (task.assetType || firstParam.assetType || '-'),
                chainage: task.chainage,
                parameterCount: task.category === 'Roadway' ? (task.ratings?.length || 0) : (task.parameters?.length || 0),
                taskGlobalIndex: globalIndex,
                status: task.status,
                createdAt: task.createdAt,
                direction: task.direction || firstParam.direction || '-',
                roadType: task.roadType || firstParam.roadType || '-'
              };
            });
            setQuestions(tasksAsAssets);
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      }
    }
  }, [version, projectBatches, activeBatchId]);

  let currentData = questions;
  
  // Apply filters based on appliedFilters state
  if (appliedFilters.category && appliedFilters.category !== 'All') {
    currentData = currentData.filter(q => q.category === appliedFilters.category);
  }
  if (appliedFilters.direction && appliedFilters.direction !== 'Choose Direction' && appliedFilters.direction !== 'All') {
    currentData = currentData.filter(q => q.direction === appliedFilters.direction);
  }
  if (appliedFilters.roadType && appliedFilters.roadType !== 'Choose Road Type' && appliedFilters.roadType !== 'All') {
    currentData = currentData.filter(q => q.roadType === appliedFilters.roadType);
  }
  if (appliedFilters.minChainage) {
    const min = parseFloat(appliedFilters.minChainage);
    if (!isNaN(min)) {
      currentData = currentData.filter(q => parseFloat(q.chainage) >= min);
    }
  }
  if (appliedFilters.maxChainage) {
    const max = parseFloat(appliedFilters.maxChainage);
    if (!isNaN(max)) {
      currentData = currentData.filter(q => parseFloat(q.chainage) <= max);
    }
  }
  
  let totalPages = Math.ceil(currentData.length / 10) || 1;
  
  // Apply Pagination
  const indexOfLastItem = currentPage * 10;
  const indexOfFirstItem = indexOfLastItem - 10;
  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);
  
  const handleGetRatings = () => {
    setAppliedFilters({
      category: selectedCategory,
      minChainage,
      maxChainage,
      direction,
      roadType,
      paramType,
      concernedItems,
    });
    setCurrentPage(1);
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const pageNum = parseInt(goToPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPageInput('');
    } else if (goToPageInput.trim() !== '') {
      alert(`Please enter a valid page number between 1 and ${totalPages}`);
    }
  };
  
  const handleExportCSV = async () => {
    try {
      const response = await ratingService.exportRatingsCSV(roadId, activeBatchId);
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ratings_Export_${roadId}_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to export CSV');
    }
  };

  
  const tabsFilters = [
    { id: 'RATING POINTS', label: 'RATING POINTS' },
    { id: 'RATING SUMMARY', label: 'RATING SUMMARY' },
    { id: 'RATING VERSION HISTORY', label: 'RATING VERSION HISTORY' },
    { id: 'RATING CHAINAGES', label: 'RATING CHAINAGES' },
    { id: 'ROAD DETAILS', label: 'ROAD DETAILS' },
    { id: 'ROAD HISTORY', label: 'ROAD HISTORY' }
  ];

  const [activeTab, setActiveTab] = useState('RATING POINTS');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded shadow-sm border border-borderColor flex flex-col min-h-full overflow-hidden">
            
            {/* Top Tabs */}
            <div className="flex p-4 border-b border-borderColor overflow-x-auto shrink-0">
              <SegmentedFilters 
                filters={tabsFilters} 
                activeFilter={activeTab} 
                onFilterChange={setActiveTab} 
              />
            </div>

      <div className="p-6 flex flex-col flex-1 overflow-hidden">
        {/* Filters */}
        <div className="grid grid-cols-7 gap-4 mb-6 shrink-0">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category :</label>
            <CustomDropdown
              options={[
                'All',
                'Roadway',
                'Road Signage and Furniture',
                'Project Facilities',
                'Structures',
                'ATMS',
                'TMS',
                'Landscaping'
              ]}
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
              placeholder="Category"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Min Chainage :</label>
            <input type="text" value={minChainage} onChange={(e) => setMinChainage(e.target.value)} placeholder="Enter Chainage" className="w-full border border-[#5cb85c] rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#5cb85c] focus:ring-2 focus:ring-[#5cb85c]/20 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Max Chainage :</label>
            <input type="text" value={maxChainage} onChange={(e) => setMaxChainage(e.target.value)} placeholder="Enter Chainage" className="w-full border border-[#5cb85c] rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#5cb85c] focus:ring-2 focus:ring-[#5cb85c]/20 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Direction :</label>
            <CustomDropdown
              options={['Choose Direction', 'All', 'LHS', 'RHS']}
              value={direction}
              onChange={setDirection}
              placeholder="Direction"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Road Type :</label>
            <CustomDropdown
              options={['Choose Road Type', 'All', 'SR', 'MCW']}
              value={roadType}
              onChange={setRoadType}
              placeholder="Road Type"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Parameter Type :</label>
            <CustomDropdown
              options={['Choose', 'Conventional', 'Digital', 'Both']}
              value={paramType}
              onChange={setParamType}
              placeholder="Parameter Type"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">Go to Page :</label>
            <form onSubmit={handleGoToPage} className="flex gap-2">
              <input 
                type="number" 
                min="1" 
                max={totalPages}
                value={goToPageInput} 
                onChange={(e) => setGoToPageInput(e.target.value)} 
                placeholder="Page #" 
                className="w-full border border-[#5cb85c] rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#5cb85c] focus:ring-1 focus:ring-[#5cb85c]/50 transition-all" 
              />
              <button type="submit" className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded text-sm transition-colors">
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-end justify-center gap-6 mb-6 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <input type="checkbox" id="concerned" checked={concernedItems} onChange={(e) => setConcernedItems(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#5cb85c] focus:ring-[#5cb85c] accent-[#5cb85c]" />
            <label htmlFor="concerned" className="text-sm font-medium text-gray-700">Concerned Items</label>
          </div>
          
          <div className="w-[120px]">
            <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Version:</label>
            <CustomDropdown
              options={projectBatches.length > 0 ? projectBatches.map(b => new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })) : ['Choose']}
              value={version}
              onChange={setVersion}
              placeholder="Version"
            />
          </div>
          
          <button onClick={handleGetRatings} className="bg-[#5cb85c] hover:bg-green-600 text-white font-medium py-1.5 px-6 rounded text-sm transition-colors mb-0.5">
            Get Ratings
          </button>
          
          <button onClick={handleExportCSV} className="flex items-center gap-2 border-2 border-[#5cb85c] text-[#5cb85c] hover:bg-green-50 font-medium py-1.5 px-4 rounded text-sm transition-colors mb-0.5">
            <MdOutlineFileDownload className="text-lg" />
            Generate CSV
          </button>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto min-h-0 border-t border-[#5cb85c]/40">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#5cb85c] uppercase bg-green-50/50 sticky top-0 border-b border-[#5cb85c]/40">
              <tr>
                <th className="px-4 py-3 font-medium">ASSET ID</th>
                <th className="px-4 py-3 font-medium">PROJECT</th>
                <th className="px-4 py-3 font-medium">CATEGORY</th>
                <th className="px-4 py-3 font-medium">ASSET TYPE</th>
                <th className="px-4 py-3 font-medium">CHAINAGE</th>
                <th className="px-4 py-3 font-medium">PARAMETERS</th>
                <th className="px-4 py-3 font-medium text-center">STATUS</th>
                <th className="px-4 py-3 font-medium">CREATED</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-8">Loading...</td></tr>
              ) : currentItems.map((q, index) => {
                return (
                <tr 
                  key={index} 
                  onClick={() => {
                    if (!activeBatchId) {
                      alert('No active inspection batch found for this project.');
                      return;
                    }
                    if (q.taskGlobalIndex === -1) {
                      alert('This asset is not part of the current active inspection batch.');
                      return;
                    }
                    navigate(`/rating/inspector/${activeBatchId}?startIndex=${q.taskGlobalIndex}`);
                  }}
                  className={`border-b border-[#5cb85c]/20 hover:bg-green-50/50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-[#5cb85c]/[0.02]'}`}
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">{q.assetId}</td>
                  <td className="px-4 py-3 text-gray-600">{q.project}</td>
                  <td className="px-4 py-3 text-gray-600">{q.category}</td>
                  <td className="px-4 py-3 text-gray-600">{q.assetType}</td>
                  <td className="px-4 py-3 text-gray-600">{q.chainage}</td>
                  <td className="px-4 py-3 text-gray-600">{q.parameterCount} Params</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded ${q.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(q.createdAt).toLocaleDateString('en-GB')}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination at bottom */}
        <div className="shrink-0 pt-4 border-t border-borderColor -mx-6">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
  );
};

export default RoadSummaryPage;

