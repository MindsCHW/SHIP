import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';
import { shipService } from '../../services/ship.service';
import { dashboardService } from '../../services/dashboard.service';

// Phase 1 components
import GlobalHealth from '../../components/Ship/GlobalHealth';
import ProjectIntelligence from '../../components/Ship/ProjectIntelligence';
import AssetIntelligence from '../../components/Ship/AssetIntelligence';
import GeographicIntelligence from '../../components/Ship/GeographicIntelligence';
import ExecutiveInsights from '../../components/Ship/ExecutiveInsights';

// Phase 2 component
import RelationshipIntelligence from '../../components/Ship/RelationshipIntelligence';

// Phase 3 component
import SpatialIntelligence from '../../components/Ship/SpatialIntelligence';

// Phase 4 component
import TemporalIntelligence from '../../components/Ship/TemporalIntelligence';

// Phase 5 component
import DecisionIntelligence from '../../components/Ship/DecisionIntelligence';

import {
  MdNetworkCheck,
  MdHub,
} from 'react-icons/md';

const TABS = [
  { id: 'executive',    label: 'Executive Intelligence' },
  { id: 'relationship', label: 'Relationship Intelligence' },
  { id: 'spatial',      label: 'Spatial Intelligence' },
  { id: 'temporal',     label: 'Temporal Intelligence' },
  { id: 'decision',     label: 'Decision Intelligence' },
];

const ShipDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('executive');
  const [loading, setLoading] = useState(true);

  const [overviewData, setOverviewData] = useState(null);
  const [projectsData, setProjectsData] = useState([]);
  const [chartsData, setChartsData] = useState(null);
  const [mapData, setMapData] = useState(null);

  useEffect(() => {
    const fetchAllIntelligence = async () => {
      setLoading(true);
      try {
        const [overview, projects, charts, map] = await Promise.all([
          shipService.getOverview(),
          shipService.getProjects(),
          dashboardService.getChartsData(''),
          dashboardService.getMapData('')
        ]);
        setOverviewData(overview);
        setProjectsData(projects);
        setChartsData(charts);
        setMapData(map);
      } catch (error) {
        console.error('Failed to fetch SHIP Intelligence', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllIntelligence();
  }, []);

  return (
    <div className="flex h-screen bg-[#FDFDFD]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar user={user} />

        <main className="flex-1 overflow-y-auto">
          {loading && activeTab === 'executive' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 pointer-events-none">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium tracking-wider uppercase text-sm">Aggregating Intelligence...</p>
              </div>
            </div>
          )}

          {/* Top Header + Tab Navigation */}
          <div className="border-b border-gray-200 bg-white sticky top-0 z-30">
            <div className="max-w-[1600px] mx-auto px-10 pt-8 pb-0">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-4 mb-5">
                <span className="text-green-700">SHIP</span>
                <span className="text-gray-200 text-2xl font-light">|</span>
                <span className="text-xl text-gray-700 font-medium tracking-normal">Smart Highway Intelligence Platform</span>
              </h1>

              {/* Tabs */}
              <div className="flex gap-0">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-6 py-3 text-sm font-bold transition-colors ${
                      activeTab === tab.id
                        ? 'text-green-700 border-b-2 border-green-600'
                        : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent'
                    }`}
                  >
                    {tab.label}

                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-[1600px] mx-auto px-10 py-12">
            {activeTab === 'executive' && !loading && (
              <div className="space-y-16">
                <section>
                  <GlobalHealth data={overviewData} />
                </section>
                <section>
                  <ExecutiveInsights overview={overviewData} projects={projectsData} charts={chartsData} />
                </section>
                <section>
                  <ProjectIntelligence projects={projectsData} />
                </section>
                <section>
                  <AssetIntelligence chartsData={chartsData} />
                </section>
                <section>
                  <GeographicIntelligence mapData={mapData} />
                </section>
              </div>
            )}

            {activeTab === 'relationship' && (
              <RelationshipIntelligence projects={projectsData} />
            )}

            {activeTab === 'spatial' && (
              <SpatialIntelligence projects={projectsData} />
            )}

            {activeTab === 'temporal' && (
              <TemporalIntelligence projects={projectsData} />
            )}

            {activeTab === 'decision' && (
              <DecisionIntelligence projects={projectsData} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShipDashboard;
