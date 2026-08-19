import React from 'react';

const PermissionHeader = () => {
  return (
    <thead>
      <tr className="border-b border-[#5cb85c]/30 bg-white">
        <th className="p-4 border-r border-[#5cb85c]/30 align-middle text-center font-bold text-[16px] text-gray-900 uppercase tracking-wider w-48">
          PLATFORM
        </th>
        <th colSpan={4} className="p-4 border-r border-[#5cb85c]/30 align-middle text-center font-bold text-[16px] text-gray-900 uppercase tracking-wider">
          ADMIN
        </th>
        <th colSpan={4} className="p-4 border-r border-[#5cb85c]/30 align-middle text-center font-bold text-[16px] text-gray-900 uppercase tracking-wider">
          APP
        </th>
      </tr>
      <tr className="border-b border-[#5cb85c]/30 bg-white">
        <th className="p-4 border-r border-[#5cb85c]/30 text-center font-bold text-[16px] text-gray-900 uppercase tracking-wider">
          TYPE
        </th>
        {/* ADMIN columns */}
        <th className="p-4 border-r border-[#5cb85c]/30 text-center font-bold text-[14px] text-gray-900 uppercase w-24">CREATE</th>
        <th className="p-4 border-r border-[#5cb85c]/30 text-center font-bold text-[14px] text-gray-900 uppercase w-24">UPDATE</th>
        <th className="p-4 border-r border-[#5cb85c]/30 text-center font-bold text-[14px] text-gray-900 uppercase w-24">READ</th>
        <th className="p-4 border-r border-[#5cb85c]/30 text-center font-bold text-[14px] text-gray-900 uppercase w-24">DELETE</th>
        {/* APP columns */}
        <th className="p-4 border-r border-[#5cb85c]/30 text-center font-bold text-[14px] text-gray-900 uppercase w-24">CREATE</th>
        <th className="p-4 border-r border-[#5cb85c]/30 text-center font-bold text-[14px] text-gray-900 uppercase w-24">UPDATE</th>
        <th className="p-4 border-r border-[#5cb85c]/30 text-center font-bold text-[14px] text-gray-900 uppercase w-24">READ</th>
        <th className="p-4 border-r border-[#5cb85c]/30 text-center font-bold text-[14px] text-gray-900 uppercase w-24">DELETE</th>
      </tr>
    </thead>
  );
};

export default PermissionHeader;
