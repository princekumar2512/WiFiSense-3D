import React, { useState } from 'react';
import { useBuildingStore } from '../stores/buildingStore';
import { useSensingStore } from '../stores/sensingStore';
import { FloorDefinition, NetworkNodeDefinition } from '../types/building';
import {
  Server,
  Wifi,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Radio,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

export const NetworkInfrastructurePage: React.FC = () => {
  const { building } = useBuildingStore();
  const { detectionMode, setDetectionMode } = useSensingStore();

  const [activeAdapter, setActiveAdapter] = useState<'deco' | 'esp32' | 'mobile' | 'sim'>('deco');

  // Collect all nodes across all floors
  const allNodes = building.floors.flatMap((f: FloorDefinition) => f.nodes);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black tracking-wide text-white">
              Hardware Infrastructure & Sensing Adapters
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Hardware-Independent Abstraction Layer (HAL) • TP-Link Deco Mesh Network • ESP32 CSI Subsystem
          </p>
        </div>

        <div className="flex items-center gap-2 bg-navy-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300">28 Registered Access Points</span>
        </div>
      </div>

      {/* HAL Architecture Overview Card */}
      <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2">
          Hardware Abstraction Layer (HAL) Interfaces
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Because network routers in commercial deployment (such as TP-Link Deco mesh systems) often lack public or unrestricted CSI telemetry APIs, WiFiSense 3D enforces decoupled adapters. Each adapter standardizes raw telemetry packets into unified spatial feature tensors.
        </p>

        {/* Adapter Switcher Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div
            onClick={() => setActiveAdapter('deco')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeAdapter === 'deco'
                ? 'bg-cyan-950/80 border-cyan-400 shadow-glow-cyan'
                : 'bg-navy-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Wifi className="w-5 h-5" />
              <span className="text-xs font-bold font-mono">RouterAdapter</span>
            </div>
            <p className="text-[11px] text-slate-300">
              TP-Link Deco mesh topology, TR-064 client tables, RSSI signal drops.
            </p>
            <div className="mt-2 text-[10px] text-emerald-400 font-mono">Status: CONNECTED (Hostel)</div>
          </div>

          <div
            onClick={() => setActiveAdapter('esp32')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeAdapter === 'esp32'
                ? 'bg-cyan-950/80 border-cyan-400 shadow-glow-cyan'
                : 'bg-navy-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Cpu className="w-5 h-5" />
              <span className="text-xs font-bold font-mono">CSIAdapter</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Experimental ESP32-S3 CSI capture (64 subcarriers, amplitude & phase).
            </p>
            <div className="mt-2 text-[10px] text-purple-400 font-mono">Status: OPTIONAL LAB HARDWARE</div>
          </div>

          <div
            onClick={() => setActiveAdapter('mobile')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeAdapter === 'mobile'
                ? 'bg-cyan-950/80 border-cyan-400 shadow-glow-cyan'
                : 'bg-navy-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Radio className="w-5 h-5" />
              <span className="text-xs font-bold font-mono">MobileSensorAdapter</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Consented smartphone IMU accelerometer, gyroscope, and barometer altitude.
            </p>
            <div className="mt-2 text-[10px] text-cyan-400 font-mono">Status: PARTICIPANT ENABLED</div>
          </div>

          <div
            onClick={() => setActiveAdapter('sim')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeAdapter === 'sim'
                ? 'bg-cyan-950/80 border-cyan-400 shadow-glow-cyan'
                : 'bg-navy-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Layers className="w-5 h-5" />
              <span className="text-xs font-bold font-mono">SimulationAdapter</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Physics log-distance path loss, wall penetration models & pedestrian walks.
            </p>
            <div className="mt-2 text-[10px] text-amber-400 font-mono">Status: ACTIVE BASELINE</div>
          </div>
        </div>
      </div>

      {/* Network Node Inventory Table */}
      <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Hostel Mesh Access Points ({allNodes.length} Nodes)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">TP-Link Deco Infrastructure</span>
        </div>

        <div className="overflow-x-auto mt-4 max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 sticky top-0 bg-navy-900">
                <th className="pb-2">Node Name</th>
                <th className="pb-2">Floor</th>
                <th className="pb-2">Hardware Model</th>
                <th className="pb-2">IP Address</th>
                <th className="pb-2">MAC Address</th>
                <th className="pb-2">Band / Channel</th>
                <th className="pb-2">Tx Power</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allNodes.map((n: NetworkNodeDefinition) => (
                <tr key={n.id} className="hover:bg-navy-850/50">
                  <td className="py-2.5 font-bold text-cyan-300">{n.name}</td>
                  <td className="py-2.5 text-white">Floor {n.floorNumber}</td>
                  <td className="py-2.5 text-slate-300">{n.model}</td>
                  <td className="py-2.5 text-slate-400">{n.ipAddress || '192.168.68.X'}</td>
                  <td className="py-2.5 text-slate-400">{n.macAddress || '98:48:27:XX:XX'}</td>
                  <td className="py-2.5 text-slate-300">
                    {n.frequencyGhz} GHz (Ch {n.channel})
                  </td>
                  <td className="py-2.5 text-slate-400">{n.txPowerDbm} dBm</td>
                  <td className="py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        n.status === 'ONLINE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-rose-950 text-rose-300 border border-rose-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          n.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'
                        }`}
                      />
                      <span>{n.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
