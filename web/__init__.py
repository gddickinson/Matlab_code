"""Web showcase and code explorer for Matlab_code (FastAPI app + static front end; see INTERFACE.md).

app.py         routes under /api and STATIC_ENDPOINTS for the static export
repo_files.py  the repository's files: kind, origin, shown or not, redacted text
privacy.py     third-party files (GainTuningExercise) and redaction
m_facts.py     facts read from MATLAB files: header comment, functions, classes, solvers, plots
howto.py       'How it works' claims tied to quoted lines
static/        front end (ES modules) and the JS ports: ode45_engine.js (Octave 4.4 ode45), shapes_engine.js
"""
