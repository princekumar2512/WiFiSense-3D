export type UserRole =
  | 'SUPER_ADMIN'
  | 'UNIVERSITY_ADMIN'
  | 'HOSTEL_ADMIN'
  | 'RESEARCHER'
  | 'REGISTERED_PARTICIPANT'
  | 'GUEST';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  avatarUrl?: string;
  hasVerifiedConsent: boolean;
  phone?: string;
  assignedBuildingId?: string;
  allowedPermissions: string[];
}

export interface DPDPNoticeRecord {
  id: string;
  title: string;
  legalBasis: string; // e.g. "India DPDP Act 2023 Sec 6"
  purpose: string;
  retentionDays: number;
  dataItemsCollected: string[];
  lastUpdated: string;
}
