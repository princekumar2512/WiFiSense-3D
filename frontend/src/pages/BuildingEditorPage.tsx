import React from 'react';
import { BuildingEditor } from '../features/building-editor/BuildingEditor';
import { BuildingCanvas } from '../features/digital-twin/BuildingCanvas';
import { Sliders, Building, Info } from 'lucide-react';

export const BuildingEditorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black tracking-wide text-white">
              Hostel Building & Network Editor
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Configurable 3D Spatial Geometry • L-Shaped Corridor Modeling • Dynamic Node Registration
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-navy-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-slate-300">Live 3D Geometry Sync Active</span>
        </div>
      </div>

      {/* Split View: Live 3D Preview on Top/Left, Configuration Controls on Bottom/Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive 3D Preview Viewport */}
        <div className="lg:col-span-5 bg-navy-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[520px]">
          <div className="p-3 bg-navy-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold">Real-Time CAD Viewport</span>
            <span className="text-cyan-400">Interactive</span>
          </div>
          <div className="h-[470px] w-full">
            <BuildingCanvas showOverlayControls={true} />
          </div>
        </div>

        {/* Building Editor Form Component */}
        <div className="lg:col-span-7">
          <BuildingEditor />
        </div>
      </div>
    </div>
  );
};
