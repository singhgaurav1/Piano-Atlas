import {BASS_NOTES, FIRST_CAPO_NOTE, LAST_DAMPED_NOTE, NOTES, TOTALS, describeNote, formatFrequency, formatLength, type Note} from './scale';

export type SystemId = 'case' | 'stand' | 'keyboard' | 'action' | 'dampers' | 'strings' | 'soundboard' | 'plate';

export interface System {
  id: SystemId;
  name: string;
  short: string;
  color: string;
  description: string;
  sources: SourceId[];
}

export const SYSTEMS: System[] = [
  {id: 'case', name: 'Case & lid', short: 'Case', color: '#26262a', description: 'The ebonized cabinet: the continuous bent maple rim, the two-part lid on its prop, the fallboard, keyslip, cheek blocks and music desk. Steinway builds the inner and outer rim in one pressing, a method it patented in 1878.', sources: ['steinwayD', 'patentRim', 'wikiD274']},
  {id: 'stand', name: 'Legs, lyre & pedals', short: 'Stand', color: '#7d6a4e', description: 'Three legs on brass casters carry the 483 kg instrument. The pedal lyre hangs from the keybed and holds three solid-brass pedals — soft, sostenuto and sustain — with the trapwork that links them to the action and dampers.', sources: ['steinwayD', 'patentSostenuto', 'wikiPedals']},
  {id: 'keyboard', name: 'Keyboard', short: 'Keys', color: '#ece6d6', description: '88 keys of European spruce — 52 naturals and 36 ebonized sharps — pivot on the balance rail of the key frame, which slides in and out of the case with the action as one unit on the quarter-sawn spruce keybed.', sources: ['steinwayD', 'steinwayAction', 'wikiFrequencies']},
  {id: 'action', name: 'Action', short: 'Action', color: '#c69a62', description: 'The grand action turns each key stroke into a hammer blow: capstan lifts wippen, jack kicks the hammer knuckle, the hammer escapes and flies at the strings, and the repetition lever resets it for the next note. Steinway mounts the parts on its brass tubular metallic action frame.', sources: ['steinwayAction', 'wikiAction', 'patentAction']},
  {id: 'dampers', name: 'Dampers', short: 'Dampers', color: '#a8443a', description: 'Wool-felt dampers on maple heads rest on the strings of the lower 68 notes and lift when a key is played or the sustain pedal is pressed. The highest notes carry no dampers: their short strings die away on their own.', sources: ['steinwayD', 'wikiAction', 'musicSE']},
  {id: 'strings', name: 'Strings', short: 'Strings', color: '#b5702f', description: '243 speaking lengths under a combined tension of 20,418 kg. The bass is copper-wound Swedish steel strung over the tenor; the treble uses plain high-tensile wire in twelve-and-a-half sizes. The longest speaking length is 201 cm from agraffe to bridge.', sources: ['steinwayD', 'ptgHistory', 'wikiD274']},
  {id: 'soundboard', name: 'Soundboard & bridges', short: 'Soundboard', color: '#deb87a', description: 'The Sitka spruce diaphragmatic soundboard — 9 mm at the center tapering to 6 mm at the rim — carries two maple-capped bridges and is ribbed with sugar pine. Five spruce braces under it tie the whole structure to the rim.', sources: ['steinwayD', 'patentSoundboard']},
  {id: 'plate', name: 'Plate & pinblock', short: 'Plate', color: '#b28c3c', description: 'A bell-quality gray-iron plate from Steinway\u2019s own foundry resists the string tension. Under its front flange sits the Hexagrip pinblock with 243 blued-steel tuning pins; agraffes and the capo d\u2019astro bar set the front string terminations, hitch pins the rear.', sources: ['steinwayD', 'patentPinblock', 'patentDuplex', 'smithsonian']},
];

export const SYSTEM_MAP = new Map(SYSTEMS.map(s => [s.id, s]));
export const DEFAULT_VISIBLE: SystemId[] = SYSTEMS.map(s => s.id);
export type View = 'three-quarter' | 'front' | 'top' | 'side';
export interface SceneState {
  inspectorOpen?: boolean;
  explode: number;
  visible: SystemId[];
  selected: string[];
  isolate: boolean;
  view: View;
  rotate: boolean;
  reset: number;
  playingNote: number;
}

export type SourceId =
  | 'steinwayD'
  | 'steinwayAction'
  | 'wikiD274'
  | 'ptgHistory'
  | 'patentDuplex'
  | 'patentRim'
  | 'patentSostenuto'
  | 'patentAction'
  | 'patentSoundboard'
  | 'patentPinblock'
  | 'smithsonian'
  | 'wikiFrequencies'
  | 'wikiAction'
  | 'wikiPedals'
  | 'wikiDuplex'
  | 'wikiPiano'
  | 'musicSE';

export interface Source {
  id: SourceId;
  title: string;
  publisher: string;
  url: string;
  note?: string;
}

