export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision mediump float;

  varying vec2 vUv;

  uniform float u_seed1;
  uniform float u_seed2;
  uniform float u_seed3;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform vec2 u_resolution;
  uniform float u_mode;  // 0 = hero, 1 = thumbnail
  uniform float u_style; // 0=3d, 1=software, 2=performance, 3=artwork, 4=diy

  // --- Simplex 2D noise ---
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289v2(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // --- fBm (fractal Brownian motion) ---
  float fbm(vec2 p, float seed) {
    float value = 0.0;
    float amplitude = 0.5;
    vec2 offset = vec2(seed * 17.3, seed * 31.7);
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p + offset);
      p *= 2.1;
      amplitude *= 0.5;
      offset *= 1.3;
    }
    return value;
  }

  // --- Domain warping ---
  float warpedFbm(vec2 p, float s1, float s2, float s3) {
    vec2 q = vec2(
      fbm(p + vec2(s1 * 5.2, s2 * 1.3), s1),
      fbm(p + vec2(s2 * 8.1, s3 * 3.7), s2)
    );
    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(s3 * 1.7, s1 * 9.2), s3),
      fbm(p + 4.0 * q + vec2(s1 * 8.3, s2 * 2.8), s1)
    );
    return fbm(p + 3.5 * r, s2);
  }

  // --- Voronoi distance (for 3D style) ---
  float voronoi(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float md = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = vec2(
          0.5 + 0.5 * sin(dot(n + g, vec2(127.1, 311.7)) + 6.28 * snoise((n + g) * 0.1)),
          0.5 + 0.5 * sin(dot(n + g, vec2(269.5, 183.3)) + 6.28 * snoise((n + g) * 0.13))
        );
        vec2 r = g + o - f;
        float d = dot(r, r);
        md = min(md, d);
      }
    }
    return sqrt(md);
  }

  // --- Style 0: 3D Angular/Faceted ---
  float style3D(vec2 p, float s1, float s2, float s3) {
    // Domain-warped coordinates for organic distortion of the geometric pattern
    vec2 warp = vec2(
      fbm(p * 1.5 + vec2(s1 * 7.0, s2 * 3.0), s1),
      fbm(p * 1.5 + vec2(s2 * 5.0, s3 * 9.0), s2)
    );
    vec2 wp = p + warp * 0.8;

    // Voronoi cells at two scales — centered around 0 for full color range
    float v1 = voronoi(wp * 3.5 + vec2(s1 * 10.0, s2 * 7.0));
    float v2 = voronoi(wp * 7.0 + vec2(s2 * 5.0, s3 * 12.0));

    // Map voronoi to signed range so output spans negative to positive
    float cells = (v1 * 0.65 + v2 * 0.35) * 2.0 - 1.0;

    // Faceted edge highlights — bright ridges between cells
    float edge1 = 1.0 - smoothstep(0.0, 0.1, abs(v1 - 0.4));
    float edge2 = 1.0 - smoothstep(0.0, 0.07, abs(v2 - 0.3));
    float edges = max(edge1, edge2) * 0.6;

    // Grid overlay with warp
    vec2 grid = abs(fract(wp * 8.0 + vec2(s3 * 3.0)) - 0.5);
    float gridLines = 1.0 - smoothstep(0.0, 0.04, min(grid.x, grid.y));

    // Noise depth variation
    float n = fbm(p * 2.0, s3);

    return cells + edges + gridLines * 0.2 + n * 0.3;
  }

  // --- Style 1: Software Digital/Grid ---
  float styleSoftware(vec2 p, float s1, float s2, float s3) {
    // Base grid
    vec2 gp = p * 6.0 + vec2(s1 * 4.0, s2 * 3.0);
    vec2 gridFract = fract(gp);
    float noiseDisplace = snoise(p * 0.8 + vec2(s1 * 5.0, s2 * 8.0)) * 0.4;

    // Displaced grid lines
    float hLine = smoothstep(0.0, 0.06, abs(gridFract.y - 0.5 + noiseDisplace));
    float vLine = smoothstep(0.0, 0.06, abs(gridFract.x - 0.5 + noiseDisplace * 0.7));
    float grid = 1.0 - min(hLine, vLine);

    // Data flow: horizontal streaks
    float flow = snoise(vec2(p.x * 12.0 + s1 * 20.0, p.y * 2.0 + s2 * 5.0));
    flow = smoothstep(0.3, 0.7, flow);

    // Circuit nodes at grid intersections
    vec2 nearestNode = floor(gp) + 0.5;
    float nodeDist = length(gp - nearestNode);
    float nodes = 1.0 - smoothstep(0.1, 0.2, nodeDist);
    nodes *= step(0.5, snoise(nearestNode * 0.5 + s3 * 3.0) * 0.5 + 0.5);

    // Background noise
    float bg = fbm(p * 1.5, s3) * 0.3 + 0.4;

    return bg + grid * 0.25 + flow * 0.2 + nodes * 0.15;
  }

  // --- Style 2: Performance Radial/Energetic ---
  float stylePerformance(vec2 p, float s1, float s2, float s3) {
    float dist = length(p);
    float angle = atan(p.y, p.x);

    // Concentric rings modulated by noise
    float rings = sin(dist * 10.0 - fbm(p * 0.8, s1) * 6.0);
    rings = smoothstep(-0.1, 0.1, rings) * 0.5;

    // Angular rays
    float rays = sin(angle * 8.0 + snoise(vec2(dist * 2.0, s2 * 10.0)) * 3.0);
    rays = smoothstep(0.2, 0.8, rays * 0.5 + 0.5) * 0.3;

    // Pulsing energy from center
    float pulse = 1.0 - smoothstep(0.0, 1.8, dist);
    pulse *= fbm(p * 2.0 + vec2(s1 * 3.0, s3 * 7.0), s2) * 0.5 + 0.5;

    // Outer noise halo
    float halo = fbm(vec2(angle * 2.0, dist * 1.5) + vec2(s3 * 5.0), s1) * 0.3;

    return rings + rays + pulse * 0.4 + halo;
  }

  // --- Style 3: Artwork Organic/Flowing ---
  float styleArtwork(vec2 p, float s1, float s2, float s3) {
    // Enhanced domain warping with extra pass
    vec2 q = vec2(
      fbm(p + vec2(s1 * 5.2, s2 * 1.3), s1),
      fbm(p + vec2(s2 * 8.1, s3 * 3.7), s2)
    );
    vec2 r = vec2(
      fbm(p + 5.0 * q + vec2(s3 * 1.7, s1 * 9.2), s3),
      fbm(p + 5.0 * q + vec2(s1 * 8.3, s2 * 2.8), s1)
    );
    // Third warp pass for extra fluidity
    vec2 s = vec2(
      fbm(p + 3.0 * r + vec2(s2 * 4.1, s3 * 6.5), s1),
      fbm(p + 3.0 * r + vec2(s3 * 2.9, s1 * 5.3), s2)
    );
    float n = fbm(p + 4.0 * s, s3);

    // Smooth the result for painterly feel
    return smoothstep(-0.6, 0.8, n);
  }

  // --- Style 4: DIY Textured/Layered ---
  float styleDIY(vec2 p, float s1, float s2, float s3) {
    // Coarse structure
    float coarse = fbm(p * 1.2 + vec2(s1 * 6.0, s2 * 4.0), s1);

    // Medium detail
    float medium = fbm(p * 3.5 + vec2(s2 * 3.0, s3 * 8.0), s2);

    // Fine grain/texture
    float fine = snoise(p * 15.0 + vec2(s3 * 10.0, s1 * 7.0));

    // Layered combination with contrast
    float layered = coarse * 0.5 + medium * 0.35 + fine * 0.15;

    // Create tonal bands for industrial feel
    float banded = floor(layered * 4.0 + 2.0) / 4.0;
    float smooth_val = layered * 0.5 + 0.5;

    // Mix smooth and banded for textured look
    return mix(smooth_val, banded, 0.4);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 3.0;

    // Generate pattern based on style
    float n;
    if (u_style < 0.5) {
      n = style3D(p, u_seed1, u_seed2, u_seed3);
    } else if (u_style < 1.5) {
      n = styleSoftware(p, u_seed1, u_seed2, u_seed3);
    } else if (u_style < 2.5) {
      n = stylePerformance(p, u_seed1, u_seed2, u_seed3);
    } else if (u_style < 3.5) {
      n = styleArtwork(p, u_seed1, u_seed2, u_seed3);
    } else {
      n = styleDIY(p, u_seed1, u_seed2, u_seed3);
    }

    // Map to 0-1 range
    float t = clamp(n * 0.5 + 0.5, 0.0, 1.0);

    // Three-way color blend
    vec3 color;
    if (t < 0.5) {
      color = mix(u_color1, u_color2, t * 2.0);
    } else {
      color = mix(u_color2, u_color3, (t - 0.5) * 2.0);
    }

    // Background blend — mix with dark background
    vec3 bg = vec3(0.039, 0.055, 0.102); // #0a0e1a
    color = mix(bg, color, 0.35 + 0.3 * t);

    // Radial vignette
    float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5) * 1.8);
    color *= 0.6 + 0.4 * vignette;

    // Thumbnail mode: darken center region for icon readability
    if (u_mode > 0.5) {
      float centerY = smoothstep(0.2, 0.35, uv.y) * (1.0 - smoothstep(0.65, 0.8, uv.y));
      float centerX = smoothstep(0.15, 0.35, uv.x) * (1.0 - smoothstep(0.65, 0.85, uv.x));
      color *= 1.0 - 0.25 * centerX * centerY;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;
