import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/** Published Model D envelope. Length and width from Steinway & Sons. */
export const DIM = {
  L: 2.74,
  W: 1.56,
  rim: 0.083,
  caseH: 0.312,
  lidT: 0.02,
  keybedY: 0.658,
  keybedT: 0.0445,
  whiteW: 0.0235,
  whiteVis: 0.148,
  whiteLen: 0.56,
  blackW: 0.011,
  blackVis: 0.095,
  blackH: 0.012,
  keyH: 0.02,
  stringY: 0.812,
  plateY: 0.8,
  boardY: 0.718,
} as const;

const OUTER: [number, number][] = [
  [-0.78, 0.16],
  [0.78, 0.16],
  [0.78, 0.42],
  [0.76, 0.78],
  [0.7, 1.12],
  [0.6, 1.48],
  [0.46, 1.82],
  [0.3, 2.1],
  [0.12, 2.34],
  [-0.06, 2.54],
  [-0.22, 2.66],
  [-0.34, 2.74],
  [-0.5, 2.72],
  [-0.68, 2.6],
  [-0.78, 2.42],
  [-0.78, 1.6],
];

export function grandOuter() {
  return OUTER.map(([x, z]) => new THREE.Vector2(x, z));
}

export function insetPoly(pts: THREE.Vector2[], amount: number) {
  const n = pts.length;
  const out: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const e1 = cur.clone().sub(prev);
    const e2 = next.clone().sub(cur);
    if (e1.lengthSq() < 1e-12 || e2.lengthSq() < 1e-12) {
      out.push(cur.clone());
      continue;
    }
    e1.normalize();
    e2.normalize();
    const n1 = new THREE.Vector2(-e1.y, e1.x);
    const n2 = new THREE.Vector2(-e2.y, e2.x);
    const miter = n1.clone().add(n2);
    if (miter.lengthSq() < 1e-8) {
      out.push(cur.clone().addScaledVector(n1, amount));
      continue;
    }
    miter.normalize();
    const d = Math.max(0.35, n1.dot(miter));
    out.push(cur.clone().addScaledVector(miter, amount / d));
  }
  return out;
}

export function makeShape(pts: THREE.Vector2[]) {
  const s = new THREE.Shape();
  s.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, pts[i].y);
  s.closePath();
  return s;
}

export function grandShape(inset = 0) {
  const pts = inset ? insetPoly(grandOuter(), inset) : grandOuter();
  return makeShape(pts);
}

function flatten(g: THREE.BufferGeometry) {
  g.rotateX(-Math.PI / 2);
  g.scale(1, 1, -1);
  g.computeVertexNormals();
  return g;
}

const extrude = (shape: THREE.Shape, depth: number, bevel = false) =>
  flatten(
    new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 1,
      curveSegments: 1,
    }),
  );

export function rimGeometry() {
  const outer = grandOuter();
  const inner = insetPoly(outer, DIM.rim);
  const shape = makeShape(outer);
  shape.holes.push(makeShape(inner));
  const g = extrude(shape, DIM.caseH);
  g.translate(0, DIM.keybedY, 0);
  return g;
}

export function lidGeometry() {
  const g = extrude(grandShape(0.01), DIM.lidT, true);
  g.translate(DIM.W / 2, 0, 0);
  return g;
}

export function soundboardGeometry() {
  const outer = grandOuter().map(p => new THREE.Vector2(p.x, Math.max(0.58, p.y)));
  const shape = makeShape(insetPoly(outer, 0.11));
  const g = extrude(shape, 0.009);
  g.translate(0, DIM.boardY, 0);
  return g;
}

export function plateGeometry() {
  const outer = grandOuter().map(p => new THREE.Vector2(p.x * 0.94, Math.max(0.26, p.y)));
  const rim = insetPoly(outer, 0.035);
  const well = insetPoly(outer, 0.16);
  const shape = makeShape(rim);
  shape.holes.push(makeShape(well));
  const g = extrude(shape, 0.024, true);
  g.translate(0, DIM.plateY, 0);
  return g;
}

function keyShape(kind: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B' | 'End') {
  const L = 1, W = 1, front = 0.265, tail = 0.5;
  const tc: Record<string, number> = {
    C: -0.22, D: 0, E: 0.22, F: -0.22, G: -0.1, A: 0.1, B: 0.22, End: 0,
  };
  const c = tc[kind];
  const s = new THREE.Shape();
  const hw = W / 2, ht = tail / 2;
  const left = c - ht, right = c + ht;
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw, front);
  if (kind === 'End') {
    s.lineTo(hw, L);
    s.lineTo(-hw, L);
  } else {
    s.lineTo(right, front);
    s.lineTo(right, L);
    s.lineTo(left, L);
    s.lineTo(left, front);
  }
  s.lineTo(-hw, front);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: 1, bevelEnabled: false});
  g.rotateX(-Math.PI / 2);
  g.scale(1, 1, -1);
  g.translate(0, 0.5, 0.5);
  g.computeVertexNormals();
  return g;
}

const KEY_CACHE: Record<string, THREE.BufferGeometry> = {};
export function whiteKeyGeometry(kind: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B' | 'End') {
  return (KEY_CACHE[kind] ??= keyShape(kind));
}

export function hammerGeometry() {
  const molding = new THREE.BoxGeometry(0.55, 0.28, 0.7);
  molding.translate(0, 0.1, 0);
  const felt = new THREE.BoxGeometry(1, 0.55, 0.85);
  felt.translate(0, 0.42, 0);
  const shank = new THREE.BoxGeometry(0.12, 0.12, 1.6);
  shank.translate(0, 0.05, -1.05);
  const g = mergeGeometries([molding, felt, shank], false)!;
  g.computeVertexNormals();
  return g;
}

export function wippenGeometry() {
  const body = new THREE.BoxGeometry(1, 0.22, 1.4);
  const jack = new THREE.BoxGeometry(0.22, 0.7, 0.18);
  jack.translate(0, 0.4, 0.2);
  return mergeGeometries([body, jack], false)!;
}

export function damperGeometry() {
  const head = new THREE.BoxGeometry(1, 0.28, 0.7);
  head.translate(0, 0.55, 0);
  const wire = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6);
  wire.translate(0, -0.15, 0);
  return mergeGeometries([head, wire], false)!;
}

export function agraffeGeometry() {
  const base = new THREE.BoxGeometry(1, 0.4, 0.55);
  const post = new THREE.CylinderGeometry(0.22, 0.22, 0.7, 8);
  post.translate(0, 0.45, 0);
  return mergeGeometries([base, post], false)!;
}

export function lyreGeometry() {
  const box = new THREE.BoxGeometry(0.34, 0.06, 0.16);
  box.translate(0, 0.02, 0);
  const col = new THREE.BoxGeometry(0.045, 0.42, 0.045);
  const left = col.clone();
  left.translate(-0.12, 0.24, 0);
  const right = col.clone();
  right.translate(0.12, 0.24, 0);
  return mergeGeometries([box, left, right], false)!;
}

export function casterGeometry() {
  const wheel = new THREE.CylinderGeometry(1, 1, 0.45, 16);
  wheel.rotateZ(Math.PI / 2);
  const fork = new THREE.BoxGeometry(0.35, 1.1, 0.55);
  fork.translate(0, 0.4, 0);
  return mergeGeometries([wheel, fork], false)!;
}

export function yAligned(from: THREE.Vector3, to: THREE.Vector3): [number, number, number] {
  const dir = to.clone().sub(from);
  if (dir.lengthSq() < 1e-12) return [0, 0, 0];
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return [e.x, e.y, e.z];
}
