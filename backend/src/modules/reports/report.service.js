'use strict';

const ExcelJS = require('exceljs');
const InspectionBatch = require('../../models/InspectionBatch.model');
const InspectionTask = require('../../models/InspectionTask.model');
const Project = require('../../models/Project.model');

class ReportService {
  async getConfig() {
    const batches = await InspectionBatch.find({}).sort({ createdAt: -1 }).lean();
    
    const projectsMap = new Map();
    const projectDocs = await Project.find({}).lean();
    const projNameMap = new Map();
    projectDocs.forEach(p => projNameMap.set(p.code, p.fullName || p.name));

    for (const batch of batches) {
      const pCode = batch.project;
      if (!projectsMap.has(pCode)) {
        projectsMap.set(pCode, {
          id: pCode,
          name: projNameMap.get(pCode) || pCode,
          cycles: []
        });
      }
      
      const dateStr = new Date(batch.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      
      projectsMap.get(pCode).cycles.push({
        id: batch._id.toString(),
        label: `${dateStr} - ${batch.name}`
      });
    }

    return {
      projects: Array.from(projectsMap.values())
    };
  }

  async getTasksForReport(project, cycleId) {
    const query = { project, status: 'COMPLETED' };
    if (cycleId && cycleId !== 'all') {
      query.batchId = cycleId;
    }
    return await InspectionTask.find(query).populate('parameters').lean();
  }

  async getSummary(project, cycleId) {
    const tasks = await this.getTasksForReport(project, cycleId);
    
    let totalRatings = 0;
    const chainages = new Set();
    const parametersRated = new Set();
    let criticalRatings = 0;
    let sumScore = 0;

    let minDate = new Date();
    let maxDate = new Date(0);

    for (const t of tasks) {
      if (t.ratings && t.ratings.length > 0) {
        chainages.add(t.chainage);
        for (const r of t.ratings) {
          totalRatings++;
          parametersRated.add(r.parameterName || r.parameterKey || 'Unknown');
          const score = Number(r.score) || 0;
          if (score === 1) criticalRatings++;
          sumScore += score;
        }
      }
      if (t.createdAt) {
        const d = new Date(t.createdAt);
        if (d < minDate) minDate = d;
        if (d > maxDate) maxDate = d;
      }
    }

    let dateRange = '-';
    if (totalRatings > 0) {
      const start = minDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const end = maxDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      dateRange = start === end ? start : `${start} to ${end}`;
    }

    return {
      projectName: project, // We could map to full name
      totalRatings,
      uniqueChainages: chainages.size,
      parametersRated: parametersRated.size,
      criticalRatings,
      averageRating: totalRatings > 0 ? (sumScore / totalRatings).toFixed(1) : 0,
      inspectionDateRange: dateRange
    };
  }

  async generateExcelReport(project, cycleId) {
    const tasks = await this.getTasksForReport(project, cycleId);
    const summary = await this.getSummary(project, cycleId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HiRATE Reports Module';
    workbook.created = new Date();

    // Reusable styles
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    const headerFont = { color: { argb: 'FFFFFFFF' }, bold: true };
    const borderAll = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // --- Helper function for flat rating data ---
    const allRatings = [];
    tasks.forEach(t => {
      if (t.ratings && t.ratings.length > 0) {
        t.ratings.forEach(r => {
          const isRoadway = t.category === 'Roadway' || t.assetType === 'Roadway';
          const actualAssetType = (isRoadway && r.group) ? r.group : (t.assetType || 'Unknown');
          const actualCategory = t.category || (isRoadway ? 'Roadway' : actualAssetType);

          allRatings.push({
            project: t.project,
            category: actualCategory,
            assetType: actualAssetType,
            chainage: t.chainage,
            direction: t.direction || '-',
            parameter: r.parameterName || r.parameterKey || 'Unknown',
            score: Number(r.score) || 0,
            remark: r.remark || '',
            ratedAt: t.updatedAt || t.createdAt,
            imageUrl: t.image?.cloudinaryUrl || ''
          });
        });
      }
    });

    this.createExecutiveSummarySheet(workbook, summary, allRatings, headerFill, headerFont, borderAll);
    this.createParameterAnalysisSheet(workbook, allRatings, headerFill, headerFont, borderAll);
    this.createCriticalIssuesSheet(workbook, allRatings, headerFill, headerFont, borderAll);
    this.createChainageHotspotsSheet(workbook, allRatings, headerFill, headerFont, borderAll);
    this.createCategoryAnalysisSheet(workbook, allRatings, headerFill, headerFont, borderAll);
    this.createDirectionAnalysisSheet(workbook, allRatings, headerFill, headerFont, borderAll);
    this.createRemarkAnalysisSheet(workbook, allRatings, headerFill, headerFont, borderAll);
    this.createImageEvidenceSheet(workbook, allRatings, headerFill, headerFont, borderAll);
    this.createRawRatingsSheet(workbook, allRatings, headerFill, headerFont, borderAll);

    return await workbook.xlsx.writeBuffer();
  }

  createExecutiveSummarySheet(workbook, summary, ratings, headerFill, headerFont, borderAll) {
    const sheet = workbook.addWorksheet('Executive Summary');
    sheet.getColumn('A').width = 30;
    sheet.getColumn('B').width = 30;
    sheet.getColumn('C').width = 30;

    sheet.mergeCells('A1:C1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `INSPECTION REPORT: ${summary.projectName}`;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FF1F4E78' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    sheet.getCell('A3').value = 'Project Name'; sheet.getCell('B3').value = summary.projectName;
    sheet.getCell('A4').value = 'Date Range'; sheet.getCell('B4').value = summary.inspectionDateRange;
    sheet.getCell('A5').value = 'Total Ratings'; sheet.getCell('B5').value = summary.totalRatings;
    sheet.getCell('A6').value = 'Unique Chainages'; sheet.getCell('B6').value = summary.uniqueChainages;
    sheet.getCell('A7').value = 'Average Rating'; sheet.getCell('B7').value = summary.averageRating;
    sheet.getCell('A8').value = 'Critical Issues (1s)'; sheet.getCell('B8').value = summary.criticalRatings;

    // Bold A3:A8
    for(let i=3; i<=8; i++) {
        sheet.getCell(`A${i}`).font = { bold: true };
    }

    // Rating Distribution
    sheet.getCell('A11').value = 'Rating Distribution';
    sheet.getCell('A11').font = { bold: true, size: 12 };
    
    sheet.getCell('A12').value = 'Rating'; sheet.getCell('B12').value = 'Count'; sheet.getCell('C12').value = 'Percentage';
    ['A12','B12','C12'].forEach(c => {
      sheet.getCell(c).fill = headerFill;
      sheet.getCell(c).font = headerFont;
      sheet.getCell(c).border = borderAll;
    });

    const c1 = ratings.filter(r => r.score === 1).length;
    const c5 = ratings.filter(r => r.score === 5).length;
    const c10 = ratings.filter(r => r.score === 10).length;
    const tot = c1 + c5 + c10 || 1; // avoid / 0

    const dist = [
      { r: 1, c: c1, p: (c1/tot)*100 },
      { r: 5, c: c5, p: (c5/tot)*100 },
      { r: 10, c: c10, p: (c10/tot)*100 }
    ];

    dist.forEach((d, i) => {
      const row = sheet.getRow(13 + i);
      row.getCell(1).value = d.r;
      row.getCell(2).value = d.c;
      row.getCell(3).value = `${d.p.toFixed(1)}%`;
      [1,2,3].forEach(col => row.getCell(col).border = borderAll);
    });

    // Key Findings
    sheet.getCell('A18').value = 'Key Findings';
    sheet.getCell('A18').font = { bold: true, size: 12 };

    let findings = [];
    if (summary.totalRatings === 0) {
      findings.push("No rating data available for this selection.");
    } else {
      if ((c1/tot)*100 > 20) findings.push("Over 20% of ratings indicate critical issues requiring immediate attention.");
      
      const catMap = {};
      ratings.forEach(r => {
        if(!catMap[r.category]) catMap[r.category] = { total:0, crit:0 };
        catMap[r.category].total++;
        if(r.score===1) catMap[r.category].crit++;
      });
      let worstCat = null;
      let worstCrit = -1;
      for (const [cat, data] of Object.entries(catMap)) {
        if(data.crit > worstCrit) { worstCrit = data.crit; worstCat = cat; }
      }
      if (worstCat && worstCrit > 0) {
        findings.push(`${worstCat} has the highest number of critical ratings (${worstCrit}).`);
      } else if (worstCrit === 0) {
        findings.push("No critical issues found across any categories.");
      }
    }

    findings.forEach((f, i) => {
      sheet.getCell(`A${19+i}`).value = `• ${f}`;
    });
  }

  createParameterAnalysisSheet(workbook, ratings, headerFill, headerFont, borderAll) {
    const sheet = workbook.addWorksheet('Parameter Analysis');
    sheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Asset Type', key: 'assetType', width: 20 },
      { header: 'Parameter', key: 'parameter', width: 25 },
      { header: 'Total Ratings', key: 'total', width: 15 },
      { header: 'Avg Rating', key: 'avg', width: 15 },
      { header: 'Rating 1', key: 'c1', width: 10 },
      { header: 'Rating 5', key: 'c5', width: 10 },
      { header: 'Rating 10', key: 'c10', width: 10 },
      { header: 'Critical %', key: 'critPct', width: 15 },
      { header: 'Most Common Remark', key: 'remark', width: 30 }
    ];

    sheet.getRow(1).eachCell(cell => { cell.fill = headerFill; cell.font = headerFont; });
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = 'A1:J1';

    const paramMap = {};
    ratings.forEach(r => {
      const key = `${r.category}_${r.assetType}_${r.parameter}`;
      if (!paramMap[key]) {
        paramMap[key] = { c: r.category, a: r.assetType, p: r.parameter, tot:0, sum:0, c1:0, c5:0, c10:0, remarks:{} };
      }
      paramMap[key].tot++;
      paramMap[key].sum += r.score;
      if(r.score===1) paramMap[key].c1++;
      if(r.score===5) paramMap[key].c5++;
      if(r.score===10) paramMap[key].c10++;
      if(r.remark) {
        paramMap[key].remarks[r.remark] = (paramMap[key].remarks[r.remark] || 0) + 1;
      }
    });

    const rows = Object.values(paramMap).map(pm => {
      let topRem = '-';
      let remCount = 0;
      for(const [rem, c] of Object.entries(pm.remarks)) {
        if(c > remCount) { remCount = c; topRem = rem; }
      }
      return {
        category: pm.c, assetType: pm.a, parameter: pm.p,
        total: pm.tot, avg: (pm.sum/pm.tot).toFixed(2),
        c1: pm.c1, c5: pm.c5, c10: pm.c10,
        critPct: ((pm.c1/pm.tot)*100).toFixed(1),
        remark: topRem
      };
    });

    rows.sort((a,b) => b.critPct - a.critPct || a.avg - b.avg);
    rows.forEach(r => sheet.addRow(r));
  }

  createCriticalIssuesSheet(workbook, ratings, headerFill, headerFont, borderAll) {
    const sheet = workbook.addWorksheet('Critical Issues');
    sheet.columns = [
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Project', key: 'project', width: 15 },
      { header: 'Chainage', key: 'chainage', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Asset Type', key: 'assetType', width: 20 },
      { header: 'Direction', key: 'direction', width: 15 },
      { header: 'Parameter', key: 'parameter', width: 25 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Remark', key: 'remark', width: 30 },
      { header: 'Rated At', key: 'ratedAt', width: 25 },
      { header: 'Image', key: 'image', width: 15 }
    ];
    sheet.getRow(1).eachCell(cell => { cell.fill = headerFill; cell.font = headerFont; });
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = 'A1:K1';

    const criticals = ratings.filter(r => r.score === 1).map(r => ({
      priority: 'CRITICAL',
      project: r.project, chainage: r.chainage, category: r.category,
      assetType: r.assetType, direction: r.direction, parameter: r.parameter,
      score: r.score, remark: r.remark, 
      ratedAt: new Date(r.ratedAt).toLocaleString(), 
      image: r.imageUrl
    }));

    criticals.forEach(r => {
      const row = sheet.addRow(r);
      if (r.image) {
        row.getCell('image').value = { text: 'View Image', hyperlink: r.image, tooltip: 'Click to open image' };
        row.getCell('image').font = { color: { argb: 'FF0563C1' }, underline: true };
      }
    });
  }

  createChainageHotspotsSheet(workbook, ratings, headerFill, headerFont, borderAll) {
    const sheet = workbook.addWorksheet('Chainage Hotspots');
    sheet.columns = [
      { header: 'Chainage', key: 'chainage', width: 15 },
      { header: 'Total Issues', key: 'tot', width: 15 },
      { header: 'Critical Issues', key: 'crit', width: 15 },
      { header: 'Avg Rating', key: 'avg', width: 15 },
      { header: 'Affected Categories', key: 'cats', width: 30 },
      { header: 'Affected Parameters', key: 'params', width: 40 },
      { header: 'Priority', key: 'priority', width: 15 }
    ];
    sheet.getRow(1).eachCell(cell => { cell.fill = headerFill; cell.font = headerFont; });
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = 'A1:G1';

    const hotMap = {};
    ratings.forEach(r => {
      if(!hotMap[r.chainage]) hotMap[r.chainage] = { ch: r.chainage, tot:0, crit:0, sum:0, cats:new Set(), params:new Set() };
      const h = hotMap[r.chainage];
      if (r.score === 1 || r.score === 5) h.tot++;
      if (r.score === 1) h.crit++;
      h.sum += r.score; // wait, average of all or issues? Average of all ratings at this chainage
      h.cats.add(r.category);
      if (r.score === 1 || r.score === 5) h.params.add(r.parameter);
    });

    const rows = Object.values(hotMap).map(h => {
      let p = 'LOW';
      if(h.crit > 2) p = 'CRITICAL';
      else if(h.crit > 0 || h.tot > 3) p = 'HIGH';
      else if(h.tot > 1) p = 'MEDIUM';
      
      return {
        chainage: h.ch,
        tot: h.tot,
        crit: h.crit,
        avg: h.tot > 0 ? (h.sum/ratings.filter(x=>x.chainage===h.ch).length).toFixed(2) : 10,
        cats: Array.from(h.cats).join(', '),
        params: Array.from(h.params).join(', '),
        priority: p
      };
    }).filter(h => h.tot > 0);

    rows.sort((a,b) => b.crit - a.crit || b.tot - a.tot);
    rows.forEach(r => sheet.addRow(r));
  }

  createCategoryAnalysisSheet(workbook, ratings, headerFill, headerFont, borderAll) {
    const sheet = workbook.addWorksheet('Category Analysis');
    sheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Total Ratings', key: 'tot', width: 15 },
      { header: 'Average Score', key: 'avg', width: 15 },
      { header: 'Critical', key: 'c1', width: 10 },
      { header: 'High', key: 'c5', width: 10 },
      { header: 'Good', key: 'c10', width: 10 },
      { header: 'Critical %', key: 'critPct', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];
    sheet.getRow(1).eachCell(cell => { cell.fill = headerFill; cell.font = headerFont; });
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = 'A1:H1';

    const catMap = {};
    ratings.forEach(r => {
      const catKey = r.category === 'Roadway' ? `Roadway → ${r.assetType}` : r.category;
      if(!catMap[catKey]) catMap[catKey] = { c:catKey, tot:0, sum:0, c1:0, c5:0, c10:0 };
      const cm = catMap[catKey];
      cm.tot++; cm.sum+=r.score;
      if(r.score===1) cm.c1++;
      if(r.score===5) cm.c5++;
      if(r.score===10) cm.c10++;
    });

    Object.values(catMap).map(cm => {
      const pct = (cm.c1/cm.tot)*100;
      let stat = 'Healthy';
      if(pct > 15) stat = 'Critical';
      else if(pct > 5 || (cm.c5/cm.tot)*100 > 20) stat = 'Needs Attention';
      sheet.addRow({
        category: cm.c, tot: cm.tot, avg: (cm.sum/cm.tot).toFixed(2),
        c1: cm.c1, c5: cm.c5, c10: cm.c10, critPct: pct.toFixed(1), status: stat
      });
    });
  }

  createDirectionAnalysisSheet(workbook, ratings, headerFill, headerFont, borderAll) {
    const sheet = workbook.addWorksheet('Direction Analysis');
    sheet.columns = [
      { header: 'Direction', key: 'dir', width: 15 },
      { header: 'Total Ratings', key: 'tot', width: 15 },
      { header: 'Average Rating', key: 'avg', width: 15 },
      { header: 'Critical Issues', key: 'c1', width: 15 },
      { header: 'Critical %', key: 'critPct', width: 15 },
      { header: 'Rating 5', key: 'c5', width: 10 },
      { header: 'Rating 10', key: 'c10', width: 10 }
    ];
    sheet.getRow(1).eachCell(cell => { cell.fill = headerFill; cell.font = headerFont; });

    const dirMap = { LHS: {tot:0,sum:0,c1:0,c5:0,c10:0}, RHS: {tot:0,sum:0,c1:0,c5:0,c10:0} };
    ratings.forEach(r => {
      if(r.direction === 'LHS' || r.direction === 'RHS') {
        const d = dirMap[r.direction];
        d.tot++; d.sum+=r.score;
        if(r.score===1) d.c1++;
        if(r.score===5) d.c5++;
        if(r.score===10) d.c10++;
      }
    });

    ['LHS','RHS'].forEach(d => {
      if(dirMap[d].tot > 0) {
        const dm = dirMap[d];
        sheet.addRow({
          dir: d, tot: dm.tot, avg: (dm.sum/dm.tot).toFixed(2),
          c1: dm.c1, critPct: ((dm.c1/dm.tot)*100).toFixed(1),
          c5: dm.c5, c10: dm.c10
        });
      }
    });
  }

  createRemarkAnalysisSheet(workbook, ratings, headerFill, headerFont, borderAll) {
    const sheet = workbook.addWorksheet('Remark Analysis');
    sheet.columns = [
      { header: 'Remark', key: 'remark', width: 40 },
      { header: 'Count', key: 'count', width: 15 },
      { header: 'Average Rating', key: 'avg', width: 15 },
      { header: 'Critical Count', key: 'crit', width: 15 },
      { header: 'Affected Categories', key: 'cats', width: 40 }
    ];
    sheet.getRow(1).eachCell(cell => { cell.fill = headerFill; cell.font = headerFont; });
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = 'A1:E1';

    const rmMap = {};
    ratings.forEach(r => {
      if(!r.remark) return;
      if(!rmMap[r.remark]) rmMap[r.remark] = { count:0, sum:0, crit:0, cats:new Set() };
      const rm = rmMap[r.remark];
      rm.count++; rm.sum+=r.score;
      if(r.score===1) rm.crit++;
      rm.cats.add(r.category);
    });

    const rows = Object.entries(rmMap).map(([k,v]) => ({
      remark: k, count: v.count, avg: (v.sum/v.count).toFixed(2),
      crit: v.crit, cats: Array.from(v.cats).join(', ')
    }));
    rows.sort((a,b) => b.count - a.count);
    rows.forEach(r => sheet.addRow(r));
  }

  createImageEvidenceSheet(workbook, ratings, headerFill, headerFont, borderAll) {
    const sheet = workbook.addWorksheet('Image Evidence');
    sheet.columns = [
      { header: 'Chainage', key: 'chainage', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Asset Type', key: 'assetType', width: 20 },
      { header: 'Parameter', key: 'parameter', width: 25 },
      { header: 'Rating', key: 'score', width: 10 },
      { header: 'Remark', key: 'remark', width: 30 },
      { header: 'Direction', key: 'direction', width: 10 },
      { header: 'Rated At', key: 'ratedAt', width: 20 },
      { header: 'View Image', key: 'image', width: 15 }
    ];
    sheet.getRow(1).eachCell(cell => { cell.fill = headerFill; cell.font = headerFont; });
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = 'A1:I1';

    const evs = ratings.filter(r => r.score === 1 || r.score === 5);
    evs.sort((a,b) => a.score - b.score);
    
    evs.forEach(r => {
      const row = sheet.addRow({
        chainage: r.chainage, category: r.category, assetType: r.assetType, parameter: r.parameter,
        score: r.score, remark: r.remark, direction: r.direction, ratedAt: new Date(r.ratedAt).toLocaleString()
      });
      if(r.imageUrl) {
        row.getCell('image').value = { text: 'View Image', hyperlink: r.imageUrl };
        row.getCell('image').font = { color: { argb: 'FF0563C1' }, underline: true };
      }
    });
  }

  createRawRatingsSheet(workbook, ratings, headerFill, headerFont, borderAll) {
    const sheet = workbook.addWorksheet('Raw Ratings');
    sheet.columns = [
      { header: 'PROJECT', key: 'project', width: 15 },
      { header: 'CATEGORY', key: 'category', width: 20 },
      { header: 'ASSET TYPE', key: 'assetType', width: 20 },
      { header: 'CHAINAGE', key: 'chainage', width: 15 },
      { header: 'DIRECTION', key: 'direction', width: 10 },
      { header: 'PARAMETER', key: 'parameter', width: 25 },
      { header: 'SCORE', key: 'score', width: 10 },
      { header: 'REMARK', key: 'remark', width: 30 },
      { header: 'IMAGE URL', key: 'image', width: 40 },
      { header: 'RATED AT', key: 'ratedAt', width: 25 }
    ];
    sheet.getRow(1).eachCell(cell => { cell.fill = headerFill; cell.font = headerFont; });
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = 'A1:J1';

    ratings.forEach(r => {
      sheet.addRow({
        project: r.project, category: r.category, assetType: r.assetType, chainage: r.chainage,
        direction: r.direction, parameter: r.parameter, score: r.score, remark: r.remark,
        image: r.imageUrl, ratedAt: new Date(r.ratedAt).toLocaleString()
      });
    });
  }
}

module.exports = new ReportService();
