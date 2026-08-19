import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const chartData = [
  { id: 1, name: "HO Rated", value: 6, color: "#368c3f" }, // Logo Green
  { id: 2, name: "Not Rated", value: 9, color: "#1a1a1a" }, // Logo Dark Gray/Black
  { id: 3, name: "On Going", value: 12, color: "#1b5e20" }  // Dark Green
];

const rechartsPolarToCartesian = (cx, cy, radius, angle) => {
  const radian = -(angle * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(radian),
    y: cy + radius * Math.sin(radian)
  };
};

const rechartsDescribeArc = (cx, cy, radius, startAngle, endAngle) => {
  const start = rechartsPolarToCartesian(cx, cy, radius, startAngle);
  const end = rechartsPolarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
  const sweepFlag = startAngle > endAngle ? 1 : 0;
  
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y
  ].join(' ');
};

const HighwayShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, isActive } = props;
  const centerRadius = innerRadius + (outerRadius - innerRadius) / 2;

  // Reduce the arc slightly so the lines don't poke past the Sector's ends
  // If paddingAngle is used, startAngle and endAngle are already inset.
  
  return (
    <g 
      className="outline-none focus:outline-none"
      style={{
        transform: isActive ? `scale(1.05)` : `scale(1)`,
        transformOrigin: `${cx}px ${cy}px`,
        transition: 'transform 250ms ease-out',
        outline: 'none'
      }}
    >
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={0}
      />
      <path
        d={rechartsDescribeArc(cx, cy, outerRadius - 1, startAngle, endAngle)}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2}
      />
      <path
        d={rechartsDescribeArc(cx, cy, innerRadius + 1, startAngle, endAngle)}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2}
      />
      <path
        d={rechartsDescribeArc(cx, cy, centerRadius, startAngle, endAngle)}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={3}
        strokeDasharray="18 18"
        strokeLinecap="round"
      />
    </g>
  );
};



const RoadIcon = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22L10 2"/>
    <path d="M20 22L14 2"/>
    <path d="M12 22V16"/>
    <path d="M12 12V10"/>
    <path d="M12 6V4"/>
  </svg>
);

const DashboardChart = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isEngineStarted, setIsEngineStarted] = useState(false);
  const [data, setData] = useState([]);

  React.useEffect(() => {
    import('../services/dashboard.service').then(({ dashboardService }) => {
      dashboardService.getRoadsStatus().then(res => {
        // Map backend data to chart format with colors
        const colors = {
          'COMPLETED': '#368c3f', // Green
          'ONGOING': '#1b5e20', // Dark Green
          'PENDING': '#1a1a1a'  // Dark Gray
        };
        const responseData = Array.isArray(res) ? res : (res.data || []);
        const mappedData = responseData.map(item => ({
          id: item._id,
          name: item._id,
          value: item.count,
          color: colors[item._id] || '#8884d8'
        }));
        setData(mappedData.length ? mappedData : [{ name: 'No Data', value: 1, color: '#ccc' }]);
      }).catch(console.error);
    });
  }, []);

  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);
  const activeData = activeIndex !== null ? data[activeIndex] : null;

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center outline-none focus:outline-none min-h-[220px]">
      <AnimatePresence mode="wait">
        {!isEngineStarted ? (
          <motion.div 
            key="start-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(8px)' }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => setIsEngineStarted(true)}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-black p-1 shadow-[0_0_25px_rgba(0,0,0,0.6)] flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-1.5 rounded-full border-[2px] border-[#368c3f]/40 group-hover:border-[#368c3f]/90 transition-colors duration-300"></div>
               <div className="w-[90%] h-[90%] rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center shadow-inner group-active:scale-95 transition-transform duration-150">
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 mb-1">STATUS</span>
                  <RoadIcon className="w-9 h-9 text-[#368c3f] group-hover:text-[#4ade80] group-hover:drop-shadow-[0_0_8px_rgba(54,140,63,0.8)] transition-all duration-300" />
                  <span className="text-[12px] font-bold tracking-widest text-[#368c3f] mt-1">ROAD</span>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chart"
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="relative w-full aspect-square max-w-[300px] max-h-[300px] min-h-[180px] min-w-[180px] mx-auto outline-none focus:outline-none focus-visible:outline-none" 
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            
            {/* Center Text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <AnimatePresence mode="wait">
                {activeData ? (
                  <motion.div 
                    key="active"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-4xl font-bold text-gray-800 leading-none">{activeData.value}</span>
                    <span className="text-sm font-semibold text-gray-600 mt-2">{activeData.name}</span>
                    <span className="text-xs font-bold text-gray-400 mt-1">{((activeData.value / total) * 100).toFixed(2)}%</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="total"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</span>
                    <span className="text-4xl font-bold text-gray-800 leading-none">{total}</span>
                    <span className="text-sm font-medium text-gray-500 mt-2">Projects</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recharts PieChart */}
            <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
              <PieChart className="focus:outline-none !outline-none" style={{ outline: 'none' }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="100%"
                  fill="#8884d8"
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  activeIndex={activeIndex}
                  shape={(props) => <HighwayShape {...props} isActive={false} />}
                  activeShape={(props) => <HighwayShape {...props} isActive={true} />}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      style={{ cursor: 'pointer', outline: 'none' }}
                      className="outline-none focus:outline-none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardChart;
