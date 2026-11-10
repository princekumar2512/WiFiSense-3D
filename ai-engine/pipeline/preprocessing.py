import numpy as np
from typing import List, Tuple, Optional

class SignalPreprocessor:
    """
    Stage 1 AI Pipeline: Preprocessing & Noise Filtering.
    Applies Hampel filtering for outlier rejection, moving average for temporal smoothing,
    and missing data imputation for irregular RF telemetry streams.
    """

    @staticmethod
    def hampel_filter(data: np.ndarray, window_size: int = 5, n_sigmas: float = 3.0) -> np.ndarray:
        """
        Hampel filter for outlier detection and replacement with local median.
        Particularly effective for multipath RF impulse spikes in indoor corridors.
        """
        n = len(data)
        filtered = data.copy()
        k = 1.4826 # Scale factor for Gaussian distribution

        for i in range(n):
            start = max(0, i - window_size)
            end = min(n, i + window_size + 1)
            window = data[start:end]
            median = np.median(window)
            mad = k * np.median(np.abs(window - median))

            if mad > 0 and np.abs(data[i] - median) > n_sigmas * mad:
                filtered[i] = median

        return filtered

    @staticmethod
    def moving_average(data: np.ndarray, window: int = 3) -> np.ndarray:
        """Simple moving average filter to smooth high-frequency RF noise."""
        if len(data) < window:
            return data
        kernel = np.ones(window) / window
        return np.convolve(data, kernel, mode='same')

    @staticmethod
    def impute_missing_rssi(rssi_vector: np.ndarray, default_val: float = -95.0) -> np.ndarray:
        """Imputes missing/unreachable access point readings with nominal receiver sensitivity threshold."""
        return np.nan_to_num(rssi_vector, nan=default_val)

    @staticmethod
    def normalize_min_max(rssi_vector: np.ndarray, min_rssi: float = -100.0, max_rssi: float = -30.0) -> np.ndarray:
        """Normalizes RSSI values to [0.0, 1.0] range for neural network and SVM classifiers."""
        clipped = np.clip(rssi_vector, min_rssi, max_rssi)
        return (clipped - min_rssi) / (max_rssi - min_rssi)
