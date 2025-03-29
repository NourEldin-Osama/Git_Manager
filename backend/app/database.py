from pathlib import Path

from sqlmodel import SQLModel, create_engine

# Create database URL in user's home directory (.git-account-manager)
USER_HOME = Path.home()
APP_DATA_DIR = USER_HOME / ".git-account-manager"
APP_DATA_DIR.mkdir(exist_ok=True)

sqlite_file_name = APP_DATA_DIR / "git_accounts.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(
    sqlite_url,
    echo=False,  # Set to True to see SQL queries in console
    connect_args={"check_same_thread": False},  # Needed for SQLite
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
