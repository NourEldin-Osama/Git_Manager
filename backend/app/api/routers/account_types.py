from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from sqlmodel import select

from app.api.dependencies import SessionDependency
from app.models import AccountType, AccountTypeCreate, AccountTypePublic, AccountTypeUpdate

router = APIRouter(prefix="/account-types", tags=["Account Types"])


@router.post(
    "",
    response_model=AccountTypePublic,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new account type",
    description="Creates a new account type for categorizing Git accounts.",
)
async def create_account_type(account_type: AccountTypeCreate, session: SessionDependency):
    try:
        # Check if account type already exists
        existing = session.exec(select(AccountType).where(AccountType.name == account_type.name)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Account type already exists")

        # Create new account type
        account_type_db = AccountType.model_validate(account_type)
        session.add(account_type_db)
        session.commit()
        session.refresh(account_type_db)
        return account_type_db
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "",
    response_model=list[AccountTypePublic],
    summary="List all account types",
    description="Retrieves a list of all account types.",
)
async def read_account_types(
    session: SessionDependency,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    return session.exec(select(AccountType).offset(offset).limit(limit)).all()


@router.get(
    "/{account_type_id}",
    response_model=AccountTypePublic,
    summary="Get a specific account type",
    description="Retrieves information about a specific account type.",
)
async def read_account_type(account_type_id: int, session: SessionDependency):
    account_type = session.get(AccountType, account_type_id)
    if not account_type:
        raise HTTPException(status_code=404, detail="Account type not found")
    return account_type


@router.patch(
    "/{account_type_id}",
    response_model=AccountTypePublic,
    summary="Update an account type",
    description="Updates an existing account type's information.",
)
async def update_account_type(account_type_id: int, account_type: AccountTypeUpdate, session: SessionDependency):
    account_type_db = session.get(AccountType, account_type_id)
    if not account_type_db:
        raise HTTPException(status_code=404, detail="Account type not found")
    account_type_data = account_type.model_dump(exclude_unset=True)
    account_type_db.sqlmodel_update(account_type_data)
    session.add(account_type_db)
    session.commit()
    session.refresh(account_type_db)
    return account_type_db


@router.delete(
    "/{account_type_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an account type",
    description="Deletes an account type if it's not associated with any accounts.",
)
async def delete_account_type(account_type_id: int, session: SessionDependency):
    account_type = session.get(AccountType, account_type_id)
    if not account_type:
        raise HTTPException(status_code=404, detail="Account type not found")

    # Check if there are associated accounts
    if account_type.accounts:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete account type. It is associated with {len(account_type.accounts)} account(s).",
        )

    session.delete(account_type)
    session.commit()
    return {"message": "Account type deleted successfully"}
