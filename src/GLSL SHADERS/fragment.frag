#version 450
layout(location = 0) out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D terrainTexture;
const float EPSILON = 0.001;
const float MAX_DIST = 2000.0;
const float STEPS = 600.0;
const float PI = 22/7;
const int NUM_OCTAVES = 12;

vec3 lightPos = vec3(250.0, 100.0, -300.0) * 3.0;

float noise(vec2 p) {
    return sin(p[0]) + sin(p[1]);
}


mat2 rot(float a) {
    float sa = sin(a);
    float ca = cos(a);
    return mat2(ca, -sa, sa, ca);
}


float fbm(vec2 p) {
    float res = 0.0;
    float amp = 0.5;
    float freq = 1.95;
    for( int i = 0; i < NUM_OCTAVES; i++) {
        res += amp * noise(p);
        amp *= 0.5;
        p = p * freq * rot(PI / 4.0) - res * 0.4;
    }
    return res;
}


vec2 getWater(vec3 p) {
    float rippleFactor = 3.0 * noise(p.xz * 0.02 + 0.8 * u_time);
    float d = p.y + 3.0 * sin(u_time) + 80.0 + rippleFactor;
    d += rippleFactor;
    float waterID = 1.0;
    vec2 water = vec2(d, waterID);
    return water;
}


vec2 getTerrain(vec3 p) {
    float d = 0;
    d -= 130.0 * noise(p.xz * 0.005);
    d += 80.0 * noise(p.xz * 0.01) + 70.0;
    d += 20.0 * fbm(p.xz * 0.1) * noise(p.xz * 0.05) + 30.0;
    d -= 2.0 * sin(0.4 * d);
    d += p.y + 2.0;
    float terrainID = 2.0;
    vec2 terrain = vec2(d*0.2, terrainID);
    return terrain;
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(EPSILON, 0.0);
    vec3 n = normalize(vec3(
        getTerrain(p + e.xyy).x - getTerrain(p - e.xyy).x,
        getTerrain(p + e.yxy).x - getTerrain(p - e.yxy).x,
        getTerrain(p + e.yyx).x - getTerrain(p - e.yyx).x
    ));
    return n;
}

vec4 map(vec3 p) {
    vec2 terrainData = getTerrain(p);
    float terrainHeight = terrainData.x;
    float waterHeight = getWater(p).x;

    if (terrainHeight < waterHeight) {
        //Volcanic Texture
        vec3 rockyColor = vec3(0.725, 0.749, 0.737) + vec3(0.05, 0.1, 0.05) * smoothstep(0.0, 0.3, terrainHeight);
        vec3 volcanicColor = vec3(0.443, 0.392, 0.376) + 0.05 * fbm(p.xz * 0.02);
        volcanicColor = mix(volcanicColor, vec3(0.251, 0.212, 0.188), smoothstep(0.4, 0.8, terrainHeight));
        volcanicColor += vec3(0.02, 0.01, 0.0);
        vec3 terrainColor = mix(rockyColor, volcanicColor, smoothstep(0.3, 0.5, terrainHeight));
        terrainColor *= vec3(0.584, 0.498, 0.478);
        terrainColor += 0.02 * fbm(p.xz * 0.1);
        terrainColor = mix(vec3(1.0), terrainColor, 0.7);
        terrainColor *= 0.9 + 0.1 * noise(p.xz * 0.1);
        return vec4(terrainHeight, terrainColor);
    } else {
        //Water Texture
        float shoreDistance = abs(p.x);
        vec3 shoreColor = vec3(0.8, 0.9, 1.0);
        vec3 nearShoreColor = vec3(0.6, 0.7, 0.9);
        vec3 deepColor = vec3(0.016, 0.53, 0.89);
        vec3 waterColor = mix(deepColor, mix(nearShoreColor, shoreColor, smoothstep(50.0, 150.0, shoreDistance)), smoothstep(300.0, 500.0, shoreDistance));
        waterColor += 0.01 * fbm(p.xz * 0.1);
        float specular = 0.3 * pow(clamp(dot(normalize(p - lightPos), normalize(p - vec3(p.x, waterHeight, p.z))), 0.0, 1.0), 20.0);
        waterColor += vec3(1.0) * specular;
        waterColor = mix(vec3(1.0), waterColor, 0.9);
        return vec4(waterHeight, waterColor);
    }
}

