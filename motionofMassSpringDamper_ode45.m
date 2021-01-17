%Example of Higher order ODE
dxdt = @(t,x) [x(2); -x(2)-x(1)];
tLim = [0,10];
x0 = [0,1];
[tSol,xSol] = ode45(dxdt, tLim, x0);
%tSol = time
%xSol = position x (column 1) and velocity dx/dt (column 2)

scatter(tSol,xSol(:,1),'red');
xlabel('time');
ylabel('position');
title('Spring Dampening');

hold on;

scatter(tSol,xSol(:,2),'green');
xlabel('time');
ylabel('velocity');
title('Spring Dampening');

hold off;