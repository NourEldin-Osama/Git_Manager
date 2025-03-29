from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.core.database import engine


def get_session():
    """Dependency for getting database sessions"""
    with Session(engine) as session:
        yield session


SessionDependency = Annotated[Session, Depends(get_session)]
