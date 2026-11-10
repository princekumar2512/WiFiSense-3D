import React, { useState } from 'react';
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

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');

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
