import { create } from 'zustand';
import { UserRole, UserProfile, DPDPNoticeRecord } from '../types/auth';

interface AuthState {
  currentUser: UserProfile;
  isAuthenticated: boolean;
  activeRole: UserRole;
  isSharingLocation: boolean;
  consentGranted: boolean;
  consentTimestamp: string | null;
  dpdpNotice: DPDPNoticeRecord;
  hasAcceptedDPDP: boolean;

  // Actions
  switchRole: (role: UserRole) => void;
  toggleLocationSharing: () => void;
  grantConsent: () => void;
  revokeConsent: () => void;
  acceptDPDPNotice: () => void;
  loginAs: (role: UserRole, email?: string) => void;
  logout: () => void;
}

const defaultProfiles: Record<UserRole, UserProfile> = {
  SUPER_ADMIN: {
    id: 'usr-super-01',
    email: 'director.research@wifisense3d.org',
    fullName: 'Dr. Vikram Malhotra',
    role: 'SUPER_ADMIN',
    organizationId: 'org-consortium',
    organizationName: 'National Wi-Fi Sensing & Spatial Analytics Consortium',
    hasVerifiedConsent: true,
    allowedPermissions: ['*'],
  },
  UNIVERSITY_ADMIN: {
    id: 'usr-univ-01',
    email: 'admin.infra@apexuniv.edu.in',
    fullName: 'Prof. Ananya Sen',
    role: 'UNIVERSITY_ADMIN',
    organizationId: 'univ-tech-01',
    organizationName: 'Apex Institute of Technology & Science',
    hasVerifiedConsent: true,
    allowedPermissions: ['manage:buildings', 'view:analytics', 'manage:hostels'],
  },
  HOSTEL_ADMIN: {
    id: 'usr-hostel-01',
    email: 'warden.blocka@apexuniv.edu.in',
    fullName: 'Ramesh K. Sharma (Hostel Warden)',
    role: 'HOSTEL_ADMIN',
    organizationId: 'univ-tech-01',
    organizationName: 'Hostel Block Alpha (Pilot)',
    hasVerifiedConsent: true,
    assignedBuildingId: 'hostel-block-alpha',
    allowedPermissions: ['manage:floors', 'manage:rooms', 'manage:nodes', 'view:occupancy'],
  },
  RESEARCHER: {
    id: 'usr-res-01',
    email: 'researcher.rf@apexuniv.edu.in',
    fullName: 'Dr. Siddharth Rao (RF Lab)',
    role: 'RESEARCHER',
    organizationId: 'univ-tech-01',
    organizationName: 'Wireless CSI & Indoor Positioning Lab',
    hasVerifiedConsent: true,
    allowedPermissions: ['read:measurements', 'train:models', 'export:anonymized_data', 'view:lab'],
  },
  REGISTERED_PARTICIPANT: {
    id: 'usr-part-01',
    email: 'aravind.patel@student.apexuniv.edu.in',
    fullName: 'Aravind Patel (Student Resident)',
    role: 'REGISTERED_PARTICIPANT',
    organizationId: 'univ-tech-01',
    organizationName: 'Hostel Block Alpha - Room 104',
    hasVerifiedConsent: true,
    phone: '+91 98765 43210',
    allowedPermissions: ['manage:own_consent', 'view:own_location', 'pause:tracking', 'delete:account'],
  },
  GUEST: {
    id: 'usr-guest-01',
    email: 'guest.visitor@wifisense3d.org',
    fullName: 'Public Academic Visitor',
    role: 'GUEST',
    organizationId: 'public',
    organizationName: 'Public Demonstration Portal',
    hasVerifiedConsent: false,
    allowedPermissions: ['read:public_summary'],
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: defaultProfiles.SUPER_ADMIN,
  isAuthenticated: true,
  activeRole: 'SUPER_ADMIN',
  isSharingLocation: true,
  consentGranted: true,
  consentTimestamp: '2026-11-01T08:00:00Z',
  hasAcceptedDPDP: true,
  dpdpNotice: {
    id: 'dpdp-notice-2026-v1',
    title: 'Consent for Experimental Indoor Localization Telemetry',
    legalBasis: 'Digital Personal Data Protection Act, 2023 (Section 6 - Consent Notice)',
    purpose: 'Academic spatial analysis and authorized student emergency beacon services inside Hostel Block Alpha.',
    retentionDays: 30,
    dataItemsCollected: [
      'Approximate room coordinate estimate (uncertainty ± 1.8m)',
      'Wi-Fi RSSI signal measurements with corridor access points',
      'Device motion category (stationary vs walking from IMU sensor)',
      'Floor elevation pressure telemetry',
    ],
    lastUpdated: '2026-11-01',
  },

  switchRole: (role) => {
    set({
      activeRole: role,
      currentUser: defaultProfiles[role],
      isSharingLocation: role === 'REGISTERED_PARTICIPANT',
    });
  },

  toggleLocationSharing: () =>
    set((state) => ({ isSharingLocation: !state.isSharingLocation })),

  grantConsent: () =>
    set({
      consentGranted: true,
      consentTimestamp: new Date().toISOString(),
      isSharingLocation: true,
    }),

  revokeConsent: () =>
    set({
      consentGranted: false,
      isSharingLocation: false,
      consentTimestamp: null,
    }),

  acceptDPDPNotice: () => set({ hasAcceptedDPDP: true }),

  loginAs: (role, email) => {
    const profile = { ...defaultProfiles[role] };
    if (email) profile.email = email;
    set({
      currentUser: profile,
      activeRole: role,
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({
      currentUser: defaultProfiles.GUEST,
      activeRole: 'GUEST',
      isAuthenticated: false,
      isSharingLocation: false,
    });
  },
}));
