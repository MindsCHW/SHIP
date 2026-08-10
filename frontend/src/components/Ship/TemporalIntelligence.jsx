import React, { useState, useEffect } from 'react';
import { shipService } from '../../services/ship.service';

import ProjectTimeline from './temporal/ProjectTimeline';
import ProjectHealthTrend from './temporal/ProjectHealthTrend';
import CategoryEvolution from './temporal/CategoryEvolution';
import AssetLifecycle from './temporal/AssetLifecycle';
import ChainageHistory from './temporal/ChainageHistory';
import RecurringIssues from './temporal/RecurringIssues';
import RectificationEffectiveness from './temporal/RectificationEffectiveness';
import PerformanceScorecard from './temporal/PerformanceScorecard';
import ExecutiveTimeline from './temporal/ExecutiveTimeline';
import TemporalInsights from './temporal/TemporalInsights';

import {
  MdTimeline,
  MdShowChart,
  MdTrendingUp,
  MdRecycling,
  MdFindInPage,
  MdRepeat,
  MdBuild,
  MdDataset,
  MdHistoryEdu,
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

const TemporalIntelligence = ({ projects = [] }) => {
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
        const result = await shipService.getTemporalIntelligence(selectedProject);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch temporal intelligence', err);
        setError('Unable to load temporal intelligence. Please try again.');
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
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Temporal Context</span>
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
          <MdRefresh /> Refresh Temporal Data
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Calculating temporal trajectories and historical baselines...</p>
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
            <SectionHeader index="1" icon={MdTimeline} title="Project Timeline" subtitle="Chronological flow of all inspection cycles." />
            <ProjectTimeline data={data.projectTimeline} />
          </div>

          {/* Section 2 */}
          <div>
            <SectionHeader index="2" icon={MdShowChart} title="Project Health Trend" subtitle="Historical evolution of overall ratings and critical issues." />
            <Card>
              <ProjectHealthTrend data={data.healthTrend} />
            </Card>
          </div>

          {/* Section 3 + 4 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div>
              <SectionHeader index="3" icon={MdTrendingUp} title="Category Evolution" subtitle="Long-term performance trends across major asset categories." />
              <Card noPadding>
                <CategoryEvolution data={data.categoryEvolution} />
              </Card>
            </div>
            <div>
              <SectionHeader index="4" icon={MdRecycling} title="Asset Lifecycle" subtitle="Continuous rating history for individual assets." />
              <Card noPadding>
                <AssetLifecycle data={data.assetLifecycle} />
              </Card>
            </div>
          </div>

          {/* Section 5 + 6 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div>
              <SectionHeader index="5" icon={MdFindInPage} title="Chainage History" subtitle="Temporal deep-dive into specific chainages." />
              <Card noPadding>
                <ChainageHistory data={data.chainageHistory} />
              </Card>
            </div>
            <div>
              <SectionHeader index="6" icon={MdRepeat} title="Recurring Issue Detection" subtitle="Defects that persistently reappear across multiple inspections." />
              <Card noPadding>
                <RecurringIssues data={data.recurringIssues} />
              </Card>
            </div>
          </div>

          {/* Section 7 + 8 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div>
              <SectionHeader index="7" icon={MdBuild} title="Rectification Effectiveness" subtitle="Metrics proving the success of maintenance between cycles." />
              <Card>
                <RectificationEffectiveness data={data.rectificationEffectiveness} />
              </Card>
            </div>
            <div>
              <SectionHeader index="8" icon={MdDataset} title="Performance Scorecard" subtitle="Tabular history of category metrics per cycle." />
              <Card noPadding>
                <PerformanceScorecard data={data.scorecards} />
              </Card>
            </div>
          </div>

          {/* Section 9 + 10 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div>
              <SectionHeader index="9" icon={MdHistoryEdu} title="Executive Timeline" subtitle="Significant milestones derived from temporal shifts." />
              <Card>
                <ExecutiveTimeline data={data.executiveTimeline} />
              </Card>
            </div>
            <div>
              <SectionHeader index="10" icon={MdAutoGraph} title="Temporal Executive Summary" subtitle="Auto-generated textual observations summarizing the project's evolution." />
              <TemporalInsights data={data.insights} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default TemporalIntelligence;
