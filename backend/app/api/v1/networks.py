from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.auth.dependencies import require_role
from app.models.network import NetworkNode
from app.models.user import User
from app.schemas.network import NodeCreate, NodeUpdate

router = APIRouter(prefix="/networks", tags=["Network Hardware Management"])

@router.get("/nodes", response_model=List[Dict[str, Any]])
async def list_network_nodes(db: AsyncSession = Depends(get_db)):
    """List all registered Wi-Fi mesh access points and routers."""
    res = await db.execute(select(NetworkNode).order_by(NetworkNode.floor_id))
    nodes = res.scalars().all()
    return [
        {
            "id": n.id,
            "floor_id": n.floor_id,
            "name": n.node_name,
            "hardware_type": n.hardware_type,
            "model": n.model,
            "mac_address": n.mac_address,
            "ip_address": n.ip_address,
            "band_ghz": n.band_ghz,
            "channel": n.channel,
            "tx_power_dbm": n.tx_power_dbm,
            "coverage_radius_meters": n.coverage_radius_meters,
            "position": {"x": n.pos_x, "y": n.pos_y, "z": n.pos_z},
            "status": n.status,
            "is_simulated": n.is_simulated,
            "notes": n.notes
        }
        for n in nodes
    ]


@router.post("/nodes")
async def register_network_node(
    payload: NodeCreate,
    current_user: User = Depends(require_role(["SUPER_ADMIN", "HOSTEL_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    """Register a new Deco router or sensor probe on a building floor."""
    node = NetworkNode(
        floor_id=payload.floor_id,
        node_name=payload.node_name,
        hardware_type=payload.hardware_type,
        model=payload.model,
        mac_address=payload.mac_address,
        ip_address=payload.ip_address,
        band_ghz=payload.band_ghz,
        channel=payload.channel,
        tx_power_dbm=payload.tx_power_dbm,
        coverage_radius_meters=payload.coverage_radius_meters,
        pos_x=payload.pos_x,
        pos_y=payload.pos_y,
        pos_z=payload.pos_z,
        status=payload.status,
        is_simulated=payload.is_simulated,
        notes=payload.notes
    )
    db.add(node)
    await db.commit()
    await db.refresh(node)
    return {"message": "Node registered successfully", "id": node.id}


@router.put("/nodes/{node_id}")
async def update_network_node(
    node_id: str,
    payload: NodeUpdate,
    current_user: User = Depends(require_role(["SUPER_ADMIN", "HOSTEL_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    """Update node coordinates, channel, or operating status."""
    node = await db.get(NetworkNode, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Network node not found")

    if payload.node_name is not None: node.node_name = payload.node_name
    if payload.model is not None: node.model = payload.model
    if payload.band_ghz is not None: node.band_ghz = payload.band_ghz
    if payload.channel is not None: node.channel = payload.channel
    if payload.tx_power_dbm is not None: node.tx_power_dbm = payload.tx_power_dbm
    if payload.coverage_radius_meters is not None: node.coverage_radius_meters = payload.coverage_radius_meters
    if payload.pos_x is not None: node.pos_x = payload.pos_x
    if payload.pos_y is not None: node.pos_y = payload.pos_y
    if payload.pos_z is not None: node.pos_z = payload.pos_z
    if payload.status is not None: node.status = payload.status
    if payload.notes is not None: node.notes = payload.notes

    await db.commit()
    return {"message": "Node updated successfully", "id": node.id}