export const SOURCES: Record<SourceId, Source> = {
  steinwayD: {id: 'steinwayD', title: 'Model D Concert Grand Piano — Specifications and Design', publisher: 'Steinway & Sons', url: 'https://www.steinway.com/pianos/steinway/grand/model-d', note: 'Dimensions, weight, materials, string tension, rim, soundboard, pinblock and plate specifications.'},
  steinwayAction: {id: 'steinwayAction', title: 'The Touch — The History of Steinway Piano Action', publisher: 'Steinway & Sons', url: 'https://www.steinway.com/news/features/utilty/piano-action', note: 'Tubular metallic action frame, key materials, 1931 Accelerated Action.'},
  wikiD274: {id: 'wikiD274', title: 'Steinway D-274', publisher: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Steinway_D-274', note: '1884 redesign: 20-note bass, capo bar in the upper treble sections, strengthened lyre; 1936 soundboard; bent-rim history.'},
  ptgHistory: {id: 'ptgHistory', title: 'History of the Piano — Modern Steinway Grand Piano Model D', publisher: 'Piano Technicians Guild', url: 'https://www.ptg.org/teacher-resources/history-of-the-piano', note: '243 speaking lengths, roughly 12,000 parts, action descended from Érard (1821).'},
  patentDuplex: {id: 'patentDuplex', title: 'US 126,848 — Improvement in Duplex Agraffe Scales for Piano-Fortes (C. F. Theodor Steinway, 14 May 1872)', publisher: 'Google Patents', url: 'https://patents.google.com/patent/US126848A/en'},
  patentRim: {id: 'patentRim', title: 'US 204,106 — Improvement in Grand Piano-Fortes: bent inner and outer rim (C. F. Theodor Steinway, 21 May 1878)', publisher: 'Google Patents', url: 'https://patents.google.com/patent/US204106A/en'},
  patentSostenuto: {id: 'patentSostenuto', title: 'US 156,388 — Improvement in Piano-Forte Attachments: sostenuto (Albert Steinway, 27 Oct 1874)', publisher: 'Google Patents', url: 'https://patents.google.com/patent/US156388A/en'},
  patentAction: {id: 'patentAction', title: 'US 1,826,848 — Piano Key Mounting, the “Accelerated Action” patent (13 Oct 1931)', publisher: 'Google Patents', url: 'https://patents.google.com/patent/US1826848A/en'},
  patentSoundboard: {id: 'patentSoundboard', title: 'US 2,051,633 — Soundboard for Pianos, the “Diaphragmatic Soundboard” (Paul H. Bilhuber, 18 Aug 1936)', publisher: 'Google Patents', url: 'https://patents.google.com/patent/US2051633A/en'},
  patentPinblock: {id: 'patentPinblock', title: 'US 3,091,149 — Wrestplanks, the “Hexagrip” pinblock (28 May 1963)', publisher: 'Google Patents', url: 'https://patents.google.com/patent/US3091149A/en'},
  smithsonian: {id: 'smithsonian', title: 'William Steinway Diary — annotation on Steinway scale patents (overstringing, duplex scale, cupola plate, capo d\u2019astro)', publisher: 'Smithsonian National Museum of American History', url: 'https://americanhistory.si.edu/steinwaydiary/annotations/?id=2043'},
  wikiFrequencies: {id: 'wikiFrequencies', title: 'Piano key frequencies', publisher: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Piano_key_frequencies', note: 'Equal temperament: f(n) = 440 × 2^((n − 49) / 12) Hz.'},
  wikiAction: {id: 'wikiAction', title: 'Action (piano)', publisher: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Action_(piano)', note: 'Names and roles of wippen, jack, repetition lever, knuckle, backcheck and damper.'},
  wikiPedals: {id: 'wikiPedals', title: 'Piano pedals', publisher: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Piano_pedals', note: 'Soft (una corda), sostenuto and sustain pedal mechanisms.'},
  wikiDuplex: {id: 'wikiDuplex', title: 'Duplex scaling', publisher: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Duplex_scaling'},
  wikiPiano: {id: 'wikiPiano', title: 'Piano — construction and components', publisher: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Piano'},
  musicSE: {id: 'musicSE', title: 'What is the most common highest key with a damper?', publisher: 'Music Stack Exchange (community answer citing Shockley, The Contemporary Piano)', url: 'https://music.stackexchange.com/questions/88141/what-is-the-most-common-highest-key-with-a-damper', note: 'Grand pianos typically leave the top 15–22 notes undamped; Steinway grands are reported to stop around D♯6–E6.'},
};

export type PartKind =
  | 'rim' | 'lid' | 'lid-flap' | 'lid-prop' | 'fallboard' | 'keyslip' | 'cheek' | 'music-desk'
  | 'leg' | 'caster' | 'lyre' | 'lyre-brace' | 'pedal' | 'trapwork'
  | 'key' | 'key-frame' | 'keybed'
  | 'hammer' | 'wippen' | 'hammer-rail' | 'wippen-rail' | 'rest-rail' | 'action-bracket'
  | 'damper' | 'damper-frame' | 'damper-guide' | 'sostenuto-rod'
  | 'string'
  | 'soundboard' | 'rib' | 'long-bridge' | 'bass-bridge' | 'brace' | 'belly-rail'
  | 'plate' | 'capo' | 'agraffe' | 'tuning-pin' | 'pinblock' | 'hitch-pins' | 'duplex-bars' | 'treble-bell';

export interface PartInfo {
  id: string;
  name: string;
  system: SystemId;
  kind: PartKind;
  note?: number;
  unison?: number;
  summary: string;
  specs: [string, string][];
  sources: SourceId[];
  /** Explains which aspects are modeled rather than published. */
  modeled?: string;
  /** Short label for search results and lists. */
  tags?: string[];
}

export interface Concept {
  id: string;
  name: string;
  kind: 'note' | 'group' | 'system' | 'part';
  parts: string[];
  summary?: string;
  system?: SystemId;
}

const M = {
  scale: 'Individual speaking lengths, wire sizes and the bass/tenor unison split are modeled from the published totals (243 strings, 20-note bass, 201 cm longest length); they are not factory measurements.',
  geometry: 'Proportions are modeled from the published length, width and part dimensions; fine shapes are illustrative.',
  count: 'Steinway does not publish this count; the number shown is modeled from typical concert-grand construction.',
};

const cm = (m: number) => formatLength(m);

export function noteSpecs(note: Note): [string, string][] {
  return [
    ['Note', `${note.name} · no. ${note.n} of 88 · MIDI ${note.midi}`],
    ['Frequency', `${formatFrequency(note.frequency)} (A4 = 440 Hz)`],
    ['Unisons', note.strings === 1 ? '1 string (monochord)' : note.strings === 2 ? '2 strings (bichord)' : '3 strings (trichord)'],
  ];
}

export function describeKey(note: Note): PartInfo {
  const natural = !note.sharp;
  return {
    id: `key-${note.n}`,
    name: `Key ${note.n} · ${note.name}${note.n === 40 ? ' (middle C)' : ''}`,
    system: 'keyboard',
    kind: 'key',
    note: note.n,
    summary: `${natural ? 'Natural' : 'Sharp'} key for ${describeNote(note)}. The key is a spruce lever pivoting on the balance rail: pressing the front lifts the capstan at its tail, which drives the wippen and throws hammer ${note.n} at ${note.strings === 1 ? 'its single string' : `its ${note.strings} unison strings`}${note.damped ? `, while the key tail lifts damper ${note.n} clear of the strings` : '. This note has no damper; its short strings fade on their own'}.`,
    specs: [
      ...noteSpecs(note),
      ['Type', natural ? `Natural (white) · no. ${note.whiteIndex + 1} of 52` : 'Sharp (black) · one of 36'],
      ['Material', natural ? 'European spruce; chip-proof, stain-resistant covering; linden button over the balance rail' : 'European spruce; slip-proof abraded ebonized sharp; linden button over the balance rail'],
      ['Longest key on the Model D', '24½ in · 62.2 cm'],
      ['Weighed off', 'Individually'],
    ],
    sources: ['steinwayD', 'wikiFrequencies', 'steinwayAction'],
    modeled: 'Key widths use the standard 165 mm octave span (23.6 mm natural pitch); key lengths taper from the published 62.2 cm maximum.',
    tags: [note.name, note.flatLetter ? `${note.flatLetter}${note.octave}` : '', natural ? 'natural white key' : 'sharp black key', note.n === 40 ? 'middle C' : '', note.n === 49 ? 'concert pitch' : ''].filter(Boolean),
  };
}

export function describeHammer(note: Note): PartInfo {
  return {
    id: `hammer-${note.n}`,
    name: `Hammer ${note.n} · ${note.name}`,
    system: 'action',
    kind: 'hammer',
    note: note.n,
    summary: `Felt hammer for ${note.name}. The jack kicks the knuckle on the underside of the shank, the hammer escapes about 2 mm before impact and strikes ${note.strings === 1 ? 'the string' : `all ${note.strings} unison strings`} at roughly one-eighth of their speaking length, then falls into the backcheck. ${note.bass ? 'Bass hammers are the largest and heaviest, with deep, soft felt for the wound strings.' : note.n >= FIRST_CAPO_NOTE ? 'High-treble hammers are small and hard so the short strings speak brightly.' : 'Tenor and treble hammers grade steadily smaller and firmer up the scale.'}`,
    specs: [
      ...noteSpecs(note),
      ['Felt', 'Premium wool top felt and under felt; treated against insects and moisture; compression-wired to hold its shape'],
      ['Molding & shank', 'Hornbeam'],
      ['Strike point (modeled)', `${cm(note.speakingLength * (note.bass ? 0.1 : 0.1 + 0.025 * (note.n - 21) / 67))} behind the front termination`],
    ],
    sources: ['steinwayD', 'wikiAction', 'steinwayAction'],
    modeled: 'Hammer sizes grade from bass to treble as on production hammers; exact head dimensions are illustrative.',
    tags: [note.name, 'hammer felt'],
  };
}

export function describeWippen(note: Note): PartInfo {
  return {
    id: `wippen-${note.n}`,
    name: `Wippen & repetition ${note.n} · ${note.name}`,
    system: 'action',
    kind: 'wippen',
    note: note.n,
    summary: `The wippen (repetition assembly) for ${note.name} sits between the key capstan and hammer ${note.n}. Its jack pushes the hammer knuckle until the let-off button trips it; the spring-loaded repetition lever then holds the hammer high enough to be struck again before the key has fully returned — the double-escapement principle descended from Érard\u2019s 1821 action. Steinway\u2019s 1931 “Accelerated Action” rounds the balance-rail bearing beneath the key for faster repetition.`,
    specs: [
      ...noteSpecs(note),
      ['Parts represented', 'Wippen body, jack, repetition lever, spring, flange'],
      ['Frame', 'Steinway tubular metallic action frame (seamless brass tubes, maple dowels)'],
      ['Repetition patent', 'US 1,826,848 · 13 Oct 1931'],
    ],
    sources: ['steinwayAction', 'wikiAction', 'patentAction', 'ptgHistory'],
    modeled: 'The repetition assembly is simplified to its principal members.',
    tags: [note.name, 'repetition lever jack'],
  };
}

export function describeDamper(note: Note): PartInfo {
  return {
    id: `damper-${note.n}`,
    name: `Damper ${note.n} · ${note.name}`,
    system: 'dampers',
    kind: 'damper',
    note: note.n,
    summary: `Damper for ${note.name}: a maple head with horizontally cut wool felt resting on ${note.strings === 1 ? 'the string' : `the ${note.strings} unison strings`}, a wire down through the guide rail, and an underlever that the tail of key ${note.n} lifts just before the hammer strikes. The sustain pedal raises every underlever at once; the sostenuto pedal holds up only the dampers already raised. ${note.bass ? 'Bass dampers use wedge felts that seat between the wound strings.' : note.strings === 3 ? 'Trichord dampers carry flat felts across all three strings.' : ''}`,
    specs: [
      ...noteSpecs(note),
      ['Felt', 'Horizontal-cut premium wool'],
      ['Head', 'Maple'],
      ['Damped notes on this model', `Notes 1–${LAST_DAMPED_NOTE} (A0–${NOTES[LAST_DAMPED_NOTE - 1].name}); ${88 - LAST_DAMPED_NOTE} treble notes undamped`],
    ],
    sources: ['steinwayD', 'wikiAction', 'musicSE'],
    modeled: 'The last damped note is modeled at E6 following reports for Steinway grands; the factory count is not published.',
    tags: [note.name, 'damper felt'],
  };
}

export function describeString(note: Note, unison: number): PartInfo {
  const front = note.capo ? 'capo d\u2019astro bar' : `agraffe ${note.n}`;
  const bridge = note.bass ? 'bass bridge' : 'long (treble) bridge';
  return {
    id: `string-${note.n}-${unison}`,
    name: `String ${note.n} · ${note.name}${note.strings > 1 ? ` · unison ${unison} of ${note.strings}` : ''}`,
    system: 'strings',
    kind: 'string',
    note: note.n,
    unison,
    summary: note.wound
      ? `Copper-wound bass string for ${note.name}: a Swedish steel core wrapped with pure copper to add mass without stiffness, so a ${cm(note.speakingLength)} speaking length can sound ${formatFrequency(note.frequency)}. The bass section is overstrung — it crosses above the tenor strings so both can use the largest part of the soundboard.`
      : `Plain high-tensile Swedish steel wire for ${note.name}, one of the twelve-and-a-half sizes Steinway uses across the treble. It runs from its tuning pin over the ${front}, speaks for ${cm(note.speakingLength)} to the ${bridge}, and continues through the rear duplex to its hitch pin. The three unison strings are tuned together; hammer ${note.n} strikes them as one.`,
    specs: [
      ...noteSpecs(note),
      ['Speaking length (modeled)', cm(note.speakingLength)],
      ['Wire (modeled)', note.wound ? `${(note.wireDiameter * 1000).toFixed(1)} mm overall, copper over steel core` : `${(note.wireDiameter * 1000).toFixed(2)} mm plain steel`],
      ['Terminations', `${front.charAt(0).toUpperCase()}${front.slice(1)} → ${bridge} → hitch pin`],
      ['Longest speaking length on the Model D', '79¼ in · 201 cm (agraffe to bridge)'],
      ['Total string tension', '45,373 lb · 20,418 kg across 243 speaking lengths'],
    ],
    sources: ['steinwayD', 'ptgHistory', 'wikiFrequencies', 'wikiD274'],
    modeled: M.scale,
    tags: [note.name, note.wound ? 'bass wound copper' : 'plain steel treble', note.strings === 1 ? 'monochord' : note.strings === 2 ? 'bichord' : 'trichord'],
  };
}

export function describeTuningPin(note: Note, unison: number): PartInfo {
  return {
    id: `pin-${note.n}-${unison}`,
    name: `Tuning pin ${note.n}${note.strings > 1 ? `.${unison}` : ''} · ${note.name}`,
    system: 'plate',
    kind: 'tuning-pin',
    note: note.n,
    unison,
    summary: `Tuning pin for string ${note.n}${note.strings > 1 ? `.${unison}` : ''} (${note.name}). Driven into the seven-layer Hexagrip maple pinblock beneath the plate flange, it holds roughly ${Math.round(20418 / 243)} kg of tension and is turned a few degrees at a time to tune the string. Steinway grain-orients the pinblock laminations at 45° and 90° so the block grips the pin evenly around its circumference.`,
    specs: [
      ...noteSpecs(note),
      ['Material', 'Premium blued steel, rust-resistant, nickeled head'],
      ['Pinblock', 'Hexagrip: 7 laminations of quartered hard rock maple (1963 patent)'],
      ['Average tension per string', `≈ ${Math.round(20418 / 243)} kg · ${Math.round(45373 / 243)} lb`],
    ],
    sources: ['steinwayD', 'patentPinblock'],
    modeled: 'Pin diameter and the staggered rows are modeled.',
    tags: [note.name, 'tuning pin wrest pin'],
  };
}

export function describeAgraffe(note: Note): PartInfo {
  return {
    id: `agraffe-${note.n}`,
    name: `Agraffe ${note.n} · ${note.name}`,
    system: 'plate',
    kind: 'agraffe',
    note: note.n,
    summary: `Brass agraffe for ${note.name}, screwed into the plate with ${note.strings === 1 ? 'a single hole' : `${note.strings} holes`} that fix the front speaking termination and unison spacing of the string${note.strings > 1 ? 's' : ''}. Steinway\u2019s “combination agraffe” scale uses agraffes through the bass, tenor and lower treble and a cast capo d\u2019astro bar in the two upper treble sections.`,
    specs: [
      ...noteSpecs(note),
      ['Material', 'Brass'],
      ['Agraffe notes on this model', `1–${FIRST_CAPO_NOTE - 1} (${TOTALS.agraffes} agraffes); capo bar from note ${FIRST_CAPO_NOTE}`],
    ],
    sources: ['steinwayD', 'wikiD274', 'smithsonian'],
    modeled: `The note at which the capo bar takes over (${FIRST_CAPO_NOTE}) is modeled; Steinway describes the layout only as “combination agraffe” with the capo bar in the upper treble sections.`,
    tags: [note.name, 'agraffe brass'],
  };
}

export function staticPart(kind: PartKind, index?: number): PartInfo {
  const s = (id: string, name: string, system: SystemId, summary: string, specs: [string, string][], sources: SourceId[], modeled?: string, tags: string[] = []): PartInfo => ({id, name, system, kind, summary, specs, sources, modeled, tags});
  switch (kind) {
    case 'rim':
      return s('rim', 'Continuous bent rim', 'case', 'The one-piece rim wraps the case from the bass cheek along the straight spine, around the tail and through the treble bend to the treble cheek. Steinway presses inner and outer rim together from 17 laminations of hard rock maple in a single operation; the 3¼-inch wall is the foundation the soundboard, plate and keybed are built into. The bent laminated rim was patented by C. F. Theodor Steinway in 1878 and applied to the Model D in 1880.', [['Material', 'Hard rock maple, 17 laminations, inner and outer rim pressed together'], ['Wall thickness', '3¼ in · 8.3 cm'], ['Case length', '8 ft 11¾ in · 274 cm'], ['Case width', '61¾ in · 156 cm'], ['Net weight (whole piano)', '1,064 lb · 483 kg'], ['Patent', 'US 204,106 · 21 May 1878']], ['steinwayD', 'patentRim', 'wikiD274'], M.geometry, ['case body cabinet spine tail treble bend']);
    case 'lid':
      return s('lid', 'Lid', 'case', 'The main lid hinges along the spine and is raised on the long prop for performance, reflecting the soundboard\u2019s output toward the audience. Its outline follows the rim with a small overhang. New York instruments are traditionally finished in satin ebony lacquer, Hamburg instruments in high-gloss polyester.', [['Hinge', 'Along the spine (bass side)'], ['Shown', 'Raised on the long lid prop'], ['Finish', 'Ebony: satin lacquer (New York) or polished polyester (Hamburg)']], ['wikiD274', 'steinwayD'], M.geometry, ['top cover']);
    case 'lid-flap':
      return s('lid-flap', 'Front lid (flap)', 'case', 'The front section of the lid folds back onto the main lid when the piano is opened, clearing the music desk. Closed, it meets the fallboard line and completes the case top.', [['Shown', 'Folded back over the main lid']], ['wikiPiano'], M.geometry, ['top cover front']);
    case 'lid-prop':
      return s('lid-prop', 'Lid prop', 'case', 'The long prop stick holds the lid open at full height; concert grands also carry a shorter prop for a half-open lid. Its foot seats in a cup on the treble rim.', [['Shown', 'Long prop, lid fully raised']], ['wikiPiano'], M.geometry, ['prop stick']);
    case 'fallboard':
      return s('fallboard', 'Fallboard & nameboard', 'case', 'The fallboard closes over the keys when the piano is not in use and carries the Steinway & Sons name. Shown folded open, its front board stands behind the sharps as the nameboard while the cover lies back toward the tuning pins.', [['Shown', 'Open'], ['Spans', '88 keys · 1.26 m between the cheek blocks']], ['wikiPiano'], M.geometry, ['key cover nameplate']);
    case 'keyslip':
      return s('keyslip', 'Keyslip', 'case', 'The thin ebonized strip fastened across the front of the keybed just below the key fronts. It hides the key frame and front rail and can be removed to slide the action out of the case.', [['Spans', 'Full keyboard width']], ['wikiPiano'], M.geometry, ['front strip']);
    case 'cheek':
      return s(index === 0 ? 'cheek-bass' : 'cheek-treble', index === 0 ? 'Bass cheek block' : 'Treble cheek block', 'case', `The ${index === 0 ? 'left (bass)' : 'right (treble)'} cheek block sits inside the rim arm at the end of the keyboard. The pair locate the key frame and action in the case; the soft pedal shifts the whole assembly a few millimetres toward the treble against them.`, [['Position', index === 0 ? 'Left of key 1 (A0)' : 'Right of key 88 (C8)']], ['wikiPiano', 'wikiPedals'], M.geometry, ['key block end block']);
    case 'music-desk':
      return s('music-desk', 'Music desk', 'case', 'The music desk slides on runners above the tuning pins and tilts back to hold the score in front of the pianist. When not needed it lies flat or is removed so the pins and plate are exposed for tuning.', [['Shown', 'Raised and tilted']], ['wikiPiano'], M.geometry, ['music rack stand score']);
    case 'leg': {
      const names = ['Front bass leg', 'Front treble leg', 'Tail leg'];
      return s(`leg-${index}`, names[index ?? 0], 'stand', `${names[index ?? 0]} of three. The legs bolt to leg plates on the underside of the case and, with the lyre, carry the instrument\u2019s 483 kg (1,064 lb) net weight to the floor through brass casters.`, [['Net weight carried (3 legs)', '1,064 lb · 483 kg'], ['Finish', 'Ebonized']], ['steinwayD'], M.geometry, ['support stand']);
    }
    case 'caster': {
      const names = ['Front bass caster', 'Front treble caster', 'Tail caster'];
      return s(`caster-${index}`, names[index ?? 0], 'stand', 'Brass double-wheel caster at the foot of the leg. Concert instruments are rolled on and off stage on their casters; the pair of wheels spreads the load and turns without scuffing.', [['Material', 'Brass']], ['wikiPiano'], M.geometry, ['wheel']);
    }
    case 'lyre':
      return s('lyre', 'Pedal lyre', 'stand', 'The lyre hangs beneath the keybed and carries the three pedals and their trapwork. Steinway strengthened the lyre dramatically and redesigned the pedals as a self-contained unit with the 1884 Model D so that heavy pedaling stayed precise.', [['Carries', 'Soft, sostenuto and sustain pedals'], ['Redesigned', '1884 Model D']], ['wikiD274', 'steinwayD'], M.geometry, ['pedal frame']);
    case 'lyre-brace':
      return s(`lyre-brace-${index}`, `Lyre brace (${index === 0 ? 'bass' : 'treble'})`, 'stand', 'A diagonal brace running from the pedal box back to the underside of the keybed. The two braces stop the lyre from rocking under the pianist\u2019s foot.', [['Material', 'Ebonized hardwood']], ['wikiPiano'], M.geometry, ['strut support']);
    case 'pedal': {
      const info = [
        ['pedal-soft', 'Soft pedal (una corda)', 'The left pedal shifts the entire key frame and action a few millimetres to the right, so each hammer strikes only two of its three unison strings and meets them on a softer, less-worn part of the felt. The name recalls the era of two-string unisons, when the shift left a single string sounding.', 'Shifts the keyboard and action toward the treble'],
        ['pedal-sostenuto', 'Sostenuto pedal', 'The middle pedal sustains only the notes whose dampers are already raised when it is pressed: a rotating rod catches the tabs of those damper underlevers and holds them up while later notes remain damped normally. Albert Steinway patented the mechanism in 1874.', 'Holds raised dampers up · patent US 156,388 (27 Oct 1874)'],
        ['pedal-sustain', 'Sustain (damper) pedal', 'The right pedal lifts the damper underlever tray, raising all 68 dampers together so every struck note rings on and undamped strings resonate in sympathy.', 'Lifts all dampers via the trapwork'],
      ][index ?? 0];
      return s(info[0], info[1], 'stand', info[2], [['Material', 'Heavy solid brass'], ['Function', info[3]]], ['steinwayD', 'wikiPedals', ...(index === 1 ? ['patentSostenuto' as SourceId] : [])], M.geometry, ['foot pedal brass']);
    }
    case 'trapwork':
      return s('trapwork', 'Trapwork rods', 'stand', 'Three vertical rods rise from the pedals through the lyre to levers under the keybed: one shifts the action sideways (soft), one rotates the sostenuto rod, and one lifts the damper tray (sustain).', [['Count', '3 rods']], ['wikiPedals'], M.geometry, ['pedal rods linkage']);
    case 'key-frame':
      return s('key-frame', 'Key frame', 'keyboard', 'The key frame carries all 88 keys: the balance rail with its pins and the rounded bearing of the 1931 Accelerated Action, the front rail with its punchings, and the back rail. The whole frame slides in and out of the case with the action, and the soft pedal shifts it sideways.', [['Rails', 'Front, balance and back rails'], ['Balance rail bearing', 'Rounded fulcrum · Accelerated Action, 1931']], ['steinwayAction', 'patentAction', 'wikiAction'], M.geometry, ['balance rail front rail back rail']);
    case 'keybed':
      return s('keybed', 'Keybed', 'keyboard', 'The shelf the key frame and action rest on. Steinway builds it from planks of quarter-sawn spruce with horizontal and vertical birch planks forming a vented system for humidity escapement; a crowned and reverse-crowned action frame gives a snug fit and prevents “slapping” during heavy playing.', [['Material', 'Quarter-sawn spruce with birch planks'], ['Thickness', '1¾ in · 4.45 cm'], ['Touch regulation', 'Adjustable brass touch-regulating screws in maple dowel ends']], ['steinwayD'], M.geometry, ['shelf base']);
    case 'hammer-rail':
      return s('hammer-rail', 'Hammer flange rail', 'action', 'A seamless brass tube of the Steinway tubular metallic action frame carrying the 88 hammer flanges. The rosette-shaped rail contours align the flanges automatically as their screws are tightened, and the metal frame resists seasonal movement so regulation holds.', [['Material', 'Seamless brass tube with maple dowels'], ['Patent', 'Tubular metallic action frame, 1868–69']], ['steinwayAction'], M.geometry, ['hammer shank rail']);
    case 'wippen-rail':
      return s('wippen-rail', 'Wippen flange rail', 'action', 'The brass tube of the action frame that carries the 88 wippen flanges. Like the hammer rail it is force-fitted with maple dowels and hung from bronze action brackets.', [['Material', 'Seamless brass tube with maple dowels']], ['steinwayAction'], M.geometry, ['repetition rail']);
    case 'rest-rail':
      return s('rest-rail', 'Hammer rest rail', 'action', 'A felted wooden rail on which the hammer shanks rest between blows. Its height sets the hammer blow distance — the travel from rest to string.', [['Covering', 'Felt']], ['wikiAction'], M.geometry, ['rest cushion']);
    case 'action-bracket':
      return s(`action-bracket-${index}`, `Action bracket ${(index ?? 0) + 1}`, 'action', 'One of the bronze brackets that hold the action rails at the correct height and spacing over the keys and bolt the assembly to the key frame.', [['Material', 'Bronze']], ['steinwayAction'], M.geometry, ['bracket frame']);
    case 'damper-frame':
      return s('damper-frame', 'Damper underlever tray', 'dampers', 'The tray behind the keys that carries the damper underlevers. Each key tail lifts its own underlever; the sustain pedal raises the whole tray so every damper lifts at once.', [['Carries', `${LAST_DAMPED_NOTE} underlevers`]], ['wikiAction'], M.count, ['underlever damper tray']);
    case 'damper-guide':
      return s('damper-guide', 'Damper guide rail', 'dampers', 'A felted rail with a bushing for every damper wire, keeping each damper head aligned over its strings as it rises and falls.', [['Bushings', `${LAST_DAMPED_NOTE}`]], ['wikiAction'], M.count, ['guide rail']);
    case 'sostenuto-rod':
      return s('sostenuto-rod', 'Sostenuto rod', 'dampers', 'A long rod with a lip that the middle pedal rotates. Damper underlevers already raised have their tabs caught above the lip and stay up; lowered ones pass beneath it. Albert Steinway\u2019s 1874 patent.', [['Patent', 'US 156,388 · 27 Oct 1874']], ['patentSostenuto', 'wikiPedals'], M.geometry, ['sostenuto']);
    case 'soundboard':
      return s('soundboard', 'Diaphragmatic soundboard', 'soundboard', 'Close-grained, quarter-sawn Sitka spruce with a prescribed minimum number of annual rings. Under Paul Bilhuber\u2019s 1936 patent the board is 9 mm thick at the center and tapers to 6 mm toward the rim before being double-crowned, so it can move freely while displacing more air. The strings drive it through the two bridges.', [['Material', 'Sitka spruce, quarter-sawn, close-grained'], ['Thickness', '9 mm center → 6 mm at the rim, double-crowned'], ['Patent', 'US 2,051,633 · 18 Aug 1936']], ['steinwayD', 'patentSoundboard', 'wikiD274'], M.geometry, ['sound board spruce diaphragm']);
    case 'rib':
      return s(`rib-${index}`, `Soundboard rib ${(index ?? 0) + 1}`, 'soundboard', 'Ribs of resinous sugar pine glued across the grain of the soundboard hold its crown against the down-bearing of the strings and spread vibration across the board. Steinway hand-fits the rib ends into the rim liner.', [['Material', 'Sugar pine'], ['Rib ends', 'Hand-fitted']], ['steinwayD'], M.count, ['rib brace spruce']);
    case 'long-bridge':
      return s('long-bridge', 'Treble (long) bridge', 'soundboard', `The long bridge carries the ${88 - BASS_NOTES} tenor and treble notes from the strings to the soundboard. Steinway builds it from vertical laminations of hard rock maple capped with solid maple, planes and graphite-coats it, then drills and notches every string bearing by hand.`, [['Material', 'Vertically laminated hard rock maple, solid maple cap, graphite coated'], ['Notes carried', `${BASS_NOTES + 1}–88 (${88 - BASS_NOTES} notes)`], ['Notching', 'Hand-notched for individual string bearing']], ['steinwayD'], M.scale, ['treble bridge']);
    case 'bass-bridge':
      return s('bass-bridge', 'Bass bridge', 'soundboard', `The bass bridge carries the ${BASS_NOTES} copper-wound bass notes, which cross above the tenor so both sections can use the most flexible part of the soundboard. On the Model D it is continuous with the treble bridge and maple-doweled.`, [['Material', 'Vertically laminated hardwood, maple cap, maple doweled'], ['Notes carried', `1–${BASS_NOTES} (${BASS_NOTES} notes)`], ['Since', '20-note bass introduced with the 1884 Model D']], ['steinwayD', 'wikiD274'], M.scale, ['bass bridge overstrung']);
    case 'brace':
      return s(`brace-${index}`, `Spruce brace ${(index ?? 0) + 1}`, 'soundboard', 'One of five solid spruce braces beneath the soundboard. Spruce gives tensile strength with little weight; maple dowels fasten the braces to the rim so rim, braces and soundboard form a single homogeneous foundation, and the Steinway iron wedge anchors the brace ends to the cross block.', [['Count', '5 solid spruce braces'], ['Total volume', '2,907 cu in · 47,637 cm³'], ['Fastening', 'Maple dowels to rim; iron wedge to cross block']], ['steinwayD'], M.geometry, ['brace beam bottom']);
    case 'belly-rail':
      return s('belly-rail', 'Belly rail', 'soundboard', 'The heavy cross member behind the action that supports the front edge of the soundboard and closes the hammer gap. Dampers stand just in front of it; the soundboard begins just behind.', [['Position', 'Behind the hammer line']], ['wikiPiano'], M.geometry, ['cross rail']);
    case 'plate':
      return s('plate', 'Cast iron plate', 'plate', 'Up to 20 tons of string tension act on a grand piano at all times; the plate carries that force for the life of the instrument. Steinway casts its own “bell-quality” gray-iron plates in its own foundry, then fills, CNC-mills, seals, bronzes and lacquers them. The casting includes the front flange over the pinblock, the struts between string sections, the hitch-pin fields and the perimeter flange bolted to the rim.', [['Material', 'Bell-quality gray iron, own foundry'], ['Finish', 'Filled, CNC-milled, sealed, bronzed and lacquered'], ['Load', '45,373 lb · 20,418 kg string tension'], ['Design lineage', 'Cupola plate, US 127,384 (1872); capo d\u2019astro frame, US 204,111 (1878)']], ['steinwayD', 'smithsonian'], M.geometry, ['harp frame iron']);
    case 'capo':
      return s('capo', 'Capo d\u2019astro bar', 'plate', `Cast as one with the plate, the capo bar presses down on the strings of the upper treble to fix their front speaking termination in place of individual agraffes. Steinway's 1884 Model D moved the capo bar into both upper treble sections, giving the top of the scale clarity and power.`, [['Notes (modeled)', `${FIRST_CAPO_NOTE}–88`], ['Introduced on the D', '1884 (both upper treble sections)']], ['wikiD274', 'smithsonian'], `The first capo-bar note (${FIRST_CAPO_NOTE}) is modeled.`, ['capo bar v-bar']);
    case 'pinblock':
      return s('pinblock', 'Hexagrip pinblock', 'plate', 'The wrest plank beneath the plate flange that grips all 243 tuning pins. Steinway\u2019s Hexagrip design (1963) uses 7 laminations of quartered hard rock maple with grain at successive 45° and 90° angles, giving uniform grip around each pin, smoother movement under torque and longer tuning stability.', [['Material', 'Hard rock maple, 7 laminations at 45° and 90°'], ['Patent', 'US 3,091,149 · 28 May 1963'], ['Pins held', '243']], ['steinwayD', 'patentPinblock'], M.geometry, ['wrest plank wrestplank']);
    case 'hitch-pins':
      return s('hitch-pins', 'Hitch pins', 'plate', 'Steel pins set into the plate\u2019s rear flanges around which the strings are anchored. Many treble strings are a single wire looped at a hitch pin to form two speaking lengths — which is why the Model D\u2019s 243 “strings” are counted as speaking lengths.', [['Count', '243 string ends anchored'], ['Material', 'Steel']], ['ptgHistory'], M.geometry, ['hitch pin anchor']);
    case 'duplex-bars':
      return s('duplex-bars', 'Duplex scale (aliquot) bars', 'plate', 'Steinway\u2019s 1872 duplex scale tunes the normally dead string segments between bridge and hitch pin (rear duplex) and between agraffe or capo and tuning pin (front duplex) to harmonics of the speaking length, adding sympathetic brightness. The Model D carries both front and rear duplex.', [['Patent', 'US 126,848 · 14 May 1872'], ['On the Model D', 'Front and rear duplex']], ['patentDuplex', 'steinwayD', 'wikiDuplex'], M.geometry, ['aliquot duplex']);
    case 'treble-bell':
      return s('treble-bell', 'Cast iron treble bell', 'plate', 'A bell-shaped iron casting fixed to the underside of the rim at the treble bend. A steel bolt through it holds the plate firmly in position where the case curve is tightest.', [['Material', 'Cast iron'], ['Position', 'Rim underside at the treble bend']], ['steinwayD'], M.geometry, ['bell bolt']);
    default:
      throw new Error(`No description for ${kind}`);
  }
}

export function buildConcepts(parts: PartInfo[]): Concept[] {
  const byNote = new Map<number, string[]>();
  for (const p of parts) if (p.note) byNote.set(p.note, [...(byNote.get(p.note) ?? []), p.id]);
  const notes: Concept[] = NOTES.map(n => ({
    id: `note-${n.n}`,
    name: `${n.name}${n.n === 40 ? ' · middle C' : n.n === 49 ? ' · A440' : ''} — note ${n.n}`,
    kind: 'note',
    parts: byNote.get(n.n) ?? [],
    summary: `Every part that sounds ${describeNote(n)}: key, wippen, hammer, ${n.damped ? 'damper, ' : ''}${n.strings === 1 ? 'string' : `${n.strings} unison strings`}, tuning pin${n.strings > 1 ? 's' : ''}${n.capo ? '' : ' and agraffe'}. ${formatFrequency(n.frequency)}.`,
  }));
  const group = (id: string, name: string, filter: (p: PartInfo) => boolean, summary: string, system?: SystemId): Concept => ({id, name, kind: 'group', parts: parts.filter(filter).map(p => p.id), summary, system});
  const groups: Concept[] = [
    group('naturals', 'All 52 natural keys', p => p.kind === 'key' && !NOTES[p.note! - 1].sharp, 'The white keys: C, D, E, F, G, A and B in every octave, from A0 to C8.', 'keyboard'),
    group('sharps', 'All 36 sharp keys', p => p.kind === 'key' && NOTES[p.note! - 1].sharp, 'The black keys, grouped in twos and threes between the naturals.', 'keyboard'),
    group('bass-strings', `Bass strings (${BASS_NOTES} wound notes)`, p => p.kind === 'string' && NOTES[p.note! - 1].wound, 'Copper-wound strings of the overstrung bass section, on the bass bridge.', 'strings'),
    group('monochords', `Monochords (${TOTALS.monochords} notes)`, p => p.kind === 'string' && NOTES[p.note! - 1].strings === 1, 'The lowest notes, each sounded by a single heavy wound string.', 'strings'),
    group('bichords', `Bichords (${TOTALS.bichords} notes)`, p => p.kind === 'string' && NOTES[p.note! - 1].strings === 2, 'Notes with two unison strings, between the monochords and the trichords.', 'strings'),
    group('trichords', `Trichords (${TOTALS.trichords} notes)`, p => p.kind === 'string' && NOTES[p.note! - 1].strings === 3, 'Notes with three unison strings tuned together and struck as one.', 'strings'),
    group('capo-section', `Capo d\u2019astro section (notes ${FIRST_CAPO_NOTE}–88)`, p => (p.kind === 'string' || p.kind === 'hammer') && NOTES[p.note! - 1].capo, 'Strings and hammers of the upper treble where the capo bar replaces agraffes.', 'plate'),
    group('undamped', `Undamped notes (${LAST_DAMPED_NOTE + 1}–88)`, p => (p.kind === 'key' || p.kind === 'string' || p.kind === 'hammer') && !NOTES[p.note! - 1].damped, 'The highest notes, which have no dampers and ring freely.', 'dampers'),
    group('pedals', 'The three pedals', p => p.kind === 'pedal', 'Soft (una corda), sostenuto and sustain.', 'stand'),
    group('bridges', 'Both bridges', p => p.kind === 'long-bridge' || p.kind === 'bass-bridge', 'The treble and bass bridges that carry the strings to the soundboard.', 'soundboard'),
    group('patents', 'Patented Steinway features', p => ['rim', 'soundboard', 'pinblock', 'duplex-bars', 'sostenuto-rod', 'key-frame', 'hammer-rail'].includes(p.kind), 'Parts that embody Steinway patents: rim (1878), duplex scale (1872), sostenuto (1874), action frame (1868), Accelerated Action (1931), soundboard (1936), Hexagrip pinblock (1963).'),
    ...[4, 5, 6, 7].map(o => group(`octave-${o}`, `Octave ${o} keys (C${o}–B${o})`, p => p.kind === 'key' && NOTES[p.note! - 1].octave === o, `The twelve keys from C${o} to B${o}.`, 'keyboard')),
  ];
  const systems: Concept[] = SYSTEMS.map(s => ({id: `system-${s.id}`, name: s.name, kind: 'system', parts: parts.filter(p => p.system === s.id).map(p => p.id), summary: s.description, system: s.id}));
  return [...notes, ...groups, ...systems];
}
