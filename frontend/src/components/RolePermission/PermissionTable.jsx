import React from 'react';
import PermissionHeader from './PermissionHeader';
import PermissionRow from './PermissionRow';

const PermissionTable = () => {
  const rows = ['USER', 'ROLE', 'RATING', 'ROAD'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] border-collapse border border-[#5cb85c]/30">
        <PermissionHeader />
        <tbody>
          {rows.map((rowType) => (
            <PermissionRow key={rowType} type={rowType} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionTable;
