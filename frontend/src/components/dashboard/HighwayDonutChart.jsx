import React, { useMemo } from 'react';

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  // SVG draws from start to end. 
  // To match a standard clockwise pie slice, we start at startAngle and draw to endAngle.
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  // Fix for perfect 360 degree circles: if endAngle - startAngle is exactly 360, it will draw nothing
  // However, we have a gap, so it's fine.
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y
  ].join(' ');
};

const HighwayDonutChart = ({
  data = [],
  colors = [],
  width = 250,
  height = 250,
  innerRadius = 60,
  outerRadius = 100,
  laneDividerThickness = 3,
  dashLength = 18,
  dashGap = 18,
  edgeLineThickness = 2,
  separatorWidth = 4,
  shadowBlur = 8,
  shadowOpacity = 0.1,
}) => {
  const cx = width / 2;
  const cy = height / 2;
  const roadWidth = outerRadius - innerRadius;
  const centerRadius = innerRadius + roadWidth / 2;

  const totalValue = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

  let currentAngle = 0;
  
  const segments = data.map((item, index) => {
    const angleSpan = (item.value / totalValue) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    currentAngle = endAngle;

    return {
      ...item,
      color: colors[index % colors.length],
      startAngle,
      endAngle
    };
  });

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <filter id="road-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation={shadowBlur / 2} floodColor="#000" floodOpacity={shadowOpacity} />
          </filter>
        </defs>
        
        <g filter="url(#road-shadow)">
          {segments.map((segment, index) => {
            // Calculate angle offset to create a physical gap (separator)
            const gapAngle = (separatorWidth / (2 * Math.PI * centerRadius)) * 360;
            
            // If the segment is very small, make sure we don't invert the angles
            let sAngle = segment.startAngle + gapAngle / 2;
            let eAngle = segment.endAngle - gapAngle / 2;
            
            if (eAngle <= sAngle) {
              sAngle = segment.startAngle;
              eAngle = segment.endAngle;
            }

            return (
              <g key={`segment-${index}`}>
                {/* 1. Main Asphalt Road Surface */}
                <path
                  d={describeArc(cx, cy, centerRadius, sAngle, eAngle)}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={roadWidth}
                />

                {/* 2. Outer White Edge Line */}
                <path
                  d={describeArc(cx, cy, outerRadius, sAngle, eAngle)}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={edgeLineThickness}
                />

                {/* 3. Inner White Edge Line */}
                <path
                  d={describeArc(cx, cy, innerRadius, sAngle, eAngle)}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={edgeLineThickness}
                />

                {/* 4. Center Dashed Lane Divider */}
                <path
                  d={describeArc(cx, cy, centerRadius, sAngle, eAngle)}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={laneDividerThickness}
                  strokeDasharray={`${dashLength} ${dashGap}`}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default HighwayDonutChart;
