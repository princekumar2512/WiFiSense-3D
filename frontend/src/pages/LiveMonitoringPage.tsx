import React from 'react';
import { useBuildingStore } from '../stores/buildingStore';
import { useSensingStore } from '../stores/sensingStore';
import { AnonymousOccupantEstimate, ConsentedParticipant } from '../types/sensing';
import { Activity, Radio, Wifi, Clock, AlertCircle } from 'lucide-react';

export const LiveMonitoringPage: React.FC = () => {
  const { building } = useBuildingStore();
  const { anonymousOccupants, consentedParticipants, rfNoiseLevelDbm } = useSensingStore();

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black tracking-wide text-white">
              Real-Time Signal & Occupancy Monitor
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Low-Latency Telemetry Streaming • Spatial Perturbation Ingestion • WebSocket Pipeline
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-navy-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">WSS: Connected (120ms tick)</span>
        </div>
      </div>

      {/* Grid of Real-Time Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stream 1: Device-Free Spatial RF Disturbance */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
              <Radio className="w-4 h-4" />
              <span>Device-Free RF Perturbations (Anonymous)</span>
            </div>
            <span className="text-[10px] text-slate-400">Total: {anonymousOccupants.length} Active Zones</span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {anonymousOccupants.map((occ: AnonymousOccupantEstimate) => (
              <div
                key={occ.id}
                className="p-3 rounded-xl bg-navy-950/70 border border-amber-900/40 hover:border-amber-500/60 transition-colors text-xs font-mono"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-amber-300">Floor {occ.floorNumber} // {occ.zone}</span>
                  <span className="text-[10px] text-slate-400">{occ.timestamp}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>RF Disturbance Index:</span>
                  <span className="font-bold text-white">{(occ.motionIntensity * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px] mt-1">
                  <span>Origin: {occ.dataOrigin}</span>
                  <span className="text-emerald-400">{(occ.confidenceScore * 100).toFixed(0)}% confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stream 2: Consented Participant Telemetry */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase">
              <Wifi className="w-4 h-4" />
              <span>Consented Participant Sessions</span>
            </div>
            <span className="text-[10px] text-slate-400">DPDP Act 2023 Compliant</span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {consentedParticipants.map((part: ConsentedParticipant) => (
              <div
                key={part.id}
                className="p-3 rounded-xl bg-navy-950/70 border border-cyan-900/40 hover:border-cyan-400/60 transition-colors text-xs font-mono"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-cyan-300">{part.pseudonym} ({part.realNameMasked})</span>
                  <span className="text-[10px] text-emerald-400">ACTIVE SESSION</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Estimated Location:</span>
                  <span className="text-white">Floor {part.activeFloor} • Room 104 (±{part.accuracyMeters.toFixed(1)}m)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px] mt-1">
                  <span>Activity: {part.activity}</span>
                  <span className="text-cyan-400">{(part.confidenceScore * 100).toFixed(0)}% confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
