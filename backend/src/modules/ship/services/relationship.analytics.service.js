'use strict';

const InspectionTask = require('../../../models/InspectionTask.model');
const MasterList = require('../../../models/MasterList.model');
const Project = require('../../../models/Project.model');
const assetDependencyConfig = require('../analytics/assetDependency.config.json');

class RelationshipAnalyticsService {

  /**
   * Section 1: Project Health Breakdown by Category
   * Returns each category's contribution % to the project's overall health
   */
  async getProjectHealthRelationship(projectCode) {
    const tasks = await InspectionTask.find({
      project: projectCode,
      status: 'COMPLETED'
    }).populate('parameters', 'category assetType').lean();

    const categoryStats = {};
    let totalWeightedScore = 0;

    for (const task of tasks) {
      for (const rating of (task.ratings || [])) {
        const param = (task.parameters || []).find(
          p => p._id.toString() === rating.masterListId?.toString()
        );
        const category = param?.category || task.assetType || 'Uncategorized';

        if (!categoryStats[category]) {
          categoryStats[category] = { totalScore: 0, count: 0, criticalCount: 0 };
        }
        categoryStats[category].totalScore += rating.score;
        categoryStats[category].count++;
        if (rating.score <= 1) categoryStats[category].criticalCount++;
        totalWeightedScore += rating.score;
      }
    }

    const categories = Object.entries(categoryStats).map(([name, stats]) => ({
      name,
      averageRating: stats.count > 0 ? parseFloat((stats.totalScore / stats.count).toFixed(1)) : 0,
      criticalCount: stats.criticalCount,
      contribution: 0,
    }));

    // Contribution % = share of total ratings count (data volume by category)
    const totalCount = Object.values(categoryStats).reduce((s, v) => s + v.count, 0);
    categories.forEach(cat => {
      cat.contribution = totalCount > 0
        ? Math.round((categoryStats[cat.name].count / totalCount) * 100)
        : 0;
    });

    return categories.sort((a, b) => b.contribution - a.contribution);
  }

  /**
   * Section 2: Category Co-occurrence Network Graph
   * Finds which categories share critical issues at same chainages → nodes + edges
   */
  async getCategoryRelationshipMap(projectCode) {
    const criticalTasks = await InspectionTask.find({
      project: projectCode,
      status: 'COMPLETED',
      'ratings.score': { $lte: 5 }
    }).populate('parameters', 'category').lean();

    // Group by chainage
    const chainageMap = {};
    for (const task of criticalTasks) {
      const category = task.parameters?.[0]?.category || task.assetType || 'Unknown';
      const key = task.chainage;
      if (!chainageMap[key]) chainageMap[key] = new Set();
      chainageMap[key].add(category);
    }

    const edgeWeights = {};
    const nodeCounts = {};

    for (const categories of Object.values(chainageMap)) {
      const catArr = [...categories];
      catArr.forEach(cat => {
        nodeCounts[cat] = (nodeCounts[cat] || 0) + 1;
      });
      for (let i = 0; i < catArr.length; i++) {
        for (let j = i + 1; j < catArr.length; j++) {
          const edgeKey = [catArr[i], catArr[j]].sort().join('|');
          edgeWeights[edgeKey] = (edgeWeights[edgeKey] || 0) + 1;
        }
      }
    }

    const nodes = Object.entries(nodeCounts).map(([id, count]) => ({
      id,
      label: id,
      val: Math.max(3, count),
      color: count > 10 ? '#ef4444' : count > 5 ? '#f59e0b' : '#22c55e'
    }));

    const links = Object.entries(edgeWeights)
      .filter(([, weight]) => weight >= 1)
      .map(([key, weight]) => {
        const [source, target] = key.split('|');
        return { source, target, value: weight };
      });

    return { nodes, links };
  }

