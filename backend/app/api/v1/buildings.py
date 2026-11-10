from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.auth.dependencies import get_current_user, require_role, verify_tenant_isolation
from app.models.organization import Building, Floor, Room, Organization
from app.models.network import NetworkNode
from app.models.user import User, UserRole
from app.models.audit import AuditLog

router = APIRouter(prefix="/buildings", tags=["Building Management"])

@router.get("", response_model=List[Dict[str, Any]])
async def list_buildings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List registered buildings for the current user's university (or all for SUPER_ADMIN)."""
    res_roles = await db.execute(select(UserRole.role_id).where(UserRole.user_id == current_user.id))
    roles = res_roles.scalars().all()

    query = select(Building).options(selectinload(Building.organization))
    if "SUPER_ADMIN" not in roles and current_user.university_id:
        query = query.join(Building.organization).where(Organization.university_id == current_user.university_id)

    res = await db.execute(query)
    buildings = res.scalars().all()
    return [
        {
            "id": b.id,
            "code": b.code,
            "name": b.name,
            "total_floors": b.total_floors,
            "is_pilot_building": b.is_pilot_building
        }
        for b in buildings
    ]


@router.get("/{building_id}")
async def get_building_details(
    building_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full building structure including all 9 floors, rooms, and Deco nodes."""
    res = await db.execute(
        select(Building)
        .where(Building.id == building_id)
        .options(
            selectinload(Building.organization),
            selectinload(Building.floors).selectinload(Floor.rooms),
            selectinload(Building.floors).selectinload(Floor.nodes)
        )
    )
    bldg = res.scalar_one_or_none()
    if not bldg:
        raise HTTPException(status_code=404, detail="Building not found")

    target_univ = bldg.organization.university_id if bldg.organization else None
    await verify_tenant_isolation(current_user, target_univ, db)


    return {
        "id": bldg.id,
        "code": bldg.code,
        "name": bldg.name,
        "total_floors": bldg.total_floors,
        "is_pilot_building": bldg.is_pilot_building,
        "floors": [
            {
                "id": f.id,
                "floor_number": f.floor_number,
                "name": f.name,
                "elevation_meters": f.elevation_meters,
                "height_meters": f.height_meters,
                "is_l_shaped": f.is_l_shaped,
                "is_measured_pilot": f.is_measured_pilot,
                "slab_thickness_meters": f.slab_thickness_meters,
                "rooms": [
                    {
                        "id": r.id,
                        "room_number": r.room_number,
                        "name": r.name,
                        "wing": r.wing,
                        "side": r.side,
                        "capacity": r.capacity,
                        "pos_x": r.pos_x,
                        "pos_y": r.pos_y,
                        "pos_z": r.pos_z,
                        "width": r.width,
                        "height": r.height,
                        "depth": r.depth,
                        "current_occupancy": r.current_occupancy,
                        "signal_strength_dbm": r.signal_strength_dbm,
                        "is_occupied": r.is_occupied,
                        "activity_status": r.activity_status,
                        "confidence_score": r.confidence_score
                    }
                    for r in f.rooms
                ],
                "nodes": [
                    {
                        "id": n.id,
                        "name": n.node_name,
                        "hardware_type": n.hardware_type,
                        "model": n.model,
                        "mac_address": n.mac_address,
                        "ip_address": n.ip_address,
                        "band_ghz": n.band_ghz,
                        "channel": n.channel,
                        "tx_power_dbm": n.tx_power_dbm,
                        "coverage_radius_meters": n.coverage_radius_meters,
                        "pos_x": n.pos_x,
                        "pos_y": n.pos_y,
                        "pos_z": n.pos_z,
                        "status": n.status,
                        "is_simulated": n.is_simulated,
                        "notes": n.notes
                    }
                    for n in f.nodes
                ]
            }
            for f in sorted(bldg.floors, key=lambda x: x.floor_number)
        ]
    }


@router.post("/{building_id}/save-config")
async def save_building_configuration(
    building_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(require_role(["SUPER_ADMIN", "UNIVERSITY_ADMIN", "HOSTEL_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Persist updated building architectural configuration (rooms, node locations, dimensions)
    from the Building Editor to the relational database.
    """
    res = await db.execute(
        select(Building)
        .where(Building.id == building_id)
        .options(selectinload(Building.organization))
    )
    bldg = res.scalar_one_or_none()
    if not bldg:
        raise HTTPException(status_code=404, detail="Building not found")

    target_univ = bldg.organization.university_id if bldg.organization else None
    await verify_tenant_isolation(current_user, target_univ, db)


    # Update basic metadata if provided
    if "name" in payload:
        bldg.name = payload["name"]

    # Process floors and rooms updates if provided
    floors_data = payload.get("floors", [])
    for fl_data in floors_data:
        floor_num = fl_data.get("floor_number")
        if floor_num is None:
            continue
        fl_res = await db.execute(
            select(Floor).where(Floor.building_id == building_id, Floor.floor_number == floor_num)
        )
        fl = fl_res.scalar_one_or_none()
        if fl:
            if "name" in fl_data:
                fl.name = fl_data["name"]
            
            # Update rooms
            for rm_data in fl_data.get("rooms", []):
                rm_id = rm_data.get("id")
                if rm_id:
                    rm = await db.get(Room, rm_id)
                    if rm:
                        if "name" in rm_data: rm.name = rm_data["name"]
                        if "pos_x" in rm_data: rm.pos_x = rm_data["pos_x"]
                        if "pos_z" in rm_data: rm.pos_z = rm_data["pos_z"]
                        if "width" in rm_data: rm.width = rm_data["width"]
                        if "depth" in rm_data: rm.depth = rm_data["depth"]

            # Update nodes
            for nd_data in fl_data.get("nodes", []):
                nd_id = nd_data.get("id")
                if nd_id:
                    nd = await db.get(NetworkNode, nd_id)
                    if nd:
                        if "name" in nd_data: nd.node_name = nd_data["name"]
                        if "pos_x" in nd_data: nd.pos_x = nd_data["pos_x"]
                        if "pos_z" in nd_data: nd.pos_z = nd_data["pos_z"]
                        if "status" in nd_data: nd.status = nd_data["status"]

    db.add(AuditLog(
        university_id=current_user.university_id,
        actor_user_id=current_user.id,
        action="BUILDING_CONFIG_PERSISTED",
        resource_type="BUILDING",
        resource_id=building_id,
        status="SUCCESS"
    ))
    await db.commit()

    return {"message": "Building configuration successfully persisted to database", "status": "SAVED"}

