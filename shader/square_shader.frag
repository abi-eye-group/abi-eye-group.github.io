const float Pi = 3.1415927;
const float BackgroundIntensity = 0.5;

uniform float Contrast;
uniform float Frequency;  
uniform float iTime;
uniform float Brightness;
uniform float Velocity;

void main(void) {
float uv  = gl_FragCoord.x;
float phi = 2.0*Pi*Velocity*iTime;
float sv = sign((0.5*Contrast)*( sin (2.0*Pi*Frequency*uv + phi) )) + BackgroundIntensity;     
float b = Brightness;
gl_FragColor = vec4(b*sv, b*sv, b*sv, 1.0);
}