vec4 rayMarch(vec3 ro, vec3 rd) {
    vec4 dist, hit; 
    for (int i = 0; i < STEPS; i++) {
        vec3 p = ro + dist.x * rd;
        hit = map(p);

        if (abs(hit.x) < EPSILON) break;
        dist.x += hit.x;
        dist.yzw = hit.yzw;
        if (dist.x > MAX_DIST) break;
    }
    return dist;
}

float getAmbientOcclusion(vec3 p, vec3 normal) {
    float occ = 0.0;
    float weight = 0.4;
    for (int i = 0; i < 8; i++) {
        float len = 0.01 + 0.02 * float(i * i);
        vec4 dist = map(p + normal * len);
        occ += (len - dist.x) * weight;
        weight *= 0.85;
    }
    return 1.0 - clamp(0.6 * occ, 0.0, 1.0);
}

float getSoftShadow(vec3 p, vec3 lightPos) {
    float res = 1.0;
    float dist = 0.01;
    float lightSize = 0.03;
    for (int i = 0; i < 8; i++) {
        vec4 hit = map(p + lightPos * dist);
        res = min(res, hit.x / (dist * lightSize));
        if (hit.x < EPSILON) break;
        dist += hit.x;
        if (dist > 30.0) break;
    }
    return clamp(res, 0.0, 1.0);
}

vec3 getLight(vec3 p, vec3 rd, vec3 color) {
    vec3 l = normalize(lightPos - p);
    vec3 normal = getNormal(p);
    vec3 v = -rd;
    vec3 r = reflect(-l, normal);

    float diff = 0.85 * max(dot(l, normal), 0.0);
    float specular = 0.4 * pow(clamp(dot(r, v), 0.0, 1.0), 10.0);
    float ambient = 0.2;
    float shadow = getSoftShadow(p, lightPos);
    float occ = getAmbientOcclusion(p, normal);
    return  (ambient * occ + (specular * occ + diff) * shadow) * color;
}

mat3 getCam(vec3 ro, vec3 lookAt) {
    vec3 camF = normalize(vec3(lookAt - ro));
    vec3 camR = normalize(cross(vec3(0,1 , 0), camF));
    vec3 camU = cross(camF, camR);
    return mat3(camR, camU, camF);
}

vec3 getSky(vec3 p, vec3 rd) {
    vec3 col = vec3(0.016, 0.53, 0.89); 
    float sun = 0.001 / (1.0 - dot(rd, normalize(lightPos)));
     col = mix(col, vec3(1.00), 1.35 * fbm(vec2(6.8 * length(rd.xz), rd.y)));     
    col += sun * 0.1;
    return col;
}


vec3 render(vec2 uv) {
    vec3 col = vec3(0);
    vec3 ro = vec3(250.0, 100.0 * sin(u_time*0.25) + 120.0,550.0);
    ro.xz *= rot(u_time * 0.10);
    vec3 lookAt = vec3(0, 1, 0);
    vec3 rd = getCam(ro, lookAt) * normalize(vec3(uv, 2.0));
    vec4 dist = rayMarch(ro, rd);
    vec3 p = ro + dist.x * rd;
   

    if (dist.x < MAX_DIST) {
       vec3 p = ro + dist.x * rd;
        col += getLight(p, rd, dist.yzw);
        //Fog effect
        col = mix(getSky(p, rd), col, exp(-0.0000007 * dist.x));
        
    } else {
        col += getSky(p, rd);
    }
    return col;
}

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
    vec3 color = render(uv);
    fragColor = vec4(pow(color, vec3(1.5)), 1.0);
}