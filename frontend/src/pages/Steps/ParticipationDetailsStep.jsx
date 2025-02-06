import React from 'react';
import { Users, Trophy, Briefcase } from 'lucide-react';

const ParticipationDetailsStep = ({ formData, setFormData }) => {
  const branches = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Chemical',
    'Other'
  ];

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="pricePool" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Prize Pool
          </div>
        </label>
        <input
          type="number"
          id="pricePool"
          value={formData.pricePool}
          onChange={(e) => setFormData({ ...formData, pricePool: e.target.value })}
          placeholder="Enter prize amount"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          min="0"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="groupLimit" className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Group Limit
            </div>
          </label>
          <input
            type="number"
            id="groupLimit"
            value={formData.groupLimit}
            onChange={(e) => setFormData({ ...formData, groupLimit: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            min="1"
            required
          />
        </div>

        <div>
          <label htmlFor="userLimit" className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users per Group
            </div>
          </label>
          <input
            type="number"
            id="userLimit"
            value={formData.userLimit}
            onChange={(e) => setFormData({ ...formData, userLimit: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            min="1"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="girlMinLimit" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Minimum Girls in Group
          </div>
        </label>
        <input
          type="number"
          id="girlMinLimit"
          value={formData.girlMinLimit}
          onChange={(e) => setFormData({ ...formData, girlMinLimit: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          min="0"
          required
        />
      </div>

      <div>
        <label htmlFor="branchs" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Eligible Branches
          </div>
        </label>
        <select
          id="branchs"
          multiple
          value={formData.branchs}
          onChange={(e) => setFormData({
            ...formData,
            branchs: Array.from(e.target.selectedOptions, option => option.value)
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        >
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple branches</p>
      </div>
    </div>
  );
};

export default ParticipationDetailsStep;