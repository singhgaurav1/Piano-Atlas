import {COUNTS, PIANO} from '../app/piano.ts';
import {NOTES, STRING_COUNT, TOTALS, LAST_DAMPED_NOTE} from '../app/scale.ts';
import {SOURCES, SYSTEMS} from '../app/atlas.ts';

const errors = [];
const check = (ok, msg) => { if (!ok) errors.push(msg); };

check(NOTES.length === 88, `expected 88 notes, got ${NOTES.length}`);
check(TOTALS.strings === STRING_COUNT, `string total ${TOTALS.strings} != ${STRING_COUNT}`);
check(COUNTS.strings === 243, `modeled ${COUNTS.strings} strings, expected 243`);
check(COUNTS.keys === 88, `keys ${COUNTS.keys}`);
check(COUNTS.hammers === 88, `hammers ${COUNTS.hammers}`);
check(COUNTS.wippens === 88, `wippens ${COUNTS.wippens}`);
check(COUNTS.dampers === LAST_DAMPED_NOTE, `dampers ${COUNTS.dampers}, expected ${LAST_DAMPED_NOTE}`);
check(COUNTS.pins === 243, `pins ${COUNTS.pins}`);
check(COUNTS.agraffes === NOTES.filter(n => !n.capo).length, `agraffes ${COUNTS.agraffes}`);
check(PIANO.pieces.length === new Set(PIANO.pieces.map(p => p.id)).size, 'duplicate ids');
check(SYSTEMS.every(s => PIANO.pieces.some(p => p.system === s.id)), 'empty system');
check(PIANO.parts.every(p => p.sources.every(id => SOURCES[id])), 'part missing source');
check(Math.abs(NOTES[0].speakingLength - 2.01) < 1e-6, 'A0 speaking length should be 2.01 m');
check(Math.abs(NOTES[48].frequency - 440) < 1e-6, 'A4 should be 440 Hz');
check(Object.keys(SOURCES).length >= 12, 'not enough cited sources');
check(PIANO.concepts.some(c => c.id === 'note-40' && /middle c/i.test(c.name)), 'middle C concept missing');
check(PIANO.concepts.some(c => c.id === 'note-49' && /a440/i.test(c.name)), 'A440 concept missing');

const layout = (await import('../app/explosion-layout.ts')).createExplosionLayout(PIANO.pieces, 1.6);
check(layout.cells.size === PIANO.pieces.length, 'layout missing pieces');
check(layout.width > 0 && layout.height > 0, 'empty layout');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`ok · ${COUNTS.pieces} pieces · ${COUNTS.strings} strings · ${Object.keys(SOURCES).length} sources · inventory ${layout.width.toFixed(2)} × ${layout.height.toFixed(2)} m`);
