import numpy as np
from typing import Tuple, Dict, Any

class ExtendedKalmanFilter2D:
    """
    Stage 3 AI Pipeline: Sensor Fusion via Extended Kalman Filter (EKF).
    Combines Wi-Fi RSSI fingerprinting estimates (noisy, absolute) with
    Pedestrian Dead Reckoning (PDR) IMU step integration (smooth, relative drift).
    
    State Vector: x = [pos_x, pos_y, vel_x, vel_y]^T
    """

    def __init__(self, init_x: float = 1.5, init_y: float = 1.5, dt: float = 1.0):
        self.dt = dt
        # State vector: [x, y, vx, vy]
        self.x = np.array([init_x, init_y, 0.0, 0.0], dtype=float)

        # State Transition Matrix F
        self.F = np.array([
            [1.0, 0.0, dt,  0.0],
            [0.0, 1.0, 0.0, dt],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ], dtype=float)

        # Measurement Matrix H (we observe x and y from Wi-Fi)
        self.H = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0]
        ], dtype=float)

        # Process Noise Covariance Q
        q_sigma = 0.5 # accelerometer noise
        self.Q = np.eye(4, dtype=float) * (q_sigma ** 2)

        # Measurement Noise Covariance R (Wi-Fi positioning uncertainty ~ 1.5m)
        r_sigma = 1.5
        self.R = np.eye(2, dtype=float) * (r_sigma ** 2)

        # Error Covariance Matrix P
        self.P = np.eye(4, dtype=float) * 2.0

    def predict(self, accel_x: float = 0.0, accel_y: float = 0.0):
        """State prediction step using constant velocity + control input (IMU acceleration)."""
        # Control matrix B
        B = np.array([
            [0.5 * (self.dt ** 2), 0.0],
            [0.0, 0.5 * (self.dt ** 2)],
            [self.dt, 0.0],
            [0.0, self.dt]
        ], dtype=float)
        u = np.array([accel_x, accel_y], dtype=float)

        # x = F * x + B * u
        self.x = np.dot(self.F, self.x) + np.dot(B, u)
        # P = F * P * F^T + Q
        self.P = np.dot(np.dot(self.F, self.P), self.F.T) + self.Q
        return self.x[:2]

    def update(self, wifi_x: float, wifi_y: float, confidence: float = 0.85):
        """
        Measurement update step. Dynamically adjusts measurement covariance R
        based on the reported Wi-Fi localization confidence score.
        """
        z = np.array([wifi_x, wifi_y], dtype=float)
        
        # Adaptive measurement noise: higher confidence -> lower measurement noise
        adaptive_R = self.R * (1.0 / max(0.2, confidence))

        # Innovation: y = z - H * x
        y = z - np.dot(self.H, self.x)

        # Innovation covariance: S = H * P * H^T + R
        S = np.dot(np.dot(self.H, self.P), self.H.T) + adaptive_R

        # Optimal Kalman Gain: K = P * H^T * S^-1
        K = np.dot(np.dot(self.P, self.H.T), np.linalg.inv(S))

        # Updated state: x = x + K * y
        self.x = self.x + np.dot(K, y)

        # Updated error covariance: P = (I - K * H) * P
        I = np.eye(4, dtype=float)
        self.P = np.dot(I - np.dot(K, self.H), self.P)

        # Estimated uncertainty radius (meters) from P covariance eigenvalues
        pos_cov = self.P[:2, :2]
        eigenvalues = np.linalg.eigvals(pos_cov)
        uncertainty_radius = float(np.sqrt(np.max(np.abs(eigenvalues))))

        return float(self.x[0]), float(self.x[1]), uncertainty_radius

