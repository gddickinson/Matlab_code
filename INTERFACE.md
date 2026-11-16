# INTERFACE.md: navigation map for Matlab_code

MATLAB/Octave samples at the root (`logisticGrowth_ode45.m`, `motionofMassSpringDamper_ode45.m`,
`compleExponential.m`), an Octave workspace saved from a run (`test`), and `GainTuningExercise/` (third-party exercise:
P-code GUI, figure, launcher, `QuadPlot.m`). The web interface never runs MATLAB/Octave.

| File | Contents |
|---|---|
| `run_web.py` | Starts uvicorn on 127.0.0.1:8255 |
| `web/app.py` | Routes `/api/info`, `/files`, `/file/{id}`, `/how`, `/octave_run`; `STATIC_ENDPOINTS` |
| `web/repo_files.py` | `files()`, `get(id)`, `read_text(rel)` (redacted), `file_id`, `kind_of`, `stats()` |
| `web/privacy.py` | `redact(text)`, `origin(rel)`, `THIRD_PARTY` |
| `web/m_facts.py` | `header(text)`, `facts(text)`: functions, classes, solvers, plot calls |
| `web/howto.py` | `SECTIONS` claims and `sections()` with line numbers found from quotes |
| `web/static/ode45_engine.js` | `ode45`, `startingStep`, `absRelNorm` (Octave 4.4 port), `logistic`, `springDamper` |
| `web/static/shapes_engine.js` | `SHAPES`, `shape(name)`, `range` (MATLAB colon) |
| `web/static/octave_text.js` | `parseOctaveText` for Octave's text save format |
| `web/static/ode45_engine.test.mjs` | Node test: matches the saved Octave run; exact spring-damper; hand-traced star |
| `web/static/home.js`, `code.js`, `how.js`, `demos.js`, `demo_ode.js`, `demo_shapes.js`, `about.js` | Pages |
| `web/static/core.js`, `style.css`, `chart.js`, `highlight.js`, `main.js`, `static_api.js`, `style_app.css`, `index.html` | Kit, charts, highlighter, shell |
| `scripts/build_static.py`, `scripts/screenshots.py` | Static export; Playwright smoke test / screenshots |
| `tests/test_web.py` | Endpoints, static build, redaction, third-party handling, how-it-works quotes, node tests |
| `.github/workflows/pages.yml` | Publishes on push to main |
