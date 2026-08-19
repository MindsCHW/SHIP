import React from 'react';
import { MdArrowDropDown } from 'react-icons/md';

const AssetLifecycle = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-6 text-sm text-gray-400 text-center">No asset lifecycle data found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Asset / Chainage</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Historical Ratings</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((asset, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4 whitespace-nowrap">
                <div className="font-bold text-gray-900">{asset.assetType}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">CH {asset.chainage}</div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  {asset.history.map((h, j) => (
                    <React.Fragment key={j}>
                      <div className="flex flex-col items-center">
                        <div className={`text-[10px] font-bold text-gray-400 mb-1`}>
                          {h.month.split(' ')[0].substring(0, 3)}
                        </div>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${
                          h.rating >= 8 ? 'bg-green-50 text-green-700 border-green-200' :
                          h.rating >= 5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {h.rating}
                        </div>
                      </div>
                      {j < asset.history.length - 1 && (
                        <MdArrowDropDown className="text-gray-300 -rotate-90 mt-4" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetLifecycle;
