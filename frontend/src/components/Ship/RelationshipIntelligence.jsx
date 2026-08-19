import React, { useState, useEffect } from 'react';
import { shipService } from '../../services/ship.service';
import ProjectHealthRelationship from './relationship/ProjectHealthRelationship';
import CategoryRelationshipMap from './relationship/CategoryRelationshipMap';
import RootCauseAnalysis from './relationship/RootCauseAnalysis';
import ChainageHotspots from './relationship/ChainageHotspots';
import AssetDependencyGraph from './relationship/AssetDependencyGraph';
import ProjectDNA from './relationship/ProjectDNA';
import RelationshipInsights from './relationship/RelationshipInsights';
import ExecutiveRecommendations from './relationship/ExecutiveRecommendations';
import {
  MdHealthAndSafety,
  MdHub,
  MdBugReport,
  MdLocationOn,
  MdAccountTree,
  MdOutlineFingerprint,
  MdAutoAwesome,
  MdAssignment,
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

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const RelationshipIntelligence = ({ projects = [] }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-select first project
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
        const result = await shipService.getRelationshipIntelligence(selectedProject);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch relationship intelligence', err);
        setError('Unable to load relationship intelligence. Please try again.');
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
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Analyse Project</span>
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
          <MdRefresh /> Refresh
        </button>
        {data && (
          <div className="text-xs text-gray-400 font-mono border-l border-gray-200 pl-4">
            Intelligence computed for <span className="font-bold text-gray-700">{selectedProject}</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Analysing relationships in project data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Content */}
      {data && !loading && (
        <div className="space-y-10">

          {/* Section 1: Project Health */}
          <div>
            <SectionHeader
              index="1"
              icon={MdHealthAndSafety}
              title="Project Health Relationship"
              subtitle="How each asset category contributes to the overall project health score."
            />
            <Card>
              <ProjectHealthRelationship data={data.projectHealth} />
            </Card>
          </div>

          {/* Section 2 + 5 vertically stacked */}
          <div className="flex flex-col gap-10">
            <div>
              <SectionHeader
                index="2"
                icon={MdHub}
                title="Category Relationship Map"
                subtitle="Categories that share critical issues at the same chainages form relationship edges."
              />
              <Card>
                <CategoryRelationshipMap data={data.categoryRelationshipMap} fullData={data} />
              </Card>
            </div>
            <div>
              <SectionHeader
                index="5"
                icon={MdAccountTree}
                title="Asset Dependency Graph"
                subtitle="How asset conditions propagate through the highway infrastructure chain."
              />
              <Card>
                <AssetDependencyGraph data={data.assetDependencyGraph} fullData={data} />
              </Card>
            </div>
          </div>

          {/* Section 3: Root Cause */}
          <div>
            <SectionHeader
              index="3"
              icon={MdBugReport}
              title="Root Cause Analysis"
              subtitle="Categories with elevated critical rates and their primary contributing parameters."
            />
            <Card>
              <RootCauseAnalysis data={data.rootCauseAnalysis} />
            </Card>
          </div>

          {/* Section 4: Chainage Hotspots */}
          <div>
            <SectionHeader
              index="4"
              icon={MdLocationOn}
              title="Chainage Hotspots"
              subtitle="Chainages where multiple critical observations converge across asset categories."
            />
            <Card>
              <ChainageHotspots data={data.chainageHotspots} projectCode={selectedProject} />
            </Card>
          </div>

          {/* Section 6: Project DNA */}
          <div>
            <SectionHeader
              index="6"
              icon={MdOutlineFingerprint}
              title="Project DNA"
              subtitle={`Unique performance fingerprint for ${selectedProject}.`}
            />
            <ProjectDNA data={data.projectDNA} />
          </div>

          {/* Section 7 + 8 side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div>
              <SectionHeader
                index="7"
                icon={MdAutoAwesome}
                title="Relationship Insights"
                subtitle="Rule-based patterns discovered from cross-referencing ratings, categories, and chainages."
              />
              <Card>
                <RelationshipInsights data={data.relationshipInsights} />
              </Card>
            </div>
            <div>
              <SectionHeader
                index="8"
                icon={MdAssignment}
                title="Executive Recommendations"
                subtitle="Prioritised actions derived entirely from actual inspection and rating data."
              />
              <Card>
                <ExecutiveRecommendations data={data.executiveRecommendations} />
              </Card>
            </div>
          </div>

        </div>
      )}

      {!selectedProject && !loading && (
        <div className="text-center py-20 text-gray-400 text-sm">
          Select a project above to begin Relationship Intelligence analysis.
        </div>
      )}
    </div>
  );
};

export default RelationshipIntelligence;
