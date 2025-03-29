from datetime import UTC, datetime
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel


class Account_Type(str, Enum):
    PERSONAL = "personal"
    WORK = "work"


def get_current_time():
    return datetime.now(UTC)


class AccountBase(SQLModel):
    name: str = Field(
        index=True,
        description="Name of the Git account",
        schema_extra={"examples": ["NourEldin", "John Doe", "Jane Smith", "Ali Ahmed"]},
    )
    email: str | None = Field(
        default=None,
        index=True,
        description="Email associated with the Git account",
        schema_extra={"examples": ["noureldin@gmail.com", "john.doe@example.com", "jane.smith@example.com"]},
    )
    account_type: Account_Type = Field(
        default=Account_Type.PERSONAL,
        description="Type of account (personal/work)",
        schema_extra={"examples": ["work", "personal"]},
    )
    ssh_key_path: str | None = Field(
        default=None,
        index=True,
        description="Path to the SSH private key",
    )
    public_key: str | None = Field(
        default=None,
        index=True,
        description="SSH public key content",
    )


class Account(AccountBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=get_current_time)
    updated_at: datetime = Field(default_factory=get_current_time)
    projects: list["Project"] = Relationship(back_populates="account")


class AccountCreate(AccountBase):
    pass


class AccountPublic(AccountBase):
    id: int
    created_at: datetime
    updated_at: datetime


class AccountUpdate(SQLModel):
    name: str | None = None
    email: str | None = None
    account_type: Account_Type | None = None
    ssh_key_path: str | None = None
    public_key: str | None = None


class ProjectBase(SQLModel):
    path: str = Field(
        index=True,
        description="Local path to the Git repository",
        schema_extra={"examples": ["N:/Transcriber", "/path/to/repo"]},
    )
    name: str = Field(
        index=True, description="Name of the project", schema_extra={"examples": ["Transcriber", "backend-api"]}
    )
    account_id: int | None = Field(
        default=None,
        foreign_key="account.id",
        description="ID of the associated Git account",
        schema_extra={"examples": [1, 2]},
    )
    remote_url: str | None = Field(
        default=None,
        index=True,
        description="Git remote repository URL",
        schema_extra={"examples": ["git@github.com:username/my-project.git"]},
    )
    remote_name: str | None = Field(
        default=None,
        index=True,
        description="Name of the Git remote",
        schema_extra={"examples": ["origin", "upstream", "github"]},
    )


class Project(ProjectBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=get_current_time)
    updated_at: datetime = Field(default_factory=get_current_time)
    account: Account | None = Relationship(back_populates="projects")
    configured: bool = Field(default=False)


class ProjectCreate(ProjectBase):
    pass


class ProjectPublic(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime


class ProjectUpdate(SQLModel):
    path: str | None = None
    name: str | None = None
    account_id: int | None = None


class ProjectPublicWithAccount(ProjectPublic):
    account: AccountPublic | None = None


class AccountPublicWithProjects(AccountPublic):
    projects: list[ProjectPublic] = []
