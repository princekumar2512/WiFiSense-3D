# WiFiSense 3D

> **AI-Powered Wi-Fi Sensing, Indoor Localization, Occupancy Detection and 3D Digital Twin Platform**

[![Status: Production-Grade Research](https://img.shields.io/badge/Status-Research%20%26%20Production-00f5ff?style=for-the-badge)](https://github.com/wifisense-3d)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![3D Engine: Three.js](https://img.shields.io/badge/3D%20Engine-Three.js%20%2F%20R3F-4338ca?style=for-the-badge)](https://threejs.org/)

---

## 🏢 Platform Vision

WiFiSense 3D is a multidisciplinary research and enterprise platform combining:
1. **Interactive 3D Digital Twin**: High-fidelity WebGL/Three.js rendering of a 9-floor hostel featuring realistic floor cutaways, transparent walls, animated RF wave propagation, signal coverage contours, and real-time occupant markers.
2. **Accurate Configurable L-Shaped Layout**: True-to-life modeling of the first-floor L-corridor with Node 1 (junction) and Node 2 (far end), lift, staircase, network cabinet, and 18+ rooms, plus a live Building Editor for on-the-fly architectural alterations.
3. **Dual-Sensing Paradigm**: Strict separation between:
   - **Device-Free Anonymous Occupancy Sensing**: Passive RF perturbation analysis without identifying individuals.
   - **Consented Participant Localization**: High-accuracy positioning requiring verifiable, revocable participant consent compliant with the **Digital Personal Data Protection Act, 2023 (DPDP)**.
4. **Hardware Abstraction Layer (HAL)**: Pluggable adapters for TP-Link Deco mesh systems, experimental ESP32 Channel State Information (CSI) hardware, mobile sensors, and high-fidelity physics-based simulation.
5. **Real-Time Scientific Dashboard**: Comprehensive telemetry visualizing room/floor occupancy, node health, signal distributions, confidence metrics, and research dataset logs.

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ (Tested on v24+)
- Python 3.11+
- Docker & Docker Compose (Optional for full-stack containers)

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# or source venv/bin/activate # Linux/macOS
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Open [http://localhost:8000/docs](http://localhost:8000/docs) for the interactive Swagger OpenAPI docs.

---

## 📂 Project Structure

```text
WiFiSense-3D/
├── frontend/               # React 18, Vite, Three.js, R3F, Tailwind CSS
│   ├── src/
│   │   ├── features/
│   │   │   ├── digital-twin/ # 3D Building, Floor Slices, RF Waves, Heatmaps
│   │   │   ├── building-editor/ # Interactive geometry & node placement
│   │   │   ├── dashboard/   # Real-time metrics & system telemetry
│   │   │   └── simulation/  # Mode A simulation engine
│   │   ├── stores/          # Zustand global state (Auth, Building, Telemetry)
│   │   └── pages/           # Landing, Dashboard, Digital Twin, Analytics, etc.
├── backend/                # Python FastAPI, SQLAlchemy, WebSockets
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, buildings, consent, sensing)
│   │   ├── core/            # Config, security, database sessions
│   │   ├── models/          # Relational & PostGIS entities
│   │   └── services/        # HAL, Localization, Consent management
├── ai-engine/              # Localization models, CSI pipelines, Kalman filters
├── database/               # PostgreSQL & PostGIS schemas and migrations
└── documentation/          # Academic papers, DPDP compliance, architecture
```

---

## 🔒 Privacy & Legal Compliance Notice
WiFiSense 3D strictly adheres to privacy-by-design principles:
- **Zero Unconsented Tracking**: Individual positioning is disabled by default and activated only when an authenticated participant provides explicit consent with an active session token.
- **Anonymous Occupancy**: RF spatial sensing estimates room density and motion index without capturing or storing MAC addresses, device identifiers, or biometric profiles.
- **Compliance Alignment**: System workflows are designed in accordance with the provisions of India's Digital Personal Data Protection Act, 2023.
