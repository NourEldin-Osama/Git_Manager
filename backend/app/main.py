from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from . import __version__
from .database import create_db_and_tables
from .routers import accounts, folder_select, projects


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

# Set the static directory to serve frontend files
STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"


app.include_router(accounts.router)
app.include_router(projects.router)
app.include_router(folder_select.router)

app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")


def main() -> None:
    """Start the FastAPI application server.

    This function initializes and starts the FastAPI server with the following configuration:
    - Host: 127.0.0.1 (localhost)
    - Port: 8000
    """
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)


if __name__ == "__main__":
    main()
