import React from 'react';
import { FloorDefinition } from '../../types/building';
import { RoomMesh } from './RoomMesh';
import { CorridorMesh } from './CorridorMesh';
import { NodeMarker } from './NodeMarker';
import { SignalWaveMesh } from './SignalWaveMesh';
import { HeatmapOverlay } from './HeatmapOverlay';
import { OccupantMarker } from './OccupantMarker';
import { useBuildingStore } from '../../stores/buildingStore';
import { useSensingStore } from '../../stores/sensingStore';

interface BuildingFloorProps {
  floor: FloorDefinition;
  isIsolatedView: boolean;
  cutawayActive: boolean;
}

export const BuildingFloor: React.FC<BuildingFloorProps> = ({
  floor,
  isIsolatedView,
  cutawayActive,
}) => {
  const { building } = useBuildingStore();
  const { consentedParticipants, anonymousOccupants } = useSensingStore();

  const floorParticipants = consentedParticipants.filter((p) => p.activeFloor === floor.floorNumber);
  const floorOccupants = anonymousOccupants.filter((o) => o.floorNumber === floor.floorNumber);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Corridors, Floor Slabs, and Vertical Cores */}
      <CorridorMesh
        corridors={floor.corridors}
        cores={floor.cores}
        floorElevationY={floor.elevationY}
        slabThickness={floor.slabThickness}
        hasCabinet={!!floor.networkCabinet}
        cabinetPosition={floor.networkCabinet?.position}
      />

      {/* 2. Rooms */}
      {floor.rooms.map((room) => {
        // Cutaway wall logic: hide front-facing rooms when cutaway is enabled
        if (cutawayActive && room.side === 'right' && !isIsolatedView) {
          return null;
        }
        return (
          <RoomMesh
            key={room.id}
            room={room}
            floorElevationY={floor.elevationY}
            wallTransparency={building.wallTransparency}
          />
        );
      })}

      {/* 3. Wi-Fi Nodes */}
      {floor.nodes.map((node) => (
        <React.Fragment key={node.id}>
          <NodeMarker node={node} />
          {building.showSignalWaves && (
            <SignalWaveMesh
              origin={node.position}
              radius={node.coverageRadiusMeters}
              color={node.frequencyGhz === 5.0 ? '#38bdf8' : '#00f5ff'}
              speed={node.frequencyGhz === 5.0 ? 1.3 : 0.9}
              isActive={node.status === 'ONLINE'}
            />
          )}
        </React.Fragment>
      ))}

      {/* 4. Heatmap RF / Occupancy Overlay */}
      <HeatmapOverlay
        floorElevationY={floor.elevationY}
        slabThickness={floor.slabThickness}
        showHeatmap={building.showHeatmap}
      />

      {/* 5. Occupants (Consented & Anonymous) */}
      {building.showOccupants && (
        <>
          {floorParticipants.map((p) => (
            <OccupantMarker
              key={p.id}
              type="CONSENTED_PARTICIPANT"
              position={p.estimatedPosition}
              label={p.pseudonym}
              subLabel={p.realNameMasked}
              confidenceScore={p.confidenceScore}
              uncertaintyRadius={p.accuracyMeters}
              activity={p.activity}
            />
          ))}

          {floorOccupants.map((o) => (
            <OccupantMarker
              key={o.id}
              type="ANONYMOUS_OCCUPANT"
              position={o.position}
              label={`RF Perturbation (${o.zone.slice(0, 10)})`}
              confidenceScore={o.confidenceScore}
              uncertaintyRadius={o.uncertaintyRadiusMeters}
              activity={o.motionDetected ? 'RF Motion Spike' : 'Static RF Shadow'}
            />
          ))}
        </>
      )}
    </group>
  );
};
