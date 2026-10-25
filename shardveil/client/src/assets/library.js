// Asset library: loads GLB/glTF assets listed in /assets/manifest.json through
// GLTFLoader, caches them, and hands out independent clones. This is the only
// path by which character, outfit and weapon art enters the game, so artist
// assets replace generated ones by changing a URL in the manifest.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';

export class AssetLibrary {
  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map();
    this.ready = new Map();
    this.manifest = null;
    this.loaded = 0;
    this.total = 0;
  }

  async init() {
    const res = await fetch('/assets/manifest.json');
    if (!res.ok) throw new Error('Asset manifest missing');
    this.manifest = await res.json();
  }

  entry(kind, key) {
    return this.manifest?.[kind]?.[key] || null;
  }

  load(kind, key) {
    const id = `${kind}/${key}`;
    if (!this.cache.has(id)) {
      const e = this.entry(kind, key);
      if (!e) return Promise.reject(new Error(`No asset ${id} in manifest`));
      this.total++;
      this.cache.set(id, this.loader.loadAsync(e.url).then((gltf) => {
        this.loaded++;
        this.ready.set(id, gltf);
        gltf.scene.traverse((o) => {
          if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = !o.isSkinnedMesh; }
        });
        return gltf;
      }));
    }
    return this.cache.get(id);
  }

  async preload(list, onProgress) {
    let done = 0;
    await Promise.all(list.map(([kind, key]) => this.load(kind, key).then(() => onProgress?.(++done, list.length))));
  }

  // Synchronous access after preload (null if not loaded yet).
  get(kind, key) {
    return this.ready.get(`${kind}/${key}`) || null;
  }

  // Independent copy of a loaded asset (skeletons are cloned correctly).
  cloneLoaded(kind, key) {
    const gltf = this.get(kind, key);
    return gltf ? { scene: cloneSkinned(gltf.scene), animations: gltf.animations } : null;
  }

  async instance(kind, key) {
    const gltf = await this.load(kind, key);
    return { scene: cloneSkinned(gltf.scene), animations: gltf.animations };
  }
}

export const assets = new AssetLibrary();
