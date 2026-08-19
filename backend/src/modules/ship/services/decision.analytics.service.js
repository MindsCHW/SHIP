'use strict';

const InspectionTask = require('../../../models/InspectionTask.model');
const InspectionBatch = require('../../../models/InspectionBatch.model');
const Project = require('../../../models/Project.model');
const decisionRules = require('../analytics/decision.rules.config.json');

// ─── helpers ─────────────────────────────────────────────────────────────────

const parseCh = (ch) => {
  if (!ch) return 0;
  const m = ch.toString().match(/\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
};

const healthColor = (score) => {
  if (score >= 8) return 'green';
  if (score >= 6) return 'yellow';
  if (score >= 4) return 'orange';
  return 'red';
};

class DecisionAnalyticsService {

  async getDecisionIntelligence(projectCode) {
    const projects = await Project.find({ isActive: true }).lean();
    if (!projects.length) return this._emptyState();

    // ── Aggregate per-project metrics ────────────────────────────────────────
    const projectMetrics = await Promise.all(
      projects.map(p => this._projectMetrics(p))
    );

    // Pull the selected project's data
    const selected = projectMetrics.find(m => m.code === projectCode) || projectMetrics[0];

    // ── 1. Executive Decision Center ─────────────────────────────────────────
    const executiveDecisions = this._buildDecisions(selected, projectMetrics);

    // ── 2. Maintenance Priority Engine ───────────────────────────────────────
    const maintenancePriority = projectMetrics
      .map(m => ({
        project: m.name,
        code: m.code,
        priorityScore: m.priorityScore,
        riskScore: m.riskScore,
        healthScore: m.healthScore,
        criticalIssues: m.criticalIssues,
        skipRate: m.skipRate,
        status: m.priorityScore >= 75 ? 'Critical' : m.priorityScore >= 50 ? 'High' : m.priorityScore >= 25 ? 'Medium' : 'Low'
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);

    // ── 3. Resource Planning ─────────────────────────────────────────────────
    const { resourceAssumptions } = decisionRules;
    const resourcePlanning = projectMetrics.map(m => {
      const totalHours = m.criticalIssues * resourceAssumptions.hoursPerCriticalIssue;
      const hoursPerTeamDay = resourceAssumptions.hoursPerTeamPerDay * resourceAssumptions.teamSize;
      const totalDays = Math.ceil(totalHours / hoursPerTeamDay);
      const weeksNeeded = Math.ceil(totalDays / resourceAssumptions.workingDaysPerWeek);
      const teamsRequired = Math.max(1, Math.ceil(m.criticalIssues / 20));
      return {
        project: m.name,
        code: m.code,
        criticalAssets: m.criticalIssues,
        estimatedHours: totalHours,
        teamsRequired,
        weeksNeeded,
        maintenanceVolume: `${m.criticalIssues} assets`,
        inspectionVolume: `${m.totalTasks} tasks`
      };
    });

    // ── 4. Action Impact Simulation ──────────────────────────────────────────
    const actionImpact = decisionRules.actionImpactRules.map(rule => {
      // Count how many tasks in selected project match affected assets
      const affected = selected.criticalByAsset.filter(a =>
        rule.affectedAssets.length === 0 || rule.affectedAssets.includes(a.assetType)
      );
      const totalAffected = affected.reduce((s, a) => s + a.count, 0) || selected.criticalIssues;

      return {
        action: rule.action,
        priority: rule.priority,
        estimatedTimeWeeks: rule.estimatedTimeWeeks,
        assetsTargeted: totalAffected,
        downstreamBenefits: rule.downstreamBenefits,
        expectedRatingGain: (rule.downstreamBenefits.reduce((s, b) => s + b.ratingImprovementFactor, 0) / rule.downstreamBenefits.length).toFixed(2)
      };
    });

    // ── 5. Project Risk Matrix ───────────────────────────────────────────────
    const riskMatrix = projectMetrics.map(m => {
      let quadrant = 'Monitor';
      if (m.healthScore >= 7 && m.riskScore < 40) quadrant = 'Healthy';
      else if (m.healthScore >= 7 && m.riskScore >= 40) quadrant = 'Monitor';
      else if (m.healthScore < 7 && m.riskScore < 60) quadrant = 'Needs Attention';
      else quadrant = 'Critical';
      return {
        project: m.name,
        code: m.code,
        healthScore: m.healthScore,
        riskScore: m.riskScore,
        quadrant,
        color: healthColor(m.healthScore)
      };
    });

    // ── 6. Project Priority Board ────────────────────────────────────────────
    const priorityBoard = {
      Critical: maintenancePriority.filter(p => p.status === 'Critical'),
      High: maintenancePriority.filter(p => p.status === 'High'),
      Medium: maintenancePriority.filter(p => p.status === 'Medium'),
      Low: maintenancePriority.filter(p => p.status === 'Low')
    };

    // ── 7. Executive Brief ───────────────────────────────────────────────────
    const avgHealth = (projectMetrics.reduce((s, m) => s + m.healthScore, 0) / projectMetrics.length).toFixed(1);
    const totalCritical = projectMetrics.reduce((s, m) => s + m.criticalIssues, 0);
    const criticalProjects = projectMetrics.filter(m => m.riskScore >= 70).length;
    const executiveBrief = {
      generatedAt: new Date().toISOString(),
      overallNetworkHealth: avgHealth,
      totalProjects: projectMetrics.length,
      criticalProjects,
      totalCriticalIssues: totalCritical,
      sentences: [
        `Overall network health stands at ${avgHealth}/10 across ${projectMetrics.length} active projects.`,
        criticalProjects > 0
          ? `${criticalProjects} project${criticalProjects > 1 ? 's' : ''} require immediate executive intervention.`
          : `All projects are operating within acceptable health thresholds.`,
        `A total of ${totalCritical} critical issues have been identified across the network.`,
        maintenancePriority[0]
          ? `Highest priority project is ${maintenancePriority[0].project} with a priority score of ${maintenancePriority[0].priorityScore}/100.`
          : '',
        selected.skipRate > 5
          ? `Skip rate for ${selected.name} is ${selected.skipRate.toFixed(1)}% — incomplete inspection coverage is masking the true risk profile.`
          : `Inspection coverage is satisfactory across the network.`,
        `Drainage and roadway maintenance should be prioritized based on asset dependency analysis.`,
        `Rectification effectiveness must be monitored to prevent recurring defect escalation.`
      ].filter(Boolean)
    };

    // ── 8. What-If Scenarios ─────────────────────────────────────────────────
    const whatIfScenarios = [
      {
        id: 'fix_drainage',
        label: 'What if all Drainage issues are repaired?',
        icon: 'water',
        assumptions: ['All critical drainage assets rectified', 'Downstream assets improve per dependency rules'],
        projections: [
          { metric: 'Roadway Rating', improvement: '+0.6 pts', rationale: 'Reduced water ingress' },
          { metric: 'Shoulder Stability', improvement: '+0.5 pts', rationale: 'Dry base layer stabilises' },
          { metric: 'Critical Issues', improvement: `-${Math.round(selected.criticalIssues * 0.3)} issues`, rationale: '~30% of critical issues are drainage-related' }
        ]
      },
      {
        id: 'fix_skips',
        label: 'What if all skipped inspections are completed?',
        icon: 'clipboard',
        assumptions: ['100% inspection coverage achieved', 'Skipped items rated based on neighbourhood average'],
        projections: [
          { metric: 'Data Coverage', improvement: `+${selected.skipRate.toFixed(1)}%`, rationale: 'All blind spots eliminated' },
          { metric: 'Risk Accuracy', improvement: '+30%', rationale: 'Risk score recalculates with full data' },
          { metric: 'Critical Issues (est.)', improvement: `+${Math.round(selected.skipRate * 2)} items likely revealed`, rationale: 'Unchecked areas historically contain defects' }
        ]
      },
      {
        id: 'fix_rating1',
        label: 'What if all Rating-1 assets are rectified?',
        icon: 'wrench',
        assumptions: ['All assets rated ≤1 brought to baseline rating of 6', 'Cascade improvements per dependency config'],
        projections: [
          { metric: 'Overall Network Rating', improvement: `+${(selected.criticalIssues * 0.04).toFixed(1)} pts`, rationale: 'Rating-1 assets disproportionately drag averages' },
          { metric: 'Risk Score', improvement: '-35 pts', rationale: 'Catastrophic failure risk eliminated' },
          { metric: 'Maintenance Urgency', improvement: 'High → Medium', rationale: 'Emergency interventions no longer required' }
        ]
      }
    ];

    // ── 9. Decision Timeline ─────────────────────────────────────────────────
    // Auto-generate decisions, each starts at "Generated"
    const decisionTimeline = executiveDecisions.slice(0, 5).map((d, i) => ({
      id: `REC-${String(i + 1).padStart(3, '0')}`,
      title: d.recommendation,
      project: d.project,
      priority: d.priority,
      stage: 'Generated',
      generatedAt: new Date().toISOString(),
      stages: ['Generated', 'Approved', 'Assigned', 'Completed', 'Verified']
    }));

    // ── 10. Knowledge Center data ────────────────────────────────────────────
    const knowledgeIndex = {
      projects: projects.map(p => ({ type: 'Project', title: p.fullName || p.name, code: p.code, url: `/ship?project=${p.code}` })),
      decisions: executiveDecisions.slice(0, 10).map(d => ({ type: 'Decision', title: d.recommendation, priority: d.priority, project: d.project })),
      criticalAssets: selected.criticalByAsset.map(a => ({ type: 'Asset', title: a.assetType, count: a.count, project: selected.name })),
      criticalChainages: selected.criticalChainages.map(c => ({ type: 'Chainage', title: `CH ${c.ch}`, count: c.count, project: selected.name }))
    };

    return {
      executiveDecisions,
      maintenancePriority,
      resourcePlanning,
      actionImpact,
      riskMatrix,
      priorityBoard,
      executiveBrief,
      whatIfScenarios,
      decisionTimeline,
      knowledgeIndex
    };
  }

  // ── Per-project metric aggregation ─────────────────────────────────────────
  async _projectMetrics(project) {
    const tasks = await InspectionTask.find({
      project: project.code,
      status: { $in: ['COMPLETED', 'READY_FOR_RATING', 'SKIPPED'] }
    }).lean();

    let totalRatings = 0, sumRatings = 0, criticalIssues = 0, skipCount = 0, totalAssetsCount = 0;
    const assetCriticalMap = {};
    const chainageCriticalMap = {};

    tasks.forEach(t => {
      const isRoadway = t.category === 'Roadway' || t.assetType === 'Roadway';
      
      if (isRoadway) {
        totalAssetsCount += 4; // Roadway task represents 4 asset types
        if (t.status === 'SKIPPED') {
          skipCount += 4;
        } else if (t.skippedAssetTypes && t.skippedAssetTypes.length > 0) {
          skipCount += t.skippedAssetTypes.length;
        }
      } else {
        totalAssetsCount += 1;
        if (t.status === 'SKIPPED') {
          skipCount += 1;
        }
      }

      if (t.status === 'SKIPPED' && !isRoadway) return;
      
      if (t.ratings) {
        t.ratings.forEach(r => {
          if (r.score !== undefined) {
            sumRatings += r.score;
            totalRatings++;
            if (r.score <= 4) {
              criticalIssues++;
              const effectiveAssetType = (isRoadway && r.group) ? r.group : t.assetType;
              if (effectiveAssetType) assetCriticalMap[effectiveAssetType] = (assetCriticalMap[effectiveAssetType] || 0) + 1;
              if (t.chainage) {
                const ch = parseCh(t.chainage);
                chainageCriticalMap[ch] = (chainageCriticalMap[ch] || 0) + 1;
              }
            }
          }
        });
      }
    });

    const healthScore = totalRatings > 0 ? parseFloat((sumRatings / totalRatings).toFixed(1)) : 10;
    const skipRate = totalAssetsCount > 0 ? (skipCount / totalAssetsCount) * 100 : 0;

    // Priority Score: weighted composite (0–100)
    const critScore = Math.min(criticalIssues / 5, 40);       // max 40 pts
    const healthPenalty = Math.max(0, (10 - healthScore) * 4); // max 40 pts
    const skipPenalty = Math.min(skipRate * 0.5, 20);          // max 20 pts
    const priorityScore = Math.round(critScore + healthPenalty + skipPenalty);

    // Risk Score (0–100)
    const riskScore = Math.min(100, Math.round(critScore * 1.5 + skipPenalty + healthPenalty * 0.5));

    const criticalByAsset = Object.entries(assetCriticalMap)
      .map(([assetType, count]) => ({ assetType, count }))
      .sort((a, b) => b.count - a.count);

    const criticalChainages = Object.entries(chainageCriticalMap)
      .map(([ch, count]) => ({ ch, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      code: project.code,
      name: project.fullName || project.name || project.code,
      totalTasks: tasks.length,
      healthScore,
      criticalIssues,
      skipRate,
      priorityScore,
      riskScore,
      criticalByAsset,
      criticalChainages
    };
  }

  // ── Rule-based decision generation ─────────────────────────────────────────
  _buildDecisions(selected, allMetrics) {
    const decisions = [];

    // Decision 1: High critical count
    if (selected.criticalIssues > 0) {
      const topAsset = selected.criticalByAsset[0];
      decisions.push({
        priority: selected.criticalIssues > 50 ? 'Critical' : selected.criticalIssues > 20 ? 'High' : 'Medium',
        recommendation: `Strategic Asset Rehabilitation: ${topAsset ? topAsset.assetType : 'Critical Infrastructure'}`,
        reason: `Current failure density in ${topAsset ? topAsset.assetType : 'assets'} poses a significant operational risk and potential for accelerated network deterioration. Immediate capital intervention is advised to prevent cascading failures.`,
        project: selected.name,
        chainage: selected.criticalChainages[0] ? `CH ${selected.criticalChainages[0].ch}` : 'Network-Wide',
        category: topAsset ? topAsset.assetType : 'Multiple',
        expectedBenefit: `Improve overall network health from ${selected.healthScore}/10 to target KPI, ensuring compliance and extending the asset lifecycle.`,
        estimatedImpact: `~${Math.round(selected.criticalIssues * 0.4)} critical issues resolved, mitigating potential catastrophic failures.`,
        strategicImpact: 'Asset Lifecycle Extension & Compliance',
        roi: 'High (Preventative vs Reactive Cost Ratio)'
      });
    }

    // Decision 2: High skip rate
    if (selected.skipRate > 5) {
      decisions.push({
        priority: selected.skipRate > 15 ? 'High' : 'Medium',
        recommendation: `Audit Compliance Initiative: Complete ${selected.skipRate.toFixed(1)}% Skipped Inspections`,
        reason: `High skip rate creates blind spots in the enterprise risk profile. Actual asset condition may be significantly worse than recorded, exposing the organisation to unforeseen liabilities and safety hazards.`,
        project: selected.name,
        chainage: 'Network-wide',
        category: 'Inspection Coverage',
        expectedBenefit: 'Accurate risk assessment, reduced compliance liability, and identification of hidden defects before they escalate into capital expenses.',
        estimatedImpact: 'Estimated 15-30% more defects may surface upon completion, enabling proactive budgeting.',
        strategicImpact: 'Risk Mitigation & Audit Compliance',
        roi: 'Very High (Data Accuracy)'
      });
    }

    // Decision 3: Apply dependency rules
    selected.criticalByAsset.slice(0, 3).forEach(asset => {
      const rule = decisionRules.actionImpactRules.find(r => r.affectedAssets.includes(asset.assetType));
      if (rule) {
        decisions.push({
          priority: rule.priority,
          recommendation: `Systemic Intervention: ${rule.action}`,
          reason: `${asset.count} critical ${asset.assetType} defects detected. Based on dependency modelling, ${rule.downstreamBenefits[0]?.rationale} Addressing the root cause will yield compounding positive effects on dependent assets.`,
          project: selected.name,
          chainage: selected.criticalChainages[0] ? `CH ${selected.criticalChainages[0].ch}` : 'Multiple',
          category: asset.assetType,
          expectedBenefit: `Cascading improvement across ${rule.downstreamBenefits.map(b => b.asset).join(', ')}, reducing overall OPEX in subsequent cycles.`,
          estimatedImpact: `Estimated ${(parseFloat(rule.downstreamBenefits[0]?.ratingImprovementFactor || 0) * 10).toFixed(0)}% improvement in downstream categories.`,
          strategicImpact: 'Root Cause Resolution & OPEX Reduction',
          roi: 'High (Compounding Benefits)'
        });
      }
    });

    // Decision 4: Network-level low performers
    const criticalProjects = allMetrics.filter(m => m.riskScore >= 70 && m.code !== selected.code);
    if (criticalProjects.length > 0) {
      decisions.push({
        priority: 'High',
        recommendation: `Executive Oversight Escalation: Underperforming Portfolios`,
        reason: `${criticalProjects.length} project(s) have enterprise risk scores exceeding 70. This represents an unacceptable level of operational risk and requires immediate executive review and resource reallocation.`,
        project: criticalProjects[0].name,
        chainage: 'Network-wide',
        category: 'Executive Oversight',
        expectedBenefit: 'Prevent further deterioration, rebalance maintenance portfolios, and protect long-term asset value through early intervention.',
        estimatedImpact: 'Projected risk score reduction of 15-25 points following corrective action.',
        strategicImpact: 'Portfolio Rebalancing & Value Protection',
        roi: 'Medium (Strategic Realignment)'
      });
    }

    return decisions.length > 0 ? decisions : [{
      priority: 'Low',
      recommendation: 'Sustain Current Operations & Optimize OPEX',
      reason: 'No critical operational risks detected. The asset portfolio is performing within acceptable enterprise parameters. Focus on optimizing routine maintenance schedules to further reduce OPEX.',
      project: selected.name,
      chainage: 'N/A',
      category: 'Routine Operations',
      expectedBenefit: 'Sustain healthy asset ratings above 8/10 while maximizing operational efficiency.',
      estimatedImpact: 'Steady-state performance maintained with nominal budget variance.',
      strategicImpact: 'Operational Excellence',
      roi: 'Baseline'
    }];
  }

  _emptyState() {
    return {
      executiveDecisions: [], maintenancePriority: [], resourcePlanning: [],
      actionImpact: [], riskMatrix: [], priorityBoard: { Critical: [], High: [], Medium: [], Low: [] },
      executiveBrief: { sentences: [] }, whatIfScenarios: [], decisionTimeline: [], knowledgeIndex: {}
    };
  }
}

module.exports = new DecisionAnalyticsService();
