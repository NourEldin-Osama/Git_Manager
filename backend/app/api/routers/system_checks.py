import platform
import shutil
import subprocess
from typing import Any

from fastapi import APIRouter

# Fix the router prefix to match the app structure
router = APIRouter(
    prefix="/system",
    tags=["system"],
    responses={404: {"description": "Not found"}},
)


@router.get("/health", response_model=dict[str, Any])
async def health_check():
    """
    Check if the backend service is running and healthy.

    Returns:
        dict: Status information including service status and version
    """
    return {
        "status": "ok",
        "service": "Git Account Manager API",
        "platform": platform.system(),
        "python_version": platform.python_version(),
    }


@router.get("/check")
async def check_prerequisites():
    """
    Check if all required system prerequisites are installed.

    This endpoint verifies if Git and SSH are installed and available on the system.

    Returns:
        dict: Status of each prerequisite
    """
    git_installed = shutil.which("git") is not None
    ssh_installed = shutil.which("ssh") is not None

    # Additional checks to verify git works
    git_version = None
    if git_installed:
        try:
            result = subprocess.run(["git", "--version"], capture_output=True, text=True, check=False)
            git_version = result.stdout.strip() if result.returncode == 0 else None
        except Exception:
            git_installed = False

    # Additional check to verify ssh works
    ssh_version = None
    if ssh_installed:
        try:
            result = subprocess.run(
                ["ssh", "-V"], capture_output=True, text=True, stderr=subprocess.STDOUT, check=False
            )
            ssh_version = result.stdout.strip() if result.returncode == 0 else result.stderr.strip()
        except Exception:
            ssh_installed = False

    return {
        "git": git_installed,
        "ssh": ssh_installed,
        "details": {"git_version": git_version, "ssh_version": ssh_version},
    }
