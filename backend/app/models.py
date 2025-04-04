from datetime import datetime
from pathlib import Path

import sqlalchemy as sa
from pydantic import EmailStr, computed_field
from sqlmodel import Field, Relationship, SQLModel


class TimestampMixin(SQLModel):
    created_at: datetime | None = Field(
        default=None,
        sa_type=sa.DateTime(timezone=True),
        sa_column_kwargs={"server_default": sa.func.now()},
        nullable=False,
    )

    updated_at: datetime | None = Field(
        default=None,
        sa_type=sa.DateTime(timezone=True),
        sa_column_kwargs={"server_default": sa.func.now(), "onupdate": sa.func.now()},
    )


class TableMixin(TimestampMixin):
    id: int | None = Field(default=None, primary_key=True)


class AccountTypeBase(SQLModel):
    name: str = Field(
        ...,
        unique=True,
        index=True,
        description="Account type, e.g., personal or work",
        schema_extra={"examples": ["personal", "work"]},
    )


class AccountType(TableMixin, AccountTypeBase, table=True):
    accounts: list["Account"] = Relationship(back_populates="account_type")

    __tablename__ = "account_type"


class AccountTypeCreate(AccountTypeBase):
    pass


class AccountTypeUpdate(AccountTypeBase):
    pass


class AccountTypePublic(AccountTypeBase):
    id: int


class AccountBase(SQLModel):
    name: str = Field(
        ...,
        unique=True,
        index=True,
        description="Name of the account for displaying in the UI",
        schema_extra={"examples": ["NourEldin Account", "My Account", "Open Source Account"]},
    )
    user_name: str = Field(
        ...,
        index=True,
        description="Name of the user associated with this account for git config",
        schema_extra={"examples": ["NourEldin", "John Doe", "Jane Smith"]},
    )
    user_email: EmailStr = Field(
        ...,
        index=True,
        description="Email address for the user associated with this account for git config",
        schema_extra={"examples": ["example_user@example_domain.com"]},
    )
    account_type_id: int = Field(
        ...,
        foreign_key="account_type.id",
        description="ID of the account type",
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


class Account(TableMixin, AccountBase, table=True):
    projects: list["Project"] = Relationship(back_populates="account")
    account_type: AccountType | None = Relationship(back_populates="accounts")


class AccountCreate(AccountBase):
    account_type_name: str | None = Field(
        default="personal", description="Name of the account type (e.g., 'personal', 'work')"
    )


class AccountPublic(AccountBase):
    id: int
    created_at: datetime
    updated_at: datetime
    account_type: AccountTypePublic | None = None

    @computed_field
    @property
    def ssh_key_filename(self) -> str | None:
        """Get the SSH key filename from the path"""
        if not self.ssh_key_path:
            return None
        return Path(self.ssh_key_path).name


class AccountUpdate(SQLModel):
    name: str | None = None
    account_type_id: int | None = None
    user_name: str | None = None
    user_email: EmailStr | None = None
    ssh_key_path: str | None = None
    public_key: str | None = None


class ProjectBase(SQLModel):
    path: str = Field(
        index=True,
        description="Local path to the Git repository",
        schema_extra={"examples": ["N:/Transcriber", "/path/to/repo"]},
    )
    name: str = Field(
        index=True,
        description="Name of the project",
        schema_extra={"examples": ["Transcriber", "backend-api"]},
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


class Project(TableMixin, ProjectBase, table=True):
    account: Account | None = Relationship(back_populates="projects")
    configured: bool = Field(default=False)


class ProjectCreate(ProjectBase):
    pass


class ProjectPublic(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    configured: bool


class ProjectUpdate(SQLModel):
    path: str | None = None
    name: str | None = None
    account_id: int | None = None


class ProjectPublicWithAccount(ProjectPublic):
    account: AccountPublic | None = None


class AccountPublicWithProjects(AccountPublic):
    projects: list[ProjectPublic] = []


class FolderResponse(SQLModel):
    status: str
    path: str | None = None
    message: str | None = None
