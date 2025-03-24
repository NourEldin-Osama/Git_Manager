from pathlib import Path

from sqlmodel import SQLModel, create_engine

# Create database URL
PROJECT_DIR = Path(__file__).resolve().parent

sqlite_file_name = f"{PROJECT_DIR}/git_accounts.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(
    sqlite_url,
    echo=False,  # Set to True to see SQL queries
    connect_args={"check_same_thread": False},  # Needed for SQLite
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
