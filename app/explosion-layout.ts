import type {Piece} from './piano';

export interface LayoutCell {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Pack visible pieces into a front-facing inventory. */
export function createExplosionLayout(pieces: Piece[], aspect = 1) {
  const cards = pieces.map(p => ({
    id: p.id,
    system: p.system,
    width: p.pack[0],
    height: p.pack[1],
  }));
  const area = cards.reduce((n, c) => n + c.width * c.height, 0);
  const maxWidth = Math.max(0.3, ...cards.map(c => c.width));
  const targetWidth = Math.max(maxWidth, Math.sqrt(area * Math.max(0.5, Math.min(1.6, aspect))) * 1.16);
  cards.sort((a, b) => a.system.localeCompare(b.system) || b.height - a.height || a.id.localeCompare(b.id));
  const cells = new Map<string, LayoutCell>();
  let x = 0, y = 0, row = 0, usedWidth = 0;
  for (const c of cards) {
    if (x > 0 && x + c.width > targetWidth) {
      x = 0;
      y += row;
      row = 0;
    }
    cells.set(c.id, {x: x + c.width / 2, y: -y - c.height / 2, width: c.width, height: c.height});
    x += c.width;
    usedWidth = Math.max(usedWidth, x);
    row = Math.max(row, c.height);
  }
  const height = y + row;
  cells.forEach(c => {
    c.x -= usedWidth / 2;
    c.y += height / 2;
  });
  return {cells, width: usedWidth, height};
}
