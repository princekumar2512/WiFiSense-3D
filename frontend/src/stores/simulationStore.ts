import { create } from 'zustand';

interface SimulationState {
  isRunning: boolean;
  simulationSpeed: number; // 1x, 2x, 5x
  simulatedOccupantCount: number;
  rfNoiseVariance: number;
  nodeFailureSimulated: boolean;
  failedNodeId: string | null;
  activePathType: 'corridorWalk' | 'roomStationary' | 'floorTransition';

  // Actions
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  setSimulatedOccupantCount: (count: number) => void;
  setRfNoiseVariance: (variance: number) => void;
  triggerNodeFailure: (nodeId?: string) => void;
  restoreNodes: () => void;
  triggerOccupancySpike: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isRunning: true,
  simulationSpeed: 1,
  simulatedOccupantCount: 42,
  rfNoiseVariance: 1.2,
  nodeFailureSimulated: false,
  failedNodeId: null,
  activePathType: 'corridorWalk',

  toggleSimulation: () => set((state) => ({ isRunning: !state.isRunning })),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  setSimulatedOccupantCount: (count) => set({ simulatedOccupantCount: count }),
  setRfNoiseVariance: (variance) => set({ rfNoiseVariance: variance }),

  triggerNodeFailure: (nodeId = 'node-1-farend') =>
    set({
      nodeFailureSimulated: true,
      failedNodeId: nodeId,
    }),

  restoreNodes: () =>
    set({
      nodeFailureSimulated: false,
      failedNodeId: null,
    }),

  triggerOccupancySpike: () => {
    const current = get().simulatedOccupantCount;
    set({ simulatedOccupantCount: current + 15 });
  },
}));

