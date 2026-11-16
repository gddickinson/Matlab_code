"""Origin of each file and redaction of personal details for everything the site shows.

GainTuningExercise/ holds an exercise (a protected P-code GUI, its figure, a launcher and QuadPlot.m, whose QuatToRot
says 'written by Daniel Mellinger'), with no licence statement: listed with its structure (classes, functions, header
comments) but its source is not shown or ported. The Octave workspace file `test` names the machine it was saved on;
that header's user@host is redacted.
"""
import re

THIRD_PARTY = {
    "GainTuningExercise/QuadPlot.m": "third-party exercise code (QuatToRot: 'written by Daniel Mellinger'); no licence statement",
    "GainTuningExercise/pd_control_gui.p": "protected MATLAB P-code of the exercise GUI (not readable source)",
    "GainTuningExercise/pd_control_gui.fig": "MATLAB figure file of the exercise GUI",
}
_HOME = [
    (re.compile(r"(?i)([A-Z]:(?:\\\\|\\|/)+Users(?:\\\\|\\|/)+)([^\\/'\"\s]+)"), r"\1<user>"),
    (re.compile(r"(?i)((?:\\\\|/)Users(?:\\\\|/)+)([^\\/'\"\s]+)"), r"\1<user>"),
    (re.compile(r"(/home/)([^/'\"\s]+)"), r"\1<user>"),
]
_EMAIL = re.compile(r"(?<![\w.%+-])[\w.%+-]++@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?:\.[A-Za-z]{2,})?")
_OCTAVE_HEADER = re.compile(r"^(# Created by Octave [^<\n]*)<[^>\n]*>", re.M)


def redact(text: str) -> str:
    text = _OCTAVE_HEADER.sub(r"\1<redacted>", text)
    for rx, rep in _HOME:
        text = rx.sub(rep, text)
    return _EMAIL.sub("<email>", text)


def origin(rel: str) -> dict:
    if rel in THIRD_PARTY:
        return {"kind": "third-party", "note": THIRD_PARTY[rel], "show": False}
    return {"kind": "own", "note": "", "show": True}
