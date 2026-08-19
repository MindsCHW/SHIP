export const mockComparisonData = {
  kpis: {
    overallRatingA: 89.2,
    overallRatingB: 92.4,
    overallRatingDiff: 3.2,
    criticalA: 53,
    criticalB: 41,
    criticalDiff: -12,
    perfect10A: 64,
    perfect10B: 72,
    perfect10Diff: 8,
    imagesCompared: 165,
    chainagesCompared: 43
  },
  categories: [
    { name: 'Roadway', aug: 84, sep: 91, diff: 7 },
    { name: 'Structures', aug: 81, sep: 79, diff: -2 },
    { name: 'Road Signage & Furniture', aug: 78, sep: 88, diff: 10 },
    { name: 'Landscaping', aug: 74, sep: 85, diff: 11 }
  ],
  topImprovements: [
    { name: 'Road Markings', diff: 18 },
    { name: 'Crash Barrier', diff: 15 },
    { name: 'Lighting', diff: 12 },
    { name: 'Chevron', diff: 10 },
    { name: 'Median Plantation', diff: 9 }
  ],
  topDeteriorations: [
    { name: 'Bridge Drainage', diff: -12 },
    { name: 'Expansion Joint', diff: -8 },
    { name: 'Pavement', diff: -7 },
    { name: 'Signboard', diff: -6 },
    { name: 'Shoulder', diff: -5 }
  ],
  criticalIssues: [
    {
      chainage: '145.320', category: 'Roadway', asset: 'Pavement', parameter: 'Cracks',
      prev: { rating: 5, remark: 'Patching Required', date: '04 Aug 2026', image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
      curr: { rating: 10, remark: 'Rectified', date: '05 Sep 2026', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80' },
      status: 'Improved'
    },
    {
      chainage: '147.100', category: 'Road Signage & Furniture', asset: 'Signboard', parameter: 'Reflectivity',
      prev: { rating: 10, remark: 'Good Condition', date: '04 Aug 2026', image: 'https://images.unsplash.com/photo-1563223062-8e104e7978b6?auto=format&fit=crop&w=800&q=80' },
      curr: { rating: 5, remark: 'Faded, needs replacement', date: '05 Sep 2026', image: 'https://images.unsplash.com/photo-1534073133331-c4c6226683cb?auto=format&fit=crop&w=800&q=80' },
      status: 'Deteriorated'
    },
    {
      chainage: '148.500', category: 'Structures', asset: 'Bridge', parameter: 'Expansion Joint',
      prev: { rating: 10, remark: 'Normal wear', date: '04 Aug 2026', image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80' },
      curr: { rating: 1, remark: 'Severe gap, immediate repair', date: '05 Sep 2026', image: 'https://images.unsplash.com/photo-1518241416805-4f7f2597ffc8?auto=format&fit=crop&w=800&q=80' },
      status: 'Deteriorated'
    },
    {
      chainage: '150.200', category: 'Roadway', asset: 'Shoulder', parameter: 'Erosion',
      prev: { rating: 1, remark: 'Deep cut observed', date: '04 Aug 2026', image: 'https://images.unsplash.com/photo-1584449755490-50d4f3b432a2?auto=format&fit=crop&w=800&q=80' },
      curr: { rating: 10, remark: 'Filled and compacted', date: '05 Sep 2026', image: 'https://images.unsplash.com/photo-1528652037986-0937a0eb52d2?auto=format&fit=crop&w=800&q=80' },
      status: 'Improved'
    },
    {
      chainage: '152.050', category: 'Landscaping', asset: 'Median Plantation', parameter: 'Survival Rate',
      prev: { rating: 5, remark: 'Dry plants', date: '04 Aug 2026', image: 'https://images.unsplash.com/photo-1585244517228-4ce31da8dcba?auto=format&fit=crop&w=800&q=80' },
      curr: { rating: 10, remark: 'Replanted and watered', date: '05 Sep 2026', image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80' },
      status: 'Improved'
    },
    {
      chainage: '155.800', category: 'Road Signage & Furniture', asset: 'Crash Barrier', parameter: 'Alignment',
      prev: { rating: 1, remark: 'Damaged by accident', date: '04 Aug 2026', image: 'https://images.unsplash.com/photo-1568283893301-4be3a30b429d?auto=format&fit=crop&w=800&q=80' },
      curr: { rating: 10, remark: 'Replaced with new barrier', date: '05 Sep 2026', image: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=800&q=80' },
      status: 'Improved'
    }
  ],
  chainages: [
    { chainage: '145.320', category: 'Roadway', parameter: 'Cracks', ratingA: 5, ratingB: 10, diff: 5, status: 'Improved' },
    { chainage: '146.100', category: 'Structures', parameter: 'Drainage', ratingA: 10, ratingB: 5, diff: -5, status: 'Deteriorated' },
    { chainage: '147.100', category: 'Road Signage & Furniture', parameter: 'Reflectivity', ratingA: 10, ratingB: 5, diff: -5, status: 'Deteriorated' },
    { chainage: '148.500', category: 'Structures', parameter: 'Expansion Joint', ratingA: 10, ratingB: 1, diff: -9, status: 'Deteriorated' },
    { chainage: '149.200', category: 'Roadway', parameter: 'Pothole', ratingA: 1, ratingB: 10, diff: 9, status: 'Improved' },
    { chainage: '150.200', category: 'Roadway', parameter: 'Erosion', ratingA: 1, ratingB: 10, diff: 9, status: 'Improved' },
    { chainage: '151.300', category: 'Landscaping', parameter: 'Pruning', ratingA: 5, ratingB: 10, diff: 5, status: 'Improved' },
    { chainage: '152.050', category: 'Landscaping', parameter: 'Survival Rate', ratingA: 5, ratingB: 10, diff: 5, status: 'Improved' },
    { chainage: '153.400', category: 'Road Signage & Furniture', parameter: 'Lighting', ratingA: 5, ratingB: 10, diff: 5, status: 'Improved' },
    { chainage: '154.200', category: 'Roadway', parameter: 'Rutting', ratingA: 10, ratingB: 5, diff: -5, status: 'Deteriorated' },
    { chainage: '155.800', category: 'Road Signage & Furniture', parameter: 'Alignment', ratingA: 1, ratingB: 10, diff: 9, status: 'Improved' },
    { chainage: '156.100', category: 'Structures', parameter: 'Parapet Wall', ratingA: null, ratingB: 1, diff: -10, status: 'New Observation' },
    { chainage: '157.500', category: 'Roadway', parameter: 'Bleeding', ratingA: 5, ratingB: 10, diff: 5, status: 'Improved' },
    { chainage: '158.200', category: 'Road Signage & Furniture', parameter: 'Road Markings', ratingA: 1, ratingB: 10, diff: 9, status: 'Improved' },
    { chainage: '159.000', category: 'Roadway', parameter: 'Patching', ratingA: 5, ratingB: 5, diff: 0, status: 'No Change' }
  ],
  mapPoints: [
    { lat: 21.15, lng: 79.11, status: 'Improved', chainage: '145.320', type: 'Cracks' },
    { lat: 21.16, lng: 79.12, status: 'Deteriorated', chainage: '148.500', type: 'Expansion Joint' },
    { lat: 21.17, lng: 79.13, status: 'Improved', chainage: '152.050', type: 'Survival Rate' },
    { lat: 21.18, lng: 79.10, status: 'New Observation', chainage: '156.100', type: 'Parapet Wall' },
    { lat: 21.19, lng: 79.15, status: 'Deteriorated', chainage: '147.100', type: 'Reflectivity' }
  ],
  insights: [
    'Overall project health improved by 3.2%.',
    '12 critical observations were rectified.',
    'Roadway ratings increased significantly.',
    'Landscaping showed the highest improvement.',
    'Structures require additional inspection.',
    'Signboard reflectivity requires attention.'
  ]
};
