
import React, { useState, useEffect } from 'react';
import { LicenseEntry, AuthMethod, RelationshipType, ContentType, ApplicationStatus } from './types';
import { LicenseTable } from './components/LicenseTable';
import { StatsCards } from './components/StatsCards';
import { EmailImporter } from './components/EmailImporter';
import { EditModal } from './components/EditModal';
import { Plus, Wand2, ShieldCheck, Search, Filter, ChevronDown, RotateCcw, Cloud, Loader2 } from 'lucide-react';

// Firebase Imports
import { db } from './firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';

const App: React.FC = () => {
  const [entries, setEntries] = useState<LicenseEntry[]>([]);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<LicenseEntry> | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Load data from Firestore
  useEffect(() => {
    setLoading(true);
    // Query: Sort by applicationDate descending
    const q = query(collection(db, "licenses"), orderBy("applicationDate", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: LicenseEntry[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id } as LicenseEntry);
      });
      setEntries(data);
      setLoading(false);

      // Optional: Seed data if empty (only runs once if empty)
      if (querySnapshot.empty && !localStorage.getItem('hasSeeded')) {
        seedInitialData();
        localStorage.setItem('hasSeeded', 'true');
      }
    }, (error) => {
      console.error("Firebase Snapshot Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const seedInitialData = async () => {
    // Seed a few examples if DB is empty
    const defaultData: Omit<LicenseEntry, 'id'>[] = [
        {
          brand: 'Whoscall',
          relationship: RelationshipType.PARTNER,
          contentType: ContentType.TRADEMARK,
          usage: '官網',
          location: '知名企業合作認證區',
          emailSubject: '【合作授權-懇請核示】Whoscall官網 91APP LOGO使用授權',
          authMethod: AuthMethod.EMAIL_CONSENT,
          status: ApplicationStatus.APPROVED,
          remarks: '已撤除',
          expiryDate: '',
          applicant: 'UPD-Reona',
          applicationDate: '2022-04-01'
        },
        {
          brand: 'AppWorks School',
          relationship: RelationshipType.PARTNER,
          contentType: ContentType.TRADEMARK,
          usage: '官網',
          location: '成功案例',
          emailSubject: '【懇請芳哥核示】91APP - AppWorks School 招募合作企業 Logo 露出授權',
          authMethod: AuthMethod.EMAIL_CONSENT,
          status: ApplicationStatus.APPROVED,
          remarks: '已撤除',
          expiryDate: '',
          applicant: 'HR-Betty',
          applicationDate: '2023-01-01'
        },
        {
          brand: '關鍵評論網',
          relationship: RelationshipType.PARTNER,
          contentType: ContentType.TRADEMARK,
          usage: '新聞稿',
          location: '新聞稿封面',
          emailSubject: '【懇請核示】TNL 合作新聞稿配圖 - 91APP LOGO 授權申請',
          authMethod: AuthMethod.EMAIL_CONSENT,
          status: ApplicationStatus.APPROVED,
          remarks: '',
          expiryDate: '',
          applicant: 'CEOO-Jill',
          applicationDate: '2024-01-01'
        },
        {
          brand: 'Google Cloud',
          relationship: RelationshipType.PARTNER,
          contentType: ContentType.TRADEMARK,
          usage: '影片',
          location: '影片封面',
          emailSubject: '【懇請核示】Google Cloud Cloudversation 專題影片 - 91APP LOGO 授權申請',
          authMethod: AuthMethod.EMAIL_CONSENT,
          status: ApplicationStatus.APPROVED,
          remarks: '',
          expiryDate: '',
          applicant: 'CEOO-Fran',
          applicationDate: '2024-04-01'
        }
    ];

    const batch = writeBatch(db);
    defaultData.forEach(item => {
      const docRef = doc(collection(db, "licenses"));
      batch.set(docRef, item);
    });
    await batch.commit();
  };

  const handleAdd = () => {
    setEditingEntry(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (entry: LicenseEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<LicenseEntry, 'id'> & { id?: string }) => {
    try {
      if (data.id) {
        // Update existing in Firestore
        const { id, ...updateData } = data;
        const entryRef = doc(db, "licenses", id);
        await updateDoc(entryRef, updateData);
      } else {
        // Create new in Firestore
        await addDoc(collection(db, "licenses"), data);
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error saving document: ", e);
      alert("儲存失敗，請檢查網路連線");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除這筆資料嗎？')) {
      try {
        await deleteDoc(doc(db, "licenses", id));
      } catch (e) {
        console.error("Error deleting document: ", e);
        alert("刪除失敗");
      }
    }
  };

  const handleCycleStatus = async (id: string, currentStatus: ApplicationStatus) => {
    const nextStatusMap: Record<ApplicationStatus, ApplicationStatus> = {
      [ApplicationStatus.PROCESSING]: ApplicationStatus.APPROVED,
      [ApplicationStatus.APPROVED]: ApplicationStatus.REJECTED,
      [ApplicationStatus.REJECTED]: ApplicationStatus.PROCESSING,
    };
    const nextStatus = nextStatusMap[currentStatus];
    
    try {
      const entryRef = doc(db, "licenses", id);
      await updateDoc(entryRef, { status: nextStatus });
    } catch (e) {
      console.error("Error updating status: ", e);
    }
  };

  const handleImport = (importedData: Partial<LicenseEntry>) => {
    setEditingEntry(importedData);
    setIsModalOpen(true); 
  };

  const resetFilters = () => {
    setFilterYear('ALL');
    setFilterStatus('ALL');
  };

  // Filter Logic
  const filteredEntries = entries.filter(e => {
    const matchesSearch = 
      e.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.emailSubject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.usage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterYear !== 'ALL') {
      if (!e.applicationDate.startsWith(filterYear)) return false;
    }

    if (filterStatus !== 'ALL') {
      if (filterStatus === 'PROCESSING') {
        if (e.status !== ApplicationStatus.PROCESSING) return false;
      }
      if (filterStatus === 'COMPLETED') {
        if (e.status === ApplicationStatus.PROCESSING) return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
               <h1 className="text-xl font-bold text-gray-900 leading-none">91APP 商標與內容授權管理系統</h1>
               <div className="flex items-center gap-1.5 mt-0.5">
                 <span className="text-xs text-gray-500">商標與影音內容申請授權狀況</span>
                 <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-medium flex items-center gap-0.5">
                   <Cloud size={10} />
                   Firebase Synced
                 </span>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative hidden lg:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="搜尋品牌、信件..." 
                 className="pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all w-64 border border-transparent focus:border-blue-200"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             
             <button 
              onClick={() => setIsImporterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium transition-colors border border-indigo-100"
            >
              <Wand2 size={18} />
              <span className="hidden sm:inline">AI 信件匯入</span>
            </button>
            
            <button 
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm shadow-blue-200"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">新增項目</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
            <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
            <p>正在載入 Firebase 資料...</p>
          </div>
        ) : (
          <>
            <StatsCards entries={entries} />
            
            <div className="mb-4 flex items-center justify-between lg:hidden">
                <input 
                     type="text" 
                     placeholder="搜尋..." 
                     className="w-full px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="mb-6 flex overflow-x-auto pb-1">
              <div className="bg-gray-100 p-1.5 rounded-xl flex items-center gap-2 shadow-inner">
                <div className="flex items-center gap-2 text-sm text-gray-500 px-2">
                  <Filter size={16} />
                  <span className="font-medium">篩選:</span>
                </div>

                <div className="relative">
                  <select 
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className={`appearance-none pl-4 pr-9 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      filterYear !== 'ALL' 
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                        : 'bg-transparent text-gray-600 hover:bg-gray-200/50'
                    }`}
                  >
                    <option value="ALL">年份 (全部)</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                  <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                     filterYear !== 'ALL' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                </div>

                <div className="w-px h-4 bg-gray-300 mx-1"></div>

                 <div className="relative">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`appearance-none pl-4 pr-9 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      filterStatus !== 'ALL' 
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                        : 'bg-transparent text-gray-600 hover:bg-gray-200/50'
                    }`}
                  >
                    <option value="ALL">進度類別 (全部)</option>
                    <option value="PROCESSING">處理中</option>
                    <option value="COMPLETED">已完成</option>
                  </select>
                  <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                     filterStatus !== 'ALL' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                </div>

                {(filterYear !== 'ALL' || filterStatus !== 'ALL') && (
                   <button 
                    onClick={resetFilters}
                    className="ml-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                  >
                    <RotateCcw size={12} />
                    總表
                  </button>
                )}
              </div>
            </div>

            <LicenseTable 
              entries={filteredEntries} 
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleStatus={handleCycleStatus}
            />
          </>
        )}
      </main>

      <EditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingEntry}
      />
      
      {isImporterOpen && (
        <EmailImporter 
          onClose={() => setIsImporterOpen(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
};

export default App;
