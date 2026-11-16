"""Facts read from a MATLAB/Octave file's text: header comment, functions and classes defined, solver and plotting
calls. Only what is literally in the file (also used for files whose source is not shown)."""
import re

FUNC = re.compile(r"^\s*function\s+(?:\[?[\w,\s]*\]?\s*=\s*)?(\w+)", re.M)
CLASS = re.compile(r"^\s*classdef\s+(\w+)", re.M)
SOLVER = re.compile(r"\b(ode45|ode23|ode15s|fzero|fminsearch|lsqcurvefit|integral)\s*\(")
PLOT = re.compile(r"\b(plot|plot3|scatter|surf|mesh|imagesc|bar|hist|histogram)\s*\(")


def header(text: str) -> str:
    """First prose comment lines ('%' or '%%'), skipping commented-out code."""
    out = []
    for line in text.split("\n")[:15]:
        s = line.strip()
        if not s.startswith("%"):
            if out or (s and not s.startswith("function") and not s.startswith("classdef")):
                break
            continue
        body = s.lstrip("%").strip()
        if re.match(r"^[\w.]+\s*=|^axis\b", body):
            break                       # commented-out code ends the header
        if len(body.split()) >= 2:
            out.append(body)
        if len(out) >= 2:
            break
    return " ".join(out)


def facts(text: str) -> dict:
    code = "\n".join(l.split("%")[0] for l in text.split("\n"))
    return {"summary": header(text), "functions": FUNC.findall(code), "classes": CLASS.findall(code),
            "solvers": sorted(set(SOLVER.findall(code))), "plots": len(PLOT.findall(code))}
