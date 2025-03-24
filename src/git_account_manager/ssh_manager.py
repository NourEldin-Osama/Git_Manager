import subprocess
from pathlib import Path

SSH_CONFIG_PATH = Path.home() / ".ssh" / "config"


def generate_ssh_key(account_name: str, email: str, account_type: str, overwrite: bool) -> Path:
    key_path = Path.home() / ".ssh" / f"id_{account_name}_{account_type}"
    file_exists = key_path.exists()
    if file_exists and not overwrite:
        raise FileExistsError(f"SSH key already exists at {key_path}. Use overwrite=True to replace it.")

    command = f"ssh-keygen -t ed25519 -C {email} -f {key_path} -N '' -q"
    if file_exists and overwrite:
        command += " -y"
    command = command.split()

    subprocess.run(command, check=True)
    return key_path


def update_ssh_config(account_name: str, account_type: str, key_path: Path):
    config_entry = f"""
Host github-{account_name}-{account_type}
    HostName github.com
    User git
    IdentityFile {key_path}
"""
    with open(SSH_CONFIG_PATH, "a") as file:
        file.write(config_entry)


def read_public_key(key_path: Path) -> tuple[str, str]:
    """Read public key and extract email from it"""
    public_key_path = Path(f"{key_path}.pub")
    with open(public_key_path) as file:
        content = file.read().strip()
        try:
            email = content.split()[-1].strip("<>")
        except Exception:
            email = None
        return content, email
