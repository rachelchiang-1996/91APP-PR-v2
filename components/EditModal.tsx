
import React, { useState, useEffect } from 'react';
import { LicenseEntry, AuthMethod, RelationshipType, ContentType, ApplicationStatus, SPECIAL_EXPIRY_CONDITION } from '../types';
import { X, Save, ShieldAlert, FileText, Mail } from 'lucide-react';

interface EditModalProps {
  initialData?: Partial<LicenseEntry>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<LicenseEntry, 'id'> & { id?: string }) => void;
}

const emptyEntry: Omit<LicenseEntry, 'id'> = {
  brand: '',
  relationship: RelationshipType.CLIENT,
  contentType: ContentType.TRADEMARK,
  usage: '',
  location: '',
  emailSubject: '',
  authMethod: AuthMethod.EMAIL_CONSENT,
  expiryDate: '',
  applicant: '',
  applicationDate: new Date().toISOString().split('T')[0],
  status: ApplicationStatus.PROCESSING,
  remarks: '',
};

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Omit<LicenseEntry, 'id'>>(emptyEntry);
  const [isSpecialExpiry, setIsSpecialExpiry] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const entry = { ...emptyEntry, ...initialData };
        setFormData(entry as any);
        setIsSpecialExpiry(entry.expiryDate === SPECIAL_EXPIRY_CONDITION);
      } else {
        setFormData(emptyEntry);
        setIsSpecialExpiry(false);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      expiryDate: isSpecialExpiry ? SPECIAL_EXPIRY_CONDITION : formData.expiryDate,
      id: initialData?.id
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthMethodChange = (method: AuthMethod) => {
    setFormData(prev => ({ ...prev, authMethod: method }));
  };

  const toggleSpecialExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsSpecialExpiry(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, expiryDate: SPECIAL_EXPIRY_CONDITION }));
    } else {
      setFormData(prev => ({ ...prev, expiryDate: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData?.id ? '編輯授權資料' : '新增授權資料'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名稱 (Brand) *</label>
                <input required name="brand" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">關係 *</label>
                  <select name="relationship" value={formData.relationship} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 outline-none bg-white">
                    {Object.values(RelationshipType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">授權內容 *</label>
                  <select name="contentType" value={formData.contentType} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 outline-none bg-white">
                    {Object.values(ContentType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用途 (Usage)</label>
                <input name="usage" value={formData.usage} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 outline-none" placeholder="ex: 新聞稿, 廣告" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">露出位置</label>
                <input name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 outline-none" />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">信件主旨 (Subject)</label>
                <input name="emailSubject" value={formData.emailSubject} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">授權方式 *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAuthMethodChange(AuthMethod.EMAIL_CONSENT)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                      formData.authMethod === AuthMethod.EMAIL_CONSENT
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Mail size={18} />
                    信件
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAuthMethodChange(AuthMethod.SIGNED_AGREEMENT)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                      formData.authMethod === AuthMethod.SIGNED_AGREEMENT
                        ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <FileText size={18} />
                    協議書
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">到期提醒</label>
                <div className="flex items-center gap-2 mb-1">
                  <input 
                    type="checkbox" 
                    id="special-expiry" 
                    checked={isSpecialExpiry} 
                    onChange={toggleSpecialExpiry}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="special-expiry" className="text-sm text-blue-700 font-medium cursor-pointer flex items-center gap-1">
                    <ShieldAlert size={14} />
                    審閱同意制 (每次使用前提供91APP書面審閱)
                  </label>
                </div>
                <input 
                  type="date" 
                  name="expiryDate" 
                  disabled={isSpecialExpiry}
                  value={isSpecialExpiry ? '' : formData.expiryDate} 
                  onChange={handleChange} 
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 outline-none ${isSpecialExpiry ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-red-200'}`} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">申請時間</label>
                    <input type="date" name="applicationDate" value={formData.applicationDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 outline-none bg-white">
                        {Object.values(ApplicationStatus).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">申請人</label>
                <input name="applicant" value={formData.applicant} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={1} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 outline-none" />
              </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">取消</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save size={18} />
              儲存資料
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