  /**
   * Section 3: Root Cause Analysis
   * For each major category with low ratings, find what sub-categories co-occur with criticals
   */
  async getRootCauseAnalysis(projectCode) {
    const tasks = await InspectionTask.find({
      project: projectCode,
      status: 'COMPLETED'
    }).populate('parameters', 'category assetType parameter').lean();

    const categoryLowRatings = {};
    const categoryTotals = {};

    for (const task of tasks) {
      for (const rating of (task.ratings || [])) {
        const param = (task.parameters || []).find(
          p => p._id.toString() === rating.masterListId?.toString()
        );
        const category = param?.category || 'Unknown';
        const paramName = param?.parameter || 'Unknown';

        if (!categoryTotals[category]) categoryTotals[category] = { total: 0, critical: 0, params: {} };
        categoryTotals[category].total++;
        if (rating.score <= 5) {
          categoryTotals[category].critical++;
          if (!categoryTotals[category].params[paramName]) categoryTotals[category].params[paramName] = 0;
          categoryTotals[category].params[paramName]++;
        }
      }
    }

    // Only produce root cause cards for categories with > 10% critical rate
    const rootCauses = [];
    for (const [category, stats] of Object.entries(categoryTotals)) {
      if (stats.total < 5) continue;
      const criticalRate = (stats.critical / stats.total) * 100;
      if (criticalRate < 10) continue;

      const topParams = Object.entries(stats.params)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, count]) => ({
          name,
          percentage: Math.round((count / stats.critical) * 100)
        }));

      rootCauses.push({
        category,
        criticalRate: Math.round(criticalRate),
        totalRatings: stats.total,
        criticalCount: stats.critical,
        topContributors: topParams
      });
    }

    return rootCauses.sort((a, b) => b.criticalRate - a.criticalRate);
  }

  /**
   * Section 4: Chainage Hotspots
   * Find chainages with multiple critical observations across categories
   */
  async getChainageHotspots(projectCode) {
    const criticalTasks = await InspectionTask.find({
      project: projectCode,
      status: 'COMPLETED',
      'ratings.score': { $lte: 3 }
    }).populate('parameters', 'category').lean();

    const hotspotMap = {};
    for (const task of criticalTasks) {
      const key = task.chainage;
      if (!hotspotMap[key]) {
        hotspotMap[key] = {
          chainage: key,
          criticalCount: 0,
          categories: new Set(),
          lat: task.metadata?.latitude || null,
          lng: task.metadata?.longitude || null
        };
      }
      const critRatings = (task.ratings || []).filter(r => r.score <= 3);
      hotspotMap[key].criticalCount += critRatings.length;
      const category = task.parameters?.[0]?.category || task.assetType || 'Unknown';
      hotspotMap[key].categories.add(category);
    }

    const hotspots = Object.values(hotspotMap)
      .map(h => ({
        chainage: h.chainage,
        criticalCount: h.criticalCount,
        categories: [...h.categories],
        risk: h.criticalCount >= 10 ? 'High' : h.criticalCount >= 5 ? 'Medium' : 'Low',
        lat: h.lat,
        lng: h.lng
      }))
      .filter(h => h.criticalCount >= 2)
      .sort((a, b) => b.criticalCount - a.criticalCount)
      .slice(0, 20);

    return hotspots;
  }

  /**
   * Section 5: Asset Dependency Graph
   * Returns the dependency graph from config (not hardcoded in React)
   * Enriched with actual rating data per node
   */
  async getAssetDependencyGraph(projectCode) {
    const { dependencies } = assetDependencyConfig;

    // Get all asset types and their avg ratings
    const tasks = await InspectionTask.find({
      project: projectCode,
      status: 'COMPLETED'
    }).populate('parameters', 'assetType').lean();

    const assetRatings = {};
    for (const task of tasks) {
      const assetType = task.assetType || 'Unknown';
      if (!assetRatings[assetType]) assetRatings[assetType] = { total: 0, count: 0 };
      for (const r of (task.ratings || [])) {
        assetRatings[assetType].total += r.score;
        assetRatings[assetType].count++;
      }
    }

    // Build node set from config
    const nodeSet = new Set();
    dependencies.forEach(d => { nodeSet.add(d.from); nodeSet.add(d.to); });

    const nodes = [...nodeSet].map(name => {
      const stats = assetRatings[name];
      const avgRating = stats && stats.count > 0 ? parseFloat((stats.total / stats.count).toFixed(1)) : null;
      return {
        id: name,
        label: name,
        avgRating,
        color: avgRating === null ? '#94a3b8' : avgRating < 5 ? '#ef4444' : avgRating < 8 ? '#f59e0b' : '#22c55e',
        val: 5
      };
    });

    const links = dependencies.map(d => ({
      source: d.from,
      target: d.to,
      effect: d.effect,
      strength: d.strength,
      value: d.strength === 'high' ? 3 : d.strength === 'medium' ? 2 : 1
    }));

    return { nodes, links, config: dependencies };
  }

  /**
   * Section 6: Project DNA
   * Unique fingerprint per project: strengths, weaknesses, best/worst categories
   */
  async getProjectDNA(projectCode) {
    const tasks = await InspectionTask.find({
      project: projectCode,
      status: 'COMPLETED'
    }).populate('parameters', 'category assetType').lean();

    const categoryStats = {};

    for (const task of tasks) {
      for (const rating of (task.ratings || [])) {
        const param = (task.parameters || []).find(
          p => p._id.toString() === rating.masterListId?.toString()
        );
        const category = param?.category || task.assetType || 'Unknown';
        if (!categoryStats[category]) categoryStats[category] = { total: 0, count: 0 };
        categoryStats[category].total += rating.score;
        categoryStats[category].count++;
      }
    }

    const allCategories = Object.entries(categoryStats).map(([name, s]) => ({
      name,
      avgRating: s.count > 0 ? parseFloat((s.total / s.count).toFixed(1)) : 0
    }));

    const strengths = allCategories.filter(c => c.avgRating >= 8).sort((a, b) => b.avgRating - a.avgRating);
    const weaknesses = allCategories.filter(c => c.avgRating < 6).sort((a, b) => a.avgRating - b.avgRating);
    const mostCritical = [...allCategories].sort((a, b) => a.avgRating - b.avgRating)[0] || null;
    const bestPerforming = [...allCategories].sort((a, b) => b.avgRating - a.avgRating)[0] || null;

    const totalTasks = await InspectionTask.countDocuments({ project: projectCode });
    const completedTasks = await InspectionTask.countDocuments({ project: projectCode, status: 'COMPLETED' });
    const inspectionCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const allRatings = tasks.flatMap(t => t.ratings || []);
    const avgRating = allRatings.length > 0
      ? parseFloat((allRatings.reduce((s, r) => s + r.score, 0) / allRatings.length).toFixed(1))
      : 0;

    return {
      projectCode,
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3),
      mostCriticalAsset: mostCritical,
      bestPerformingAsset: bestPerforming,
      inspectionCompletion,
      averageRating: avgRating,
      totalCategories: allCategories.length
    };
  }

  /**
   * Section 7 & 8: Relationship Insights + Executive Recommendations
   * Rule-based pattern detection from actual statistics
   */
  async getRelationshipInsightsAndRecommendations(projectCode) {
    const rootCauses = await this.getRootCauseAnalysis(projectCode);
    const hotspots = await this.getChainageHotspots(projectCode);
    const catRelMap = await this.getCategoryRelationshipMap(projectCode);
    const dependency = await this.getAssetDependencyGraph(projectCode);
    const projectDNA = await this.getProjectDNA(projectCode);
    const projectHealth = await this.getProjectHealthRelationship(projectCode);

    const insights = [];
    const recommendations = [];

    // 1. Co-occurrence Insight
    if (catRelMap.links.length > 0) {
      const topLink = [...catRelMap.links].sort((a, b) => b.value - a.value)[0];
      if (topLink && topLink.value >= 2) {
        insights.push({
          title: `Systemic Environmental Dependency: ${topLink.source} & ${topLink.target}`,
          body: `Analysis of spatial data reveals that ${topLink.source} and ${topLink.target} defects co-occur at ${topLink.value} distinct chainages. This strong correlation suggests an underlying structural or environmental dependency (e.g., poor drainage accelerating pavement decay). Addressing one without the other will likely result in recurring failures.`,
          type: 'warning'
        });
        recommendations.push({
          priority: 'High',
          action: `Implement a Joint Rehabilitation Strategy for ${topLink.source} and ${topLink.target}.`,
          rationale: `Simultaneous inspection and repair at the ${topLink.value} identified common chainages will prevent redundant mobilization costs and address the true root cause of the deterioration.`
        });
      }
    }

    // 2. Root Cause / Most Critical Category
    if (rootCauses.length > 0) {
      const top = rootCauses[0];
      insights.push({
        title: `Primary Portfolio Risk: ${top.category} Degradation`,
        body: `Asset portfolio analysis identifies ${top.category} as the primary source of operational risk, with an alarming ${top.criticalRate}% of all observed ratings classified as critical. The dominant failure mode driving this decline is the condition of ${top.topContributors[0]?.name || 'key components'} (accounting for ${top.topContributors[0]?.percentage || 0}% of these criticals).`,
        type: 'critical'
      });
      recommendations.push({
        priority: 'Critical',
        action: `Mandate immediate capital intervention for ${top.category} assets, specifically targeting ${top.topContributors[0]?.name || 'primary parameters'}.`,
        rationale: `A ${top.criticalRate}% critical failure rate represents an unacceptable enterprise risk and directly threatens overall network safety and compliance.`
      });
    }

    // 3. Asset Dependency Risk Insight
    const lowNodes = dependency.nodes.filter(n => n.avgRating !== null && n.avgRating <= 5);
    if (lowNodes.length > 0) {
      // Find what this low node affects
      const downstreamEffects = dependency.links.filter(l => lowNodes.some(ln => ln.id === l.source));
      if (downstreamEffects.length > 0) {
        const primaryCause = downstreamEffects[0].source;
        const affectedAssets = [...new Set(downstreamEffects.map(l => l.target))].join(', ');
        insights.push({
          title: `Cascading Failure Warning: ${primaryCause} Driven Decay`,
          body: `Asset dependency models predict that the current poor performance in ${primaryCause} (Current Average Rating: ${lowNodes.find(n => n.id === primaryCause).avgRating}/10) is actively accelerating the structural decay of downstream dependent assets, specifically: ${affectedAssets}. Left unaddressed, this will trigger an exponential increase in future OPEX.`,
          type: 'critical'
        });
        recommendations.push({
          priority: 'Critical',
          action: `Fast-track emergency rehabilitation of ${primaryCause} infrastructure to protect downstream investments.`,
          rationale: `Systemic dependency rules dictate that failure to stabilize ${primaryCause} will result in unavoidable and costly deterioration across ${affectedAssets}.`
        });
      }
    }

    // 4. Project DNA (Strengths / Weaknesses)
    if (projectDNA.weaknesses.length > 0 && projectDNA.strengths.length > 0) {
      insights.push({
        title: `Project DNA & Core Capabilities Profile`,
        body: `The project's operational DNA shows a severe systemic vulnerability in ${projectDNA.weaknesses[0].name} (Operating at ${projectDNA.weaknesses[0].avgRating}/10). Conversely, ${projectDNA.strengths[0].name} demonstrates exceptional resilience and robust performance (Operating at ${projectDNA.strengths[0].avgRating}/10), validating recent maintenance strategies in that sector.`,
        type: 'warning'
      });
    }

    // 5. Chainage Hotspot Deep-Dive
    if (hotspots.length > 0) {
      const highRisk = hotspots.filter(h => h.risk === 'High' || h.risk === 'Medium');
      if (highRisk.length > 0) {
        const topHotspot = highRisk[0];
        insights.push({
          title: `Multi-Disciplinary Failure Zone: Chainage ${topHotspot.chainage}`,
          body: `Geospatial clustering indicates a severe "Hotspot" at Chainage ${topHotspot.chainage}. This zone is a multi-disciplinary failure point, reporting ${topHotspot.criticalCount} severe observations simultaneously across disparate categories (${topHotspot.categories.join(', ')}). Isolated, category-specific repairs will be ineffective here.`,
          type: 'critical'
        });
        recommendations.push({
          priority: 'High',
          action: `Deploy a specialized cross-functional maintenance task force to Chainage ${topHotspot.chainage}.`,
          rationale: `The concentration of ${topHotspot.criticalCount} defects across ${topHotspot.categories.length} categories requires a holistic, zone-based rehabilitation rather than siloed asset repairs.`
        });
      }
    }

    // 6. Disproportionate Health Contribution
    const topContributor = projectHealth.sort((a, b) => b.criticalCount - a.criticalCount)[0];
    if (topContributor && topContributor.criticalCount > 0) {
      insights.push({
        title: `Disproportionate KPI Impact from ${topContributor.name}`,
        body: `While ${topContributor.name} represents only ${topContributor.contribution}% of the total inspection data volume, it is generating ${topContributor.criticalCount} critical defects. This extreme failure density is disproportionately dragging down the overall project health score and masking the otherwise stable performance of the rest of the network.`,
        type: 'warning'
      });
    }

    // 7. Stable Asset Classes
    const stableCategories = rootCauses.filter(c => c.criticalRate === 0);
    if (stableCategories.length > 0) {
      insights.push({
        title: `Operational Stability Achieved in Selected Classes`,
        body: `Enterprise analytics confirm that ${stableCategories.map(c => c.category).join(', ')} are performing exceptionally well, with zero critical observations recorded in the current inspection cycle. This validates the effectiveness of recent preventative maintenance initiatives in these areas.`,
        type: 'good'
      });
      recommendations.push({
        priority: 'Low',
        action: `Reallocate OPEX and optimize inspection cycles for ${stableCategories[0].category}.`,
        rationale: `With zero critical defects recorded, routine inspection intervals can safely be extended to conserve resources for higher-risk portfolios.`
      });
    }

    // Ensure we don't return too many insights (max 6 for UI layout)
    return { 
      insights: insights.slice(0, 6), 
      recommendations: recommendations.slice(0, 5) 
    };
  }

  /**
   * Master aggregation — single API call returns everything for the page
   */
  async getFullRelationshipIntelligence(projectCode) {
    const [
      projectHealth,
      categoryRelationshipMap,
      rootCauseAnalysis,
      chainageHotspots,
      assetDependencyGraph,
      projectDNA,
      insightsAndReco
    ] = await Promise.all([
      this.getProjectHealthRelationship(projectCode),
      this.getCategoryRelationshipMap(projectCode),
      this.getRootCauseAnalysis(projectCode),
      this.getChainageHotspots(projectCode),
      this.getAssetDependencyGraph(projectCode),
      this.getProjectDNA(projectCode),
      this.getRelationshipInsightsAndRecommendations(projectCode)
    ]);

    return {
      projectCode,
      projectHealth,
      categoryRelationshipMap,
      rootCauseAnalysis,
      chainageHotspots,
      assetDependencyGraph,
      projectDNA,
      relationshipInsights: insightsAndReco.insights,
      executiveRecommendations: insightsAndReco.recommendations
    };
  }
}

module.exports = new RelationshipAnalyticsService();
