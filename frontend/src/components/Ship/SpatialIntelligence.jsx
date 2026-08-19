import React, { useState, useEffect } from 'react';
import { shipService } from '../../services/ship.service';
import NetworkHealthMap from './spatial/NetworkHealthMap';
import ChainageHeatmap from './spatial/ChainageHeatmap';
import CarriagewayIntelligence from './spatial/CarriagewayIntelligence';
import CorridorIntelligence from './spatial/CorridorIntelligence';
import IssueClusterDetection from './spatial/IssueClusterDetection';
import AssetDistributionMap from './spatial/AssetDistributionMap';
import CriticalZones from './spatial/CriticalZones';
import CorridorTimeline from './spatial/CorridorTimeline';
import BeforeAfterCorridor from './spatial/BeforeAfterCorridor';
import SpatialInsights from './spatial/SpatialInsights';
import {
  MdMap,
  MdLinearScale,
  MdAltRoute,
  MdViewStream,
  MdDynamicFeed,
  MdMyLocation,
  MdReportProblem,
  MdHistory,
  MdCompare,
  MdAutoGraph,
  MdRefresh
} from 'react-icons/md';

const SectionHeader = ({ icon: Icon, title, subtitle, index }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="w-9 h-9 rounded-full border-2 border-green-600 bg-green-50 flex items-center justify-center text-green-700 font-black text-sm">
        {index}
      </div>
      <div className="w-0.5 bg-green-100 flex-1 min-h-[8px]"></div>
    </div>
    <div className="pt-1">
      <div className="flex items-center gap-2 mb-0.5">
        <Icon className="text-green-600 text-lg" />
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const Card = ({ children, className = '', noPadding = false }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${noPadding ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
);

const SpatialIntelligence = ({ projects = [] }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].code);
    }
  }, [projects]);

  useEffect(() => {
    if (!selectedProject) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await shipService.getSpatialIntelligence(selectedProject);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch spatial intelligence', err);
        setError('Unable to load spatial intelligence. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedProject]);

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Selector Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8 flex items-center gap-4 flex-wrap">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Spatial Context</span>
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="text-base font-bold text-gray-800 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-[220px]"
          >
            {projects.map(p => (
              <option key={p.id || p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1"></div>
        <button
          onClick={() => setSelectedProject(prev => { const v = prev; setSelectedProject(''); setTimeout(() => setSelectedProject(v), 50); })}
          className="flex items-center gap-1.5 text-sm font-medium text-green-700 border border-green-200 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors"
        >
          <MdRefresh /> Refresh Spatial Data
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Aggregating geographical and corridor intelligence...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 font-medium">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="space-y-12">
          
          {/* Section 1 */}
          <div>
            <SectionHeader
              index="1"
              icon={MdMap}
              title="Network Health Map"
              subtitle="Geographic overview of all project corridors colored by health."
            />
            <Card noPadding>
              <NetworkHealthMap data={data.networkHealthMap} selectedProject={selectedProject} />
            </Card>
          </div>

          {/* Section 2 */}
          <div>
            <SectionHeader
              index="2"
              icon={MdLinearScale}
              title="Chainage Heatmap"
              subtitle="Continuous issue density across the highway length."
            />
            <Card>
              <ChainageHeatmap data={data.chainageHeatmap} />
            </Card>
          </div>

          {/* Section 3 + 4 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div>
              <SectionHeader
                index="3"
                icon={MdAltRoute}
                title="LHS vs RHS Intelligence"
                subtitle="Disparity in ratings and issues between carriageways."
              />
              <CarriagewayIntelligence data={data.carriagewayIntelligence} />
            </div>
            <div>
              <SectionHeader
                index="4"
                icon={MdViewStream}
                title="Road Corridor Intelligence"
                subtitle="Performance grouped by 20km highway segments."
              />
              <Card noPadding>
                <CorridorIntelligence data={data.corridorIntelligence} />
              </Card>
            </div>
          </div>

          {/* Section 5 + 7 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div>
              <SectionHeader
                index="5"
                icon={MdDynamicFeed}
                title="Issue Cluster Detection"
                subtitle="Locations where multiple assets are failing simultaneously."
              />
              <Card noPadding>
                <IssueClusterDetection data={data.issueClusters} />
              </Card>
            </div>
            <div>
              <SectionHeader
                index="7"
                icon={MdReportProblem}
                title="Critical Zones"
                subtitle="Highest priority 1km segments requiring immediate deployment."
              />
              <Card noPadding>
                <CriticalZones data={data.criticalZones} />
              </Card>
            </div>
          </div>

          {/* Section 6 */}
          <div>
            <SectionHeader
              index="6"
              icon={MdMyLocation}
              title="Asset Distribution Map"
              subtitle="Spatial distribution of assets and their ratings."
            />
            <Card noPadding>
              <AssetDistributionMap data={data.assetDistribution} />
            </Card>
          </div>

          {/* Section 8 + 9 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div>
              <SectionHeader
                index="8"
                icon={MdHistory}
                title="Corridor Timeline"
                subtitle="Historical spatial trends over recent inspection cycles."
              />
              <Card>
                <CorridorTimeline data={data.timeline} />
              </Card>
            </div>
            <div>
              <SectionHeader
                index="9"
                icon={MdCompare}
                title="Before / After Corridor View"
                subtitle="Comparison of critical locations between previous and current cycles."
              />
              <Card>
                <BeforeAfterCorridor data={data.beforeAfter} />
              </Card>
            </div>
          </div>

          {/* Section 10 */}
          <div>
            <SectionHeader
              index="10"
              icon={MdAutoGraph}
              title="Spatial Executive Insights"
              subtitle="Rule-based geographical insights generated from corridor data."
            />
            <SpatialInsights data={data.insights} />
          </div>

        </div>
      )}
    </div>
  );
};

export default SpatialIntelligence;
