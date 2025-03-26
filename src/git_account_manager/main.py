from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .database import create_db_and_tables
from .routers import accounts, projects


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)
PROJECT_DIR = Path(__file__).resolve().parent
STATIC_DIR = PROJECT_DIR / "static"


app.include_router(accounts.router)
app.include_router(projects.router)

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
