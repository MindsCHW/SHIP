'use strict';

class HealthEngine {
  constructor() {
    this.weights = {
      inspectionProgress: 0.25,
      ratingCompletion: 0.25,
      averageRating: 0.20,
      criticalIssues: 0.20,
      imageReviewCompletion: 0.10
    };
  }

  calculateHealthScore(metrics) {
    const {
      inspectionProgress = 0, // 0-100%
      ratingCompletion = 0, // 0-100%
      averageRating = 0, // 0-10
      criticalIssuesCount = 0,
      totalIssuesCount = 1,
      imageReviewCompletion = 0 // 0-100%
    } = metrics;

    // Normalize metrics to 0-100 scales
    const normAvgRating = (averageRating / 10) * 100;
    
    // Fewer critical issues is better. 0 critical issues = 100%. All critical issues = 0%.
    const criticalRatio = totalIssuesCount > 0 ? (criticalIssuesCount / totalIssuesCount) : 0;
    const normCritical = Math.max(0, 100 - (criticalRatio * 100));

    const score = (
      (inspectionProgress * this.weights.inspectionProgress) +
      (ratingCompletion * this.weights.ratingCompletion) +
      (normAvgRating * this.weights.averageRating) +
      (normCritical * this.weights.criticalIssues) +
      (imageReviewCompletion * this.weights.imageReviewCompletion)
    );

    const roundedScore = Math.round(score);

    let status = 'Stable';
    if (roundedScore >= 80) status = 'Healthy';
    else if (roundedScore <= 40) status = 'At Risk';

    return {
      score: roundedScore,
      status
    };
  }
}

module.exports = new HealthEngine();
