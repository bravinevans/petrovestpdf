import asyncio
import os
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pdf2docx import Converter

app = FastAPI(title="Petrovest PDF Conversion Worker", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = 25 * 1024 * 1024
JOB_SEMAPHORE = asyncio.Semaphore(int(os.getenv("MAX_CONCURRENT_JOBS", "2")))
OFFICE_EXTENSIONS = {".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".csv", ".odt", ".ods", ".odp", ".rtf"}


@app.get("/")
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "petrovestpdf-worker",
        "libreoffice": shutil.which("soffice") is not None,
        "qpdf": shutil.which("qpdf") is not None,
    }


async def save_upload(upload: UploadFile, dest: Path) -> int:
    total = 0
    with dest.open("wb") as f:
        while chunk := await upload.read(1024 * 1024):
            total += len(chunk)
            if total > MAX_UPLOAD_BYTES:
                raise HTTPException(status_code=413, detail="File exceeds 25 MB limit.")
            f.write(chunk)
    return total


def run_libreoffice_to_pdf(input_path: Path, out_dir: Path, profile_dir: Path) -> Path:
    cmd = [
        "soffice",
        "--headless",
        "--nologo",
        "--nofirststartwizard",
        f"-env:UserInstallation=file://{profile_dir}",
        "--convert-to",
        "pdf",
        "--outdir",
        str(out_dir),
        str(input_path),
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=90)
    pdf_path = out_dir / f"{input_path.stem}.pdf"
    if proc.returncode != 0 or not pdf_path.exists():
        raise RuntimeError(f"LibreOffice conversion failed: {proc.stderr.decode(errors='ignore')}")
    return pdf_path


def run_pdf_to_docx(pdf_path: Path, docx_path: Path) -> Path:
    cv = Converter(str(pdf_path))
    try:
        cv.convert(str(docx_path), start=0, end=None)
    finally:
        cv.close()
    if not docx_path.exists():
        raise RuntimeError("PDF to DOCX conversion produced no output.")
    return docx_path


def run_qpdf_protect(in_pdf: Path, out_pdf: Path, password: str, allow_print: bool, allow_copy: bool) -> Path:
    print_flag = "full" if allow_print else "none"
    extract_flag = "y" if allow_copy else "n"
    cmd = [
        "qpdf",
        "--encrypt",
        password,
        password,
        "256",
        f"--print={print_flag}",
        f"--extract={extract_flag}",
        "--",
        str(in_pdf),
        str(out_pdf),
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=45)
    if proc.returncode not in (0, 3) or not out_pdf.exists():
        raise RuntimeError(f"PDF encryption failed: {proc.stderr.decode(errors='ignore')}")
    return out_pdf


def run_qpdf_unlock(in_pdf: Path, out_pdf: Path, password: str) -> Path:
    cmd = ["qpdf", f"--password={password}", "--decrypt", str(in_pdf), str(out_pdf)]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=45)
    if proc.returncode not in (0, 3) or not out_pdf.exists():
        err = proc.stderr.decode(errors="ignore").lower()
        if "invalid password" in err:
            raise ValueError("Incorrect PDF password.")
        raise RuntimeError(f"PDF decryption failed: {proc.stderr.decode(errors='ignore')}")
    return out_pdf


@app.post("/api/office-to-pdf")
async def office_to_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in OFFICE_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    work_dir = Path(tempfile.mkdtemp(prefix="pv_office_"))
    background_tasks.add_task(shutil.rmtree, work_dir, True)

    in_path = work_dir / f"input_{uuid.uuid4().hex[:8]}{ext}"
    profile_dir = work_dir / "lo_profile"
    await save_upload(file, in_path)

    async with JOB_SEMAPHORE:
        try:
            out_pdf = await asyncio.to_thread(run_libreoffice_to_pdf, in_path, work_dir, profile_dir)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

    download_name = f"{Path(file.filename or 'converted').stem}.pdf"
    return FileResponse(path=out_pdf, media_type="application/pdf", filename=download_name)


@app.post("/api/pdf-to-word")
async def pdf_to_word(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    ext = Path(file.filename or "").suffix.lower()
    if ext != ".pdf":
        raise HTTPException(status_code=400, detail="Only .pdf files are accepted.")

    work_dir = Path(tempfile.mkdtemp(prefix="pv_docx_"))
    background_tasks.add_task(shutil.rmtree, work_dir, True)

    in_path = work_dir / f"input_{uuid.uuid4().hex[:8]}.pdf"
    out_docx = work_dir / "output.docx"
    await save_upload(file, in_path)

    async with JOB_SEMAPHORE:
        try:
            await asyncio.to_thread(run_pdf_to_docx, in_path, out_docx)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

    download_name = f"{Path(file.filename or 'converted').stem}.docx"
    return FileResponse(
        path=out_docx,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=download_name,
    )


@app.post("/api/protect-pdf")
async def protect_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    password: str = Form(...),
    allow_print: bool = Form(True),
    allow_copy: bool = Form(True),
):
    if not password.strip():
        raise HTTPException(status_code=400, detail="Password cannot be empty.")

    work_dir = Path(tempfile.mkdtemp(prefix="pv_lock_"))
    background_tasks.add_task(shutil.rmtree, work_dir, True)

    in_path = work_dir / f"in_{uuid.uuid4().hex[:8]}.pdf"
    out_path = work_dir / "protected.pdf"
    await save_upload(file, in_path)

    async with JOB_SEMAPHORE:
        try:
            await asyncio.to_thread(run_qpdf_protect, in_path, out_path, password, allow_print, allow_copy)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

    download_name = f"{Path(file.filename or 'document').stem}-protected.pdf"
    return FileResponse(path=out_path, media_type="application/pdf", filename=download_name)


@app.post("/api/unlock-pdf")
async def unlock_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    password: str = Form(""),
):
    work_dir = Path(tempfile.mkdtemp(prefix="pv_unlock_"))
    background_tasks.add_task(shutil.rmtree, work_dir, True)

    in_path = work_dir / f"in_{uuid.uuid4().hex[:8]}.pdf"
    out_path = work_dir / "unlocked.pdf"
    await save_upload(file, in_path)

    async with JOB_SEMAPHORE:
        try:
            await asyncio.to_thread(run_qpdf_unlock, in_path, out_path, password)
        except ValueError as exc:
            raise HTTPException(status_code=401, detail=str(exc))
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

    download_name = f"{Path(file.filename or 'document').stem}-unlocked.pdf"
    return FileResponse(path=out_path, media_type="application/pdf", filename=download_name)
