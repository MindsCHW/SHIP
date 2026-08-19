import React from 'react';
import { MdLock } from 'react-icons/md';
import LegendBadge from './LegendBadge';
import PermissionTable from './PermissionTable';

const PermissionsCard = () => {
  return (
    <div className="bg-cardBg border border-[#5cb85c]/30 rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2 text-gray-900">
          <MdLock className="text-xl" />
          <h2 className="text-[20px] font-bold">Permissions</h2>
        </div>
        <div className="flex items-center gap-3">
          <LegendBadge variant="allowed">Allowed</LegendBadge>
          <LegendBadge variant="not_allowed">Not Allowed</LegendBadge>
        </div>
      </div>
      
      {/* Table section, border-t to separate from header slightly if needed, but the prompt says just clean layout. */}
      {/* Since the table itself has borders, we just insert it. */}
      <PermissionTable />
    </div>
  );
};

export default PermissionsCard;
