import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CategoryAssetComparison = ({ categories, topImprovements, topDeteriorations }) => {

  // Section 2: Category Comparison Data
  const categoryChartData = {
    labels: categories.map(c => c.name),
    datasets: [
      {
        label: 'Aug',
        data: categories.map(c => c.aug),
        backgroundColor: 'rgba(156, 163, 175, 0.7)', // gray-400
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 1,
      },
      {
        label: 'Sep',
        data: categories.map(c => c.sep),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      }
    ],
  };

  const categoryOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}%`
        }
      }
    },
    scales: {
      x: { max: 100, min: 0, title: { display: true, text: 'Rating (%)' } }
    }
  };

  const ListRow = ({ item, isImprovement }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
      <span className="font-bold text-gray-700">{item.name}</span>
      <div className={`flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-sm ${isImprovement ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {isImprovement ? <MdArrowUpward /> : <MdArrowDownward />}
        {isImprovement ? '+' : ''}{item.diff}%
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* SECTION 2 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider border-b border-gray-100 pb-3">Section 2: Category Comparison</h2>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 h-[300px]">
            <Bar data={categoryChartData} options={categoryOptions} />
          </div>
          
          <div className="w-full lg:w-64 flex flex-col gap-3 justify-center">
            {categories.map((c, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
                <span className="text-sm font-semibold text-gray-600 truncate mr-2" title={c.name}>{c.name}</span>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${c.diff > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {c.diff > 0 ? <MdArrowUpward className="w-3 h-3" /> : <MdArrowDownward className="w-3 h-3" />}
                  {c.diff > 0 ? '+' : ''}{c.diff}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider border-b border-gray-100 pb-3 text-green-700 flex items-center gap-2">
            <MdArrowUpward /> Section 4: Top Improvements
          </h2>
          <div className="space-y-3">
            {topImprovements.map((item, idx) => <ListRow key={idx} item={item} isImprovement={true} />)}
          </div>
        </div>

        {/* SECTION 5 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider border-b border-gray-100 pb-3 text-red-700 flex items-center gap-2">
            <MdArrowDownward /> Section 5: Top Deterioration
          </h2>
          <div className="space-y-3">
            {topDeteriorations.map((item, idx) => <ListRow key={idx} item={item} isImprovement={false} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryAssetComparison;
