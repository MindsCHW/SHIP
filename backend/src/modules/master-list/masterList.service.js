const masterListRepository = require('./masterList.repository');
const MasterList = require('../../models/MasterList.model');
const xlsx = require('xlsx');

class MasterListService {
  async importMasterList(fileBuffer, projectName, importMode) {
    if (!fileBuffer) throw new Error('No file uploaded');
    if (!projectName) throw new Error('Project name is required');
    if (!['append', 'replace'].includes(importMode)) {
      throw new Error('Invalid import mode. Must be "append" or "replace"');
    }

    // 1. Parse Excel/CSV
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    // raw: false ensures strings are formatted
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows || rows.length === 0) {
      throw new Error('File is empty or could not be parsed.');
    }

    // 2. Fetch existing for deduplication (if append)
    let existingSet = new Set();
    if (importMode === 'replace') {
      await MasterList.deleteMany({ project: projectName });
    } else {
      const existingRecords = await MasterList.find({ project: projectName })
        .select('chainage parameter')
        .lean();
      
      existingRecords.forEach(r => {
        // Dedup key: Chainage_Parameter
        existingSet.add(`${r.chainage}_${r.parameter}`.toLowerCase().trim());
      });
    }

    let imported = 0;
    let duplicates = 0;
    let invalid = 0;
    const validDocsToInsert = [];
    
    // Maintain a local set to deduplicate within the file itself
    const localFileSet = new Set();

    // 3. Process rows
    for (const row of rows) {
      // Find columns case-insensitively/flexibly
      const getVal = (keyNames) => {
        const key = Object.keys(row).find(k => keyNames.some(n => k.toLowerCase().includes(n.toLowerCase())));
        return key ? String(row[key]).trim() : '';
      };

      // We allow the uploaded file to specify project, OR we override it with the selected project
      // The prompt says: "Duplicate means: Project + Chainage + Parameter"
      // Since Project is selected in the UI, we force all rows to use `projectName`.
      const category = getVal(['category']);
      const assetType = getVal(['asset']);
      const assetSubType = getVal(['sign board type', 'asset sub type', 'subtype', 'sub type']);
      const chainage = getVal(['chainage', 'location']);
      const parameter = getVal(['parameter', 'question']);
      
      // Optional fields
      const roadType = getVal(['road type', 'roadtype']) || 'N/A';
      const direction = getVal(['direction']) || 'N/A';
      const placement = getVal(['placement']) || '';

      // Validation
      if (!category || !assetType || !chainage || !parameter) {
        invalid++;
        continue; // Skip invalid row
      }

      const dedupKey = `${chainage}_${parameter}`.toLowerCase();

      // Check Duplicates
      if (existingSet.has(dedupKey) || localFileSet.has(dedupKey)) {
        duplicates++;
        continue;
      }

      // It's valid and unique
      localFileSet.add(dedupKey);
      
      // Auto-tag Day/Night image requirement based on parameter text and asset type
      let imageRequirement = 'DAY';
      const paramLower = parameter.toLowerCase();
      
      if (assetType.toLowerCase().includes('pavement markings') && paramLower.includes('night visibility')) {
        imageRequirement = 'NIGHT';
      } else if (assetType.toLowerCase().includes('signages') && paramLower.includes('retro reflectivity')) {
        imageRequirement = 'NIGHT';
      } else if (assetType.toLowerCase().includes('traffic blinkers and signals') && paramLower.includes('functional condition')) {
        imageRequirement = 'NIGHT';
      } else if (assetType.toLowerCase().includes('lightings') && paramLower.includes('functional condition')) {
        imageRequirement = 'NIGHT';
      } else if (assetType.toLowerCase().includes('delineators') && paramLower.includes('functional condition')) {
        imageRequirement = 'NIGHT';
      }

      validDocsToInsert.push({
        project: projectName,
        category,
        assetType,
        assetSubType,
        chainage,
        parameter,
        roadType,
        direction,
        placement,
        imageRequirement,
        questionId: `Q-${Date.now()}-${Math.floor(Math.random() * 100000)}-${validDocsToInsert.length}`, // Auto-generate with guaranteed uniqueness
        status: 'Active'
      });
    }

    // 4. Bulk Insert
    if (validDocsToInsert.length > 0) {
      // Chunk inserts just in case it's huge (e.g. 50k rows)
      const chunkSize = 5000;
      for (let i = 0; i < validDocsToInsert.length; i += chunkSize) {
        const chunk = validDocsToInsert.slice(i, i + chunkSize);
        await MasterList.insertMany(chunk, { ordered: false });
      }
      imported = validDocsToInsert.length;
    }

