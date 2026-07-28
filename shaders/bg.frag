#ifdef GL_ES
precision highp float;
#endif

uniform float uTime;
uniform vec2 uResolution;
uniform float uTransition; // 0 = main page (straight lines), 1 = portfolio (bent + veil)


vec3 bgColor = vec3(0.01, 0.4, 0.42);
vec3 rectColor = vec3(0.01, 0.26, 0.57);

const float noiseIntensity = 2.8;
const float noiseDefinition = 1.;
const vec2 glowPos = vec2(-2., 0.);

const float total = 60.;
const float minSize = 0.03;
const float maxSize = 0.08-minSize;
const float yDistribution = 0.5;

float random(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

const float numLines = 20.0;
const float lineSpread = 0.;   // vertical spread of the stack around y=0
const float lineThickness = 0.004;

float hash1(float n) { return fract(sin(n) * 43758.5453123); }

float noise( in vec2 p )
{
    p*=noiseIntensity;
    vec2 i = floor( p );
    vec2 f = fract( p );
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( random( i + vec2(0.0,0.0) ), 
                     random( i + vec2(1.0,0.0) ), u.x),
                mix( random( i + vec2(0.0,1.0) ), 
                     random( i + vec2(1.0,1.0) ), u.x), u.y);
}

vec3 drawLines(vec2 uv, vec3 color) {
    for (float i = 0.0; i < numLines; i++) {
        float t = i / (numLines - 1.0);
        float baseY = mix(-lineSpread, lineSpread, t);

        // per-line randomized bend params
        float freq  = mix(1.5, 4.0, hash1(i * 3.1));
        float phase = hash1(i * 7.7) * 6.2831;
        float amp   = mix(0.1, 0.4, hash1(i * 1.3));
        float speed = mix(0.15, 0.5, hash1(i * 5.5));

        float bend = sin(uv.x * freq + uTime * speed + phase) * amp * uTransition;
        float y = baseY + bend;

        // the line itself
        float d = abs(uv.y - y);
        float lineMask = smoothstep(lineThickness, 0.0, d);
        color += (bgColor * 0.5) * lineMask;

        // transparent veil between the bent line and y = 0
        float inVeil = step(0.0, uv.y * y) * step(abs(uv.y), abs(y));
        float veilAlpha = 0.1 * uTransition;
        color += (bgColor * 0.9) * inVeil * veilAlpha;
    }
    return color;
}

float fbm( in vec2 uv )
{	
    uv *= 5.0;
    mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
    float f  = 0.5000*noise( uv ); uv = m*uv;
    f += 0.2500*noise( uv ); uv = m*uv;
    f += 0.1250*noise( uv ); uv = m*uv;
    f += 0.0625*noise( uv ); uv = m*uv;
    
    f = 0.5 + 0.5*f;
    return f;
}

vec3 bg(vec2 uv )
{
    float velocity = uTime/1.6;
    float intensity = sin(uv.x*3.+velocity*2.)*1.1+1.5;
    uv.y -= 2.;
    vec2 bp = uv+glowPos;
    uv *= noiseDefinition;
    float rb = fbm(vec2(uv.x*.5-velocity*.03, uv.y))*.1;
    uv += rb;
    float rz = fbm(uv*.9+vec2(velocity*.35, 0.0));
    rz *= dot(bp*intensity,bp)+1.2;
    vec3 col = bgColor/(.1-rz);
    return sqrt(abs(col));
}

float rectangle(vec2 uv, vec2 pos, float width, float height, float blur) {
    pos = (vec2(width, height) + .01)/2. - abs(uv - pos);
    pos = smoothstep(0., blur , pos);
    return pos.x * pos.y; 
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / uResolution.xy * 2. - 1.;
    uv.x *= uResolution.x/uResolution.y;
    
    vec3 color = bg(uv)*(2.-abs(uv.y*2.));
    
    float velX = -uTime/8.;
	float velY = uTime/10.;
	for(float i=0.; i<total; i++){
		float index = i/total;
		float rnd = random(vec2(index));
		vec3 pos = vec3(0, 0., 0.);

		// extra permanent left-drift, outside the fract() wrap, driven by uTransition
		pos.x = fract(velX*rnd+index)*4.-2.0 - uTransition*3.0;
		pos.y = sin(index*rnd*1000.+velY) * yDistribution;
		pos.z = maxSize*rnd+minSize;

		vec2 uvRot = uv - pos.xy + pos.z/2.;
		uvRot = rotate2d( i+uTime/2. ) * uvRot;
		uvRot += pos.xy+pos.z/2.;
		float rect = rectangle(uvRot, pos.xy, pos.z, pos.z, (maxSize+minSize-pos.z)/2.);

		// fade out as transition progresses
		color += rectColor * rect * pos.z/maxSize * (1.0 - uTransition);
	}

	// lines drawn on top, after bg + rectangles
	color = drawLines(uv, color);
    
    fragColor = vec4(color, 1.0);
}

void main( void ) {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}