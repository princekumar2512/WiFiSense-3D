import { Point3D } from './building';

export type DetectionMode = 'SIMULATION' | 'LIVE_DECO_TELEMETRY' | 'ESP32_CSI_LAB';

export type ActivityClass = 'STATIONARY' | 'WALKING' | 'SITTING' | 'STANDING' | 'UNKNOWN';

export interface ConsentedParticipant {
  id: string;
  pseudonym: string; // Anonymous handle for researcher view
  realNameMasked: string; // e.g. "P***** K****"
  deviceModel: string;
  hasGrantedConsent: boolean;
  consentTimestamp: string;
  isSharingLocation: boolean;
  activeFloor: number;
  estimatedPosition: Point3D;
  confidenceScore: number; // 0.0 - 1.0
  accuracyMeters: number; // e.g. ± 1.8m
  activity: ActivityClass;
  lastUpdated: string;
  batteryLevel?: number;
}

export interface AnonymousOccupantEstimate {
  id: string;
  floorNumber: number;
  roomId?: string;
  zone: string;
  position: Point3D;
  motionDetected: boolean;
  motionIntensity: number; // 0.0 - 1.0 RF perturbation index
  confidenceScore: number;
  uncertaintyRadiusMeters: number;
  dataOrigin: 'RF_PERTURBATION' | 'RSSI_SHADOWING' | 'SIMULATION';
  timestamp: string;
}

export interface NodeTelemetry {
  nodeId: string;
  timestamp: string;
  connectedClients: number;
  channelUtilizationPct: number;
  noiseFloorDbm: number;
  packetLossPct: number;
  latencyMs: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'UNREACHABLE';
}

export interface SystemHealthSummary {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  activeNodes: number;
  totalNodes: number;
  sensingMode: DetectionMode;
  totalParticipants: number;
  activeConsentingSessions: number;
  anonymousOccupancyEstimate: number;
  averageConfidencePct: number;
  lastTelemetryPing: string;
  unresolvedAlerts: number;
}

