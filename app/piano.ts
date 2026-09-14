import * as THREE from 'three';
import {
  buildConcepts,
  describeAgraffe,
  describeDamper,
  describeHammer,
  describeKey,
  describeString,
  describeTuningPin,
  describeWippen,
  staticPart,
  type PartInfo,
  type PartKind,
  type SystemId,
} from './atlas';
import {NOTES} from './scale';
import {DIM, yAligned} from './shape';

export type GeomName =
  | 'box'
  | 'cyl'
  | 'rim'
  | 'lid'
  | 'soundboard'
  | 'plate'
  | 'hammer'
  | 'wippen'
  | 'damper'
  | 'agraffe'
  | 'lyre'
  | 'caster'
  | 'keyC' | 'keyD' | 'keyE' | 'keyF' | 'keyG' | 'keyA' | 'keyB' | 'keyEnd';

export type MatName =
  | 'ebony'
  | 'ivory'
  | 'sharp'
  | 'brass'
  | 'gold'
  | 'spruce'
  | 'maple'
  | 'felt'
  | 'damperFelt'
  | 'steel'
  | 'copper'
  | 'iron'
  | 'blued'
  | 'hornbeam';

export interface Piece {
  id: string;
  system: SystemId;
  kind: PartKind;
  note?: number;
  unison?: number;
  info: PartInfo;
  geom: GeomName;
  material: MatName;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  pack: [number, number];
  size: [number, number, number];
}

const WHITE_W = DIM.whiteW;
const KB = 52 * WHITE_W;
const X0 = -KB / 2;
const KEY_Y = DIM.keybedY + DIM.keyH / 2;
const KEY_Z0 = 0.012;

const LETTER_GEOM: Record<string, GeomName> = {
  C: 'keyC', D: 'keyD', E: 'keyE', F: 'keyF', G: 'keyG', A: 'keyA', B: 'keyB',
};

function whiteGeom(note: typeof NOTES[number]): GeomName {
  if (note.n === 88) return 'keyEnd';
  if (note.n === 1) return 'keyC';
  return LETTER_GEOM[note.letter] ?? 'keyC';
}

function keyX(note: typeof NOTES[number]) {
  if (!note.sharp) return X0 + (note.whiteIndex + 0.5) * WHITE_W;
  return X0 + (note.whiteIndex + 1) * WHITE_W;
}

function pinPos(note: typeof NOTES[number], unison: number): THREE.Vector3 {
  const slot = note.n - 1 + (unison - 0.5) / note.strings;
  const x = X0 + (slot / 88) * KB;
  const z = 0.292 + ((note.n + unison) % 2) * 0.016;
  return new THREE.Vector3(x, DIM.stringY + 0.02, z);
}

function hitchTarget(note: typeof NOTES[number], unison: number): THREE.Vector3 {
  const spread = (unison - (note.strings + 1) / 2) * 0.007;
  if (note.bass) {
    const t = (note.n - 1) / 19;
    return new THREE.Vector3(0.16 + t * 0.4 + spread, DIM.stringY, 2.32 - t * 0.38);
  }
  const t = (note.n - 21) / 67;
  return new THREE.Vector3(0.64 - t * 0.82 + spread, DIM.stringY, 0.82 + t * 1.74);
}

function stringPath(note: typeof NOTES[number], unison: number) {
  const pin = pinPos(note, unison);
  const front = pin.clone();
  front.y = DIM.stringY;
  front.z += 0.05;
  const aim = hitchTarget(note, unison);
  const dir = aim.clone().sub(front).normalize();
  const total = note.speakingLength * 1.16 + 0.06;
  const hitch = front.clone().addScaledVector(dir, total);
  const bridge = front.clone().addScaledVector(dir, note.speakingLength);
  return {pin, front, hitch, bridge, dir};
}

const SYSTEM_PACK: Record<SystemId, [number, number]> = {
  case: [0.22, 0.16],
  stand: [0.14, 0.16],
  keyboard: [0.07, 0.12],
  action: [0.06, 0.09],
  dampers: [0.05, 0.08],
  strings: [0.036, 0.1],
  soundboard: [0.16, 0.12],
  plate: [0.05, 0.07],
};

export const SYSTEM_OFFSET: Record<SystemId, [number, number, number]> = {
  case: [0, 0.85, -0.15],
  stand: [0, -0.62, 0.25],
  keyboard: [0, 0.12, -1.05],
  action: [0, 0.48, -0.55],
  dampers: [0, 0.62, -0.12],
  strings: [0, 0.78, 0.18],
  soundboard: [0, -0.18, 0.35],
  plate: [0, 1.05, 0.12],
};

