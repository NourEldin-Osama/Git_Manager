import subprocess
from pathlib import Path

ssh_dir = Path.home() / ".ssh"

private_key = "id_NourEldin_personal"
# change permission of the key in windows
private_key_path = ssh_dir / private_key
if not private_key_path.exists():
    print(f"SSH key not found: {private_key_path}")
    raise FileNotFoundError(f"SSH key not found: {private_key_path}")

command = f"""
cp {private_key} ~/{private_key}
eval $(ssh-agent -s)
chmod 400 ~/{private_key}
ssh-add ~/{private_key}
"""

process = subprocess.run(["bash", "-c", command], cwd=str(ssh_dir), capture_output=True, text=True)

if process.returncode == 0:
    print("✅ SSH agent started and key added successfully.")
else:
    print("❌ Failed to start SSH agent or add key.")
