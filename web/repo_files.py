"""The repository's own files for the code explorer: kind, whether the text is shown, facts and redacted text.

Kinds: code (.m), doc (README, LICENSE), data (the Octave workspace file `test`), binary (.fig figure, .p P-code).
Third-party material (privacy.THIRD_PARTY) is listed with its structure only. The web interface's files are not listed.
"""
import re
from functools import lru_cache
from pathlib import Path

from web import m_facts, privacy

ROOT = Path(__file__).resolve().parent.parent
WEB_FILES = {"web", "scripts", "tests", "docs", ".github", "site", ".git", "run_web.py", "requirements-web.txt",
             "INTERFACE.md", "SESSION_LOG.md", "CLAUDE.md", ".gitignore", ".pytest_cache", ".DS_Store", ".gitattributes"}
KIND = {".m": "code", ".md": "doc", ".fig": "binary", ".p": "binary"}


def file_id(rel: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", rel.replace("/", "__"))


def kind_of(rel: str) -> str:
    p = Path(rel)
    if p.name == "LICENSE":
        return "doc"
    if p.name == "test":
        return "data"
    return KIND.get(p.suffix.lower(), "binary")


@lru_cache(maxsize=1)
def files() -> list:
    out = []
    for p in sorted(ROOT.rglob("*"), key=lambda q: str(q.relative_to(ROOT)).lower()):
        rel = p.relative_to(ROOT)
        if not p.is_file() or rel.parts[0] in WEB_FILES or p.name == ".DS_Store":
            continue
        rel = str(rel)
        kind, org = kind_of(rel), privacy.origin(rel)
        why = ("binary file (MATLAB figure or protected P-code)" if kind == "binary"
               else org["note"] if not org["show"] else "")
        text = read_text(rel) if kind != "binary" else ""
        facts = m_facts.facts(text) if kind == "code" else None
        out.append({
            "id": file_id(rel), "path": rel, "name": p.name, "kind": kind, "lang": "matlab" if kind == "code" else "",
            "size": p.stat().st_size, "lines": len(text.rstrip("\n").split("\n")) if text else None,
            "origin": org["kind"], "note": org["note"], "shown": not why, "why": why,
            "summary": facts["summary"] if facts else "",
        })
    return out


def get(fid: str) -> dict | None:
    return next((f for f in files() if f["id"] == fid), None)


def read_text(rel: str) -> str:
    text = (ROOT / rel).read_bytes().decode("utf-8", errors="replace")
    return privacy.redact(text.replace("\r\n", "\n").replace("\r", "\n"))


def stats() -> dict:
    fs = files()
    m = [f for f in fs if f["kind"] == "code"]
    return {"files": len(fs), "m_files": len(m), "m_lines": sum(f["lines"] or 0 for f in m),
            "own_m": sum(f["origin"] == "own" for f in m), "functions": sum(len(m_facts.facts(read_text(f["path"]))["functions"]) for f in m)}
