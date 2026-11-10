import logging
from sqlalchemy import select, func
from app.core.database import engine, Base
from app.core.security import get_password_hash
from app.models.organization import University, Organization, Building, Floor, Room
from app.models.user import User, Role, UserRole
from app.models.consent import ConsentRecord
from app.models.network import NetworkNode, NetworkCabinet

logger = logging.getLogger("WiFiSense3D.InitDB")

ROLES_DATA = [
    ("SUPER_ADMIN", "Cross-university platform orchestrator with full administrative privileges"),
    ("UNIVERSITY_ADMIN", "Manages university campus infrastructure, buildings, and hostel administrators"),
    ("HOSTEL_ADMIN", "Manages building floors, rooms, router registrations, and local configurations"),
    ("RESEARCHER", "Accesses authorized research telemetry, algorithmic benchmarking, and CSI feature sets"),
    ("REGISTERED_PARTICIPANT", "Explicitly consents to indoor localization and controls personal tracking sessions"),
    ("GUEST", "Read-only public demonstrations and platform capability summaries")
]

async def init_database():
    """Initializes tables and seeds baseline hostel pilot data if empty."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema verified/created successfully.")

    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        # 1. Seed Roles
        for role_id, desc in ROLES_DATA:
            role = await session.get(Role, role_id)
            if not role:
                session.add(Role(id=role_id, description=desc))
        await session.commit()

        # 2. Ensure University & Building exist
        res = await session.execute(select(University).where(University.code == "APEX-UNIV"))
        univ = res.scalar_one_or_none()
        if not univ:
            univ = University(
                id="univ-tech-01",
                code="APEX-UNIV",
                name="Apex Institute of Technology & Science",
                country="India",
                state="Karnataka",
                city="Bengaluru"
            )
            session.add(univ)
            await session.commit()

        org_res = await session.execute(select(Organization).where(Organization.id == "org-res-01"))
        org = org_res.scalar_one_or_none()
        if not org:
            org = Organization(
                id="org-res-01",
                university_id=univ.id,
                name="Hostel Administration & Student Housing",
                type="RESIDENTIAL_HOSTELS"
            )
            session.add(org)
            await session.commit()

        bldg_res = await session.execute(select(Building).where(Building.id == "hostel-block-alpha"))
        bldg = bldg_res.scalar_one_or_none()
        if not bldg:
            bldg = Building(
                id="hostel-block-alpha",
                organization_id=org.id,
                code="HOSTEL-BLOCK-ALPHA",
                name="Hostel Block Alpha (Pilot Facility)",
                total_floors=9,
                is_pilot_building=True,
                local_origin_latitude=12.9716,
                local_origin_longitude=77.5946
            )
            session.add(bldg)
            await session.commit()

        # 3. Check and seed Floors if missing
        floor_cnt = (await session.execute(select(func.count(Floor.id)).where(Floor.building_id == bldg.id))).scalar_one()
        if floor_cnt == 0:
            floor_height = 3.4
            slab_thick = 0.35
            corridor_width = 2.4
            room_depth = 4.2
            room_width = 4.0
            room_height = 2.9

            for f in range(1, 10):
                is_first = (f == 1)
                elevation_y = (f - 1) * floor_height
                fl_name = "Floor 1 (Ground / Pilot Measured)" if is_first else f"Floor {f} (Configurable Prototype)"
                
                floor = Floor(
                    id=f"floor-{f}",
                    building_id=bldg.id,
                    floor_number=f,
                    name=fl_name,
                    elevation_meters=elevation_y,
                    height_meters=floor_height,
                    is_l_shaped=True,
                    is_measured_pilot=is_first,
                    slab_thickness_meters=slab_thick
                )
                session.add(floor)
                await session.flush()

                # Long wing (+Z North side)
                for i in range(6):
                    r_num = f"{f}0{i + 1}"
                    pos_x = 4.5 + i * 4.2
                    pos_z = corridor_width / 2 + room_depth / 2
                    session.add(Room(
                        id=f"room-{f}-{r_num}",
                        floor_id=floor.id,
                        room_number=r_num,
                        name=f"Room {r_num}",
                        wing="long-wing",
                        side="left",
                        capacity=2,
                        pos_x=pos_x,
                        pos_y=elevation_y + room_height / 2 + slab_thick,
                        pos_z=pos_z,
                        width=room_width,
                        height=room_height,
                        depth=room_depth,
                        current_occupancy=2 if (f + i) % 3 == 0 else (1 if (f + i) % 2 == 0 else 0),
                        signal_strength_dbm=-52.0 - (i * 3) - ((f - 1) * 2),
                        is_occupied=(f + i) % 2 == 0,
                        activity_status="stationary" if (f + i) % 3 == 0 else ("walking" if (f + i) % 2 == 0 else "unoccupied"),
                        confidence_score=0.88
                    ))

                # Long wing (-Z South side)
                for i in range(6):
                    r_num = f"{f}{i + 7:02d}"
                    pos_x = 4.5 + i * 4.2
                    pos_z = -(corridor_width / 2 + room_depth / 2)
                    session.add(Room(
                        id=f"room-{f}-{r_num}",
                        floor_id=floor.id,
                        room_number=r_num,
                        name=f"Room {r_num}",
                        wing="long-wing",
                        side="right",
                        capacity=2,
                        pos_x=pos_x,
                        pos_y=elevation_y + room_height / 2 + slab_thick,
                        pos_z=pos_z,
                        width=room_width,
                        height=room_height,
                        depth=room_depth,
                        current_occupancy=1 if (f + i * 2) % 3 == 0 else 0,
                        signal_strength_dbm=-55.0 - (i * 3) - ((f - 1) * 2),
                        is_occupied=(f + i * 2) % 3 == 0,
                        activity_status="sitting" if (f + i * 2) % 3 == 0 else "unoccupied",
                        confidence_score=0.86
                    ))

                # Short wing (+X East side)
                for i in range(4):
                    r_num = f"{f}{13 + i}"
                    pos_x = corridor_width / 2 + room_depth / 2
                    pos_z = 4.5 + i * 4.2
                    session.add(Room(
                        id=f"room-{f}-{r_num}",
                        floor_id=floor.id,
                        room_number=r_num,
                        name=f"Room {r_num}",
                        wing="short-wing",
                        side="left",
                        capacity=2,
                        pos_x=pos_x,
                        pos_y=elevation_y + room_height / 2 + slab_thick,
                        pos_z=pos_z,
                        width=room_depth,
                        height=room_height,
                        depth=room_width,
                        current_occupancy=2 if (f + i) % 4 == 0 else 0,
                        signal_strength_dbm=-58.0 - (i * 4),
                        is_occupied=(f + i) % 4 == 0,
                        activity_status="standing" if (f + i) % 4 == 0 else "unoccupied",
                        confidence_score=0.82
                    ))

                # Short wing (-X West side)
                for i in range(4):
                    r_num = f"{f}{17 + i}"
                    pos_x = -(corridor_width / 2 + room_depth / 2)
                    pos_z = 4.5 + i * 4.2
                    session.add(Room(
                        id=f"room-{f}-{r_num}",
                        floor_id=floor.id,
                        room_number=r_num,
                        name=f"Room {r_num}",
                        wing="short-wing",
                        side="right",
                        capacity=2,
                        pos_x=pos_x,
                        pos_y=elevation_y + room_height / 2 + slab_thick,
                        pos_z=pos_z,
                        width=room_depth,
                        height=room_height,
                        depth=room_width,
                        current_occupancy=1 if (f + i + 1) % 3 == 0 else 0,
                        signal_strength_dbm=-60.0 - (i * 3),
                        is_occupied=(f + i + 1) % 3 == 0,
                        activity_status="walking" if (f + i + 1) % 3 == 0 else "unoccupied",
                        confidence_score=0.81
                    ))

                # Seed Deco Nodes
                if is_first:
                    session.add(NetworkNode(
                        id="node-1-junction",
                        floor_id=floor.id,
                        node_name="Deco-F1-01 (L-Junction Turning Point)",
                        hardware_type="TPLINK_DECO",
                        model="TP-Link Deco X50",
                        mac_address="98:48:27:A1:42:01",
                        ip_address="192.168.68.101",
                        band_ghz=2.4,
                        channel=6,
                        tx_power_dbm=20.0,
                        coverage_radius_meters=14.0,
                        pos_x=1.5,
                        pos_y=elevation_y + 2.4,
                        pos_z=1.5,
                        status="ONLINE",
                        is_simulated=True,
                        notes="Primary anchor node at L-junction beside elevator core"
                    ))
                    session.add(NetworkNode(
                        id="node-1-farend",
                        floor_id=floor.id,
                        node_name="Deco-F1-02 (Far End Long Corridor)",
                        hardware_type="TPLINK_DECO",
                        model="TP-Link Deco X50",
                        mac_address="98:48:27:A1:42:02",
                        ip_address="192.168.68.102",
                        band_ghz=5.0,
                        channel=11,
                        tx_power_dbm=23.0,
                        coverage_radius_meters=16.0,
                        pos_x=26.0,
                        pos_y=elevation_y + 2.4,
                        pos_z=0.0,
                        status="ONLINE",
                        is_simulated=True,
                        notes="Far-end anchor node serving rooms 106, 112"
                    ))
                    session.add(NetworkCabinet(
                        id="cabinet-f1",
                        floor_id=floor.id,
                        name="First-Floor Core Network Cabinet",
                        pos_x=1.2,
                        pos_y=elevation_y + 1.2,
                        pos_z=-3.2,
                        fiber_backhaul_capacity_gbps=10.0
                    ))
                else:
                    session.add(NetworkNode(
                        id=f"node-{f}-junction",
                        floor_id=floor.id,
                        node_name=f"Deco-F{f}-01 (Junction Node)",
                        hardware_type="TPLINK_DECO",
                        model="TP-Link Deco X50",
                        mac_address=f"98:48:27:A{f}:10:01",
                        ip_address=f"192.168.68.{f}01",
                        band_ghz=2.4 if f % 2 == 1 else 5.0,
                        channel=(f % 3) * 5 + 1,
                        tx_power_dbm=20.0,
                        coverage_radius_meters=14.0,
                        pos_x=1.5,
                        pos_y=elevation_y + 2.4,
                        pos_z=1.5,
                        status="ONLINE",
                        is_simulated=True
                    ))
                    session.add(NetworkNode(
                        id=f"node-{f}-farend",
                        floor_id=floor.id,
                        node_name=f"Deco-F{f}-02 (Far End Node)",
                        hardware_type="TPLINK_DECO",
                        model="TP-Link Deco X50",
                        mac_address=f"98:48:27:A{f}:10:02",
                        ip_address=f"192.168.68.{f}02",
                        band_ghz=5.0,
                        channel=36,
                        tx_power_dbm=23.0,
                        coverage_radius_meters=15.0,
                        pos_x=26.0,
                        pos_y=elevation_y + 2.4,
                        pos_z=0.0,
                        status="ONLINE",
                        is_simulated=True
                    ))
            await session.commit()

        # 4. Check and seed Users if missing
        user_cnt = (await session.execute(select(func.count(User.id)))).scalar_one()
        if user_cnt == 0:
            default_users = [
                ("usr-super-01", "director.research@wifisense3d.org", "SUPER_ADMIN", "Dr. Vikram Malhotra", "SuperAdmin@123"),
                ("usr-univ-01", "admin.infra@apexuniv.edu.in", "UNIVERSITY_ADMIN", "Prof. Ananya Sen", "UnivAdmin@123"),
                ("usr-hostel-01", "warden.blocka@apexuniv.edu.in", "HOSTEL_ADMIN", "Ramesh K. Sharma (Warden)", "HostelAdmin@123"),
                ("usr-res-01", "researcher.rf@apexuniv.edu.in", "RESEARCHER", "Dr. Siddharth Rao", "Researcher@123"),
                ("usr-part-01", "aravind.patel@student.apexuniv.edu.in", "REGISTERED_PARTICIPANT", "Aravind Patel", "Student@123"),
                ("usr-guest-01", "guest.visitor@wifisense3d.org", "GUEST", "Public Academic Visitor", "Guest@123"),
            ]

            for u_id, email, role_id, full_name, raw_pwd in default_users:
                u = User(
                    id=u_id,
                    university_id=univ.id,
                    email=email,
                    password_hash=get_password_hash(raw_pwd),
                    full_name=full_name,
                    assigned_building_id=bldg.id,
                    is_active=True,
                    is_verified=True
                )
                session.add(u)
                session.add(UserRole(user_id=u_id, role_id=role_id))
                
                if role_id == "REGISTERED_PARTICIPANT":
                    session.add(ConsentRecord(
                        id="consent-aravind-01",
                        user_id=u_id,
                        notice_version="2026-v1",
                        purpose="Academic indoor spatial sensing and emergency beacon research inside Hostel Block Alpha.",
                        legal_basis="India DPDP Act 2023 Section 6",
                        is_currently_active=True,
                        retention_period_days=30
                    ))

            await session.commit()
            logger.info("Hostel Block Alpha (9 Floors, 180+ Rooms, Deco Nodes, Users) successfully seeded.")
