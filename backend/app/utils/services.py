from pathlib import Path

from sqlmodel import Session, select

from app.models import Account, AccountType, Project
from app.utils.git_manager import GitManager
from app.utils.ssh_manager import SSH_CONFIG_PATH, generate_ssh_key, read_public_key, update_ssh_config


def get_or_create_account_type(session: Session, account_type_name: str) -> AccountType:
    """
    Get an existing account type by name or create a new one if it doesn't exist.

    Args:
        session: Database session
        account_type_name: Name of the account type to get or create

    Returns:
        The AccountType object (either existing or newly created)
    """
    account_type_object = session.exec(select(AccountType).where(AccountType.name == account_type_name)).first()

    if not account_type_object:
        account_type_object = AccountType(name=account_type_name)
        session.add(account_type_object)
        session.commit()
        session.refresh(account_type_object)

    return account_type_object


def create_git_account(account: Account, overwrite: bool = False) -> tuple[str, str]:
    # Get the account type
    account_type = account.account_type.name
    # Generate SSH key
    key_path = generate_ssh_key(account.name, account.user_email, account_type, overwrite)
    ssh_key_path = str(key_path)

    # Read public key
    public_key, _ = read_public_key(key_path)

    # Update SSH config
    update_ssh_config(account.name, account_type, key_path)

    return ssh_key_path, public_key


def list_accounts_ssh_config(session: Session) -> list[dict]:
    accounts = []
    current_host = None
    account_type = None
    current_email = None

    with open(SSH_CONFIG_PATH) as file:
        for line in file:
            line = line.strip()
            if line.startswith("Host "):
                current_host = line.split()[1]
                if current_host.startswith("github-"):
                    current_host = current_host[7:]  # Remove "github-" prefix
                if "-" in current_host:
                    account_type = current_host.split("-")[-1]
                    current_host = "-".join(current_host.split("-")[:-1])
                else:
                    account_type = "personal"
            elif line.startswith("IdentityFile ") and current_host:
                identity_file = Path(line.split(None, 1)[1].strip()).expanduser()

                try:
                    public_key_content, current_email = read_public_key(identity_file)
                except Exception:
                    public_key_content, current_email = None, None

                existing = session.exec(select(Account).where(Account.name == current_host)).first()

                if not existing and current_email:
                    # Get or create account type
                    account_type_object = get_or_create_account_type(session, account_type)

                    # Create account with user and account type
                    new_account = Account(
                        name=current_host,
                        user_name=current_host,
                        user_email=current_email,
                        ssh_key_path=str(identity_file),
                        public_key=public_key_content,
                        account_type_id=account_type_object.id,
                    )
                    session.add(new_account)
                    session.commit()
                    session.refresh(new_account)

                accounts.append(
                    {
                        "host": current_host,
                        "identity_file": str(identity_file),
                        "email": current_email,
                        "type": account_type,
                    }
                )
                current_host = None
                current_email = None
                account_type = None

    return accounts


def validate_project_path(project_path: Path) -> None:
    """Validate the project path is a valid git repository."""
    if not GitManager.validate_git_repo(project_path):
        raise ValueError(f"Invalid Git repository: {project_path}")


def get_remote_info(path: Path, project: Project) -> tuple[str, str]:
    """Get or validate remote URL and name for a project."""
    existing_remote = False
    # Get current remote URL and name
    remote_info = GitManager.get_remote_url(path)
    if remote_info:
        remote_url, remote_name = remote_info
        existing_remote = True
    else:
        # If no remote URL is found, use the project remote URL and name
        remote_url = project.remote_url
        remote_name = project.remote_name or "origin"

    if not remote_url or not remote_name:
        raise ValueError(f"No remote URL or remote name found for project: {path}")

    # Remove existing remote if it exists
    if existing_remote:
        GitManager.remove_remote(path, remote_name)

    return remote_url, remote_name


def validate_remote_url_and_path(remote_url: str) -> str:
    """Validate remote URL and get repository path."""
    # Validate remote URL
    if not GitManager.validate_remote_url(remote_url):
        raise ValueError(f"Invalid remote URL: {remote_url}")

    # Get repo path from URL
    repo_path = GitManager.get_repo_path(remote_url)
    if not repo_path:
        raise ValueError(f"Invalid repository path in URL: {remote_url}")
    # Validate repo path
    if not GitManager.validate_repo_path(repo_path):
        raise ValueError(f"Invalid repository path: {repo_path}")

    return repo_path


def configure_project(project: Project, account: Account) -> Project:
    """Configure a project to use specific git account."""
    path = Path(project.path).expanduser()
    validate_project_path(path)

    remote_url, remote_name = get_remote_info(path, project)
    repo_path = validate_remote_url_and_path(remote_url)
    account_type = account.account_type.name

    # Construct new SSH URL using SSH config host
    new_remote_url = f"git@github-{account.name}-{account_type}:{repo_path}.git"

    print(
        f"Configuring project {project.name},\n"
        f"with remote URL: {remote_url},\n"
        f"New remote URL: {new_remote_url},\n"
        f"remote name: {remote_name},\n"
        f"account: {account.name}, account type: {account_type},\n"
        f"email: {account.user_email}, name: {account.name},\n"
        f"SSH key path: {account.ssh_key_path},\n"
        f"public key: {account.public_key}"
    )
    # Add remote URL
    success = GitManager.add_remote(path, remote_name, new_remote_url)
    if not success:
        raise ValueError(f"Failed to update remote URL for project: {path}")

    # Update project with new URL
    project.remote_url = new_remote_url
    project.remote_name = remote_name

    # Check account name and email
    if not account.name or not account.user_email:
        raise ValueError("Account name and email must be set")

    # Set Git user config for the project
    if not GitManager.set_user_config(path, account.name, account.user_email):
        raise ValueError(f"Failed to set Git user config for project: {path}")

    # Update project in database
    project.configured = True
    return project


def validate_project_configuration(project: Project) -> None:
    """Validate the project configuration."""
    if not project.configured:
        raise ValueError("Project is not configured")
    if not project.remote_url:
        raise ValueError("Project remote URL is not set")
    if not project.remote_name:
        raise ValueError("Project remote name is not set")
    if not project.account_id:
        raise ValueError("Project account is not set")

    path = Path(project.path).expanduser()
    host = project.remote_url.split(":")[0]

    if not GitManager.validate_ssh_connection(path=path, host=host):
        raise ValueError(f"SSH connection to {host} failed")
