import React from 'react';
import { useBuildingStore } from '../stores/buildingStore';
import { Radio, Users, TrendingUp, BarChart2, Calendar, Download } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const OccupancyAnalyticsPage: React.FC = () => {
  const { building } = useBuildingStore();

  const hourlyOccupancyTrend = [
    { hour: '06:00', hostelTotal: 120, commonAreas: 5 },
    { hour: '08:00', hostelTotal: 85, commonAreas: 25 },
    { hour: '10:00', hostelTotal: 40, commonAreas: 12 },
    { hour: '12:00', hostelTotal: 65, commonAreas: 30 },
    { hour: '14:00', hostelTotal: 50, commonAreas: 18 },
    { hour: '16:00', hostelTotal: 75, commonAreas: 28 },
    { hour: '18:00', hostelTotal: 130, commonAreas: 45 },
    { hour: '20:00', hostelTotal: 165, commonAreas: 40 },
    { hour: '22:00', hostelTotal: 178, commonAreas: 15 },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black tracking-wide text-white">
              Spatial Occupancy & Density Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Device-Free Aggregate Spatial Occupancy Trends • 9-Floor Hostel Pilot Dataset
          </p>
        </div>

        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-navy-900 hover:bg-navy-850 text-cyan-300 border border-slate-700 rounded-lg">
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics Report (.CSV)</span>
        </button>
      </div>

      {/* Hourly Density Trend Area Chart */}
      <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              24-Hour Building Occupancy Curve (Estimated Occupants)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Peak Occupancy: 22:00 (178 Residents)</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyOccupancyTrend}>
              <defs>
                <linearGradient id="colorHostel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00f5ff" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCommon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#050c1c',
                  borderColor: '#00f5ff',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <Area
                type="monotone"
                dataKey="hostelTotal"
                stroke="#00f5ff"
                fillOpacity={1}
                fill="url(#colorHostel)"
                name="Total Building Occupancy"
              />
              <Area
                type="monotone"
                dataKey="commonAreas"
                stroke="#a855f7"
                fillOpacity={1}
                fill="url(#colorCommon)"
                name="Corridors & Lobbies"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
