import numpy as np
from typing import Dict, List, Any, Tuple

class FeatureExtractor:
    """
    Stage 2 AI Pipeline: Spatial & Temporal Feature Extraction.
    Extracts multi-AP RSSI vectors, differential signal features (removing device hardware bias),
    temporal variance indices, and IMU step integration features.
    """

    @staticmethod
    def extract_differential_rssi(rssi_map: Dict[str, float], reference_ap: str = "Deco-F1-01") -> Dict[str, float]:
        """
        Calculates differential RSSI relative to a designated reference access point.
        This cancels out device-specific transmit/receive antenna gain offsets.
        """
        ref_val = rssi_map.get(reference_ap, -60.0)
        diff_features = {}
        for ap_name, val in rssi_map.items():
            if ap_name != reference_ap:
                diff_features[f"diff_{ap_name}_{reference_ap}"] = val - ref_val
        return diff_features

    @staticmethod
    def compute_temporal_variance(rssi_time_series: np.ndarray) -> float:
        """
        Computes sample variance over recent temporal window.
        High variance in Wi-Fi signal indicates human body movement in the line-of-sight.
        """
        if len(rssi_time_series) < 2:
            return 0.0
        return float(np.var(rssi_time_series))

    @staticmethod
    def estimate_floor_from_barometer(current_pressure_hpa: float, ground_pressure_hpa: float = 1013.25) -> Tuple[int, float]:
        """
        Estimates building floor from atmospheric barometric pressure variation.
        Barometric formula: ~1 hPa change corresponds to ~8.43 meters of elevation change.
        """
        # delta_h = 8.43 * (ground_pressure - current_pressure)
        delta_p = ground_pressure_hpa - current_pressure_hpa
        estimated_height_m = delta_p * 8.43
        floor_height = 3.4
        estimated_floor = max(1, min(9, int(round(estimated_height_m / floor_height)) + 1))
        return estimated_floor, estimated_height_m

    @staticmethod
    def extract_csi_features(amplitudes: np.ndarray, phases: np.ndarray) -> Dict[str, float]:
        """
        Extracts Channel State Information (CSI) statistical descriptors:
        - Mean amplitude
        - Amplitude variance across subcarriers
        - Phase variance
        - Subcarrier correlation ratio
        """
        return {
            "csi_mean_amplitude": float(np.mean(amplitudes)),
            "csi_amplitude_std": float(np.std(amplitudes)),
            "csi_phase_variance": float(np.var(phases)),
            "csi_subcarrier_energy": float(np.sum(amplitudes ** 2))
        }
