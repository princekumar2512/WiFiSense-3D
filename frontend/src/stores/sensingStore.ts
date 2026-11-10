import { create } from 'zustand';
import { ConsentedParticipant, AnonymousOccupantEstimate, SystemHealthSummary, DetectionMode } from '../types/sensing';

interface SensingState {
  detectionMode: DetectionMode;
  systemHealth: SystemHealthSummary;
  consentedParticipants: ConsentedParticipant[];
  anonymousOccupants: AnonymousOccupantEstimate[];
  selectedParticipantId: string | null;
  averageLocalizationConfidence: number;
  rfNoiseLevelDbm: number;
  totalOccupantsCount: number;

  // Actions
  setDetectionMode: (mode: DetectionMode) => void;
  updateParticipantPosition: (id: string, x: number, y: number, z: number, floor: number) => void;
  setSelectedParticipant: (id: string | null) => void;
  tickSimulationTelemetry: () => void;
}

export const useSensingStore = create<SensingState>((set, get) => ({
  detectionMode: 'SIMULATION',
  averageLocalizationConfidence: 87.4,
  rfNoiseLevelDbm: -92.5,
  totalOccupantsCount: 42,
  selectedParticipantId: null,

  systemHealth: {
    status: 'HEALTHY',
    activeNodes: 26,
    totalNodes: 28,
    sensingMode: 'SIMULATION',
    totalParticipants: 18,
    activeConsentingSessions: 7,
    anonymousOccupancyEstimate: 35,
    averageConfidencePct: 87.4,
    lastTelemetryPing: 'Just now (<1s)',
    unresolvedAlerts: 1,
  },

  consentedParticipants: [
    {
      id: 'part-01',
      pseudonym: 'Participant #829',
      realNameMasked: 'Aravind P**** (Room 104)',
      deviceModel: 'OnePlus 11 5G (Android 14)',
      hasGrantedConsent: true,
      consentTimestamp: '2026-11-01T08:00:00Z',
      isSharingLocation: true,
      activeFloor: 1,
      estimatedPosition: { x: 17.1, y: 1.7, z: 4.8 }, // Inside Room 104
      confidenceScore: 0.91,
      accuracyMeters: 1.4,
      activity: 'WALKING',
      lastUpdated: '1s ago',
      batteryLevel: 88,
    },
    {
      id: 'part-02',
      pseudonym: 'Participant #412',
      realNameMasked: 'Rohit V**** (Room 102)',
      deviceModel: 'Pixel 8 Pro (Android 14)',
      hasGrantedConsent: true,
      consentTimestamp: '2026-11-02T10:15:00Z',
      isSharingLocation: true,
      activeFloor: 1,
      estimatedPosition: { x: 8.7, y: 1.7, z: 4.8 }, // Inside Room 102
      confidenceScore: 0.88,
      accuracyMeters: 1.6,
      activity: 'SITTING',
      lastUpdated: '2s ago',
      batteryLevel: 72,
    },
    {
      id: 'part-03',
      pseudonym: 'Participant #519',
      realNameMasked: 'Sneha M**** (Room 205)',
      deviceModel: 'iPhone 15 (iOS 18.1)',
      hasGrantedConsent: true,
      consentTimestamp: '2026-11-03T14:20:00Z',
      isSharingLocation: true,
      activeFloor: 2,
      estimatedPosition: { x: 21.3, y: 5.1, z: -4.8 },
      confidenceScore: 0.84,
      accuracyMeters: 1.9,
      activity: 'STATIONARY',
      lastUpdated: '4s ago',
      batteryLevel: 94,
    },
    {
      id: 'part-04',
      pseudonym: 'Participant #103',
      realNameMasked: 'Karan J**** (Room 301)',
      deviceModel: 'Samsung Galaxy S24',
      hasGrantedConsent: true,
      consentTimestamp: '2026-11-04T09:00:00Z',
      isSharingLocation: true,
      activeFloor: 3,
      estimatedPosition: { x: 4.5, y: 8.5, z: 4.8 },
      confidenceScore: 0.86,
      accuracyMeters: 1.7,
      activity: 'WALKING',
      lastUpdated: '1s ago',
      batteryLevel: 65,
    },
  ],

  anonymousOccupants: [
    {
      id: 'anon-01',
      floorNumber: 1,
      roomId: 'room-1-101',
      zone: 'North Wing Bay 1',
      position: { x: 4.5, y: 1.7, z: 4.8 },
      motionDetected: true,
      motionIntensity: 0.74,
      confidenceScore: 0.89,
      uncertaintyRadiusMeters: 1.5,
      dataOrigin: 'RF_PERTURBATION',
      timestamp: 'Just now',
    },
    {
      id: 'anon-02',
      floorNumber: 1,
      roomId: 'room-1-106',
      zone: 'North Wing Bay 6 (Far End)',
      position: { x: 25.5, y: 1.7, z: 4.8 },
      motionDetected: false,
      motionIntensity: 0.12,
      confidenceScore: 0.82,
      uncertaintyRadiusMeters: 2.1,
      dataOrigin: 'RSSI_SHADOWING',
      timestamp: '2s ago',
    },
    {
      id: 'anon-03',
      floorNumber: 1,
      zone: 'L-Junction Corridor Turning Point',
      position: { x: 1.5, y: 1.7, z: 1.5 },
      motionDetected: true,
      motionIntensity: 0.88,
      confidenceScore: 0.93,
      uncertaintyRadiusMeters: 1.1,
      dataOrigin: 'RF_PERTURBATION',
      timestamp: 'Just now',
    },
    {
      id: 'anon-04',
      floorNumber: 1,
      zone: 'Short Wing Corridor',
      position: { x: 0.0, y: 1.7, z: 8.5 },
      motionDetected: true,
      motionIntensity: 0.65,
      confidenceScore: 0.85,
      uncertaintyRadiusMeters: 1.7,
      dataOrigin: 'RF_PERTURBATION',
      timestamp: 'Just now',
    },
    {
      id: 'anon-05',
      floorNumber: 2,
      roomId: 'room-2-208',
      zone: 'South Wing Corridor',
      position: { x: 8.7, y: 5.1, z: -4.8 },
      motionDetected: false,
      motionIntensity: 0.08,
      confidenceScore: 0.78,
      uncertaintyRadiusMeters: 2.3,
      dataOrigin: 'RSSI_SHADOWING',
      timestamp: '5s ago',
    },
    {
      id: 'anon-06',
      floorNumber: 3,
      zone: 'Elevator Lobby Core',
      position: { x: -2.0, y: 8.5, z: -2.0 },
      motionDetected: true,
      motionIntensity: 0.92,
      confidenceScore: 0.91,
      uncertaintyRadiusMeters: 1.2,
      dataOrigin: 'RF_PERTURBATION',
      timestamp: 'Just now',
    },
  ],

  setDetectionMode: (mode) => set({ detectionMode: mode }),

  updateParticipantPosition: (id, x, y, z, floor) => {
    set((state) => ({
      consentedParticipants: state.consentedParticipants.map((p) =>
        p.id === id ? { ...p, estimatedPosition: { x, y, z }, activeFloor: floor } : p
      ),
    }));
  },

  setSelectedParticipant: (id) => set({ selectedParticipantId: id }),

  tickSimulationTelemetry: () => {
    // Dynamic micro-movement in corridor & rooms for realistic live sensing feel
    set((state) => {
      const updatedParticipants = state.consentedParticipants.map((p) => {
        // Subtle drift or walking cycle
        const deltaX = (Math.random() - 0.5) * 0.25;
        const deltaZ = (Math.random() - 0.5) * 0.25;
        return {
          ...p,
          estimatedPosition: {
            x: Math.max(1, Math.min(27, p.estimatedPosition.x + deltaX)),
            y: p.estimatedPosition.y,
            z: Math.max(-6, Math.min(18, p.estimatedPosition.z + deltaZ)),
          },
          lastUpdated: 'Just now',
        };
      });

      const updatedOccupants = state.anonymousOccupants.map((o) => ({
        ...o,
        motionIntensity: Math.min(1, Math.max(0.05, o.motionIntensity + (Math.random() - 0.5) * 0.15)),
        motionDetected: Math.random() > 0.35,
      }));

      return {
        consentedParticipants: updatedParticipants,
        anonymousOccupants: updatedOccupants,
        rfNoiseLevelDbm: -92.0 + (Math.random() - 0.5) * 3.0,
      };
    });
  },
}));

