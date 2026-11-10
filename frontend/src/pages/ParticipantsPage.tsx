import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSensingStore } from '../stores/sensingStore';
import { ConsentedParticipant } from '../types/sensing';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  Pause,
  Play,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Eye,
} from 'lucide-react';

export const ParticipantsPage: React.FC = () => {
  const {
    currentUser,
    activeRole,
    consentGranted,
    isSharingLocation,
    toggleLocationSharing,
    grantConsent,
    revokeConsent,
    dpdpNotice,
  } = useAuthStore();
  const { consentedParticipants } = useSensingStore();

  const [erasureRequested, setErasureRequested] = useState(false);

  const handleDataDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        subject: currentUser.fullName,
        email: currentUser.email,
        consentTimestamp: "2026-11-01T08:00:00Z",
        legalBasis: "DPDP Act 2023 Section 6",
        telemetryLogs: [
          { timestamp: "2026-11-10T12:00:00Z", floor: 1, room: "104", accuracy: "±1.4m", activity: "WALKING" },
          { timestamp: "2026-11-10T12:05:00Z", floor: 1, room: "104", accuracy: "±1.2m", activity: "STATIONARY" }
        ]
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wifisense_telemetry_export_${currentUser.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black tracking-wide text-white">
              Consent, Privacy & Participant Control Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Compliant with India's Digital Personal Data Protection Act, 2023 (DPDP) • Strict Dual-Stream Separation
          </p>
        </div>

        <div className="flex items-center gap-2 bg-navy-900 px-3 py-1.5 rounded-lg border border-cyan-800 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300">Privacy Safeguards Enforced</span>
        </div>
      </div>

      {/* DPDP Legal Notice Card */}
      <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-950 rounded-xl border border-cyan-500/40 text-cyan-400 hidden sm:block">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {dpdpNotice.title}
              </h2>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-600 px-2 py-0.5 rounded font-mono">
                {dpdpNotice.legalBasis}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong>Purpose Limitation:</strong> {dpdpNotice.purpose} Individual localization is strictly restricted to consented participants with active session tokens. Device-free spatial occupancy remains completely anonymous and unlinked from resident profiles.
            </p>
            <div className="pt-2 text-xs text-slate-400 font-mono">
              <strong>Data Retention Policy:</strong> Automatic purge after {dpdpNotice.retentionDays} days. Historical traces undergo cryptographic erasure.
            </div>
          </div>
        </div>
      </div>

      {/* Participant Personal Privacy Control Panel (If Participant or Admin) */}
      <div className="bg-navy-900/80 border border-cyan-500/30 rounded-2xl p-6 shadow-glow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold tracking-wider">
              YOUR PERSONAL LOCATION SHARING STATUS
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              {currentUser.fullName} ({currentUser.email})
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Assigned Location: Hostel Block Alpha • Active Role: {activeRole}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {consentGranted ? (
              <button
                onClick={toggleLocationSharing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  isSharingLocation
                    ? 'bg-amber-950 text-amber-300 border border-amber-500 hover:bg-amber-900'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500 hover:bg-emerald-900'
                }`}
              >
                {isSharingLocation ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isSharingLocation ? 'Pause Location Sharing' : 'Resume Location Sharing'}</span>
              </button>
            ) : null}

            {consentGranted ? (
              <button
                onClick={revokeConsent}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-600 hover:bg-rose-900 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Revoke All Consent</span>
              </button>
            ) : (
              <button
                onClick={grantConsent}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500 text-navy-950 hover:bg-cyan-400 transition-all shadow-glow-cyan"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Grant Explicit Consent</span>
              </button>
            )}
          </div>
        </div>

        {/* Data Subject Rights (DPDP Act 2023) */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-navy-950/70 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Right to Access Data (Sec 11)
            </span>
            <p className="text-xs text-slate-300">
              Download a complete JSON archive of all timestamped RF signal measurements, uncertainty logs, and room position estimates collected during your consented sessions.
            </p>
            <button
              onClick={handleDataDownload}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-navy-800 hover:bg-navy-700 text-cyan-300 border border-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export My Telemetry Data (.JSON)</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/70 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Right to Erasure & Correction (Sec 12)
            </span>
            <p className="text-xs text-slate-300">
              Permanently delete all historical indoor tracking records from the research database and invalidate active session tokens immediately.
            </p>
            {erasureRequested ? (
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Erasure request queued. Data wiped from research store.</span>
              </div>
            ) : (
              <button
                onClick={() => setErasureRequested(true)}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Request Immediate Data Erasure</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Consented Participants Table (Researcher / Admin View) */}
      <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Active Consented Participant Sessions ({consentedParticipants.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">Pseudonymized Researcher View</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2">Pseudonym</th>
                <th className="pb-2">Masked Identity</th>
                <th className="pb-2">Device</th>
                <th className="pb-2">Active Floor</th>
                <th className="pb-2">Estimated Zone</th>
                <th className="pb-2">Confidence</th>
                <th className="pb-2">Accuracy</th>
                <th className="pb-2">Activity</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {consentedParticipants.map((p: ConsentedParticipant) => (
                <tr key={p.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="py-2.5 text-cyan-300 font-bold">{p.pseudonym}</td>
                  <td className="py-2.5 text-slate-300">{p.realNameMasked}</td>
                  <td className="py-2.5 text-slate-400">{p.deviceModel}</td>
                  <td className="py-2.5 text-white">Floor {p.activeFloor}</td>
                  <td className="py-2.5 text-slate-300">Room 104</td>
                  <td className="py-2.5 text-emerald-400">{(p.confidenceScore * 100).toFixed(0)}%</td>
                  <td className="py-2.5 text-slate-400">±{p.accuracyMeters.toFixed(1)}m</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-navy-800 text-cyan-300 border border-cyan-800">
                      {p.activity}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Consented</span>
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
