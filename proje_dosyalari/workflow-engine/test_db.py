#!/usr/bin/env python3
import asyncio
import uuid
from datetime import datetime

from sqlalchemy.future import select

# Adjust imports based on actual project structure
from src.database import get_db, engine, AsyncSessionLocal
from src.models.db_models import Base, WorkflowDefinitionDB, WorkflowRunDB
from src.models.workflow import WorkflowDefinition, WorkflowRun, Node, Edge, NodeType, WorkflowStatus, NodeStatus

async def test_database_operations():
    print("Starting database test...")

    # Create tables (usually done by Alembic, but good for isolated test)
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.drop_all) # Optional: Clean slate
    #     await conn.run_sync(Base.metadata.create_all)
    # print("Tables created (if they didn't exist).")

    async with AsyncSessionLocal() as session:
        print("Session created.")

        # 1. Create Workflow Definition
        test_def_id = f"test_wf_{uuid.uuid4()}"
        pydantic_node = Node(id="node1", type=NodeType.TRIGGER, piece_type="manual_trigger", config={})
        pydantic_edge = Edge(id="edge1", source_node_id="node1", target_node_id="node2") # Assuming node2 exists for structure

        db_def = WorkflowDefinitionDB(
            id=test_def_id,
            name="Test Workflow",
            description="A workflow for testing DB operations",
            nodes=[pydantic_node.model_dump()], # Store Pydantic model as dict/JSON
            edges=[pydantic_edge.model_dump()],
            version=1
        )
        session.add(db_def)
        await session.commit()
        await session.refresh(db_def)
        print(f"Created WorkflowDefinitionDB: ID={db_def.id}, Name={db_def.name}")

        # 2. Read Workflow Definition
        stmt = select(WorkflowDefinitionDB).where(WorkflowDefinitionDB.id == test_def_id)
        result = await session.execute(stmt)
        read_def = result.scalar_one_or_none()
        if read_def:
            print(f"Read WorkflowDefinitionDB: ID={read_def.id}, Nodes={read_def.nodes}")
            assert read_def.name == "Test Workflow"
        else:
            print(f"Error: Could not read WorkflowDefinitionDB with ID={test_def_id}")
            return

        # 3. Create Workflow Run
        test_run_id = f"test_run_{uuid.uuid4()}"
        db_run = WorkflowRunDB(
            id=test_run_id,
            workflow_id=test_def_id,
            workflow_version=read_def.version,
            status=WorkflowStatus.IDLE,
            node_states={"node1": NodeStatus.PENDING},
            node_outputs={}
        )
        session.add(db_run)
        await session.commit()
        await session.refresh(db_run)
        print(f"Created WorkflowRunDB: ID={db_run.id}, Status={db_run.status}")

        # 4. Read Workflow Run
        stmt_run = select(WorkflowRunDB).where(WorkflowRunDB.id == test_run_id)
        result_run = await session.execute(stmt_run)
        read_run = result_run.scalar_one_or_none()
        if read_run:
            print(f"Read WorkflowRunDB: ID={read_run.id}, Status={read_run.status}")
            assert read_run.workflow_id == test_def_id
        else:
            print(f"Error: Could not read WorkflowRunDB with ID={test_run_id}")
            return

        # 5. Update Workflow Run Status
        read_run.status = WorkflowStatus.RUNNING
        read_run.start_time = datetime.utcnow()
        await session.commit()
        await session.refresh(read_run)
        print(f"Updated WorkflowRunDB: ID={read_run.id}, New Status={read_run.status}")

        # Verify update
        result_run_updated = await session.execute(stmt_run)
        read_run_updated = result_run_updated.scalar_one()
        assert read_run_updated.status == WorkflowStatus.RUNNING
        print("Update verified.")

        # 6. Delete Records (Clean up)
        await session.delete(read_run)
        await session.delete(read_def)
        await session.commit()
        print(f"Deleted test records for Workflow ID={test_def_id} and Run ID={test_run_id}")

        # Verify deletion
        result_def_deleted = await session.execute(select(WorkflowDefinitionDB).where(WorkflowDefinitionDB.id == test_def_id))
        assert result_def_deleted.scalar_one_or_none() is None
        result_run_deleted = await session.execute(select(WorkflowRunDB).where(WorkflowRunDB.id == test_run_id))
        assert result_run_deleted.scalar_one_or_none() is None
        print("Deletion verified.")

    print("Database test completed successfully!")

if __name__ == "__main__":
    # Ensure the DB file exists (Alembic should have created it)
    # If running standalone, might need to create tables first
    asyncio.run(test_database_operations())

