import numpy as np
from typing import List, Dict, Tuple, Optional

class WKNNFingerprinting:
    """
    Stage 3 AI Pipeline: Weighted K-Nearest Neighbors (WKNN) Wi-Fi Fingerprinting.
    Matches online RSSI signal vectors against offline radio map fingerprints.
    """

    def __init__(self, k: int = 4, p_norm: int = 2):
        self.k = k
        self.p_norm = p_norm
        self.fingerprints_rssi: Optional[np.ndarray] = None # Shape: (N, num_aps)
        self.fingerprints_coords: Optional[np.ndarray] = None # Shape: (N, 3) [x, y, z]
        self.ap_identifiers: List[str] = []

    def fit(self, ap_ids: List[str], rssi_matrix: np.ndarray, coordinates: np.ndarray):
        """Trains/registers the offline radio map."""
        self.ap_identifiers = ap_ids
        self.fingerprints_rssi = np.array(rssi_matrix, dtype=float)
        self.fingerprints_coords = np.array(coordinates, dtype=float)

    def predict(self, online_rssi_map: Dict[str, float]) -> Tuple[float, float, float, float, float]:
        """
        Estimates 3D coordinates from online RSSI measurements.
        
        Returns:
            (est_x, est_y, est_z, confidence_score, uncertainty_radius_m)
        """
        if self.fingerprints_rssi is None or len(self.fingerprints_rssi) == 0:
            raise ValueError("Radio map has not been trained or loaded.")

        # Convert dictionary to ordered vector
        online_vector = np.array([
            online_rssi_map.get(ap_id, -95.0) for ap_id in self.ap_identifiers
        ], dtype=float)

        # Compute signal-space distances
        diffs = np.abs(self.fingerprints_rssi - online_vector)
        if self.p_norm == 2:
            distances = np.sqrt(np.sum(diffs ** 2, axis=1))
        else: # Manhattan norm
            distances = np.sum(diffs, axis=1)

        # Select k nearest neighbors
        k_indices = np.argsort(distances)[:self.k]
        k_distances = distances[k_indices]
        k_coords = self.fingerprints_coords[k_indices]

        # Inverse distance weights
        epsilon = 1e-4
        weights = 1.0 / (k_distances + epsilon)
        weights /= np.sum(weights)

        # Weighted spatial coordinate estimate
        estimated_coords = np.sum(k_coords * weights[:, np.newaxis], axis=0)

        # Calculate dispersion uncertainty radius
        spatial_variance = np.sum(weights * np.sum((k_coords - estimated_coords) ** 2, axis=1))
        uncertainty_radius_m = float(np.sqrt(spatial_variance))

        # Confidence metric (inversely proportional to mean signal distance)
        mean_signal_dist = float(np.mean(k_distances))
        confidence_score = float(np.clip(1.0 - (mean_signal_dist / 40.0), 0.25, 0.98))

        return (
            float(estimated_coords[0]),
            float(estimated_coords[1]),
            float(estimated_coords[2]),
            confidence_score,
            max(0.8, uncertainty_radius_m)
        )
