export const processComparisonData = (tasksA, tasksB) => {
  const getTaskKey = (t) => `${t.project}-${t.category}-${t.assetType}-${t.parameter}-${t.chainage}-${t.direction}`;
  
  const mapA = new Map();
  tasksA.forEach(t => mapA.set(getTaskKey(t), t));

  const matched = [];
  const newObservations = [];
  
  tasksB.forEach(tB => {
    const key = getTaskKey(tB);
    const tA = mapA.get(key);
    
    if (tA) {
      const ratingA = Number(tA.rating);
      const ratingB = Number(tB.rating);
      
      let status = 'unchanged';
      let difference = 0;
      
      if (!isNaN(ratingA) && !isNaN(ratingB)) {
        difference = ratingB - ratingA;
        if (ratingB > ratingA) status = 'improved';
        else if (ratingB < ratingA) status = 'deteriorated';
      }
      
      matched.push({
        taskA: tA,
        taskB: tB,
        status,
        difference,
        chainage: tB.chainage,
        category: tB.category,
        assetType: tB.assetType,
        parameter: tB.parameter,
        direction: tB.direction,
        roadType: tB.roadType
      });
      mapA.delete(key);
    } else {
      newObservations.push(tB);
    }
  });

  const resolvedIssues = Array.from(mapA.values()); // Missing in B

  // KPI Calculations
  let improvedIssues = 0;
  let deterioratedIssues = 0;
  let unchangedIssues = 0;
  let criticalImagesCompared = 0;

  matched.forEach(m => {
    if (m.status === 'improved') improvedIssues++;
    if (m.status === 'deteriorated') deterioratedIssues++;
    if (m.status === 'unchanged') unchangedIssues++;
    
    if (
      [1, 5].includes(Number(m.taskA.rating)) || 
      [1, 5].includes(Number(m.taskB.rating))
    ) {
      criticalImagesCompared++;
    }
  });

  // Analytics Phase 3
  const calcStats = (tasks) => {
    let totalScore = 0;
    let count = 0;
    let criticalCount = 0;
    let perfect10 = 0;
    let skipped = 0;
    let completed = 0;

    tasks.forEach(t => {
      if (t.skipStatus === 'Skipped') {
        skipped++;
      } else {
        completed++;
        const r = Number(t.rating);
        if (!isNaN(r)) {
          totalScore += r;
          count++;
          if (r === 1 || r === 5) criticalCount++;
          if (r === 10) perfect10++;
        }
      }
    });

    const averageRating = count > 0 ? (totalScore / count) : 0;
    const overallRating = count > 0 ? ((totalScore / (count * 10)) * 100) : 0;

    return { overallRating, averageRating, criticalCount, perfect10, skipped, completed, count };
  };

  const statsA = calcStats(tasksA);
  const statsB = calcStats(tasksB);

  const analytics = {
    overallRatingDiff: statsB.overallRating - statsA.overallRating,
    overallRatingA: statsA.overallRating,
    overallRatingB: statsB.overallRating,
    
    criticalDiff: statsB.criticalCount - statsA.criticalCount,
    criticalA: statsA.criticalCount,
    criticalB: statsB.criticalCount,
    
    perfect10Diff: statsB.perfect10 - statsA.perfect10,
    perfect10A: statsA.perfect10,
    perfect10B: statsB.perfect10,
    
    averageRatingDiff: statsB.averageRating - statsA.averageRating,
    averageRatingA: statsA.averageRating,
    averageRatingB: statsB.averageRating,
    
    completedDiff: statsB.completed - statsA.completed,
    completedA: statsA.completed,
    completedB: statsB.completed,
    
    skippedDiff: statsB.skipped - statsA.skipped,
    skippedA: statsA.skipped,
    skippedB: statsB.skipped,
  };

  // Category & Asset Performance (Phase 4)
  const categoryStatsA = {};
  const categoryStatsB = {};
  const assetStatsA = {};
  const assetStatsB = {};

  const processCategoryAsset = (tasks, catObj, assetObj) => {
    tasks.forEach(t => {
      const r = Number(t.rating);
      if (!isNaN(r) && t.skipStatus !== 'Skipped') {
        if (!catObj[t.category]) catObj[t.category] = { total: 0, count: 0 };
        catObj[t.category].total += r;
        catObj[t.category].count++;

        if (!assetObj[t.assetType]) assetObj[t.assetType] = { total: 0, count: 0 };
        assetObj[t.assetType].total += r;
        assetObj[t.assetType].count++;
      }
    });
  };

  processCategoryAsset(tasksA, categoryStatsA, assetStatsA);
  processCategoryAsset(tasksB, categoryStatsB, assetStatsB);

  const categoryPerformance = Object.keys(categoryStatsB).map(cat => {
    const a = categoryStatsA[cat] ? (categoryStatsA[cat].total / (categoryStatsA[cat].count * 10)) * 100 : null;
    const b = (categoryStatsB[cat].total / (categoryStatsB[cat].count * 10)) * 100;
    return {
      category: cat,
      ratingA: a,
      ratingB: b,
      diff: a !== null ? b - a : 0
    };
  });

  const assetPerformance = Object.keys(assetStatsB).map(asset => {
    const a = assetStatsA[asset] ? (assetStatsA[asset].total / (assetStatsA[asset].count * 10)) * 100 : null;
    const b = (assetStatsB[asset].total / (assetStatsB[asset].count * 10)) * 100;
    return {
      assetType: asset,
      ratingA: a,
      ratingB: b,
      diff: a !== null ? b - a : 0
    };
  });

  return {
    matched,
    newObservations,
    resolvedIssues,
    kpis: {
      criticalImagesCompared,
      improvedIssues,
      deterioratedIssues,
      unchangedIssues
    },
    analytics,
    categoryPerformance,
    assetPerformance
  };
};
