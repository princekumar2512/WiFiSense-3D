"""
WiFiSense 3D - Multi-Tenant WebSocket Connection & Telemetry Manager
SEC-02: Tenant-Scoped Channel Isolation & Connection Lifecycle
"""

import asyncio
import json
import logging
from typing import Dict, Set, Any, Optional
from fastapi import WebSocket

logger = logging.getLogger("WiFiSense3D.WebSocket")

class TenantConnectionManager:
    """
    Manages tenant-isolated WebSocket connections.
    Enforces strict cross-university boundary separation:
    - University A connections receive ONLY University A telemetry.
    - University B connections receive ONLY University B telemetry.
    - Super-Admin connections can subscribe to designated tenant channels.
    """

    def __init__(self):
        # Maps university_id -> Set of active WebSockets
        self.tenant_connections: Dict[str, Set[WebSocket]] = {}
        # Maps WebSocket -> metadata dictionary
        self.connection_meta: Dict[WebSocket, Dict[str, Any]] = {}
        # Global lock for thread-safe connection mutability
        self._lock = asyncio.Lock()

    async def connect(
        self,
        websocket: WebSocket,
        user_id: str,
        university_id: str,
        role: str,
        subscribed_tenant: Optional[str] = None
    ):
        """Accepts and registers a verified tenant-bound WebSocket connection."""
        await websocket.accept()

        target_tenant = university_id
        if role == "SUPER_ADMIN" and subscribed_tenant:
            target_tenant = subscribed_tenant

        async with self._lock:
            if target_tenant not in self.tenant_connections:
                self.tenant_connections[target_tenant] = set()

            self.tenant_connections[target_tenant].add(websocket)
            self.connection_meta[websocket] = {
                "user_id": user_id,
                "university_id": university_id,
                "role": role,
                "subscribed_tenant": target_tenant
            }

        logger.info(
            f"WebSocket client connected: user={user_id}, tenant={target_tenant}, "
            f"role={role}. Tenant clients: {len(self.tenant_connections[target_tenant])}"
        )

    async def disconnect(self, websocket: WebSocket):
        """Unregisters connection and cleans up tenant connection pool."""
        async with self._lock:
            meta = self.connection_meta.pop(websocket, None)
            if meta:
                target_tenant = meta.get("subscribed_tenant")
                if target_tenant and target_tenant in self.tenant_connections:
                    self.tenant_connections[target_tenant].discard(websocket)
                    if not self.tenant_connections[target_tenant]:
                        del self.tenant_connections[target_tenant]
                logger.info(f"WebSocket client disconnected: user={meta.get('user_id')}, tenant={target_tenant}")

    async def broadcast_to_tenant(self, university_id: str, message: Dict[str, Any]):
        """
        Delivers telemetry STRICTLY to connections belonging to the specified university tenant.
        Prevents any cross-tenant data delivery.
        """
        async with self._lock:
            sockets = list(self.tenant_connections.get(university_id, []))

        if not sockets:
            return

        payload = json.dumps(message)
        dead_sockets = []

        for ws in sockets:
            try:
                await ws.send_text(payload)
            except Exception as e:
                logger.warning(f"Failed to send to WebSocket, marking for removal: {e}")
                dead_sockets.append(ws)

        if dead_sockets:
            for dead_ws in dead_sockets:
                await self.disconnect(dead_ws)

    async def broadcast_global(self, message: Dict[str, Any]):
        """Broadcasts generic system health/ping across all active tenant pools."""
        async with self._lock:
            all_tenants = list(self.tenant_connections.keys())

        for tenant_id in all_tenants:
            await self.broadcast_to_tenant(tenant_id, message)

    def get_tenant_client_count(self, university_id: str) -> int:
        """Returns the number of active clients for a university tenant."""
        return len(self.tenant_connections.get(university_id, set()))

    def get_total_connections_count(self) -> int:
        """Returns total active WebSocket connections across all universities."""
        return sum(len(conns) for conns in self.tenant_connections.values())

# Global Singleton Manager
ws_manager = TenantConnectionManager()
