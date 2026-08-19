'use strict';

class TrendEngine {
  analyzeTrends(historicalData, currentData) {
    // Phase 1: Basic trend based on current snapshot vs historical
    // If historical data is not fully populated, we infer from current health.
    // In Phase 2, this will diff two time periods.
    
    let increasing = 0;
    let decreasing = 0;
    let stable = 0;

    currentData.projects.forEach(project => {
      if (project.healthScore >= 80) increasing++;
      else if (project.healthScore <= 40) decreasing++;
      else stable++;
    });

    return {
      projectsIncreasing: increasing,
      projectsDecreasing: decreasing,
      projectsStable: stable
    };
  }
}

module.exports = new TrendEngine();
