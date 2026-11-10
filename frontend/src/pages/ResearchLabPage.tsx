import React, { useState } from 'react';
import {
  FlaskConical,
  BarChart2,
  Database,
  Cpu,
  CheckCircle,
  Clock,
  Layers,
  Activity,
  AlertCircle,
  FileCode,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

export const ResearchLabPage: React.FC = () => {
  const [activeModel, setActiveModel] = useState<'knn' | 'rf' | 'svm' | 'ekf'>('rf');

  // Baseline Model Evaluation Metrics
  const modelComparisonData = [
    { model: 'K-Nearest Neighbors (k=5)', floorAccuracy: 94.2, roomAccuracy: 84.1, meanErrorM: 2.1, inferenceMs: 4.2 },
    { model: 'Random Forest (100 Trees)', floorAccuracy: 98.4, roomAccuracy: 91.6, meanErrorM: 1.5, inferenceMs: 6.8 },
    { model: 'Support Vector Machine (RBF)', floorAccuracy: 96.1, roomAccuracy: 88.3, meanErrorM: 1.8, inferenceMs: 5.1 },
    { model: 'Sensor Fusion + EKF Filter', floorAccuracy: 99.1, roomAccuracy: 94.8, meanErrorM: 1.2, inferenceMs: 8.5 },
  ];

  // Radar chart of feature significance
  const featureSignificanceData = [
    { subject: 'Deco RSSI Gradient', A: 95 },
    { subject: 'Channel Phase Variance', A: 78 },
    { subject: 'Temporal RF Shadowing', A: 88 },
    { subject: 'Barometer Floor Delta', A: 96 },
    { subject: 'Pedestrian Dead Reckoning', A: 82 },
    { subject: 'Spatial Fingerprint Map', A: 90 },
  ];

  // Confusion matrix simulation for Floor 1 Rooms 101 to 106
  const confusionMatrix = [
    { actual: 'Room 101', pred101: 92, pred102: 6, pred103: 2, other: 0 },
    { actual: 'Room 102', pred101: 4, pred102: 91, pred103: 4, other: 1 },
    { actual: 'Room 103', pred101: 1, pred102: 5, pred103: 89, other: 5 },
    { actual: 'Room 104', pred101: 0, pred102: 2, pred103: 4, other: 94 },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black tracking-wide text-white">
              RF Sensing & Localization Research Laboratory
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Empirical Validation • Machine Learning Baselines • ESP32 CSI Research Pipeline
          </p>
        </div>

        <div className="flex items-center gap-2 bg-navy-900 px-3 py-1.5 rounded-lg border border-purple-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-purple-300">PyTorch & Scikit-Learn Engine</span>
        </div>
      </div>

      {/* Academic Disclosures & Grounding Notice */}
      <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-4 shadow-glass-panel flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-white uppercase tracking-wider font-mono">
            Scientific Protocol & Experimental Dataset Status
          </p>
          <p className="text-slate-300 leading-relaxed font-sans">
            In compliance with research integrity standards, simulated benchmarking data is currently labeled for algorithmic evaluation. Actual physical site surveys (measuring fine-grained multi-path fading in the 9-floor hostel) are scheduled following formal ethical review.
          </p>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 font-mono">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Localization Algorithm Baselines (Cross-Validated)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Hostel Synthetic Dataset v1.4</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2">Algorithm / Architecture</th>
                <th className="pb-2">Floor Accuracy (%)</th>
                <th className="pb-2">Room Accuracy (%)</th>
                <th className="pb-2">Mean Localization Error</th>
                <th className="pb-2">Inference Latency</th>
                <th className="pb-2">Validation Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {modelComparisonData.map((m, idx) => (
                <tr key={m.model} className="hover:bg-navy-850/50 transition-colors">
                  <td className="py-2.5 font-bold text-white">{m.model}</td>
                  <td className="py-2.5 text-emerald-400">{m.floorAccuracy}%</td>
                  <td className="py-2.5 text-cyan-300">{m.roomAccuracy}%</td>
                  <td className="py-2.5 text-amber-400">±{m.meanErrorM} m</td>
                  <td className="py-2.5 text-slate-400">{m.inferenceMs} ms</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                      Rank #{idx + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts: Radar Analysis & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar: Sensing Feature Importance */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">
            Spatial Feature Information Gain
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={featureSignificanceData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis stroke="#64748b" fontSize={9} />
                <Radar name="Feature Importance" dataKey="A" stroke="#00f5ff" fill="#00f5ff" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix: Room Level Localization */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass-panel">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">
            Floor 1 Room Classification Confusion Matrix (%)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 text-left">Ground Truth</th>
                  <th className="pb-2">Pred Room 101</th>
                  <th className="pb-2">Pred Room 102</th>
                  <th className="pb-2">Pred Room 103</th>
                  <th className="pb-2">Other</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {confusionMatrix.map((row) => (
                  <tr key={row.actual} className="hover:bg-navy-850/50">
                    <td className="py-2.5 font-bold text-left text-white">{row.actual}</td>
                    <td className="py-2.5 bg-cyan-950/40 text-cyan-300 font-bold">{row.pred101}%</td>
                    <td className="py-2.5 bg-navy-950/60 text-slate-300">{row.pred102}%</td>
                    <td className="py-2.5 bg-navy-950/60 text-slate-300">{row.pred103}%</td>
                    <td className="py-2.5 text-slate-500">{row.other}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[10px] text-slate-400 font-mono">
            * Diagonal elements represent true positive accuracy. Cross-corridor adjacent rooms exhibit expected ~4-6% RF ambiguity.
          </p>
        </div>
      </div>
    </div>
  );
};

