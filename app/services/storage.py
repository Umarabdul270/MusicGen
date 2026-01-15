import os
import shutil
from pathlib import Path
from fastapi import UploadFile
from starlette.responses import FileResponse

STORAGE_DIR = Path("/workspaces/MusicGen/storage")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

def save_file(file: UploadFile) -> str:
    """Saves a file to local storage and returns the relative path."""
    file_path = STORAGE_DIR / f"{os.urandom(8).hex()}_{file.filename}"
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return str(file_path)

def stream_file(file_path: str):
    """Returns a FileResponse for streaming."""
    if not os.path.exists(file_path):
        return None
    return FileResponse(file_path)
