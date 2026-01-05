import React, { useState } from 'react';
import { parseEmailContent } from '../services/geminiService';
import { LicenseEntry, AuthMethod, ApplicationStatus } from '../types';
import { Wand2, Loader2, X } from 'lucide-react';

interface EmailImporterProps {
  onImport: (data: Partial<LicenseEntry>) => void;
  onClose: () => void;
}

export const EmailImporter: React.FC<EmailImporterProps> = ({ onImport, onClose }) => {
  const [emailText, setEmailText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!emailText.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const extractedData = await parseEmailContent(emailText);
      onImport({
        ...extractedData,
        status: ApplicationStatus.PROCESSING,
      });
      onClose();
    } catch (err) {
      setError("無法解析信件內容，請稍後再試。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <Wand2 className="w-6 h-6" />
            <h2 className="text-xl font-bold">AI 信件智慧匯入</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            請將相關的授權申請 Email 內容（包含標題、內文）複製並貼上到下方。
            Gemini AI 將自動擷取品牌、申請人、日期與授權方式等資訊填入表格。
          </p>
          
          <textarea
            className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm bg-gray-50 font-mono"
            placeholder="Subject: Brand Authorization Request...&#10;&#10;Hi Team,&#10;We would like to request permission to use the 91APP logo..."
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
          />
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !emailText.trim()}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                正在分析...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                開始分析
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};