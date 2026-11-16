"""Web interface tests: every exported endpoint answers, the static build is complete, and the JS engine tests pass.

Run: python -m pytest -q tests/test_web.py
"""
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from web.app import STATIC, STATIC_ENDPOINTS, app  # noqa: E402

client = TestClient(app)


def test_index_served():
    r = client.get("/")
    assert r.status_code == 200 and "static/main.js" in r.text


@pytest.mark.parametrize("path", STATIC_ENDPOINTS)
def test_endpoint(path):
    r = client.get("/api" + path)
    assert r.status_code == 200, r.text
    assert r.json() is not None


def test_static_build(tmp_path):
    sys.path.insert(0, str(ROOT / "scripts"))
    import build_static
    build_static.build(tmp_path / "site")
    assert (tmp_path / "site" / "index.html").read_text().count("APP_STATIC") == 1
    for path in STATIC_ENDPOINTS:
        assert (tmp_path / "site" / "api" / (path.strip("/") + ".json")).exists()


def test_static_assets_referenced_exist():
    html = (STATIC / "index.html").read_text()
    for name in ("style.css", "main.js"):
        assert f"static/{name}" in html and (STATIC / name).exists()


@pytest.mark.skipif(not shutil.which("node"), reason="node not installed")
def test_js_engine():
    tests = sorted(STATIC.glob("*.test.mjs"))
    for t in tests:
        r = subprocess.run(["node", str(t)], capture_output=True, text=True)
        assert r.returncode == 0, r.stdout + r.stderr


# --- project-specific -----------------------------------------------------------------------------------------------
from web import howto, privacy  # noqa: E402
from web import repo_files as R  # noqa: E402


def test_third_party_source_not_returned():
    f = client.get(f"/api/file/{R.file_id('GainTuningExercise/QuadPlot.m')}").json()
    assert not f["shown"] and "text" not in f
    assert f["facts"]["classes"] == ["QuadPlot"] and "QuatToRot" in f["facts"]["functions"]


def test_octave_header_redacted(tmp_path):
    assert "LAPTOP" not in client.get("/api/octave_run").json()["text"]
    sys.path.insert(0, str(ROOT / "scripts"))
    import build_static
    build_static.build(tmp_path / "site")
    for p in (tmp_path / "site" / "api").rglob("*.json"):
        assert "LAPTOP-" not in p.read_text() and "unknown@" not in p.read_text(), p


def test_redact():
    assert privacy.redact("# Created by Octave 4.4.1, Sun Nov 04 2018 GMT <a@B-1>\nx") == "# Created by Octave 4.4.1, Sun Nov 04 2018 GMT <redacted>\nx"
    assert privacy.redact(r"C:\Users\Someone\x.m") == r"C:\Users\<user>\x.m"


def test_howto_quotes_exist():
    for s in howto.sections():
        for c in s["claims"]:
            assert c["line"], (c["file"], c["quote"])


def test_summaries_come_from_comments():
    by = {f["path"]: f for f in R.files()}
    assert by["logisticGrowth_ode45.m"]["summary"] == "Example of 1st order ODE"
    assert by["compleExponential.m"]["summary"] == ""     # its comments are shape names and commented-out code
