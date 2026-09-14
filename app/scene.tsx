import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createExplosionLayout} from './explosion-layout';
import {PointerTap} from './pointer-tap';
import {PIANO, SYSTEM_OFFSET, type GeomName, type MatName, type Piece} from './piano';
import {agraffeGeometry, casterGeometry, damperGeometry, hammerGeometry, lidGeometry, lyreGeometry, plateGeometry, rimGeometry, soundboardGeometry, whiteKeyGeometry, wippenGeometry} from './shape';
import type {SceneState, SystemId} from './atlas';

interface Props {
  state: SceneState;
  onSelect: (id: string) => void;
  onHover: (id: string, x: number, y: number) => void;
}

const MAT: Record<MatName, {color: string; metalness: number; roughness: number; clearcoat?: number}> = {
  ebony: {color: '#1c1b1f', metalness: 0.2, roughness: 0.3, clearcoat: 0.7},
  ivory: {color: '#f4efe4', metalness: 0.04, roughness: 0.46},
  sharp: {color: '#141416', metalness: 0.14, roughness: 0.36, clearcoat: 0.45},
  brass: {color: '#c6a45c', metalness: 0.92, roughness: 0.26},
  gold: {color: '#d0a84c', metalness: 0.88, roughness: 0.3},
  spruce: {color: '#d9b57e', metalness: 0.04, roughness: 0.7},
  maple: {color: '#cc985a', metalness: 0.06, roughness: 0.6},
  felt: {color: '#dccab0', metalness: 0, roughness: 0.92},
  damperFelt: {color: '#a0443a', metalness: 0, roughness: 0.88},
  steel: {color: '#c7cad0', metalness: 1, roughness: 0.16},
  copper: {color: '#b56c34', metalness: 0.9, roughness: 0.3},
  iron: {color: '#5a5854', metalness: 0.7, roughness: 0.44},
  blued: {color: '#2a3138', metalness: 0.86, roughness: 0.34},
  hornbeam: {color: '#e4c68c', metalness: 0.05, roughness: 0.56},
};

function makeGeoms(): Record<GeomName, THREE.BufferGeometry> {
  const box = new THREE.BoxGeometry(1, 1, 1);
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 10);
  return {
    box, cyl,
    rim: rimGeometry(),
    lid: lidGeometry(),
    soundboard: soundboardGeometry(),
    plate: plateGeometry(),
    hammer: hammerGeometry(),
    wippen: wippenGeometry(),
    damper: damperGeometry(),
    agraffe: agraffeGeometry(),
    lyre: lyreGeometry(),
    caster: casterGeometry(),
    keyC: whiteKeyGeometry('C'),
    keyD: whiteKeyGeometry('D'),
    keyE: whiteKeyGeometry('E'),
    keyF: whiteKeyGeometry('F'),
    keyG: whiteKeyGeometry('G'),
    keyA: whiteKeyGeometry('A'),
    keyB: whiteKeyGeometry('B'),
    keyEnd: whiteKeyGeometry('End'),
  };
}

function material(name: MatName) {
  const m = MAT[name];
  return new THREE.MeshPhysicalMaterial({
    color: m.color,
    metalness: m.metalness,
    roughness: m.roughness,
    clearcoat: m.clearcoat ?? 0,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.9,
  });
}

type Slot = {piece: Piece; key: string; index: number};

