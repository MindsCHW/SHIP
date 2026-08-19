import React, { useState } from 'react';
import CustomDropdown from '../common/CustomDropdown';

const RoleSelectorCard = () => {
  const [role, setRole] = useState('');

  const roleOptions = [
    { label: 'HO IR', value: 'ho_ir' },
    { label: 'SPV OR', value: 'spv_or' },
    { label: 'Admin', value: 'admin' },
    { label: 'Contractor', value: 'contractor' },
    { label: 'Superuser', value: 'superuser' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'User', value: 'user' },
  ];

  return (
    <div className="bg-cardBg border border-[#5cb85c]/30 rounded-lg p-6 shadow-sm mb-6">
      <div className="relative w-[300px]">
        <CustomDropdown
          options={roleOptions}
          value={role}
          onChange={setRole}
          placeholder="Select Role"
        />
      </div>
    </div>
  );
};

export default RoleSelectorCard;
