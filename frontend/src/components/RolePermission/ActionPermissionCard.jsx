import React from 'react';
import { MdPerson } from 'react-icons/md';

const ActionPermissionCard = () => {
  const actions = [
    'ADMIN-LOGIN',
    'NOTIFICATION',
    'ADMIN-ANALYTICS',
    'SPV-AWARDS',
    'EVALUTE-AWARDS'
  ];

  return (
    <div className="bg-white border border-[#5cb85c]/30 rounded-lg shadow-sm mt-6">
      <div className="flex items-center gap-2 p-6 border-b border-[#5cb85c]/30">
        <MdPerson className="text-xl text-[#0F2942]" />
        <h2 className="text-[20px] font-bold text-[#0F2942]">Action</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-[#5cb85c]/30">
              <th className="p-4 border-r border-[#5cb85c]/30 font-bold text-[14px] text-[#0F2942] uppercase tracking-wider w-1/3">
                TYPE
              </th>
              <th className="p-4 border-r border-[#5cb85c]/30 font-bold text-[14px] text-[#0F2942] uppercase tracking-wider w-1/3 leading-tight">
                ALLOWED /<br/>NOT ALLOWED
              </th>
              <th className="p-4 font-bold text-[14px] text-[#0F2942] uppercase tracking-wider w-1/3 leading-tight">
                CHANGE<br/>PERMISSION
              </th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action, index) => (
              <tr key={action} className={`border-b border-[#5cb85c]/30 ${index === actions.length - 1 ? 'border-none' : ''}`}>
                <td className="p-4 border-r border-[#5cb85c]/30 font-medium text-[14px] text-[#0F2942] uppercase">
                  {action}
                </td>
                <td className="p-4 border-r border-[#5cb85c]/30">
                  <span className="text-[#0F2942] font-bold text-lg select-none">&mdash;</span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5cb85c] shadow-inner"></div>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActionPermissionCard;
