/**
 * Note arithmetic and the modeled string scale for the 88-note keyboard.
 *
 * Published facts used here (see SOURCES.md):
 * - 88 notes, A0 (note 1) to C8 (note 88); A4 = 440 Hz, f(n) = 440 · 2^((n − 49) / 12).
 * - Steinway Model D: 243 speaking lengths (Piano Technicians Guild), a 20-note bass
 *   section on the bass bridge (Wikipedia, D-274), longest agraffe-to-bridge speaking
 *   length 79¼ in / 201 cm (steinway.com), "twelve whole and one-half" treble wire
 *   sizes (steinway.com).
 *
 * The split of the 243 lengths into 8 monochords, 5 bichords and 75 trichords, the
 * individual speaking lengths, the wire gauges and the last damped note are modeled
 * from these published figures and from general concert-grand practice; they are not
 * factory measurements. Each part panel says so where it applies.
 */
export const NOTE_COUNT = 88;
export const NATURAL_COUNT = 52;
export const SHARP_COUNT = 36;
export const BASS_NOTES = 20;
export const MONOCHORD_NOTES = 8;
export const BICHORD_NOTES = 5;
export const LAST_DAMPED_NOTE = 68;
export const FIRST_CAPO_NOTE = 56;
export const STRING_COUNT = 243;

const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const;
const FLAT_NAMES: Record<string, string> = {'C♯': 'D♭', 'D♯': 'E♭', 'F♯': 'G♭', 'G♯': 'A♭', 'A♯': 'B♭'};

export interface Note {
  n: number; // 1..88
  midi: number;
  pitchClass: number; // 0 = C
  letter: string; // e.g. "C♯"
  flatLetter?: string;
  octave: number; // scientific pitch notation
  name: string; // "C♯4"
  sharp: boolean;
  whiteIndex: number; // 0..51 for naturals, index of the natural to the left for sharps
  frequency: number;
  strings: number; // unisons: 1, 2 or 3
  wound: boolean;
  bass: boolean; // on the bass bridge (overstrung section)
  damped: boolean;
  capo: boolean; // front termination is the capo d'astro bar rather than an agraffe
  section: 'bass' | 'tenor' | 'treble' | 'high treble';
  speakingLength: number; // meters, modeled
  wireDiameter: number; // meters, modeled
  period: number; // ms
}

export function frequency(n: number): number {
  return 440 * Math.pow(2, (n - 49) / 12);
}

const SPEAKING_ANCHORS: [number, number][] = [
  [1, 2.01],
  [8, 1.85],
  [13, 1.68],
  [20, 1.42],
  [21, 1.62],
  [28, 1.28],
  [34, 1.02],
  [40, 0.74],
  [46, 0.56],
  [52, 0.41],
  [58, 0.3],
  [64, 0.212],
  [70, 0.15],
  [76, 0.106],
  [82, 0.074],
  [88, 0.052],
];

/** Log-linear interpolation through anchor lengths; the two bridge sections are kept separate. */
export function speakingLength(n: number): number {
  const anchors = n <= BASS_NOTES ? SPEAKING_ANCHORS.filter(a => a[0] <= BASS_NOTES) : SPEAKING_ANCHORS.filter(a => a[0] > BASS_NOTES);
  for (let i = 0; i < anchors.length - 1; i++) {
    const [n0, l0] = anchors[i], [n1, l1] = anchors[i + 1];
    if (n >= n0 && n <= n1) {
      const t = (n - n0) / (n1 - n0);
      return Math.exp(Math.log(l0) * (1 - t) + Math.log(l1) * t);
    }
  }
  return anchors[anchors.length - 1][1];
}

/** Modeled wire: plain steel core diameters from ~0.8 mm (C8) to ~1.2 mm (tenor); wound bass grows to ~6 mm overall. */
export function wireDiameter(n: number): number {
  if (n <= BASS_NOTES) return 0.0018 + ((BASS_NOTES - n) / (BASS_NOTES - 1)) * 0.0044;
  const t = (n - (BASS_NOTES + 1)) / (NOTE_COUNT - BASS_NOTES - 1);
  return 0.00122 - t * 0.00042;
}

export const NOTES: Note[] = Array.from({length: NOTE_COUNT}, (_, i) => {
  const n = i + 1;
  const midi = n + 20;
  const pitchClass = (n + 8) % 12;
  const octave = Math.floor((n + 8) / 12);
  const letter = NAMES[pitchClass];
  const sharp = letter.includes('♯');
  let whiteIndex = 0;
  for (let k = 1; k <= n; k++) if (!NAMES[(k + 8) % 12].includes('♯')) whiteIndex++;
  whiteIndex -= 1;
  const strings = n <= MONOCHORD_NOTES ? 1 : n <= MONOCHORD_NOTES + BICHORD_NOTES ? 2 : 3;
  const bass = n <= BASS_NOTES;
  const section = bass ? 'bass' : n < FIRST_CAPO_NOTE ? (n < 40 ? 'tenor' : 'treble') : 'high treble';
  const f = frequency(n);
  return {
    n,
    midi,
    pitchClass,
    letter,
    flatLetter: FLAT_NAMES[letter],
    octave,
    name: `${letter}${octave}`,
    sharp,
    whiteIndex,
    frequency: f,
    strings,
    wound: bass,
    bass,
    damped: n <= LAST_DAMPED_NOTE,
    capo: n >= FIRST_CAPO_NOTE,
    section,
    speakingLength: speakingLength(n),
    wireDiameter: wireDiameter(n),
    period: 1000 / f,
  };
});

export function noteByNumber(n: number): Note {
  return NOTES[n - 1];
}

export function describeNote(note: Note): string {
  const alias = note.flatLetter ? ` (also ${note.flatLetter}${note.octave})` : '';
  const special = note.n === 40 ? ' — middle C' : note.n === 49 ? ' — concert pitch A4, 440 Hz' : note.n === 1 ? ' — the lowest note on the keyboard' : note.n === 88 ? ' — the highest note on the keyboard' : '';
  return `${note.name}${alias}${special}`;
}

export function formatFrequency(f: number): string {
  return f >= 1000 ? `${(f / 1000).toFixed(3)} kHz` : f >= 100 ? `${f.toFixed(1)} Hz` : `${f.toFixed(2)} Hz`;
}

export function formatLength(m: number): string {
  if (m >= 1) return `${(m * 100).toFixed(1)} cm · ${(m / 0.0254).toFixed(1)} in`;
  if (m >= 0.01) return `${(m * 100).toFixed(1)} cm · ${(m / 0.0254).toFixed(2)} in`;
  return `${(m * 1000).toFixed(2)} mm · ${(m / 0.0254).toFixed(3)} in`;
}

export const TOTALS = {
  strings: NOTES.reduce((n, note) => n + note.strings, 0),
  damped: NOTES.filter(n => n.damped).length,
  agraffes: NOTES.filter(n => !n.capo).length,
  monochords: NOTES.filter(n => n.strings === 1).length,
  bichords: NOTES.filter(n => n.strings === 2).length,
  trichords: NOTES.filter(n => n.strings === 3).length,
};
