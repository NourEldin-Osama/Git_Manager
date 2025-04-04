import subprocess
from pathlib import Path

SSH_CONFIG_PATH = Path.home() / ".ssh" / "config"


def generate_ssh_key(account_name: str, email: str, account_type: str, overwrite: bool) -> Path:
    # Generate SSH key in ~/.ssh/ directory
    key_path = Path.home() / ".ssh" / f"id_{account_name}_{account_type}"
    file_exists = key_path.exists()
    if file_exists and not overwrite:
        raise FileExistsError(f"SSH key already exists at {key_path}. Use overwrite=True to replace it.")

    # If overwriting, delete existing keys first
    if overwrite:
        key_path.unlink(missing_ok=True)
        public_key_path = Path(f"{key_path}.pub")
        public_key_path.unlink(missing_ok=True)

    command = f"ssh-keygen -t ed25519 -C {email} -f {key_path} -N '' -q"
    command = command.split()

    subprocess.run(command, check=True)
    return key_path


def update_ssh_config(account_name: str, account_type: str, key_path: Path):
    # Convert absolute path to ~/.ssh/ format for better portability
    relative_path = f"~/.ssh/{key_path.name}"

    config_entry = f"""
Host github-{account_name}-{account_type}
    HostName github.com
    User git
    IdentityFile {relative_path}
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


def delete_ssh_key(key_path: str):
    """Delete SSH key pair and remove entry from SSH config

    Args:
        key_path: Path to the SSH private key file

    Raises:
        OSError: If there are issues with file operations
    """
    try:
        key_path = Path(key_path)

        # Delete private and public keys
        key_path.unlink(missing_ok=True)
        public_key_path = Path(f"{key_path}.pub")
        public_key_path.unlink(missing_ok=True)

        # Skip SSH config cleanup if file doesn't exist
        if not SSH_CONFIG_PATH.exists():
            return

        # Read and process SSH config
        with open(SSH_CONFIG_PATH) as file:
            lines = file.readlines()

        # Extract account info from key name
        # Assuming format: id_accountname_type or id_account_name_with_underscores_type
        key_parts = key_path.name.split("_")
        if len(key_parts) < 3:
            return  # Invalid key name format

        # The type is the last part, account name is everything in between
        account_type = key_parts[-1]
        account_name = "_".join(key_parts[1:-1])
        expected_host = f"github-{account_name}-{account_type}"

        # Find and remove the config entry
        new_lines = []
        skip = False
        for line in lines:
            if f"IdentityFile ~/.ssh/{key_path.name}" in line:
                skip = False
                continue
            if line.startswith(f"Host {expected_host}"):
                skip = True
                continue
            if not skip:
                new_lines.append(line)

        # Write back cleaned config
        with open(SSH_CONFIG_PATH, "w") as file:
            file.writelines(new_lines)

    except OSError as e:
        raise OSError(f"Failed to delete SSH key or update config: {e}") from e
