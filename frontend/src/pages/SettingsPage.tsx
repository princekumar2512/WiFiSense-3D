import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useBuildingStore } from '../stores/buildingStore';
import { Settings, Shield, Building, Database, Server, Key, CheckCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, activeRole, switchRole } = useAuthStore();
  const { building } = useBuildingStore();

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black tracking-wide text-white">
              System Configuration & Multi-Tenant Settings
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Keycloak OIDC Integration • PostgreSQL/PostGIS Configuration • Role Access Matrix
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tenant Configuration */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
            <Building className="w-4 h-4" />
            <span>Active Tenant & University</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 block mb-1">Assigned University</span>
              <input
                type="text"
                readOnly
                value="Apex Institute of Technology & Science"
                className="w-full bg-navy-950 border border-slate-700 rounded px-3 py-1.5 text-white"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Hostel Facility Block</span>
              <input
                type="text"
                readOnly
                value={building.name}
                className="w-full bg-navy-950 border border-slate-700 rounded px-3 py-1.5 text-cyan-300"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Multi-Tenant Isolation Mode</span>
              <input
                type="text"
                readOnly
                value="PostgreSQL Row-Level Security (RLS) Schema Isolation"
                className="w-full bg-navy-950 border border-slate-700 rounded px-3 py-1.5 text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
            <Key className="w-4 h-4" />
            <span>Keycloak Identity Provider & Security</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded bg-navy-950 border border-emerald-900/40">
              <span className="text-slate-300">Identity Provider (IdP):</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Keycloak 24 (OIDC)
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-navy-950 border border-slate-800">
              <span className="text-slate-300">Token Algorithm:</span>
              <span className="text-cyan-300">RS256 (Asymmetric JWT)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-navy-950 border border-slate-800">
              <span className="text-slate-300">DPDP Consent Version:</span>
              <span className="text-cyan-300">2026-V1 (Compliant)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
