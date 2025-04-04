from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from sqlmodel import or_, select

from app.api.dependencies import SessionDependency
from app.models import (
    Account,
    AccountCreate,
    AccountPublic,
    AccountPublicWithProjects,
    AccountType,
    AccountUpdate,
)
from app.utils.services import create_git_account, list_accounts_ssh_config
from app.utils.ssh_manager import delete_ssh_key

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.post(
    "",
    response_model=AccountPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Git account",
    description="""
    Creates a new Git account with the following steps:
    1. Validates that the account doesn't already exist
    2. Creates or gets associated AccountType
    3. Generates SSH key pair for the account
    4. Configures SSH settings
    5. Stores account information in the database
    """,
)
async def create_account(account: AccountCreate, session: SessionDependency):
    try:
        # Check if account already exists
        existing = session.exec(
            select(Account).where(or_(Account.name == account.name, Account.user_email == account.user_email))
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Account already exists")

        # Create account
        account_db = Account.model_validate(account)

        # Get the account type
        account_type = session.get(AccountType, account.account_type_id)
        if not account_type:
            raise HTTPException(status_code=400, detail="Account type not found")
        account_db.account_type = account_type

        # Now create the account with SSH key
        ssh_key_path, public_key = create_git_account(account_db)
        account_db.ssh_key_path = ssh_key_path
        account_db.public_key = public_key
        session.add(account_db)
        session.commit()
        session.refresh(account_db)
        return account_db
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "",
    response_model=list[AccountPublic],
    summary="List all Git accounts",
    description="Retrieves a list of all Git accounts with pagination support.",
)
async def read_accounts(
    session: SessionDependency,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    return session.exec(select(Account).offset(offset).limit(limit)).all()


@router.get(
    "/{account_id}",
    response_model=AccountPublicWithProjects,
    summary="Get a specific Git account",
    description="Retrieves detailed information about a specific Git account including associated projects.",
)
async def read_account(account_id: int, session: SessionDependency):
    account = session.get(Account, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.patch(
    "/{account_id}",
    response_model=AccountPublic,
    summary="Update a Git account",
    description="""
    Updates an existing Git account's information.
    Only provided fields will be updated.
    """,
)
async def update_account(account_id: int, account: AccountUpdate, session: SessionDependency):
    account_db = session.get(Account, account_id)
    if not account_db:
        raise HTTPException(status_code=404, detail="Account not found")
    account_data = account.model_dump(exclude_unset=True)
    account_db.sqlmodel_update(account_data)
    session.add(account_db)
    session.commit()
    session.refresh(account_db)
    return account_db


@router.delete(
    "/{account_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a Git account",
    description="Deletes a Git account and its associated SSH keys and configuration.",
)
async def delete_account(account_id: int, session: SessionDependency):
    account = session.get(Account, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # Delete SSH keys if they exist
    if account.ssh_key_path:
        try:
            delete_ssh_key(account.ssh_key_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting SSH keys: {e}")

    session.delete(account)
    session.commit()
    return {"message": "Account deleted successfully"}


@router.post(
    "/sync-ssh-config",
    summary="Synchronize SSH configuration",
    description="""
    Synchronizes the SSH configuration with the database by:
    1. Reading the current SSH config file
    2. Updating account information in the database
    3. Ensuring SSH configurations are up to date
    """,
)
async def sync_ssh_config(session: SessionDependency):
    try:
        accounts = list_accounts_ssh_config(session)
        return {"message": "SSH config synchronized with database", "accounts": accounts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
