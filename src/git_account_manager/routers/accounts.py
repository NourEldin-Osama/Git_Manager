from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import select

from ..dependencies import SessionDependency
from ..models import (
    Account,
    AccountCreate,
    AccountPublic,
    AccountPublicWithProjects,
    AccountUpdate,
)
from ..services import create_git_account, list_accounts_ssh_config

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.post("", response_model=AccountPublic)
async def create_account(account: AccountCreate, session: SessionDependency):
    try:
        account_db = Account.model_validate(account)

        # Check if account already exists
        existing = session.exec(
            select(Account).where(Account.name == account_db.name, Account.email == account_db.email)
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Account already exists")

        ssh_key_path, public_key = create_git_account(account_db)
        account_db.ssh_key_path = ssh_key_path
        account_db.public_key = public_key
        session.add(account_db)
        session.commit()
        session.refresh(account_db)
        return account_db
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=list[AccountPublic])
async def read_accounts(
    session: SessionDependency,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    return session.exec(select(Account).offset(offset).limit(limit)).all()


@router.get("/{account_id}", response_model=AccountPublicWithProjects)
async def read_account(account_id: int, session: SessionDependency):
    account = session.get(Account, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.patch("/{account_id}", response_model=AccountPublic)
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


@router.delete("/{account_id}")
async def delete_account(account_id: int, session: SessionDependency):
    account = session.get(Account, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    session.delete(account)
    session.commit()
    return {"message": "Account deleted successfully"}


@router.post("/sync-ssh-config")
async def sync_ssh_config(session: SessionDependency):
    try:
        accounts = list_accounts_ssh_config(session)
        return {"message": "SSH config synchronized with database", "accounts": accounts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
