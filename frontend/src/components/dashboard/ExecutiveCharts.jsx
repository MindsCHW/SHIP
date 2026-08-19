import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ComposedChart, Line, Cell, PieChart, Pie, Legend
} from 'recharts';

const DivisionTable = ({ title, data, bg }) => (
  <div className="border border-gray-200 text-[9px] h-full flex flex-col">
    <div className={`font-bold text-center py-1 ${bg} text-white`}>{title}</div>
    <div className="grid grid-cols-4 bg-gray-100 font-bold p-1 border-b border-gray-200">
      <div>Asset</div>
      <div className="text-right">Total</div>
      <div className="text-right">Variance</div>
      <div className="text-right">Density</div>
    </div>
    <div className="flex-1 p-1">
      {data.map((row, i) => (
        <div key={i} className="grid grid-cols-4 py-0.5 border-b border-gray-100 last:border-0">
          <div>{row.name}</div>
          <div className="text-right">{row.total}%</div>
          <div className="text-right text-red-500">{row.var}%</div>
          <div className="text-right text-green-500 font-bold">{row.den}%</div>
        </div>
      ))}
    </div>
  </div>
);

const ExecutiveCharts = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    import('../../services/dashboard.service').then(({ dashboardService }) => {
      dashboardService.getChartsData().then(setData).catch(console.error);
    });
  }, []);

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      
      {/* ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Category Based Issues */}
        <div className="border border-gray-300 rounded shadow-sm bg-white p-2">
          <h3 className="text-green-700 font-bold text-sm mb-2 uppercase border-b pb-1">Category Based Issues</h3>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.treeMapData?.slice(0, 3)} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Bar dataKey="size" fill="#EF4444" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full text-[9px] mt-2 border-collapse border border-gray-200 text-center">
            <thead>
              <tr className="bg-blue-600 text-white font-bold">
                <th className="border border-gray-200 p-1">Category</th>
                <th className="border border-gray-200 p-1">Issue Density</th>
              </tr>
            </thead>
            <tbody>
              {data.treeMapData?.slice(0,3).map(c => (
                <tr key={c.name}><td className="border border-gray-200 p-1">{c.name}</td><td className="border border-gray-200 p-1 text-red-500">{c.size}%</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Project Issues Analysis */}
        <div className="border border-gray-300 rounded shadow-sm bg-white p-2">
          <h3 className="text-green-700 font-bold text-sm mb-2 uppercase border-b pb-1">Project Issues Analysis</h3>
          <div className="flex justify-between text-[10px] font-bold mb-2">
            <span className="text-green-600">Highest Issues: {data.criticalRoadsData?.[0]?.name}</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.criticalRoadsData} layout="vertical" margin={{top: 0, right: 10, left: 10, bottom: 0}} barGap={0} barCategoryGap="10%">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fontSize: 9}} width={40} />
                <Tooltip />
                <Bar dataKey="issues" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Condition Based Rating */}
        <div className="border border-gray-300 rounded shadow-sm bg-white p-2">
          <h3 className="text-green-700 font-bold text-sm mb-2 uppercase border-b pb-1">Condition Based Rating</h3>
          <table className="w-full text-[9px] mb-2 border-collapse border border-gray-200 text-center">
            <thead>
              <tr className="bg-gray-100 font-bold">
                <th className="border border-gray-200 p-1">Type</th>
                <th className="border border-gray-200 p-1">Avg SevR</th>
              </tr>
            </thead>
            <tbody>
              {data.radarData?.slice(0,3).map((d, i) => (
                <tr key={i}>
                  <td className="border border-gray-200 p-1">{d.subject}</td>
                  <td className="border border-gray-200 p-1">{d.A / 15}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.radarData?.slice(0,3)} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                <XAxis dataKey="subject" tick={{fontSize: 10}} />
                <YAxis domain={[0, 10]} tick={{fontSize: 10}} />
                <Bar dataKey="A" fill="#3B82F6" barSize={40} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Division Based Issues */}
        <div className="border border-gray-300 rounded shadow-sm bg-white p-2 flex flex-col">
          <h3 className="text-green-700 font-bold text-sm mb-2 uppercase border-b pb-1">Division Based Issues</h3>
          <div className="grid grid-cols-2 gap-2 flex-1">
            <DivisionTable title="ATMS" bg="bg-orange-400" data={[{name: 'VMS', total: '5.5', var: '0.1', den: '2.1'}]} />
            <DivisionTable title="RW" bg="bg-purple-600" data={[{name: 'DEL', total: '1.7', var: '0.2', den: '4.8'}]} />
            <DivisionTable title="TMS" bg="bg-black" data={[{name: 'AST', total: '8.8', var: '0.3', den: '1.2'}]} />
            <DivisionTable title="PTR" bg="bg-yellow-400" data={[{name: 'BBV', total: '25.1', var: '4.5', den: '1.2'}]} />
          </div>
        </div>

        {/* Project Rating Summary */}
        <div className="border border-gray-300 rounded shadow-sm bg-white p-2">
          <h3 className="text-green-700 font-bold text-sm mb-2 uppercase border-b pb-1">Project Rating Summary – Live</h3>
          <div className="flex gap-4">
            
            {/* Left List */}
            <div className="flex-1 border-r pr-2">
              <div className="grid grid-cols-3 bg-blue-600 text-white text-[9px] font-bold p-1 mb-1">
                <div>Project</div>
                <div className="text-center">Total Ratings</div>
              </div>
              <div className="space-y-0.5 overflow-y-auto max-h-[250px] custom-scrollbar pr-1">
                {data.barData?.map((p, i) => (
                  <div key={i} className="grid grid-cols-3 text-[10px] items-center border-b border-gray-100 pb-0.5">
                    <div className="font-bold text-gray-700">{p.name}</div>
                    <div className="w-full bg-gray-200 h-3 rounded overflow-hidden relative col-span-2">
                      <div className="bg-green-500 h-full text-[8px] text-white flex items-center px-1 font-bold" style={{width: `${Math.min(p.ratings, 100)}%`}}>
                        {p.ratings}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Summary */}
            <div className="w-[180px] flex flex-col gap-2">
              
              <div className="flex-1 mt-2">
                <div className="text-[9px] font-bold text-center mb-1 bg-blue-600 text-white py-0.5">Rating Distribution</div>
                <div className="h-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.donutData} innerRadius={25} outerRadius={40} dataKey="value" paddingAngle={2}>
                        {data.donutData?.map((entry, index) => <Cell key={`cell-${index}`} fill={['#22C55E', '#3B82F6', '#F59E0B', '#EF4444'][index % 4]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ExecutiveCharts;
