'use strict';

class PerformanceEngine {
  analyzePerformance(usersData) {
    let totalAssignments = 0;
    let completedAssignments = 0;

    usersData.forEach(user => {
      totalAssignments += user.assignmentsTotal || 0;
      completedAssignments += user.assignmentsCompleted || 0;
    });

    const completionRate = totalAssignments > 0 
      ? Math.round((completedAssignments / totalAssignments) * 100) 
      : 0;

    return {
      overallCompletionRate: completionRate,
      topPerformers: usersData.sort((a, b) => (b.assignmentsCompleted || 0) - (a.assignmentsCompleted || 0)).slice(0, 5)
    };
  }
}

module.exports = new PerformanceEngine();
