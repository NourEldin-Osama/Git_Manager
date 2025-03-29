import os
import platform
from tkinter import Tk, filedialog

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/folder-select", tags=["Folder Selection"])

# Configure DPI Awareness for Windows
if platform.system() == "Windows":
    try:
        from ctypes import windll

        windll.shcore.SetProcessDpiAwareness(1)
    except Exception as e:
        print(f"Could not set DPI awareness: {e}")


class FolderResponse(BaseModel):
    status: str
    path: str | None = None
    message: str | None = None


@router.post("/dialog", response_model=FolderResponse)
async def trigger_folder_dialog():
    """Opens a native folder selection dialog on the server."""
    try:
        root = Tk()
        root.withdraw()
        root.call("wm", "attributes", ".", "-topmost", True)

        selected_path = filedialog.askdirectory(title="Select Git Repository Directory")
        root.destroy()

        if selected_path:
            selected_path = os.path.abspath(selected_path)
            return FolderResponse(status="success", path=selected_path)
        else:
            return FolderResponse(status="cancelled", message="Folder selection cancelled.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
