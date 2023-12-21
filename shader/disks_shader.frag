const float Pi = 3.1415926;

uniform float CentralRadius;
uniform float PerimeterRadius;
uniform float FieldSpacing;
uniform float CentralIntensity;
uniform float PerimeterIntensity;
uniform float FieldDisplacementX;
uniform float iTime;
uniform float Brightness;
uniform float Velocity;

const float BackgroundIntensity = 0.5;
const float dR = 1.0;
const float FieldDisplacementY = 0.0;

vec2 MCposition;
vec2 CellSpacing = vec2(FieldSpacing, FieldSpacing);

void main(void) {
float sv;

MCposition = gl_FragCoord.xy + vec2(Velocity*iTime, 0.00);
vec2  CellLocation        = MCposition/CellSpacing;
vec2  CellArrayID         = floor(CellLocation + vec2(0.5, 0.5));
vec2  CellLocalLocation   = fract(CellLocation);
float CellRadialPosition  = length(MCposition - CellArrayID*CellSpacing);
sv = (CentralIntensity-PerimeterIntensity)*(1.0-smoothstep(CentralRadius-0.5*dR, CentralRadius+0.5*dR, CellRadialPosition));
sv = sv + (BackgroundIntensity-PerimeterIntensity)*smoothstep(PerimeterRadius-0.5*dR, PerimeterRadius+0.5*dR,CellRadialPosition);
sv = sv + PerimeterIntensity;
gl_FragColor = vec4(sv*Brightness, sv*Brightness, sv*Brightness, 1.0);
}