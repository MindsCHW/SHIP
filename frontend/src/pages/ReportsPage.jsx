import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { reportService } from '../services/report.service';
import { Download, FileSpreadsheet, Loader2, BarChart2, AlertTriangle, Hash, MapPin, CheckCircle } from 'lucide-react';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({ projects: [] });
  
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('all');
  const [reportType, setReportType] = useState('detailed');
  
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const [generating, setGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchSummary(selectedProject, selectedCycle);
      setGenerateSuccess(false);
    }
  }, [selectedProject, selectedCycle]);

  const fetchConfig = async () => {
    try {
      const data = await reportService.getConfig();
      if (data.success) {
        setConfig(data.data);
        if (data.data.projects.length > 0) {
          setSelectedProject(data.data.projects[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch report config', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (project, cycle) => {
    setLoadingSummary(true);
    try {
      const data = await reportService.getSummary(project, cycle);
      if (data.success) {
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch report summary', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedProject) return;
    setGenerating(true);
    setGenerateSuccess(false);
    try {
      await reportService.generateExcelReport(selectedProject, selectedCycle);
      setGenerateSuccess(true);
    } catch (error) {
      console.error('Failed to generate report', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const activeProjectData = config.projects.find(p => p.id === selectedProject);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-pageBg font-outfit">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 overflow-y-auto p-8 lg:px-16">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports</h1>
              <p className="text-gray-500 mt-2 text-lg">Generate inspection-cycle reports directly from completed HiRATE rating data.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Configuration Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 tracking-wide">PROJECT</label>
                      <select 
                        className="w-full h-12 px-4 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedProject}
                        onChange={(e) => {
                          setSelectedProject(e.target.value);
                          setSelectedCycle('all');
                        }}
                      >
                        {config.projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 tracking-wide">INSPECTION CYCLE</label>
                      <select 
                        className="w-full h-12 px-4 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedCycle}
                        onChange={(e) => setSelectedCycle(e.target.value)}
                        disabled={!activeProjectData}
                      >
                        <option value="all">[All Cycles]</option>
                        {activeProjectData?.cycles.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 tracking-wide">REPORT TYPE</label>
                      <select 
                        className="w-full h-12 px-4 rounded-xl border-gray-200 bg-gray-50 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <option value="detailed">Detailed Excel Report</option>
                      </select>
                    </div>

                    <div>
                      <button
                        onClick={handleGenerate}
                        disabled={generating || !selectedProject || loadingSummary}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
                      >
                        {generating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="w-5 h-5" />
                        )}
                        <span>GENERATE REPORT</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Summary Section */}
                {summary && !loadingSummary && (
                  <div className="space-y-6 animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-800">Project Overview</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="text-gray-500 mb-2"><Hash className="w-5 h-5" /></div>
                        <div className="text-2xl font-bold text-gray-900">{summary.totalRatings}</div>
                        <div className="text-sm font-medium text-gray-500">Total Ratings</div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="text-gray-500 mb-2"><MapPin className="w-5 h-5" /></div>
                        <div className="text-2xl font-bold text-gray-900">{summary.uniqueChainages}</div>
                        <div className="text-sm font-medium text-gray-500">Unique Chainages</div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="text-gray-500 mb-2"><BarChart2 className="w-5 h-5" /></div>
                        <div className="text-2xl font-bold text-gray-900">{summary.parametersRated}</div>
                        <div className="text-sm font-medium text-gray-500">Parameters Rated</div>
                      </div>

                      <div className="bg-red-50 p-5 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-between">
                        <div className="text-red-500 mb-2"><AlertTriangle className="w-5 h-5" /></div>
                        <div className="text-2xl font-bold text-red-700">{summary.criticalRatings}</div>
                        <div className="text-sm font-medium text-red-600">Critical Ratings</div>
                      </div>

                      <div className="bg-indigo-50 p-5 rounded-2xl shadow-sm border border-indigo-100 flex flex-col justify-between">
                        <div className="text-indigo-500 mb-2"><BarChart2 className="w-5 h-5" /></div>
                        <div className="text-2xl font-bold text-indigo-700">{summary.averageRating}</div>
                        <div className="text-sm font-medium text-indigo-600">Average Rating</div>
                      </div>

                      <div className="bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-700 flex flex-col justify-between text-white">
                        <div className="text-gray-400 mb-2"><CheckCircle className="w-5 h-5" /></div>
                        <div className="text-lg font-bold truncate" title={summary.inspectionDateRange}>{summary.inspectionDateRange}</div>
                        <div className="text-sm font-medium text-gray-400">Date Range</div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Success Banner */}
                {generateSuccess && summary && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4 animate-fadeIn shadow-sm">
                    <div className="bg-green-500 text-white p-2 rounded-full mt-1">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-800">Report Generated Successfully</h3>
                      <p className="text-green-700 mt-1">The professional Excel workbook for <strong>{summary.projectName}</strong> has been downloaded to your device.</p>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Ratings</p>
                          <p className="text-lg font-bold text-green-900">{summary.totalRatings}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600 font-medium">Critical Issues</p>
                          <p className="text-lg font-bold text-green-900">{summary.criticalRatings}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600 font-medium">Average Rating</p>
                          <p className="text-lg font-bold text-green-900">{summary.averageRating}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600 font-medium">Generated At</p>
                          <p className="text-lg font-bold text-green-900">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
// force reload