function add(
  pieces: Piece[],
  parts: PartInfo[],
  info: PartInfo,
  geom: GeomName,
  material: MatName,
  position: [number, number, number],
  scale: [number, number, number],
  extra?: Partial<Pick<Piece, 'rotation' | 'pack' | 'size' | 'unison'>>,
) {
  parts.push(info);
  pieces.push({
    id: info.id,
    system: info.system,
    kind: info.kind,
    note: info.note,
    unison: extra?.unison ?? info.unison,
    info,
    geom,
    material,
    position,
    rotation: extra?.rotation ?? [0, 0, 0],
    scale,
    pack: extra?.pack ?? SYSTEM_PACK[info.system],
    size: extra?.size ?? scale,
  });
}

export function buildPiano() {
  const pieces: Piece[] = [];
  const parts: PartInfo[] = [];

  add(pieces, parts, staticPart('rim'), 'rim', 'ebony', [0, 0, 0], [1, 1, 1], {pack: [0.42, 0.28], size: [1.56, 0.31, 2.58]});
  add(pieces, parts, staticPart('lid'), 'lid', 'ebony', [-DIM.W / 2, DIM.keybedY + DIM.caseH, 0], [1, 1, 1], {
    rotation: [0, 0, 0.92],
    pack: [0.4, 0.26],
    size: [1.56, 0.02, 2.6],
  });
  add(pieces, parts, staticPart('lid-flap'), 'box', 'ebony', [-0.08, DIM.keybedY + DIM.caseH + 0.62, 0.38], [1.48, DIM.lidT, 0.4], {
    rotation: [0.2, 0, 0.92],
    pack: [0.22, 0.12],
  });
  add(pieces, parts, staticPart('lid-prop'), 'cyl', 'maple', [0.52, DIM.keybedY + DIM.caseH + 0.42, 1.15], [0.012, 0.95, 0.012], {
    rotation: [0.55, 0, 0.15],
    pack: [0.08, 0.18],
  });
  add(pieces, parts, staticPart('fallboard'), 'box', 'ebony', [0, DIM.keybedY + 0.09, 0.168], [1.24, 0.09, 0.018], {pack: [0.2, 0.1]});
  add(pieces, parts, staticPart('keyslip'), 'box', 'ebony', [0, DIM.keybedY - 0.01, 0.004], [1.26, 0.028, 0.012], {pack: [0.18, 0.06]});
  add(pieces, parts, staticPart('cheek', 0), 'box', 'ebony', [X0 - 0.04, DIM.keybedY + 0.04, 0.085], [0.072, 0.09, 0.17], {pack: [0.1, 0.1]});
  add(pieces, parts, staticPart('cheek', 1), 'box', 'ebony', [-X0 + 0.04, DIM.keybedY + 0.04, 0.085], [0.072, 0.09, 0.17], {pack: [0.1, 0.1]});
  add(pieces, parts, staticPart('music-desk'), 'box', 'spruce', [0, DIM.keybedY + 0.22, 0.42], [0.72, 0.012, 0.28], {
    rotation: [-0.55, 0, 0],
    pack: [0.18, 0.12],
  });

  const legs: [number, number, number][] = [
    [-0.52, DIM.keybedY / 2, 0.2],
    [0.52, DIM.keybedY / 2, 0.2],
    [-0.22, DIM.keybedY / 2, 2.28],
  ];
  legs.forEach((p, i) => {
    add(pieces, parts, staticPart('leg', i), 'cyl', 'ebony', p, [0.042, DIM.keybedY, 0.042], {pack: [0.1, 0.18]});
    add(pieces, parts, staticPart('caster', i), 'caster', 'brass', [p[0], 0.035, p[2]], [0.028, 0.028, 0.028], {pack: [0.08, 0.08]});
  });
  add(pieces, parts, staticPart('lyre'), 'lyre', 'ebony', [0, 0.22, 0.2], [1, 1, 1], {pack: [0.16, 0.14], size: [0.34, 0.48, 0.16]});
  add(pieces, parts, staticPart('lyre-brace', 0), 'box', 'ebony', [-0.1, 0.34, 0.38], [0.02, 0.02, 0.42], {rotation: [0.4, 0, 0]});
  add(pieces, parts, staticPart('lyre-brace', 1), 'box', 'ebony', [0.1, 0.34, 0.38], [0.02, 0.02, 0.42], {rotation: [0.4, 0, 0]});
  const pedals = [-0.09, 0, 0.09];
  pedals.forEach((x, i) => add(pieces, parts, staticPart('pedal', i), 'box', 'brass', [x, 0.105, 0.07], [0.028, 0.012, 0.11], {pack: [0.08, 0.07]}));
  add(pieces, parts, staticPart('trapwork'), 'box', 'blued', [0, 0.28, 0.16], [0.2, 0.22, 0.02], {pack: [0.1, 0.1]});

  add(pieces, parts, staticPart('keybed'), 'box', 'spruce', [0, DIM.keybedY - DIM.keybedT / 2, 0.28], [1.36, DIM.keybedT, 0.56], {pack: [0.24, 0.12]});
  add(pieces, parts, staticPart('key-frame'), 'box', 'maple', [0, DIM.keybedY + 0.008, 0.26], [1.24, 0.016, 0.5], {pack: [0.22, 0.1]});

  for (const note of NOTES) {
    const x = keyX(note);
    if (!note.sharp) {
      add(pieces, parts, describeKey(note), whiteGeom(note), 'ivory', [x, KEY_Y, KEY_Z0], [WHITE_W * 0.98, DIM.keyH, DIM.whiteLen], {
        pack: [0.065, 0.12],
        size: [WHITE_W, DIM.keyH, DIM.whiteLen],
      });
    } else {
      add(pieces, parts, describeKey(note), 'box', 'sharp', [x, KEY_Y + 0.008, KEY_Z0 + 0.012], [DIM.blackW, DIM.keyH + DIM.blackH, DIM.blackVis], {
        pack: [0.05, 0.1],
      });
    }
  }

  add(pieces, parts, staticPart('hammer-rail'), 'cyl', 'brass', [0, 0.735, 0.7], [0.01, 1.22, 0.01], {rotation: [0, 0, Math.PI / 2], pack: [0.16, 0.06]});
  add(pieces, parts, staticPart('wippen-rail'), 'cyl', 'brass', [0, 0.7, 0.58], [0.009, 1.22, 0.009], {rotation: [0, 0, Math.PI / 2], pack: [0.16, 0.06]});
  add(pieces, parts, staticPart('rest-rail'), 'box', 'felt', [0, 0.748, 0.66], [1.22, 0.012, 0.028], {pack: [0.16, 0.06]});
  for (let i = 0; i < 6; i++) {
    const x = X0 + 0.04 + (i / 5) * (KB - 0.08);
    add(pieces, parts, staticPart('action-bracket', i), 'box', 'brass', [x, 0.72, 0.64], [0.016, 0.07, 0.12], {pack: [0.07, 0.07]});
  }

  for (const note of NOTES) {
    const x = keyX(note);
    const t = (note.n - 1) / 87;
    const hammerScale = 0.026 - t * 0.012;
    add(pieces, parts, describeHammer(note), 'hammer', 'felt', [x, 0.768, 0.78], [hammerScale, hammerScale, hammerScale], {
      pack: [0.055, 0.08],
      size: [hammerScale, hammerScale * 1.4, hammerScale * 2],
    });
    add(pieces, parts, describeWippen(note), 'wippen', 'hornbeam', [x, 0.695, 0.52], [0.012, 0.018, 0.07], {
      pack: [0.05, 0.07],
    });
    if (note.damped) {
      const dw = note.strings === 1 ? 0.014 : note.strings === 2 ? 0.018 : 0.022;
      add(pieces, parts, describeDamper(note), 'damper', 'damperFelt', [x * 0.96, DIM.stringY + 0.012, 0.72 + t * 0.04], [dw, 0.03, dw], {
        pack: [0.05, 0.075],
      });
    }
  }

  add(pieces, parts, staticPart('damper-frame'), 'box', 'maple', [0, 0.69, 0.48], [1.18, 0.014, 0.08], {pack: [0.18, 0.08]});
  add(pieces, parts, staticPart('damper-guide'), 'box', 'maple', [0, 0.76, 0.7], [1.12, 0.012, 0.03], {pack: [0.16, 0.06]});
  add(pieces, parts, staticPart('sostenuto-rod'), 'cyl', 'brass', [0, 0.705, 0.5], [0.006, 1.16, 0.006], {rotation: [0, 0, Math.PI / 2], pack: [0.16, 0.05]});

  const trebleBridge: THREE.Vector3[] = [];
  const bassBridge: THREE.Vector3[] = [];
  for (const note of NOTES) {
    for (let u = 1; u <= note.strings; u++) {
      const path = stringPath(note, u);
      const mid = path.pin.clone().lerp(path.hitch, 0.5);
      const len = path.pin.distanceTo(path.hitch);
      const rot = yAligned(path.pin, path.hitch);
      const r = note.wound ? note.wireDiameter * 0.55 : Math.max(0.00045, note.wireDiameter * 0.55);
      add(pieces, parts, describeString(note, u), 'cyl', note.wound ? 'copper' : 'steel', [mid.x, mid.y, mid.z], [r, len, r], {
        rotation: rot,
        unison: u,
        pack: [0.034, 0.11],
        size: [r * 2, len, r * 2],
      });
      add(pieces, parts, describeTuningPin(note, u), 'cyl', 'blued', [path.pin.x, path.pin.y, path.pin.z], [0.0032, 0.042, 0.0032], {
        unison: u,
        pack: [0.04, 0.06],
      });
      if (u === 1) (note.bass ? bassBridge : trebleBridge).push(path.bridge);
      if (!note.capo && u === 1) {
        add(pieces, parts, describeAgraffe(note), 'agraffe', 'brass', [path.front.x, path.front.y - 0.004, path.front.z], [0.01, 0.012, 0.01], {
          pack: [0.04, 0.055],
        });
      }
    }
  }

  add(pieces, parts, staticPart('soundboard'), 'soundboard', 'spruce', [0, 0, 0], [1, 1, 1], {pack: [0.36, 0.26], size: [1.3, 0.01, 2.1]});
  for (let i = 0; i < 14; i++) {
    const z = 0.72 + i * 0.13;
    const w = 1.18 - i * 0.042;
    add(pieces, parts, staticPart('rib', i), 'box', 'spruce', [-0.08, DIM.boardY - 0.012, z], [w, 0.016, 0.028], {pack: [0.14, 0.06]});
  }
  if (trebleBridge.length > 1) {
    const a = trebleBridge[0], b = trebleBridge[trebleBridge.length - 1];
    const mid = a.clone().lerp(b, 0.5);
    const len = a.distanceTo(b);
    add(pieces, parts, staticPart('long-bridge'), 'box', 'maple', [mid.x, DIM.stringY - 0.012, mid.z], [0.028, 0.022, len], {
      rotation: [0, Math.atan2(b.x - a.x, b.z - a.z), 0],
      pack: [0.2, 0.08],
    });
  }
  if (bassBridge.length > 1) {
    const a = bassBridge[0], b = bassBridge[bassBridge.length - 1];
    const mid = a.clone().lerp(b, 0.5);
    const len = a.distanceTo(b);
    add(pieces, parts, staticPart('bass-bridge'), 'box', 'maple', [mid.x, DIM.stringY - 0.01, mid.z], [0.032, 0.024, len], {
      rotation: [0, Math.atan2(b.x - a.x, b.z - a.z), 0],
      pack: [0.16, 0.08],
    });
  }
  for (let i = 0; i < 5; i++) {
    const x = -0.42 + i * 0.2;
    add(pieces, parts, staticPart('brace', i), 'box', 'spruce', [x, 0.42, 1.45], [0.045, 0.07, 1.7], {pack: [0.12, 0.14]});
  }
  add(pieces, parts, staticPart('belly-rail'), 'box', 'maple', [0, DIM.boardY - 0.02, 0.6], [1.22, 0.05, 0.06], {pack: [0.18, 0.08]});

  add(pieces, parts, staticPart('plate'), 'plate', 'gold', [0, 0, 0], [1, 1, 1], {pack: [0.36, 0.24], size: [1.2, 0.03, 2.3]});
  add(pieces, parts, staticPart('capo'), 'box', 'gold', [0.32, DIM.stringY + 0.006, 0.355], [0.62, 0.012, 0.018], {pack: [0.14, 0.06]});
  add(pieces, parts, staticPart('pinblock'), 'box', 'maple', [0, DIM.plateY - 0.03, 0.3], [1.26, 0.046, 0.16], {pack: [0.2, 0.08]});
  add(pieces, parts, staticPart('hitch-pins'), 'box', 'blued', [-0.12, DIM.stringY + 0.004, 2.42], [0.7, 0.008, 0.08], {pack: [0.14, 0.06]});
  add(pieces, parts, staticPart('duplex-bars'), 'box', 'brass', [0.18, DIM.stringY + 0.004, 2.05], [0.7, 0.006, 0.012], {pack: [0.14, 0.05]});
  add(pieces, parts, staticPart('treble-bell'), 'cyl', 'iron', [0.58, DIM.keybedY - 0.04, 0.95], [0.04, 0.05, 0.04], {pack: [0.08, 0.08]});

  const ids = new Set<string>();
  for (const p of pieces) {
    if (ids.has(p.id)) throw new Error(`Duplicate part id ${p.id}`);
    ids.add(p.id);
  }

  return {
    pieces,
    parts,
    concepts: buildConcepts(parts),
    byId: new Map(pieces.map(p => [p.id, p])),
  };
}

export const PIANO = buildPiano();

export const COUNTS = {
  pieces: PIANO.pieces.length,
  keys: PIANO.pieces.filter(p => p.kind === 'key').length,
  hammers: PIANO.pieces.filter(p => p.kind === 'hammer').length,
  wippens: PIANO.pieces.filter(p => p.kind === 'wippen').length,
  dampers: PIANO.pieces.filter(p => p.kind === 'damper').length,
  strings: PIANO.pieces.filter(p => p.kind === 'string').length,
  pins: PIANO.pieces.filter(p => p.kind === 'tuning-pin').length,
  agraffes: PIANO.pieces.filter(p => p.kind === 'agraffe').length,
};
