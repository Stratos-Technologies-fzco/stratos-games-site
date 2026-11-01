import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

export class Environment {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 15000;
    const d = 2500;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0001;
    this.scene.add(this.sunLight);

    this.ambientLight = new THREE.AmbientLight(0xddeeff, 0.4);
    this.scene.add(this.ambientLight);

    this.initSky();
    this.initOcean();
    this.initTerrain();

    this.setTimeOfDay(45);
  }

  initSky() {
    this.sky = new Sky();
    this.sky.scale.setScalar(450000);
    this.scene.add(this.sky);

    this.skyUniforms = this.sky.material.uniforms;
    this.skyUniforms['turbidity'].value = 2.5;
    this.skyUniforms['rayleigh'].value = 1.2;
    this.skyUniforms['mieCoefficient'].value = 0.005;
    this.skyUniforms['mieDirectionalG'].value = 0.8;
  }

  initOcean() {
    const oceanGeo = new THREE.PlaneGeometry(30000, 30000, 128, 128);
    oceanGeo.rotateX(-Math.PI / 2);

    this.oceanMaterial = new THREE.ShaderMaterial({
      wireframe: false,
      uniforms: {
        uTime: { value: 0 },
        uSunDir: { value: new THREE.Vector3() },
        uSunColor: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vWorldPos;
        varying vec3 vNormal;

        void main() {
          vec3 pos = position;
          float wave1 = sin(pos.x * 0.005 + uTime * 1.5) * cos(pos.z * 0.005 + uTime * 1.2) * 2.5;
          float wave2 = sin(pos.x * 0.02 - uTime * 2.0) * 0.8;
          pos.y += wave1 + wave2;

          vNormal = normalize(vec3(-cos(pos.x * 0.005) * 0.1, 1.0, -sin(pos.z * 0.005) * 0.1));
          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        uniform vec3 uSunColor;
        varying vec3 vWorldPos;
        varying vec3 vNormal;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          vec3 normal = normalize(vNormal);

          vec3 deepColor = vec3(0.01, 0.08, 0.18);
          vec3 shallowColor = vec3(0.04, 0.22, 0.35);

          float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);

          vec3 halfVec = normalize(uSunDir + viewDir);
          float spec = pow(max(dot(normal, halfVec), 0.0), 128.0) * 2.0;

          vec3 oceanCol = mix(deepColor, shallowColor, fresnel * 0.5);
          vec3 finalColor = oceanCol + (uSunColor * spec);

          gl_FragColor = vec4(finalColor, 0.92);
        }
      `,
      transparent: true,
      depthWrite: true
    });

    this.ocean = new THREE.Mesh(oceanGeo, this.oceanMaterial);
    this.ocean.position.y = 0;
    this.scene.add(this.ocean);
  }

  initTerrain() {
    const size = 8000;
    const res = 160;
    const terrainGeo = new THREE.PlaneGeometry(size, size, res, res);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      const distFromCenter = Math.sqrt(x * x + z * z);
      const islandMask = Math.max(0, 1.0 - (distFromCenter / 3500.0));

      const n1 = Math.sin(x * 0.0012) * Math.cos(z * 0.0012) * 220.0;
      const n2 = Math.sin(x * 0.0031 + 1.2) * Math.sin(z * 0.0028) * 85.0;
      const n3 = Math.cos(x * 0.008) * Math.sin(z * 0.008) * 25.0;

      let height = (n1 + n2 + n3 + 120.0) * Math.pow(islandMask, 1.8) - 15.0;
      pos.setY(i, height);
    }
    terrainGeo.computeVertexNormals();

    this.terrainMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: new THREE.Vector3() },
        uSunColor: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        uniform vec3 uSunColor;
        varying vec3 vNormal;
        varying vec3 vWorldPos;

        void main() {
          vec3 norm = normalize(vNormal);
          float y = vWorldPos.y;

          float slope = 1.0 - norm.y;
          vec3 sand = vec3(0.76, 0.70, 0.50);
          vec3 grass = vec3(0.20, 0.42, 0.18);
          vec3 rock = vec3(0.35, 0.33, 0.30);
          vec3 snow = vec3(0.92, 0.94, 0.98);

          vec3 baseColor = sand;
          if (y > 4.0) {
            baseColor = mix(sand, grass, clamp((y - 4.0) / 10.0, 0.0, 1.0));
          }
          if (y > 60.0) {
            baseColor = mix(baseColor, rock, clamp((y - 60.0) / 50.0, 0.0, 1.0));
          }
          if (slope > 0.45 && y > 15.0) {
            baseColor = rock;
          }
          if (y > 220.0 && slope < 0.5) {
            baseColor = mix(baseColor, snow, clamp((y - 220.0) / 40.0, 0.0, 1.0));
          }

          float diff = max(dot(norm, uSunDir), 0.05);
          vec3 finalColor = baseColor * (diff * uSunColor + vec3(0.12, 0.16, 0.22));

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    this.terrain = new THREE.Mesh(terrainGeo, this.terrainMaterial);
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);
  }

  setTimeOfDay(elevationDeg) {
    const phi = THREE.MathUtils.degToRad(90 - elevationDeg);
    const theta = THREE.MathUtils.degToRad(180);

    const sunPos = new THREE.Vector3();
    sunPos.setFromSphericalCoords(10000, phi, theta);

    this.sunLight.position.copy(sunPos);
    this.skyUniforms['sunPosition'].value.copy(sunPos);

    const sunDir = sunPos.clone().normalize();
    this.oceanMaterial.uniforms.uSunDir.value.copy(sunDir);
    this.terrainMaterial.uniforms.uSunDir.value.copy(sunDir);

    if (elevationDeg < 15) {
      this.sunLight.color.setHex(0xff7a36);
      this.ambientLight.color.setHex(0x5c4250);
    } else if (elevationDeg < 30) {
      this.sunLight.color.setHex(0xffb366);
      this.ambientLight.color.setHex(0x7da4c2);
    } else {
      this.sunLight.color.setHex(0xffffff);
      this.ambientLight.color.setHex(0xddeeff);
    }

    this.oceanMaterial.uniforms.uSunColor.value.copy(this.sunLight.color);
    this.terrainMaterial.uniforms.uSunColor.value.copy(this.sunLight.color);
  }

  update(time) {
    this.oceanMaterial.uniforms.uTime.value = time;
  }
}
