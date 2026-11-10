import React from 'react';
import { BuildingCanvas } from '../features/digital-twin/BuildingCanvas';
import {
  Wifi,
  Radio,
  Layers,
  ShieldCheck,
  Activity,
  Cpu,
  ChevronRight,
  Database,
  ArrowRight,
  Eye,
  Sliders,
  Sparkles,
  BarChart3,
  FileText,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (tab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 border-b border-cyan-900/40">
        {/* Futuristic Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[300px] bg-electric-blue/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            {/* Top Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 text-xs font-mono shadow-glow-cyan mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>ACADEMIC RESEARCH & COMMERCIAL PLATFORM</span>
              <span className="text-slate-600">|</span>
              <span className="text-white font-semibold">PILOT: 9-FLOOR HOSTEL</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-electric-blue">Wi-Fi Sensing</span> & 3D Digital Twin
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
              Device-free anonymous room occupancy estimation, consented participant localization, and real-time spatial analytics. Engineered for university campuses, hostel networks, and advanced RF propagation research.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onEnterApp('digital-twin')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-electric-blue text-navy-950 font-bold text-sm hover:opacity-95 shadow-glow-cyan transition-all transform hover:-translate-y-0.5"
              >
                <Layers className="w-4 h-4" />
                <span>Launch 3D Digital Twin</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEnterApp('dashboard')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 border border-cyan-500/40 text-cyan-300 font-semibold text-sm hover:bg-navy-850 hover:border-cyan-400 transition-all shadow-glass-panel"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Open Live Dashboard</span>
              </button>

              <button
                onClick={() => onEnterApp('editor')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900/60 border border-slate-700 text-slate-300 font-mono text-xs hover:text-white hover:border-slate-500 transition-all"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Configurable Floor Editor</span>
              </button>
            </div>
          </div>

          {/* 3D Interactive Hero Preview Window */}
          <div className="relative mt-8 rounded-2xl border border-cyan-500/30 bg-navy-950/80 shadow-2xl overflow-hidden p-1 backdrop-blur-xl">
            <div className="bg-navy-900/90 px-4 py-2.5 border-b border-cyan-900/60 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-slate-300 font-semibold">
                  Interactive 3D Digital Twin Viewport (WebGL / Three.js)
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="text-cyan-400">Anchor: Node 1 (Junction) & Node 2 (Far End)</span>
                <span className="hidden sm:inline">Orbit / Zoom / Pan Enabled</span>
              </div>
            </div>

            {/* Embedded Live 3D Building Canvas */}
            <div className="h-[480px] sm:h-[580px] w-full">
              <BuildingCanvas showOverlayControls={true} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Architecture Metrics Bar */}
      <section className="bg-navy-900/60 border-b border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">9 FLOORS</div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Hostel Spatial Twin</p>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">180+ ROOMS</div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Dual-Sided L-Corridors</p>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">TP-LINK DECO</div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Mesh Telemetry & HAL</p>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">DPDP 2023</div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Explicit Consent Architecture</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Product Modules */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-2">
              Engineering Pillars
            </h2>
            <h3 className="text-3xl font-bold text-white">
              Built on Scientific Rigor & Hardware Independence
            </h3>
            <p className="text-slate-400 text-sm mt-3">
              Designed to overcome the limitations of proprietary commercial routers while maintaining a path toward commercial multi-university scaling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: 3D Digital Twin */}
            <div className="bg-navy-900/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all shadow-glass-panel group">
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Interactive 3D Digital Twin</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Full 9-floor hostel building with an accurate L-shaped first floor, transparent cutaways, vertical cores (lift & stairs at junction), network cabinet, animated RF waves, and live occupant spheres.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-400 font-mono">
                <li className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Three.js & React Three Fiber
                </li>
                <li className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Floor-by-Floor Slicing & 2D/3D
                </li>
              </ul>
            </div>

            {/* Card 2: Dual Sensing Pipeline */}
            <div className="bg-navy-900/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all shadow-glass-panel group">
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Dual-Stream Sensing Paradigm</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Strict technological wall between anonymous device-free room occupancy detection and authorized participant localization. Zero unconsented individual tracking.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-400 font-mono">
                <li className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  India DPDP Act 2023 Aligned
                </li>
                <li className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Confidence & Uncertainty Bounds
                </li>
              </ul>
            </div>

            {/* Card 3: Hardware Abstraction */}
            <div className="bg-navy-900/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all shadow-glass-panel group">
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Hardware-Independent HAL</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pluggable adapters for TP-Link Deco mesh routers, experimental ESP32-CSI sniffers, smartphone IMU/barometers, and high-fidelity physics-based simulation.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-400 font-mono">
                <li className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  RouterAdapter & CSIAdapter
                </li>
                <li className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  3 Dedicated Operating Modes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. First-Floor Pilot Layout Highlight */}
      <section className="py-16 bg-navy-900/40 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-mono mb-3">
                REAL-WORLD PILOT SPECIFICATION
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Accurate L-Shaped First-Floor Architecture
              </h3>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                The pilot installation models the physical hostel structure with precision:
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300 font-sans">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1" />
                  <span><strong>Node 1 (L-Junction):</strong> Placed at the turning point beside the central elevator shaft and staircase core.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1" />
                  <span><strong>Node 2 (Far End):</strong> Placed at the extreme end of the long corridor serving end-wing residents.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1" />
                  <span><strong>Network Cabinet:</strong> First-floor primary rack cabinet with fiber optic backhaul distribution.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1" />
                  <span><strong>Configurable Floors 2–9:</strong> Fully editable room counts and dimensions via the built-in architectural editor.</span>
                </li>
              </ul>

              <div className="mt-6">
                <button
                  onClick={() => onEnterApp('editor')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-glow-cyan transition-all"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Open Interactive Building Editor</span>
                </button>
              </div>
            </div>

            {/* Architecture Graphic Card */}
            <div className="p-6 rounded-2xl bg-navy-950 border border-cyan-900/60 shadow-glass-panel">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono text-cyan-400">
                <span>HOSTEL BLOCK ALPHA // FLOOR 1 CAD SCHEMATIC</span>
                <span className="text-emerald-400 font-bold">MEASURED</span>
              </div>
              <div className="mt-4 font-mono text-[11px] text-slate-400 space-y-2 bg-navy-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-white font-semibold">Corridor Layout: L-Shaped Geometry</div>
                <div>• Long Corridor: 28.0m length x 2.4m width (Rooms 101–112)</div>
                <div>• Short Corridor: 20.0m length x 2.4m width (Rooms 113–120)</div>
                <div>• Deco Mesh Density: 1 node per ~3 rooms along corridor</div>
                <div>• Node 1 Coordinates: [X: 1.5m, Z: 1.5m, Elevation: 2.4m]</div>
                <div>• Node 2 Coordinates: [X: 26.0m, Z: 0.0m, Elevation: 2.4m]</div>
                <div>• Rack Cabinet: [X: 1.2m, Z: -3.2m, Elevation: 1.2m]</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-10 border-t border-slate-800/80 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold">WiFiSense 3D Platform</span>
            <span>— Advanced Academic Research & Spatial Sensing</span>
          </div>
          <div>
            <span>DPDP Act 2023 Compliant • Multi-University Scalable</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
