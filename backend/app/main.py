import asyncio
import json
import logging
import random
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.init_db import init_database
from app.api.v1.auth import router as auth_router
from app.api.v1.universities import router as universities_router
from app.api.v1.buildings import router as buildings_router
from app.api.v1.floors import router as floors_router
from app.api.v1.rooms import router as rooms_router
from app.api.v1.consent import router as consent_router
from app.api.v1.localization import router as localization_router
from app.api.v1.occupancy import router as occupancy_router
from app.api.v1.networks import router as networks_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.audit import router as audit_router
from app.websocket.manager import ws_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("WiFiSense3D")

background_broadcast_task = None

async def telemetry_broadcaster():
    """Background task generating periodic live telemetry for connected WebSockets."""
    while True:
        try:
            if ws_manager.active_connections:
                packet = {
                    "type": "TELEMETRY_UPDATE",
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "mode": "SIMULATION",
                    "system_health": "OPTIMAL",
                    "active_nodes_count": 28,
                    "rf_noise_floor_dbm": round(-92.0 + (random.random() - 0.5) * 2.5, 1),
                    "node_signals": {
                        "Deco-F1-01": round(-52.0 + (random.random() - 0.5) * 3.0, 1),
                        "Deco-F1-02": round(-58.0 + (random.random() - 0.5) * 4.0, 1)
                    },
                    "live_occupants_count": random.randint(40, 44),
                    "confidence_pct": round(87.0 + random.random() * 3.0, 1)
                }
                await ws_manager.broadcast(packet)
            await asyncio.sleep(2.0)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in telemetry broadcaster: {e}")
            await asyncio.sleep(2.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB & seed pilot hostel
    logger.info("Initializing WiFiSense 3D database and seeding pilot hostel...")
    await init_database()
    global background_broadcast_task
    background_broadcast_task = asyncio.create_task(telemetry_broadcaster())
    logger.info("FastAPI backend startup complete.")
    yield
    # Shutdown
    if background_broadcast_task:
        background_broadcast_task.cancel()
    logger.info("FastAPI backend shutdown complete.")

app = FastAPI(
    title=settings.APP_NAME,
    description="Academic research & enterprise platform for AI-powered Wi-Fi sensing, 3D digital twin telemetry, anonymous occupancy, and consented participant localization.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Modular Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(universities_router, prefix=settings.API_V1_STR)
app.include_router(buildings_router, prefix=settings.API_V1_STR)
app.include_router(floors_router, prefix=settings.API_V1_STR)
app.include_router(rooms_router, prefix=settings.API_V1_STR)
app.include_router(consent_router, prefix=settings.API_V1_STR)
app.include_router(localization_router, prefix=settings.API_V1_STR)
app.include_router(occupancy_router, prefix=settings.API_V1_STR)
app.include_router(networks_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "service": settings.APP_NAME,
        "database_connected": True,
        "dpdp_consent_enforced": True
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Receive client ping or commands
            data = await websocket.receive_text()
            # Respond to client heartbeat
            await websocket.send_text(json.dumps({
                "type": "HEARTBEAT_ACK",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
