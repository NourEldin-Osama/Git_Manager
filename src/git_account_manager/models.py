from datetime import UTC, datetime
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel


class Account_Type(str, Enum):
    PERSONAL = "personal"
    WORK = "work"


def get_current_time():
    return datetime.now(UTC)


class GitAccount(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    email: str | None = Field(default=None, index=True)
    account_type: Account_Type = Field(default=Account_Type.PERSONAL)
    ssh_key_path: str | None = Field(default=None, index=True)
    pub_key: str | None = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=get_current_time)
    updated_at: datetime = Field(default_factory=get_current_time)
    projects: list["Project"] = Relationship(back_populates="account")


class Project(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    path: str = Field(index=True)
    name: str = Field(index=True)
    account_id: int | None = Field(default=None, foreign_key="gitaccount.id")
    account: GitAccount | None = Relationship(back_populates="projects")
    created_at: datetime = Field(default_factory=get_current_time)
    updated_at: datetime = Field(default_factory=get_current_time)