    return {
      totalRows: rows.length,
      imported,
      duplicates,
      invalid
    };
  }

  /**
   * Get all master list records based on query parameters
   */
  async getMasterList(query) {
    const filter = {};
    
    // Apply filters if provided
    if (query.project) filter.project = query.project;
    if (query.category) filter.category = query.category;
    if (query.assetType) filter.assetType = query.assetType;
    if (query.roadType) filter.roadType = query.roadType;
    if (query.direction) filter.direction = query.direction;
    if (query.placement) filter.placement = query.placement;
    if (query.status) filter.status = query.status;

    return masterListRepository.find(filter);
  }

  /**
   * Get dashboard statistics
   */
  async getStats() {
    return masterListRepository.getStats();
  }

  /**
   * Get list of unique categories
   */
  async getCategories() {
    return masterListRepository.distinct('category', { status: 'Active' });
  }

  /**
   * Get list of unique asset types (optionally filtered by category)
   */
  async getAssetTypes(category) {
    const filter = { status: 'Active' };
    if (category) filter.category = category;
    return masterListRepository.distinct('assetType', filter);
  }

  /**
   * Get list of unique road types for a project
   */
  async getRoadTypes(project) {
    const filter = { status: 'Active' };
    if (project) filter.project = project;
    return masterListRepository.distinct('roadType', filter);
  }

  /**
   * Get list of unique projects
   */
  async getProjects() {
    return masterListRepository.distinct('project', { status: 'Active' });
  }

  /**
   * Update a Master List Item
   */
  async updateMasterListItem(id, updateData) {
    const updated = await MasterList.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updated) throw new Error('Master list item not found');
    return updated;
  }

  /**
   * Helper to clean up tasks and cloudinary images when a master list item is deleted
   */
  async _cleanupTasksForDeletedParameters(itemIds) {
    const InspectionTask = require('../../models/InspectionTask.model');
    const { cloudinary } = require('../../config/cloudinary');
    
    // Find all tasks that have these master list items in their parameters
    const tasks = await InspectionTask.find({ parameters: { $in: itemIds } });
    
    for (const task of tasks) {
      // Remove deleted item IDs from task parameters
      task.parameters = task.parameters.filter(p => !itemIds.includes(p.toString()));
      
      if (task.parameters.length === 0) {
        // If task has 0 parameters left, it is orphaned. Delete image from Cloudinary
        if (task.image && task.image.cloudinaryUrl) {
          try {
            // Reconstruct public_id
            // the folder is hirate/survey-images/project/batch_id
            // the public_id is chainage_XXX
            const publicId = `hirate/survey-images/${task.project}/${task.batchId}/chainage_${task.chainage.replace(/\\./g, '_')}`;
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error(`Failed to delete cloudinary image for task ${task._id}:`, err);
          }
        }
        // Delete the task entirely
        await InspectionTask.findByIdAndDelete(task._id);
      } else {
        // Save the updated parameters
        await task.save();
      }
    }
  }

  /**
   * Delete a single Master List Item
   */
  async deleteMasterListItem(id) {
    const item = await MasterList.findById(id);
    if (!item) throw new Error('Master list item not found');
    
    await this._cleanupTasksForDeletedParameters([id]);
    await MasterList.findByIdAndDelete(id);
    
    return { success: true, message: 'Item deleted successfully' };
  }

  /**
   * Retroactively fix imageRequirement for all existing Master List records
   * by applying the same auto-tagging logic used during import.
   * This corrects records imported before the NIGHT tagging was added.
   */
  async fixImageRequirements(project) {
    const filter = project ? { project } : {};
    const records = await MasterList.find(filter).select('_id assetType parameter').lean();

    let updated = 0;
    const nightConditions = (assetType, parameter) => {
      const aLow = assetType.toLowerCase();
      const pLow = parameter.toLowerCase();
      if (aLow.includes('pavement markings') && pLow.includes('night visibility')) return true;
      if (aLow.includes('signages') && pLow.includes('retro reflectivity')) return true;
      if (aLow.includes('traffic blinkers and signals') && pLow.includes('functional condition')) return true;
      if (aLow.includes('lightings') && pLow.includes('functional condition')) return true;
      if (aLow.includes('delineators') && pLow.includes('functional condition')) return true;
      return false;
    };

    const bulkOps = [];
    for (const record of records) {
      const isNight = nightConditions(record.assetType || '', record.parameter || '');
      bulkOps.push({
        updateOne: {
          filter: { _id: record._id },
          update: { $set: { imageRequirement: isNight ? 'NIGHT' : 'DAY' } }
        }
      });
    }

    if (bulkOps.length > 0) {
      const result = await MasterList.bulkWrite(bulkOps);
      updated = result.modifiedCount;
    }

    return {
      total: records.length,
      updated,
      project: project || 'ALL'
    };
  }

  /**
   * Delete entire project Master List
   */
  async deleteProjectMasterList(projectName) {
    const { cloudinary } = require('../../config/cloudinary');
    const InspectionTask = require('../../models/InspectionTask.model');
    const InspectionBatch = require('../../models/InspectionBatch.model');
    const WorkAssignment = require('../../models/WorkAssignment.model');

    try {
      // Delete all images in the project's folder on Cloudinary
      await cloudinary.api.delete_resources_by_prefix(`hirate/survey-images/${projectName}/`);
    } catch (err) {
      console.error(`Failed to delete cloudinary resources for project ${projectName}:`, err);
    }

    // Delete all associated collections for this project
    await InspectionTask.deleteMany({ project: projectName });
    await InspectionBatch.deleteMany({ project: projectName });
    await WorkAssignment.deleteMany({ project: projectName });
    await MasterList.deleteMany({ project: projectName });
    
    return { success: true, message: 'Project and all associated data deleted successfully' };
  }
}

module.exports = new MasterListService();
