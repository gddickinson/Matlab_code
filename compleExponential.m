%octagon
%theta = (1:2:17)'*pi/8
%hexagon
%theta = (1:2:17)'*pi/6
%circle
%theta = (0:0.1:15)'*(2*pi/5) + pi/2;

%star
theta = (0:3:15)'*(2*pi/5) + pi/2;

z = exp(i*theta)
p = plot(z);
set(p,'linewidth',4,'color','red')
%axis square off
