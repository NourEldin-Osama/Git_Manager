from fastapi import APIRouter

from app.api.routers import accounts, folder_select, projects

api_router = APIRouter()
# Routers
api_router.include_router(accounts.router)
api_router.include_router(projects.router)
api_router.include_router(folder_select.router)
