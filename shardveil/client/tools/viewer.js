// Dev-only asset viewer: /tools/viewer.html?anim=Idle&t=0.5&cam=front
import * as THREE from 'three';
import { assets } from '/src/assets/library.js';
import { Avatar, avatarAssetList } from '/src/scene/avatar.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const q = new URLSearchParams(location.search);
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1c2028');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.5;
const key = new THREE.DirectionalLight('#ffe8c8', 2.2); key.position.set(3, 5, 4); key.castShadow = true; scene.add(key);
const rim = new THREE.DirectionalLight('#8fb0ff', 1.4); rim.position.set(-4, 3, -4); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 48), new THREE.MeshStandardMaterial({ color: '#2a2a2e', roughness: 0.9 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.05, 100);

await assets.init();
await assets.preload(avatarAssetList());
const setups = (q.get('who') || 'arcanist:ash_staff,vanguard:ironwood_blade,shadeblade:twin_fangs,wardweaver:willow_rod').split(',');
const avatars = setups.map((s, i) => {
  const [outfit, weapon] = s.split(':');
  const a = new Avatar({ outfit, weapon: weapon || null });
  a.root.position.x = (i - (setups.length - 1) / 2) * 1.0;
  scene.add(a.root);
  return a;
});
const anim = q.get('anim') || 'Idle';
const t = Number(q.get('t') || 0.4);
const speed = { Idle: 0, Walk: 1.5, Run: 5.6 }[anim] ?? 0;
const st = { speed, attackT: 99, castT: 99, hitT: 99, dead: false };
for (const a of avatars) a.update(st, 0.0001);
if (anim === 'Attack') st.attackT = 0;
if (anim === 'Cast') st.castT = 0;
if (anim === 'Hit') st.hitT = 0;
if (anim === 'Death') st.dead = true;
const steps = Math.round(t / (1 / 30));
for (let i = 0; i < steps; i++) for (const a of avatars) { a.update(st, 1 / 30); st.attackT += 1 / 30; st.castT += 1 / 30; st.hitT += 1 / 30; }
const cam = q.get('cam') || 'front';
const span = setups.length;
if (cam === 'front') { camera.position.set(0, 1.25, 1.6 + span * 1.05); camera.lookAt(0, 1.0, 0); }
if (cam === 'close') { camera.position.set(0.2, 1.62, 0.85); camera.lookAt(0, 1.55, 0); }
if (cam === 'side') { camera.position.set(2.6 + span, 1.2, 0.6); camera.lookAt(0, 0.95, 0); }
if (cam === 'back') { camera.position.set(0.6, 1.6, -2.5 - span); camera.lookAt(0, 1.0, 0); }
renderer.render(scene, camera);
window.viewerReady = true;
