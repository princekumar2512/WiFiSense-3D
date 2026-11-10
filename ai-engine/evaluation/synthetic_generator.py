"""
WiFiSense 3D - Physics-Based Synthetic RF Environment & Trajectory Generator
Simulates Log-Distance Path Loss (LDPL), Wall Attenuation Factors (WAF),
and Multi-Floor Concrete Slab Penetration for the 9-Floor Hostel Building.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple

class HostelRadioSimulator:
    """
    Simulates realistic Wi-Fi signal propagation inside the 9-floor hostel.
    Corridor Geometry: L-shaped (28m long leg, 20m short leg).
    """

    def __init__(
        self,
        ref_loss_1m_dbm: float = 40.0,
        path_loss_exponent: float = 2.4,
        wall_attenuation_db: float = 6.5,
        slab_attenuation_db: float = 14.0,
        shadowing_sigma_db: float = 2.5,
        tx_power_dbm: float = 20.0
    ):
        self.pl_d0 = ref_loss_1m_dbm
        self.n = path_loss_exponent
        self.waf = wall_attenuation_db
        self.saf = slab_attenuation_db
        self.sigma = shadowing_sigma_db
        self.tx_power = tx_power_dbm

        # Define 9-floor Deco node placement
        # Floor 1: Node 1 at [1.5, 1.5, 0], Node 2 at [26.0, 0.0, 0]
        self.nodes = {}
        for f in range(1, 10):
            elevation_y = (f - 1) * 3.4
            self.nodes[f"Deco-F{f}-01"] = {
                "x": 1.5, "y": elevation_y + 2.4, "z": 1.5, "floor": f, "role": "junction"
            }
            self.nodes[f"Deco-F{f}-02"] = {
                "x": 26.0, "y": elevation_y + 2.4, "z": 0.0, "floor": f, "role": "farend"
            }

    def compute_received_rssi(
        self,
        tx_pos: Dict[str, float],
        rx_pos: Tuple[float, float, float],
        rx_floor: int
    ) -> float:
        """
        Computes received signal strength in dBm using 3D Euclidean distance,
        inter-floor slab penetration, and wall attenuation.
        """
        dx = tx_pos["x"] - rx_pos[0]
        dy = tx_pos["y"] - rx_pos[1]
        dz = tx_pos["z"] - rx_pos[2]
        dist_3d = max(0.5, np.sqrt(dx**2 + dy**2 + dz**2))

        # 1. Free space path loss component
        path_loss = self.pl_d0 + 10.0 * self.n * np.log10(dist_3d)

        # 2. Inter-floor slab attenuation
        floor_diff = abs(tx_pos["floor"] - rx_floor)
        floor_loss = floor_diff * self.saf

        # 3. Wall penetration estimate (heuristic: >5m in corridor or across wings incurs walls)
        horizontal_dist = np.sqrt(dx**2 + dz**2)
        wall_count = min(3, int(horizontal_dist / 6.0))
        wall_loss = wall_count * self.waf

        # 4. Log-normal shadow fading
        fading = np.random.normal(0, self.sigma)

        rssi = self.tx_power - (path_loss + floor_loss + wall_loss) + fading
        return float(np.clip(rssi, -95.0, -25.0))

    def generate_radio_map(self, samples_per_room: int = 15) -> pd.DataFrame:
        """
        Generates a comprehensive labeled training radio map across all 9 floors.
        Covers L-corridor reference points and 20 rooms per floor.
        """
        records = []

        for floor in range(1, 10):
            elevation_y = (floor - 1) * 3.4

            # 1. Generate Corridor Reference Points
            # Long corridor leg: X in [0..28m], Z=0
            for x in np.linspace(1.0, 27.0, 14):
                rx_pos = (x, elevation_y + 1.2, 0.0)
                record = {
                    "floor": floor,
                    "room": "CORRIDOR_LONG",
                    "x": x, "y": elevation_y + 1.2, "z": 0.0,
                    "zone_type": "CORRIDOR"
                }
                for node_id, node_data in self.nodes.items():
                    record[node_id] = self.compute_received_rssi(node_data, rx_pos, floor)
                records.append(record)

            # Short corridor leg: X=0, Z in [0..20m]
            for z in np.linspace(1.0, 19.0, 10):
                rx_pos = (0.0, elevation_y + 1.2, z)
                record = {
                    "floor": floor,
                    "room": "CORRIDOR_SHORT",
                    "x": 0.0, "y": elevation_y + 1.2, "z": z,
                    "zone_type": "CORRIDOR"
                }
                for node_id, node_data in self.nodes.items():
                    record[node_id] = self.compute_received_rssi(node_data, rx_pos, floor)
                records.append(record)

            # 2. Generate Room Reference Points (Rooms 101 to 120 per floor)
            # 12 rooms along long wing, 8 rooms along short wing
            for rm_idx in range(1, 21):
                room_num = f"{floor}{rm_idx:02d}"
                if rm_idx <= 12:
                    # Long wing rooms: X in [2..26m], Z=+4.5 (left) or Z=-4.5 (right)
                    base_x = 2.0 + (rm_idx % 6) * 4.0
                    base_z = 4.5 if rm_idx <= 6 else -4.5
                else:
                    # Short wing rooms: X=+4.5 or -4.5, Z in [2..18m]
                    base_x = 4.5 if rm_idx <= 16 else -4.5
                    base_z = 2.0 + (rm_idx % 4) * 4.0

                for _ in range(samples_per_room):
                    px = base_x + np.random.uniform(-1.0, 1.0)
                    pz = base_z + np.random.uniform(-1.0, 1.0)
                    rx_pos = (px, elevation_y + 1.2, pz)

                    record = {
                        "floor": floor,
                        "room": room_num,
                        "x": px, "y": elevation_y + 1.2, "z": pz,
                        "zone_type": "ROOM"
                    }
                    for node_id, node_data in self.nodes.items():
                        record[node_id] = self.compute_received_rssi(node_data, rx_pos, floor)
                    records.append(record)

        return pd.DataFrame(records)

    def generate_pedestrian_trajectory(
        self,
        floor: int = 1,
        steps: int = 40,
        trajectory_type: str = "l_corridor_walk"
    ) -> List[Dict[str, Any]]:
        """
        Generates a continuous synthetic human walk trajectory along the L-corridor.
        """
        elevation_y = (floor - 1) * 3.4
        waypoints = []

        if trajectory_type == "l_corridor_walk":
            # Walk from far end (X=26, Z=0) -> junction (X=0, Z=0) -> short end (X=0, Z=18)
            t1 = np.linspace(26.0, 0.0, steps // 2)
            for x in t1:
                waypoints.append((x, elevation_y + 1.2, 0.0))
            t2 = np.linspace(0.0, 18.0, steps // 2)
            for z in t2:
                waypoints.append((0.0, elevation_y + 1.2, z))

        trajectory_data = []
        for i, (wx, wy, wz) in enumerate(waypoints):
            rssi_map = {}
            for node_id, node_data in self.nodes.items():
                rssi_map[node_id] = self.compute_received_rssi(node_data, (wx, wy, wz), floor)

            trajectory_data.append({
                "step_index": i,
                "true_x": round(wx, 2),
                "true_y": round(wy, 2),
                "true_z": round(wz, 2),
                "floor": floor,
                "rssi_map": rssi_map,
                "step_frequency_hz": 1.6 + np.random.normal(0, 0.1)
            })

        return trajectory_data

