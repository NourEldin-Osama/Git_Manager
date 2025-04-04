from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.main import api_router
from app.core.database import create_db_and_tables

from . import __version__

prefix = "/api"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="Git Account Manager API",
    description="""
    A tool to manage multiple Git accounts and projects.

    Features:
    - Manage multiple Git accounts (personal/work)
    - Configure SSH keys for different accounts
    - Associate Git projects with specific accounts
    - Synchronize SSH configurations
    """,
    version=__version__,
    contact={
        "name": "NourEldin",
        "email": "noureldin.osama.saad@gmail.com",
    },
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=prefix)

# Set the static directory to serve frontend files
STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"


app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