export default function PianoScene({state, onSelect, onHover}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(state);
  const select = useRef(onSelect);
  const hover = useRef(onHover);
  latest.current = state;
  select.current = onSelect;
  hover.current = onHover;

  useEffect(() => {
    const el = host.current!;
    let disposed = false, frame = 0, dirty = true, amount = 0;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({antialias: true, alpha: false, powerPreference: 'high-performance'});
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 1.4 : 1.8));
    renderer.setClearColor('#ece8df');
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', 'Interactive Steinway Model D. Drag to orbit, pinch or scroll to zoom, tap a part to inspect it.');

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#ece8df', 8, 22);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.02, 80);
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(-2.6, 1.85, -2.35);
    controls.target.set(0, 0.82, 1.05);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.25;
    controls.maxDistance = 28;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.addEventListener('change', () => { dirty = true; });

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.dispose();
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xfff6ea, 0x8a9098, 0.85));
    const key = new THREE.DirectionalLight(0xfff4e6, 2.15);
    key.position.set(-3.2, 5.2, -1.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -3;
    key.shadow.bias = -0.0004;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe8eef6, 1.35);
    rim.position.set(2.6, 2.4, 3.2);
    scene.add(rim);
    const glow = new THREE.PointLight(0xf0d8b0, 1.4, 8);
    glow.position.set(0.4, 1.6, -1.2);
    scene.add(glow);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(18, 80), new THREE.MeshStandardMaterial({color: 0xddd6c8, roughness: 1}));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.58, 0.03, 96), new THREE.MeshStandardMaterial({color: 0xe7e1d4, metalness: 0.12, roughness: 0.62}));
    platform.position.y = 0.01;
    platform.receiveShadow = true;
    scene.add(platform);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.48, 1.492, 128), new THREE.MeshBasicMaterial({color: 0xb08a3e, side: THREE.DoubleSide}));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.026;
    scene.add(ring);

    const geoms = makeGeoms();
    const materials = new Map<MatName, THREE.MeshPhysicalMaterial>();
    (Object.keys(MAT) as MatName[]).forEach(name => materials.set(name, material(name)));

    const groups = new Map<string, Piece[]>();
    for (const piece of PIANO.pieces) {
      const keyName = `${piece.geom}:${piece.material}`;
      const list = groups.get(keyName) ?? [];
      list.push(piece);
      groups.set(keyName, list);
    }

    const slots: Slot[] = [];
    const meshes: THREE.Mesh[] = [];
    const dummy = new THREE.Object3D();
    const home = PIANO.pieces.map(p => new THREE.Vector3(...p.position));
    const color = new THREE.Color();
    const highlight = new THREE.Color('#3db8a8');

    groups.forEach((list, keyName) => {
      const piece0 = list[0];
      const geom = geoms[piece0.geom];
      const mat = materials.get(piece0.material)!;
      if (list.length === 1) {
        const mesh = new THREE.Mesh(geom, mat.clone());
        mesh.matrixAutoUpdate = false;
        mesh.castShadow = piece0.system === 'case' || piece0.system === 'stand' || piece0.kind === 'key';
        mesh.receiveShadow = true;
        mesh.userData.slot0 = slots.length;
        scene.add(mesh);
        meshes.push(mesh);
        slots.push({piece: piece0, key: keyName, index: 0});
      } else {
        const inst = new THREE.InstancedMesh(geom, mat, list.length);
        inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        const pal = new THREE.InstancedBufferAttribute(new Float32Array(list.length * 3), 3);
        inst.instanceColor = pal;
        const base = new THREE.Color(MAT[piece0.material].color);
        for (let i = 0; i < list.length; i++) {
          pal.setXYZ(i, base.r, base.g, base.b);
          inst.setColorAt(i, base);
          inst.userData[`i${i}`] = slots.length;
          slots.push({piece: list[i], key: keyName, index: i});
        }
        inst.castShadow = piece0.kind === 'key';
        inst.receiveShadow = true;
        inst.userData.group = keyName;
        scene.add(inst);
        meshes.push(inst);
      }
    });

    const slotOf = new Map<string, Slot>();
    slots.forEach(s => slotOf.set(s.piece.id, s));
    const meshByKey = new Map<string, THREE.Mesh>();
    meshes.forEach(m => {
      if (m instanceof THREE.InstancedMesh) meshByKey.set(m.userData.group, m);
      else {
        const slot = slots[m.userData.slot0];
        meshByKey.set(slot.key, m);
      }
    });

    let packingWidth = 2, packingHeight = 2, layoutKey = '';
    const offsets = PIANO.pieces.map(() => new THREE.Vector3());
    const visibleSet = new Set<string>();

    const applyMatrix = (slot: Slot, pos: THREE.Vector3, extraRotX = 0, extraY = 0) => {
      dummy.position.copy(pos);
      dummy.position.y += extraY;
      dummy.rotation.set(slot.piece.rotation[0] + extraRotX, slot.piece.rotation[1], slot.piece.rotation[2]);
      dummy.scale.set(...slot.piece.scale);
      dummy.updateMatrix();
      const mesh = meshByKey.get(slot.key)!;
      if (mesh instanceof THREE.InstancedMesh) mesh.setMatrixAt(slot.index, dummy.matrix);
      else mesh.matrix.copy(dummy.matrix);
    };

    const fit = (view: SceneState['view'], extent = 0) => {
      const mobile = el.clientWidth < 768;
      const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const assembled = mobile ? 4.6 : 3.9;
      const atlas = Math.max(packingHeight, packingWidth / Math.max(0.4, camera.aspect)) / (2 * tangent) * 1.2 + 0.6;
      const distance = THREE.MathUtils.lerp(assembled, Math.max(assembled, atlas), extent);
      if (extent > 0.8) view = 'front';
      const dir =
        view === 'front' ? new THREE.Vector3(0, 0.08, -1) :
        view === 'side' ? new THREE.Vector3(-1, 0.08, 0.12) :
        view === 'top' ? new THREE.Vector3(0.02, 1, 0.001) :
        new THREE.Vector3(-0.55, 0.32, -0.72).normalize();
      const target = new THREE.Vector3(extent > 0.15 ? 0 : 0, extent > 0.15 ? 1.15 : 0.78, extent > 0.15 ? 0.2 : 1.05);
      controls.target.copy(target);
      camera.position.copy(target).addScaledVector(dir, distance);
      controls.update();
      dirty = true;
    };

    const resize = () => {
      layoutKey = '';
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      fit(latest.current.view, amount);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const tap = new PointerTap();
    const down = (e: PointerEvent) => tap.down(e.pointerId, e.clientX, e.clientY, e.pointerType === 'touch' ? 12 : 5);
    const move = (e: PointerEvent) => {
      tap.move(e.pointerId, e.clientX, e.clientY);
      if (e.buttons) {
        hover.current('', 0, 0);
        return;
      }
      const rect = el.getBoundingClientRect();
      pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(meshes, false);
      const hit = hits.find(h => h.object.visible);
      if (!hit) {
        renderer.domElement.style.cursor = 'grab';
        hover.current('', 0, 0);
        return;
      }
      const mesh = hit.object as THREE.Mesh;
      const slot = mesh instanceof THREE.InstancedMesh
        ? slots.find(s => s.key === mesh.userData.group && s.index === (hit.instanceId ?? 0))
        : slots[mesh.userData.slot0];
      if (!slot || !visibleSet.has(slot.piece.id)) {
        hover.current('', 0, 0);
        return;
      }
      renderer.domElement.style.cursor = 'pointer';
      hover.current(slot.piece.id, e.clientX - rect.left, e.clientY - rect.top);
    };
    const up = (e: PointerEvent) => {
      if (!tap.up(e.pointerId, e.clientX, e.clientY)) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(meshes, false);
      const hit = hits.find(h => h.object.visible);
      if (!hit) return;
      const mesh = hit.object as THREE.Mesh;
      const slot = mesh instanceof THREE.InstancedMesh
        ? slots.find(s => s.key === mesh.userData.group && s.index === (hit.instanceId ?? 0))
        : slots[mesh.userData.slot0];
      if (slot && visibleSet.has(slot.piece.id)) select.current(slot.piece.id);
    };
    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointercancel', e => tap.cancel(e.pointerId));

    const clock = new THREE.Clock();
    let lastView = '', lastReset = -1, lastIsolate = '';
    const pos = new THREE.Vector3();

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const s = latest.current;
      const moving = Math.abs(amount - s.explode) > 0.0001;
      if (moving) {
        amount = THREE.MathUtils.damp(amount, s.explode, 8, dt);
        dirty = true;
      }
      const selection = new Set(s.selected);
      const visibleSystems = new Set(s.visible);
      const nextLayoutKey = `${s.visible.join(',')}|${s.isolate}|${s.selected.join(',')}|${camera.aspect.toFixed(2)}`;
      const visiblePieces = PIANO.pieces.filter(p => s.isolate ? selection.has(p.id) : visibleSystems.has(p.system) || selection.has(p.id));
      if (nextLayoutKey !== layoutKey) {
        const layout = createExplosionLayout(visiblePieces, camera.aspect);
        packingWidth = layout.width;
        packingHeight = layout.height;
        PIANO.pieces.forEach((p, i) => {
          const cell = layout.cells.get(p.id);
          const c = home[i];
          offsets[i] = cell
            ? new THREE.Vector3(cell.x - c.x, cell.y + 1.15 - c.y, 0.4 - c.z)
            : new THREE.Vector3();
        });
        layoutKey = nextLayoutKey;
        if (amount > 0.05 && !s.isolate) fit(s.view, Math.max(0, (amount - 0.3) / 0.7));
      }

      visibleSet.clear();
      const tSys = Math.min(1, amount / 0.42);
      const tInv = THREE.MathUtils.smoothstep(amount, 0.42, 1);
      const instDirty = new Set<THREE.InstancedMesh>();

      PIANO.pieces.forEach((p, i) => {
        const show = s.isolate ? selection.has(p.id) : visibleSystems.has(p.system) || selection.has(p.id);
        if (show) visibleSet.add(p.id);
        const off = SYSTEM_OFFSET[p.system];
        pos.copy(home[i]);
        pos.x += off[0] * tSys * (1 - tInv);
        pos.y += off[1] * tSys * (1 - tInv);
        pos.z += off[2] * tSys * (1 - tInv);
        pos.addScaledVector(offsets[i], tInv);
        let extraX = 0, extraY = 0;
        if (s.playingNote && p.note === s.playingNote) {
          const k = 1;
          if (p.kind === 'key') extraX = p.info.kind === 'key' && !p.note ? 0 : 0.09;
          if (p.kind === 'key') extraY = -0.006;
          if (p.kind === 'hammer') extraX = -0.42;
          if (p.kind === 'damper') extraY = 0.014;
        }
        const slot = slotOf.get(p.id)!;
        applyMatrix(slot, pos, extraX, extraY);
        const mesh = meshByKey.get(slot.key)!;
        if (mesh instanceof THREE.InstancedMesh) {
          instDirty.add(mesh);
          const base = MAT[p.material].color;
          color.set(base);
          if (selection.has(p.id)) color.lerp(highlight, 0.55);
          mesh.setColorAt(slot.index, color);
          mesh.instanceColor!.needsUpdate = true;
        } else {
          mesh.visible = show;
          const mat = mesh.material as THREE.MeshPhysicalMaterial;
          mat.emissive.set(selection.has(p.id) ? '#3a8f84' : '#000000');
          mat.emissiveIntensity = selection.has(p.id) ? 0.22 : 0;
        }
        if (mesh instanceof THREE.InstancedMesh) mesh.visible = true;
      });

      // Hide unused instances by moving them far away when not shown.
      slots.forEach(slot => {
        if (visibleSet.has(slot.piece.id)) return;
        dummy.position.set(0, -50, 0);
        dummy.scale.set(0.0001, 0.0001, 0.0001);
        dummy.updateMatrix();
        const mesh = meshByKey.get(slot.key)!;
        if (mesh instanceof THREE.InstancedMesh) {
          mesh.setMatrixAt(slot.index, dummy.matrix);
          instDirty.add(mesh);
        }
      });
      instDirty.forEach(m => { m.instanceMatrix.needsUpdate = true; });

      if (s.view !== lastView || s.reset !== lastReset) {
        fit(s.view, amount);
        lastView = s.view;
        lastReset = s.reset;
      }
      if (moving && !s.isolate) fit(amount > 0.5 ? 'front' : s.view, Math.max(0, (amount - 0.3) / 0.7));

      const isolateKey = s.isolate ? `${s.selected.join(',')}:${s.reset}:${s.inspectorOpen}:${camera.aspect}` : '';
      if (isolateKey !== lastIsolate || (s.isolate && moving)) {
        if (s.isolate && s.selected.length) {
          const box = new THREE.Box3();
          s.selected.forEach(id => {
            const piece = PIANO.byId.get(id);
            const slot = slotOf.get(id);
            if (!piece || !slot) return;
            const mesh = meshByKey.get(slot.key)!;
            mesh.updateMatrixWorld(true);
            if (mesh instanceof THREE.InstancedMesh) {
              dummy.position.copy(home[PIANO.pieces.indexOf(piece)]);
              dummy.position.addScaledVector(offsets[PIANO.pieces.indexOf(piece)], tInv);
              dummy.scale.set(...piece.scale);
              dummy.updateMatrix();
              const b = new THREE.Box3().setFromCenterAndSize(dummy.position, new THREE.Vector3(...piece.size));
              box.union(b);
            } else box.union(new THREE.Box3().setFromObject(mesh));
          });
          if (!box.isEmpty()) {
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const dist = Math.max(0.35, size.length() * 1.8);
            const dir = camera.position.clone().sub(controls.target).normalize();
            controls.target.copy(center);
            camera.position.copy(center).addScaledVector(dir, dist);
            controls.update();
            dirty = true;
          }
        } else if (lastIsolate) fit(s.view, amount);
        lastIsolate = isolateKey;
      }

      const showStage = amount < 0.45 && !s.isolate;
      ground.visible = platform.visible = ring.visible = showStage;
      controls.autoRotate = s.rotate && !s.isolate && amount < 0.35;
      controls.autoRotateSpeed = 0.6;
      controls.enableRotate = amount < 0.82;
      controls.mouseButtons.LEFT = amount < 0.82 ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN;
      controls.update();
      if (controls.autoRotate) dirty = true;
      if (dirty || moving) {
        renderer.render(scene, camera);
        dirty = false;
      }
    };
    animate();

    const lost = (e: Event) => { e.preventDefault(); };
    renderer.domElement.addEventListener('webglcontextlost', lost);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      Object.values(geoms).forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      scene.traverse(o => {
        if (o instanceof THREE.Mesh) {
          const ms = Array.isArray(o.material) ? o.material : [o.material];
          ms.forEach(m => m.dispose());
        }
      });
      env.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="scene" ref={host} />;
}
