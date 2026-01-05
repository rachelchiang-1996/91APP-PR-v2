
export enum AuthMethod {
  SIGNED_AGREEMENT = '簽署授權協議',
  EMAIL_CONSENT = '信件書面同意',
}

export enum RelationshipType {
  CLIENT = '客戶',
  PARTNER = '合作夥伴',
  ASSOCIATION = '公協會',
  VENDOR = '廠商',
}

export enum ContentType {
  TRADEMARK = '商標',
  VIDEO_AUDIO = '影音',
}

export enum ApplicationStatus {
  PROCESSING = '處理中',
  APPROVED = '已通過',
  REJECTED = '未通過',
}

export const SPECIAL_EXPIRY_CONDITION = '每次使用前提供91APP書面審閱即同意';

export interface LicenseEntry {
  id: string;
  brand: string;           // 名稱
  relationship: string;    // 關係 (Select: 客戶/合作夥伴/公協會/廠商)
  contentType: string;     // 授權內容 (Select: 商標/影音)
  usage: string;           // 用途 (New field: 新聞稿/廣告宣傳素材/活動等)
  location: string;        // 露出位置
  emailSubject: string;    // 信件主旨
  authMethod: AuthMethod;  // 授權方式
  expiryDate: string;      // 到期提醒 (YYYY-MM-DD or special text)
  
  // Additional fields for detail/record keeping
  applicant: string;       
  applicationDate: string; 
  status: ApplicationStatus;
  remarks: string;        
}

export interface AIExtractionResponse {
  brand?: string;
  relationship?: string;
  contentType?: string;
  usage?: string;
  location?: string;
  emailSubject?: string;
  authMethod?: AuthMethod;
  expiryDate?: string;
  applicant?: string;
  applicationDate?: string;
  remarks?: string;
}
