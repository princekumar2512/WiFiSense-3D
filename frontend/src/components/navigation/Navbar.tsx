import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useSensingStore } from '../../stores/sensingStore';
import { UserRole } from '../../types/auth';
import {
  Wifi,
  Radio,
  Layers,
  Activity,
  Users,
  Server,
  FlaskConical,
  Settings,
  Shield,
  ChevronDown,
  LayoutDashboard,
  Sliders,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, activeRole, switchRole, logout } = useAuthStore();
  const { detectionMode, setDetectionMode } = useSensingStore();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'digital-twin', label: 'Digital Twin', icon: Layers },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'occupancy', label: 'Occupancy Analytics', icon: Radio },
    { id: 'participants', label: 'Participants & Consent', icon: Users },
    { id: 'networks', label: 'Network Infrastructure', icon: Server },
    { id: 'research-lab', label: 'Research Lab', icon: FlaskConical },
    { id: 'editor', label: 'Building Editor', icon: Sliders },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const roleLabels: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Administrator',
    UNIVERSITY_ADMIN: 'University Admin',
    HOSTEL_ADMIN: 'Hostel Administrator',
    RESEARCHER: 'Researcher (RF Lab)',
    REGISTERED_PARTICIPANT: 'Participant (Consent Active)',
    GUEST: 'Guest (Public View)',
  };

  return (
    <header className="sticky top-0 z-50 bg-navy-950/90 backdrop-blur-md border-b border-cyan-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-electric-blue flex items-center justify-center shadow-glow-cyan group-hover:scale-105 transition-transform">
              <Wifi className="w-6 h-6 text-navy-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-wider text-white">
                  WiFi<span className="text-cyan-400">Sense</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold">
                  3D
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                AI Sensing & Spatial Digital Twin
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-glow-cyan'
                      : 'text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Utilities: Telemetry Mode & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Mode Switcher Pill */}
            <div className="hidden sm:flex items-center gap-1 bg-navy-900 border border-slate-800 rounded-lg p-1 text-[11px] font-mono">
              <button
                onClick={() => setDetectionMode('SIMULATION')}
                className={`px-2 py-0.5 rounded transition-all ${
                  detectionMode === 'SIMULATION'
                    ? 'bg-purple-900/80 text-purple-200 border border-purple-500 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SIMULATION
              </button>
              <button
                onClick={() => setDetectionMode('LIVE_DECO_TELEMETRY')}
                className={`px-2 py-0.5 rounded transition-all ${
                  detectionMode === 'LIVE_DECO_TELEMETRY'
                    ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-500 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                LIVE DECO
              </button>
              <button
                onClick={() => setDetectionMode('ESP32_CSI_LAB')}
                className={`px-2 py-0.5 rounded transition-all ${
                  detectionMode === 'ESP32_CSI_LAB'
                    ? 'bg-amber-900/80 text-amber-200 border border-amber-500 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CSI LAB
              </button>
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900 border border-cyan-900/60 hover:border-cyan-400 text-xs text-white transition-all shadow-glass-panel"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium hidden md:inline">{roleLabels[activeRole]}</span>
                <span className="font-medium md:hidden">{activeRole.slice(0, 5)}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-navy-900 border border-cyan-900/80 rounded-xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                      Switch Active User Role
                    </p>
                    <p className="text-xs text-slate-300 font-semibold mt-0.5">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>

                  {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        switchRole(role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                        activeRole === role
                          ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60'
                          : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                      }`}
                    >
                      <span>{roleLabels[role]}</span>
                      {activeRole === role && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
                      )}
                    </button>
                  ))}

                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        logout();
                        setActiveTab('landing');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors font-mono"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out to Public View</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
