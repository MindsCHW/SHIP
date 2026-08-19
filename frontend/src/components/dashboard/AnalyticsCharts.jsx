import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, LineChart, Line, CartesianGrid, AreaChart, Area, Treemap, RadialBarChart, 
  RadialBar, ScatterChart, Scatter, ZAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];

const ChartCard = ({ title, children, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="bg-white border border-borderColor rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
  >
    <h3 className="text-gray-700 font-bold text-sm tracking-wide mb-4 uppercase">{title}</h3>
    <div className="h-[250px] w-full">
      {children}
    </div>
  </motion.div>
);

const AnalyticsCharts = ({ selectedProject }) => {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    import('../../services/dashboard.service').then(({ dashboardService }) => {
      dashboardService.getChartsData(selectedProject || '').then(setData).catch(console.error);
    });
  }, [selectedProject]);

  if (!data) return (
    <div className="flex justify-center items-center h-64 text-gray-500">
      Loading Analytics...
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
      <ChartCard title="Rating Distribution" delay={0.1}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.donutData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {data.donutData?.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Ratings by Project" delay={0.2}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 12 }} />
            <Tooltip cursor={{fill: '#f3f4f6'}} />
            <Bar dataKey="ratings" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly Rating Trend" delay={0.3}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="val" stroke="#2563EB" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Asset Type Analysis" delay={0.4}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.stackedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {data.stackedData?.length > 0 && Object.keys(data.stackedData[0]).filter(k => k !== 'name').map((key, index) => (
              <Bar key={key} dataKey={key} stackId="a" fill={COLORS[index % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Road Health Score" delay={0.5}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20} data={data.radialData} startAngle={180} endAngle={0}>
            <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-black fill-gray-700">
              {data.radialData?.[0]?.value / 10 || 0}
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Asset Category (Treemap)" delay={0.6}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={data.treeMapData} dataKey="size" aspectRatio={4/3} stroke="#fff" fill="#3b82f6" />
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top Critical Roads" delay={0.7}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.criticalRoadsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="issues" fill="#EF4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Rating Comparison" delay={0.8}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} />
            <Radar name="State A" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.4} />
            <Radar name="State B" dataKey="B" stroke="#22C55E" fill="#22C55E" fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="State-wise Performance" delay={0.9}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="st" unit="km" />
            <YAxis type="number" dataKey="y" name="ratings" unit="pts" />
            <ZAxis type="number" dataKey="z" range={[60, 400]} name="score" unit="k" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="States" data={data.scatterData} fill="#8B5CF6" />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default AnalyticsCharts;
