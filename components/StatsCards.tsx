
import React from 'react';
import { LicenseEntry, ApplicationStatus, SPECIAL_EXPIRY_CONDITION } from '../types';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface StatsCardsProps {
  entries: LicenseEntry[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ entries }) => {
  const today = new Date().toISOString().split('T')[0];

  const total = entries.length;
  const approved = entries.filter(e => e.status === ApplicationStatus.APPROVED).length;
  const expired = entries.filter(e => 
    e.expiryDate && 
    e.expiryDate !== SPECIAL_EXPIRY_CONDITION && 
    e.expiryDate < today
  ).length;
  
  const expiringSoon = entries.filter(e => {
    if (!e.expiryDate || e.expiryDate === SPECIAL_EXPIRY_CONDITION) return false;
    const exp = new Date(e.expiryDate);
    if (isNaN(exp.getTime())) return false;
    
    const now = new Date();
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
          <CheckCircle size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">總申請數</p>
          <p className="text-2xl font-bold text-gray-800">{total}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-green-50 text-green-600 rounded-full">
          <CheckCircle size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">已通過授權</p>
          <p className="text-2xl font-bold text-gray-800">{approved}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-red-50 text-red-600 rounded-full">
          <AlertCircle size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">已過期</p>
          <p className="text-2xl font-bold text-red-600">{expired}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">30天內到期</p>
          <p className="text-2xl font-bold text-yellow-600">{expiringSoon}</p>
        </div>
      </div>
    </div>
  );
};
