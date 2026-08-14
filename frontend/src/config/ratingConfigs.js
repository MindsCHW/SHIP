export const roadwayConfig = {
  category: 'Roadway',
  parameters: [
    { key: 'cracks', title: 'Cracks' },
    { key: 'rutting', title: 'Rutting' },
    { key: 'pothole', title: 'Pothole' },
    { key: 'edgeDrop', title: 'Edge Drop' },
    { key: 'unevenness', title: 'Unevenness' },
    { key: 'vegetationGrowth', title: 'Vegetation Growth' },
    { key: 'cleanliness', title: 'Cleanliness' },
    { key: 'kerbPainting', title: 'Kerb Painting' },
    { key: 'physicalCondition', title: 'Physical Condition' },
    { key: 'edgeLineMarking', title: 'Edge Line Marking' },
    { key: 'laneLineMarking', title: 'Lane Line Marking' },
    { key: 'shyLineMarking', title: 'Shy Line Marking' }
  ],
  pagesData: [
    {
      id: 0,
      images: [
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 0
    },
    {
      id: 1,
      overrides: { direction: 'RHS' },
      images: [
        "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 100
    },
    {
      id: 2,
      overrides: { direction: 'RHS', roadType: 'SR' },
      images: [
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 200
    }
  ]
};

export const roadSignConfig = {
  category: 'Road Signage and Furniture',
  parameters: [
    { key: 'retroReflectivity', title: 'Retro Reflectivity' },
    { key: 'damage', title: 'Damage' },
    { key: 'visibility', title: 'Visibility' }
  ],
  pagesData: [
    {
      id: 0,
      images: [
        "https://images.unsplash.com/photo-1596700779782-b7e2898dbf2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1596700779782-b7e2898dbf2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1596700779782-b7e2898dbf2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 0
    },
    {
      id: 1,
      images: [
        "https://images.unsplash.com/photo-1563223062-8e104e7978b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1563223062-8e104e7978b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1563223062-8e104e7978b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 100
    }
  ]
};

export const drainageConfig = {
  category: 'Drainage',
  parameters: [
    { key: 'blockage', title: 'Blockage' },
    { key: 'structuralDamage', title: 'Structural Damage' },
    { key: 'vegetation', title: 'Vegetation' }
  ],
  pagesData: [
    {
      id: 0,
      images: [
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 0
    },
    {
      id: 1,
      images: [
        "https://images.unsplash.com/photo-1528652037986-0937a0eb52d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1528652037986-0937a0eb52d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1528652037986-0937a0eb52d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 100
    }
  ]
};

export const crashBarrierConfig = {
  category: 'Crash Barrier',
  parameters: [
    { key: 'alignment', title: 'Alignment' },
    { key: 'damage', title: 'Damage' },
    { key: 'missingComponents', title: 'Missing Components' }
  ],
  pagesData: [
    {
      id: 0,
      images: [
        "https://images.unsplash.com/photo-1447069387366-2a6288ea1b0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1447069387366-2a6288ea1b0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1447069387366-2a6288ea1b0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 0
    },
    {
      id: 1,
      images: [
        "https://images.unsplash.com/photo-1498006245367-9c9e54d315f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1498006245367-9c9e54d315f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1498006245367-9c9e54d315f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 100
    }
  ]
};

export const cloneConfig = {
  category: 'Clone Category',
  parameters: [
    { key: 'param1', title: 'Parameter 1' },
    { key: 'param2', title: 'Parameter 2' },
    { key: 'param3', title: 'Parameter 3' }
  ],
  pagesData: [
    {
      id: 0,
      images: [
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 0
    },
    {
      id: 1,
      overrides: { direction: 'RHS' },
      images: [
        "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 100
    },
    {
      id: 2,
      overrides: { direction: 'RHS', roadType: 'SR' },
      images: [
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      chainageOffset: 200
    }
  ]
};
