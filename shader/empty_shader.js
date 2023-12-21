const float Pi = 3.1415926;

uniform float CentralRadius;
uniform float PerimeterRadius;
uniform float FieldSpacing;
uniform float CentralIntensity;
uniform float PerimeterIntensity;
uniform float FieldDisplacementX;
uniform float iTime;
uniform float Brightness;

 const float BackgroundIntensity = 0.5;
 const float dR = 1.0;
 const float FieldDisplacementY = 0.0;

 vec2 MCposition;
 vec2 CellSpacing = vec2(FieldSpacing, FieldSpacing);

void main(void) {
float b = Brightness;
gl_FragColor = vec4(0.7*b, 0.7*b, 0.7*b, 1.0);
};
