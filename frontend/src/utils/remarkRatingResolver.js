export const resolveRemarkRating = (category, remark) => {
  if (!remark) return null;
  
  // Normalize string for matching (trim and remove multiple spaces)
  const normRemark = remark.trim().replace(/\s+/g, ' ').toLowerCase();

  // Flat mapping of all remarks to their ratings
  const mapping = {
    'cracks': '1',
    'rutting': '1',
    'bleeding': '1',
    'ravelling': '1',
    'faded': '5',
    'due to unevenness': '5',
    'due to vegetation': '5',
    'edge drop': '5',
    'pothole': '1',
    'patching': '5',
    'due to dust': '5',
    'no structure numbering': '1',
    'due to settlement': '1',
    'due to trees': '5',
    'due to median plantation': '5',
    'due to soil': '5',
    'damaged': '1',
    'bent': '1',
    'no reflectivity': '1',
    'not working': '1',
    'no numbering': '1',
    'improper fixing plates': '5',
    'missing': '1',
    'due to pruning': '5',
    'unhealthy': '5',
    'due to grass': '5'
  };

  if (mapping[normRemark]) {
    return mapping[normRemark];
  }
  
  return null;
};
