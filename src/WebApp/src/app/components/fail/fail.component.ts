import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
  SimpleChanges,
  Input,
  HostListener,
} from '@angular/core';

import {
  Renderer,
  Program,
  Triangle,
  Mesh
} from 'ogl';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// Tipovi i pomoćne funkcije
export type RaysOrigin =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'right'
  | 'left'
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left';

const DEFAULT_COLOR = '#ffffff';

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

const getAnchorAndDir = (
  origin: RaysOrigin,
  w: number,
  h: number
): { anchor: [number, number]; dir: [number, number] } => {
  const outside = 0.2;
  switch (origin) {
    case 'top-left':
      return { anchor: [0, -outside * h], dir: [0, 1] };
    case 'top-right':
      return { anchor: [w, -outside * h], dir: [0, 1] };
    case 'left':
      return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
    case 'right':
      return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
    case 'bottom-left':
      return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
    case 'bottom-center':
      return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
    case 'bottom-right':
      return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
    default: // "top-center"
      return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
  }
};

@Component({
  selector: 'app-fail',
  imports: [CommonModule],
  templateUrl: './fail.component.html',
  styleUrl: './fail.component.css'
})
export class FailComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() raysOrigin: RaysOrigin = 'top-center';
  @Input() raysColor: string = DEFAULT_COLOR;
  @Input() raysSpeed: number = 1;
  @Input() lightSpread: number = 1;
  @Input() rayLength: number = 2;
  @Input() pulsating: boolean = false;
  @Input() fadeDistance: number = 1.0;
  @Input() saturation: number = 1.0;
  @Input() followMouse: boolean = true;
  @Input() mouseInfluence: number = 0.1;
  @Input() noiseAmount: number = 0.0;
  @Input() distortion: number = 0.0;
  @Input() className: string = '';

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;


  constructor(private router : Router) {}


  private renderer!: Renderer;
  private uniforms: any;
  private mousePos = { x: 0.5, y: 0.5 };
  private smoothMouse = { x: 0.5, y: 0.5 };
  private animationId!: number;
  private mesh!: Mesh;
  private isVisible = false;
  private observer!: IntersectionObserver;

  vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

  frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
              rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                          1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
              rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                          1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;
  showVerificationMessage: boolean = false;
  ngOnInit() {
    this.observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        this.isVisible = entry.isIntersecting;
        if (this.isVisible) {
          this.initializeWebGL();
        } else {
          this.cleanupWebGL();
        }
      },
      { threshold: 0.1 }
    );
    this.showVerificationMessage = true; 
  }

  ngAfterViewInit() {
    if (this.containerRef) {
      this.observer.observe(this.containerRef.nativeElement);
    }

    setTimeout(() => {
            this.router.navigate(['home']);
          }, 4000);
  }

  ngOnDestroy() {
    this.observer.disconnect();
    this.cleanupWebGL();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.uniforms) {
      this.updateUniforms();
    }
  }

  private initializeWebGL() {
    if (this.renderer) return;

    this.renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true
    });
    const gl = this.renderer.gl;

    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';

    while (this.containerRef.nativeElement.firstChild) {
      this.containerRef.nativeElement.removeChild(this.containerRef.nativeElement.firstChild);
    }
    this.containerRef.nativeElement.appendChild(gl.canvas);

    this.uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      rayPos: { value: [0, 0] },
      rayDir: { value: [0, 1] },
      raysColor: { value: hexToRgb(this.raysColor) },
      raysSpeed: { value: this.raysSpeed },
      lightSpread: { value: this.lightSpread },
      rayLength: { value: this.rayLength },
      pulsating: { value: this.pulsating ? 1.0 : 0.0 },
      fadeDistance: { value: this.fadeDistance },
      saturation: { value: this.saturation },
      mousePos: { value: [0.5, 0.5] },
      mouseInfluence: { value: this.mouseInfluence },
      noiseAmount: { value: this.noiseAmount },
      distortion: { value: this.distortion }
    };

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: this.vert,
      fragment: this.frag,
      uniforms: this.uniforms
    });
    this.mesh = new Mesh(gl, { geometry, program });

    this.updatePlacement();
    this.loop();
  }

  private cleanupWebGL() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      try {
        const canvas = this.renderer.gl.canvas;
        const loseContextExt = this.renderer.gl.getExtension('WEBGL_lose_context');
        if (loseContextExt) {
          loseContextExt.loseContext();
        }
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      } catch (error) {
        console.warn('Error during WebGL cleanup:', error);
      }
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updatePlacement();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.followMouse || !this.containerRef || !this.renderer) return;
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    this.mousePos.x = (e.clientX - rect.left) / rect.width;
    this.mousePos.y = (e.clientY - rect.top) / rect.height;
  }

  private updatePlacement() {
    if (!this.containerRef || !this.renderer) return;

    this.renderer.dpr = Math.min(window.devicePixelRatio, 2);

    const { clientWidth: wCSS, clientHeight: hCSS } = this.containerRef.nativeElement;
    this.renderer.setSize(wCSS, hCSS);

    const dpr = this.renderer.dpr;
    const w = wCSS * dpr;
    const h = hCSS * dpr;

    this.uniforms.iResolution.value = [w, h];

    const { anchor, dir } = getAnchorAndDir(this.raysOrigin, w, h);
    this.uniforms.rayPos.value = anchor;
    this.uniforms.rayDir.value = dir;
  }

  private updateUniforms() {
    if (!this.uniforms) return;
    const u = this.uniforms;
    u.raysColor.value = hexToRgb(this.raysColor);
    u.raysSpeed.value = this.raysSpeed;
    u.lightSpread.value = this.lightSpread;
    u.rayLength.value = this.rayLength;
    u.pulsating.value = this.pulsating ? 1.0 : 0.0;
    u.fadeDistance.value = this.fadeDistance;
    u.saturation.value = this.saturation;
    u.mouseInfluence.value = this.mouseInfluence;
    u.noiseAmount.value = this.noiseAmount;
    u.distortion.value = this.distortion;

    const { clientWidth: wCSS, clientHeight: hCSS } = this.containerRef.nativeElement;
    const dpr = this.renderer.dpr;
    const { anchor, dir } = getAnchorAndDir(this.raysOrigin, wCSS * dpr, hCSS * dpr);
    u.rayPos.value = anchor;
    u.rayDir.value = dir;
  }

  private loop(t: number = 0) {
    if (!this.renderer || !this.uniforms || !this.mesh) {
      return;
    }

    this.uniforms.iTime.value = t * 0.001;

    if (this.followMouse && this.mouseInfluence > 0.0) {
      const smoothing = 0.92;
      this.smoothMouse.x = this.smoothMouse.x * smoothing + this.mousePos.x * (1 - smoothing);
      this.smoothMouse.y = this.smoothMouse.y * smoothing + this.mousePos.y * (1 - smoothing);
      this.uniforms.mousePos.value = [this.smoothMouse.x, this.smoothMouse.y];
    }

    try {
      this.renderer.render({ scene: this.mesh });
      this.animationId = requestAnimationFrame(this.loop.bind(this));
    } catch (error) {
      console.warn('WebGL rendering error:', error);
    }
  }
}