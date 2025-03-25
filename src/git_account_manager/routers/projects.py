from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import select

from ..dependencies import SessionDependency
from ..models import (
    Account,
    Project,
    ProjectCreate,
    ProjectPublic,
    ProjectPublicWithAccount,
    ProjectUpdate,
)
from ..services import configure_project, validate_project_configuration

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectPublic)
async def create_project(project: ProjectCreate, session: SessionDependency):
    try:
        # Validate account exists
        account = session.get(Account, project.account_id)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        # Create and configure project
        project_db = Project.model_validate(project)
        project_db = configure_project(project_db, account)
        session.add(project_db)
        session.commit()
        session.refresh(project_db)
        return project_db
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=list[ProjectPublic])
async def read_projects(
    session: SessionDependency,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    projects = session.exec(select(Project).offset(offset).limit(limit)).all()
    return projects


@router.get("/{project_id}", response_model=ProjectPublicWithAccount)
async def read_project(project_id: int, session: SessionDependency):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectPublic)
async def update_project(project_id: int, project: ProjectUpdate, session: SessionDependency):
    project_db = session.get(Project, project_id)
    if not project_db:
        raise HTTPException(status_code=404, detail="Project not found")
    project_data = project.model_dump(exclude_unset=True)
    project_db.sqlmodel_update(project_data)
    session.add(project_db)
    session.commit()
    session.refresh(project_db)
    return project_db


@router.delete("/{project_id}")
async def delete_project(project_id: int, session: SessionDependency):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()
    return {"message": "Project deleted successfully"}


# an endpoint to validate a project is configured correctly
@router.get("/validate/{project_id}")
async def validate_project(project_id: int, session: SessionDependency):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.configured:
        raise HTTPException(status_code=400, detail="Project is not configured")
    # Validate the project configuration
    try:
        validate_project_configuration(project)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Project is configured correctly"}
