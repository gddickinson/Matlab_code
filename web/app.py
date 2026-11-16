"""FastAPI web app for Matlab_code: showcase, code explorer and in-browser ports of the scripts' calculations.

Run with `python run_web.py` (http://127.0.0.1:8255, local only). `scripts/build_static.py` exports every path in
STATIC_ENDPOINTS to JSON for the GitHub Pages site, so keep that list in step with the GET routes below.
"""
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from web import howto, m_facts
from web import repo_files as R

STATIC = Path(__file__).resolve().parent / "static"

app = FastAPI(title="MATLAB code")
app.mount("/static", StaticFiles(directory=STATIC), name="static")


@app.get("/", include_in_schema=False)
def index():
    return FileResponse(STATIC / "index.html")


@app.get("/api/info")
def info():
    return {"title": "MATLAB code", "stats": R.stats()}


@app.get("/api/files")
def files():
    return {"files": R.files()}


@app.get("/api/file/{fid}")
def file(fid: str):
    """One file: metadata, facts (also for third-party code, whose text is not returned) and text when shown."""
    f = R.get(fid)
    if not f:
        raise HTTPException(404, f"no file {fid!r}")
    out = dict(f)
    if f["kind"] == "code":
        out["facts"] = m_facts.facts(R.read_text(f["path"]))
    if f["shown"]:
        out["text"] = R.read_text(f["path"])
    return out


@app.get("/api/how")
def how():
    return {"sections": howto.sections()}


@app.get("/api/octave_run")
def octave_run():
    """The Octave workspace file `test` (an Octave 4.4.1 run of logisticGrowth_ode45.m), header user/host redacted."""
    return {"path": "test", "text": R.read_text("test")}


STATIC_ENDPOINTS = ["/info", "/files", "/how", "/octave_run"] + [f"/file/{f['id']}" for f in R.files()]
