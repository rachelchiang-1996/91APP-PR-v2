
import React from 'react';
import { LicenseEntry, AuthMethod, ApplicationStatus, SPECIAL_EXPIRY_CONDITION } from '../types';
import { Edit2, Trash2, Mail, ExternalLink } from 'lucide-react';

interface LicenseTableProps {
  entries: LicenseEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: LicenseEntry) => void;
  onToggleStatus: (id: string, currentStatus: ApplicationStatus) => void;
}

export const LicenseTable: React.FC<LicenseTableProps> = ({ 
  entries, 
  onDelete, 
  onEdit, 
  onToggleStatus
}) => {
  const today = new Date().toISOString().split('T')[0];

  const getExpiryStatusClass = (expiryDate: string) => {
    if (!expiryDate || expiryDate === SPECIAL_EXPIRY_CONDITION) return '';
    if (expiryDate < today) return 'bg-red-50 text-red-800 border-l-4 border-red-500'; // Expired
    
    // Check if expiring within 30 days
    const exp = new Date(expiryDate);
    const now = new Date();
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0 && diffDays <= 30) return 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400'; // Warning
    return '';
  };
  
  const getStatusColor = (status: ApplicationStatus) => {
    switch(status) {
        case ApplicationStatus.APPROVED: return 'bg-green-100 text-green-700 border border-green-200';
        case ApplicationStatus.REJECTED: return 'bg-red-100 text-red-700 border border-red-200';
        default: return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const renderWithLinks = (text: string) => {
    if (!text) return '-';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    if (parts.length === 1) return text;

    return (
      <>
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a 
                key={i} 
                href={part} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-800 break-all inline-flex items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
                <ExternalLink size={10} className="inline ml-0.5 opacity-70" />
              </a>
            );
          }
          return part;
        })}
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm table-fixed min-w-[1200px]">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[3%]">NO.</th>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[6%]">進度</th>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[8%]">名稱</th>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[5%]">關係</th>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[5%]">內容</th>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[6%]">申請時間</th>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[5%]">用途</th>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[12%]">露出位置</th>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[12%]">信件主旨</th>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[10%]">備註</th>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[6%]">授權方式</th>
            <th scope="col" className="px-2 py-3 text-left font-medium text-gray-500 tracking-wider w-[12%]">到期提醒</th>
            <th scope="col" className="px-2 py-3 text-right font-medium text-gray-500 tracking-wider w-[8%]">動作</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.length === 0 ? (
            <tr>
              <td colSpan={13} className="px-6 py-12 text-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <Mail className="w-12 h-12 opacity-20" />
                  <span>尚無資料，請點擊上方按鈕新增或匯入信件</span>
                </div>
              </td>
            </tr>
          ) : (
            entries.map((entry, index) => {
              const rowClass = getExpiryStatusClass(entry.expiryDate);
              const isSpecialCondition = entry.expiryDate === SPECIAL_EXPIRY_CONDITION;
              const isExpired = !isSpecialCondition && entry.expiryDate && entry.expiryDate < today;

              return (
                <tr key={entry.id} className={`hover:bg-gray-50 transition-colors ${isExpired ? 'bg-red-50/30' : ''}`}>
                  <td className={`align-top px-2 py-3 text-xs text-gray-400 ${rowClass}`}>
                    {index + 1}
                  </td>
                  <td className="align-top px-2 py-3">
                    <button 
                        onClick={() => onToggleStatus(entry.id, entry.status)}
                        className={`w-full px-1 py-1 text-xs rounded-md flex items-center justify-center transition-all font-medium shadow-sm hover:shadow-md ${getStatusColor(entry.status)}`}
                        title="點擊切換狀態"
                      >
                         {entry.status}
                      </button>
                  </td>
                  <td className="align-top px-2 py-3 font-bold text-gray-900 break-words">
                    {entry.brand}
                  </td>
                  <td className="align-top px-2 py-3 text-gray-700">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs block w-fit">{entry.relationship}</span>
                  </td>
                  <td className="align-top px-2 py-3 text-gray-700 break-words">
                    {entry.contentType}
                  </td>
                  <td className="align-top px-2 py-3 text-gray-700 text-xs">
                    {entry.applicationDate}
                  </td>
                  <td className="align-top px-2 py-3 text-gray-700 break-words">
                    {entry.usage || '-'}
                  </td>
                  <td className="align-top px-2 py-3 text-gray-700 break-words">
                    {renderWithLinks(entry.location)}
                  </td>
                  <td className="align-top px-2 py-3 text-gray-600 text-xs break-words">
                    {entry.emailSubject}
                  </td>
                  <td className="align-top px-2 py-3 text-gray-600 text-xs break-words italic">
                    {entry.remarks || '-'}
                  </td>
                  <td className="align-top px-2 py-3">
                     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                       entry.authMethod === AuthMethod.SIGNED_AGREEMENT 
                       ? 'bg-purple-100 text-purple-800' 
                       : 'bg-teal-100 text-teal-800'
                     }`}>
                      {entry.authMethod === AuthMethod.SIGNED_AGREEMENT ? '協議書' : '信件'}
                    </span>
                  </td>
                  <td className={`align-top px-2 py-3 text-xs ${rowClass}`}>
                    <div className="font-medium flex items-center gap-1 flex-wrap">
                      {isSpecialCondition ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 leading-tight">
                          {SPECIAL_EXPIRY_CONDITION}
                        </span>
                      ) : (
                        <>
                          {entry.expiryDate || '-'}
                          {isExpired && <AlertIcon />}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="align-top px-2 py-3 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <button onClick={() => onEdit(entry)} className="text-indigo-600 hover:text-indigo-900 p-1">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDelete(entry.id)} className="text-red-600 hover:text-red-900 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

const AlertIcon = () => (
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
  </span>
);
