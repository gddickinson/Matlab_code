"""'How it works' claims, each tied to a quoted line of the file it describes (line numbers found by search; a test
checks every quote exists)."""
from web.repo_files import file_id, read_text

SECTIONS = [
    {"id": "logistic", "title": "Logistic growth with ode45 (logisticGrowth_ode45.m)", "claims": [
        ("Growth rate r = 1 and carrying capacity K = 1000.", "logisticGrowth_ode45.m", "K = 1000;"),
        ("The model is dP/dt = r P (1 - P/K), written as an anonymous function of t and P.", "logisticGrowth_ode45.m", "odefun = @(t,P) r*P*(1-P/K);"),
        ("It is solved from t = 0 to 10 starting from 20 individuals.", "logisticGrowth_ode45.m", "P0 = 20;"),
        ("ode45 returns the time points it chose and the solution there; the script scatter-plots them.", "logisticGrowth_ode45.m", "[tSol, PSol] = ode45(odefun,tSpan,P0);"),
        ("The repository also holds the workspace of an Octave 4.4.1 run of this script: 16 time points, P rising from 20 to 997.8.",
         "test", "# name: PSol"),
    ]},
    {"id": "spring", "title": "Mass-spring-damper with ode45 (motionofMassSpringDamper_ode45.m)", "claims": [
        ("The second-order equation x'' + x' + x = 0 is written as a first-order system of position and velocity.",
         "motionofMassSpringDamper_ode45.m", "dxdt = @(t,x) [x(2); -x(2)-x(1)];"),
        ("It starts at position 0 with velocity 1 and runs for 10 time units.", "motionofMassSpringDamper_ode45.m", "x0 = [0,1];"),
        ("Position (red) and velocity (green) are scatter-plotted on the same axes.", "motionofMassSpringDamper_ode45.m", "scatter(tSol,xSol(:,2),'green');"),
    ]},
    {"id": "complex", "title": "Shapes from complex exponentials (compleExponential.m)", "claims": [
        ("Angles step by 3 x 2pi/5 from pi/2, so successive points skip round a pentagon and draw a five-pointed star.",
         "compleExponential.m", "theta = (0:3:15)'*(2*pi/5) + pi/2;"),
        ("exp(i*theta) puts each angle on the unit circle; plot of a complex vector joins the points.", "compleExponential.m", "z = exp(i*theta)"),
        ("Commented-out angle vectors give an octagon, a hexagon and a circle instead.", "compleExponential.m", "%theta = (1:2:17)'*pi/8"),
    ]},
    {"id": "gain", "title": "Gain-tuning exercise (GainTuningExercise/)", "claims": [
        ("runsim.m clears the workspace and opens a PD-control tuning GUI, which is protected P-code (pd_control_gui.p).",
         "GainTuningExercise/runsim.m", "pd_control_gui"),
    ]},
]


def _line(rel: str, quote: str) -> int | None:
    return next((i for i, line in enumerate(read_text(rel).split("\n"), 1) if quote in line), None)


def sections() -> list:
    return [{"id": s["id"], "title": s["title"], "claims": [
        {"text": t, "file": f, "id": file_id(f), "quote": q, "line": _line(f, q)} for t, f, q in s["claims"]]}
        for s in SECTIONS]
