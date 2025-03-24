from pathlib import Path

from sqlmodel import Session, select

from .models import Account
from .ssh_manager import SSH_CONFIG_PATH, generate_ssh_key, read_public_key, update_ssh_config


def create_git_account(account: Account, overwrite: bool = False) -> tuple[str, str]:
    # Generate SSH key
    key_path = generate_ssh_key(account.name, account.email, account.account_type, overwrite)
    ssh_key_path = str(key_path)

    # Read public key
    public_key, _ = read_public_key(key_path)

    # Update SSH config
    update_ssh_config(account.name, account.account_type, key_path)

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
                    new_account = Account(
                        name=current_host,
                        email=current_email,
                        ssh_key_path=str(identity_file),
                        public_key=public_key_content,
                        account_type=account_type,
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
