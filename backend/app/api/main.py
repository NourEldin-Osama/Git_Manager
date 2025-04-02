from fastapi import APIRouter

from app.api.routers import account_types, accounts, projects, system, utils

api_router = APIRouter()
# Routers
api_router.include_router(account_types.router)
api_router.include_router(accounts.router)
api_router.include_router(projects.router)
api_router.include_router(system.router)
api_router.include_router(utils.router)
