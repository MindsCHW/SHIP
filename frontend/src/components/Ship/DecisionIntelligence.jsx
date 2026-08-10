import React, { useState, useEffect } from 'react';
import { shipService } from '../../services/ship.service';

import ExecutiveDecisionCenter from './decision/ExecutiveDecisionCenter';
import MaintenancePriorityEngine from './decision/MaintenancePriorityEngine';
import ResourcePlanning from './decision/ResourcePlanning';
import ActionImpactSimulation from './decision/ActionImpactSimulation';
import ProjectRiskMatrix from './decision/ProjectRiskMatrix';
import ProjectPriorityBoard from './decision/ProjectPriorityBoard';
import ExecutiveBrief from './decision/ExecutiveBrief';
import WhatIfScenarios from './decision/WhatIfScenarios';
import DecisionTimeline from './decision/DecisionTimeline';
import KnowledgeCenter from './decision/KnowledgeCenter';

import {
  MdGavel, MdOutlineLeaderboard, MdBuildCircle, MdAutoFixHigh,
  MdScatterPlot, MdViewKanban, MdArticle, MdTune,
  MdTimeline, MdManageSearch, MdRefresh
} from 'react-icons/md';

const SectionHeader = ({ icon: Icon, title, subtitle, index }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="w-9 h-9 rounded-full border-2 border-green-600 bg-green-50 flex items-center justify-center text-green-700 font-black text-sm">
        {index}
      </div>
      <div className="w-0.5 bg-green-100 flex-1 min-h-[8px]" />
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

const DecisionIntelligence = ({ projects = [] }) => {
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
    setLoading(true);
    setError(null);
    shipService.getDecisionIntelligence(selectedProject)
      .then(setData)
      .catch(err => {
        console.error('Decision intelligence fetch failed', err);
        setError('Failed to load decision intelligence. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [selectedProject]);

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Selector Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8 flex items-center gap-4 flex-wrap">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Decision Context</span>
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
        <div className="flex items-center gap-2 ml-4 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-amber-700 text-xs font-bold">⚡ Decision Engine Active</span>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => { const v = selectedProject; setSelectedProject(''); setTimeout(() => setSelectedProject(v), 50); }}
          className="flex items-center gap-1.5 text-sm font-medium text-green-700 border border-green-200 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors"
        >
          <MdRefresh /> Refresh Decisions
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Running decision engine against inspection data...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 font-medium">{error}</div>
      )}

      {data && !loading && (
        <div className="space-y-12">

          {/* Section 1 */}
          <div>
            <SectionHeader index="1" icon={MdGavel} title="Executive Decision Center"
              subtitle="Ranked, data-backed action recommendations generated from inspection data." />
            <ExecutiveDecisionCenter data={data.executiveDecisions} />
          </div>

          {/* Section 7 — Executive Brief at top for visibility */}
          <div>
            <SectionHeader index="7" icon={MdArticle} title="Automated Executive Brief"
              subtitle="One-page network summary generated from current inspection analytics." />
            <Card>
              <ExecutiveBrief data={data.executiveBrief} />
            </Card>
          </div>

          {/* Section 2 + 5 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div>
              <SectionHeader index="2" icon={MdOutlineLeaderboard} title="Maintenance Priority Engine"
                subtitle="Projects ranked by composite priority, health, and risk scores." />
              <Card noPadding>
                <MaintenancePriorityEngine data={data.maintenancePriority} />
              </Card>
            </div>
            <div>
              <SectionHeader index="5" icon={MdScatterPlot} title="Project Risk Matrix"
                subtitle="2×2 matrix positioning every project by health and risk." />
              <Card>
                <ProjectRiskMatrix data={data.riskMatrix} />
              </Card>
            </div>
          </div>

          {/* Section 6 */}
          <div>
            <SectionHeader index="6" icon={MdViewKanban} title="Project Priority Board"
              subtitle="Projects organised into urgency lanes: Critical / High / Medium / Low." />
            <ProjectPriorityBoard data={data.priorityBoard} />
          </div>

          {/* Section 3 + 4 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div>
              <SectionHeader index="3" icon={MdBuildCircle} title="Resource Planning"
                subtitle="Estimated maintenance workload, teams, and completion timelines per project." />
              <Card noPadding>
                <ResourcePlanning data={data.resourcePlanning} />
              </Card>
            </div>
            <div>
              <SectionHeader index="4" icon={MdAutoFixHigh} title="Action Impact Simulation"
                subtitle="Rule-based downstream improvement estimates for each maintenance action." />
              <Card noPadding>
                <ActionImpactSimulation data={data.actionImpact} />
              </Card>
            </div>
          </div>

          {/* Section 8 */}
          <div>
            <SectionHeader index="8" icon={MdTune} title="What-If Scenarios"
              subtitle="Simulate planning decisions to project operational improvements." />
            <WhatIfScenarios data={data.whatIfScenarios} />
          </div>

          {/* Section 9 + 10 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div>
              <SectionHeader index="9" icon={MdTimeline} title="Decision Timeline"
                subtitle="Lifecycle tracker for every generated recommendation." />
              <Card>
                <DecisionTimeline data={data.decisionTimeline} />
              </Card>
            </div>
            <div>
              <SectionHeader index="10" icon={MdManageSearch} title="SHIP Knowledge Center"
                subtitle="Searchable repository of projects, assets, decisions, and chainages." />
              <Card noPadding>
                <KnowledgeCenter data={data.knowledgeIndex} />
              </Card>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default DecisionIntelligence;
