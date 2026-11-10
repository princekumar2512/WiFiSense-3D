import React, { useState, useEffect } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { BuildingEditorPage } from './pages/BuildingEditorPage';
import { ParticipantsPage } from './pages/ParticipantsPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { OccupancyAnalyticsPage } from './pages/OccupancyAnalyticsPage';
import { NetworkInfrastructurePage } from './pages/NetworkInfrastructurePage';
import { ResearchLabPage } from './pages/ResearchLabPage';
import { SettingsPage } from './pages/SettingsPage';
import { useBuildingStore } from './stores/buildingStore';
import { useSensingStore } from './stores/sensingStore';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const { loadPersistedBuildingFromBackend } = useBuildingStore();
  const { tickSimulationTelemetry } = useSensingStore();

  useEffect(() => {
    // 1. Sync persistent building configuration from backend database
    loadPersistedBuildingFromBackend();

    // 2. Establish live WebSocket telemetry connection
    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket('ws://localhost:8000/ws/telemetry');
      socket.onopen = () => {
        console.log('Real-Time WebSocket Telemetry Connected.');
      };
      socket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.type === 'TELEMETRY_UPDATE') {
            tickSimulationTelemetry();
          }
        } catch (e) {
          // ignore parsing error
        }
      };
      socket.onerror = () => {
        console.warn('WebSocket telemetry offline. Running in resilient local simulation mode.');
      };
    } catch (e) {
      console.warn('WebSocket connection not supported in this environment.');
    }

    return () => {
      if (socket) socket.close();
    };
  }, [loadPersistedBuildingFromBackend, tickSimulationTelemetry]);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-navy-950">
      {/* Top Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Page Content */}
      <main className="flex-1">
        {activeTab === 'landing' && <LandingPage onEnterApp={(tab = 'dashboard') => setActiveTab(tab)} />}
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'digital-twin' && <DigitalTwinPage />}
        {activeTab === 'editor' && <BuildingEditorPage />}
        {activeTab === 'participants' && <ParticipantsPage />}
        {activeTab === 'live-monitoring' && <LiveMonitoringPage />}
        {activeTab === 'occupancy' && <OccupancyAnalyticsPage />}
        {activeTab === 'networks' && <NetworkInfrastructurePage />}
        {activeTab === 'research-lab' && <ResearchLabPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

export default App;

