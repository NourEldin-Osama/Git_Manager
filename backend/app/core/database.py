from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine, select

from app.models import AccountType

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
    create_default_account_types()


def create_default_account_types():
    with Session(engine) as session:
        # Check if any Account Type exists
        existing = session.exec(select(AccountType)).first()
        if existing is None:
            # Pre-fill with default account types
            session.add(AccountType(name="personal"))
            session.add(AccountType(name="work"))
            session.commit()
