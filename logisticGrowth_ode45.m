%Example of 1st order ODE
r = 1;
K = 1000;
odefun = @(t,P) r*P*(1-P/K);
tSpan = [0,10];
P0 = 20;
[tSol, PSol] = ode45(odefun,tSpan,P0);
scatter(tSol, PSol)
xlabel('time');
ylabel('population size');
title('logistic growth');