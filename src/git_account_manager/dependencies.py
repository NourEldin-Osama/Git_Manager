from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine

# Create database URL
PROJECT_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{PROJECT_DIR}/git_accounts.db"

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True to see SQL queries
    connect_args={"check_same_thread": False},  # Needed for SQLite
)


def init_db():
    """Initialize the database with all tables"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Dependency for getting database sessions"""
    with Session(engine) as session:
        yield session
