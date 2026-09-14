import {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowUpRight, ChevronRight, Focus, Info, Layers3, Pause, Play, RotateCcw, RotateCw, Search, Volume2, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Sheet, SheetContent, SheetTitle, SheetDescription} from '@/components/ui/sheet';
import {Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty} from '@/components/ui/combobox';
import PianoScene from './scene';
import {playPitch} from './audio';
import {
  DEFAULT_VISIBLE, SOURCES, SYSTEMS, SYSTEM_MAP, type Concept, type SceneState, type SourceId, type SystemId, type View,
} from './atlas';
import {COUNTS, PIANO} from './piano';
import {NOTES, formatFrequency} from './scale';

const initial: SceneState = {
  explode: 0,
  visible: DEFAULT_VISIBLE,
  selected: [],
  isolate: false,
  view: 'three-quarter',
  rotate: false,
  reset: 0,
  playingNote: 0,
};

export default function Home() {
  const detailTitle = useRef<HTMLHeadingElement>(null);
  const [state, setState] = useState(initial);
  const [panel, setPanel] = useState<'layers' | 'search' | null>(null);
  const [details, setDetails] = useState(false);
  const [about, setAbout] = useState(false);
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<Concept | null>(null);
  const [hover, setHover] = useState({id: '', x: 0, y: 0});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setPanel('search');
        setDetails(false);
      }
      if (e.key === 'Escape') {
        setPanel(null);
        setDetails(false);
        setAbout(false);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  const parts = useMemo(() => new Map(PIANO.parts.map(p => [p.id, p])), []);
  const counts = useMemo(() => Object.fromEntries(SYSTEMS.map(s => [s.id, PIANO.pieces.filter(p => p.system === s.id).length])), []);
  const selectedParts = state.selected.map(id => parts.get(id)).filter(p => !!p);
  const selected = selectedParts[0];
  const system = SYSTEM_MAP.get(selected?.system ?? 'case');
  const visibleCount = PIANO.pieces.filter(p => state.isolate ? state.selected.includes(p.id) : state.visible.includes(p.system) || state.selected.includes(p.id)).length;
  const hoverPart = hover.id ? parts.get(hover.id) : undefined;

  const results = useMemo(() => {
    const term = query.toLowerCase().trim();
    const list = PIANO.concepts;
    if (!term) {
      const featured = ['note-40', 'note-49', 'note-1', 'note-88', 'patents', 'bridges', 'pedals', 'system-strings'];
      return featured.map(id => list.find(c => c.id === id)).filter((x): x is Concept => !!x);
    }
    return list
      .filter(c => c.name.toLowerCase().includes(term) || c.id.toLowerCase().includes(term) || (c.summary ?? '').toLowerCase().includes(term))
      .sort((a, b) => a.name.length - b.name.length)
      .slice(0, 80);
  }, [query]);

  const playSelected = (note?: number) => {
    const n = note ?? selected?.note;
    if (!n) return;
    playPitch(NOTES[n - 1].frequency);
    setState(s => ({...s, playingNote: n, rotate: false}));
    window.setTimeout(() => setState(s => s.playingNote === n ? {...s, playingNote: 0} : s), 420);
  };

  const choose = (c: Concept) => {
    setChosen(c);
    setState(s => ({...s, selected: c.parts, isolate: false, rotate: false}));
    setDetails(true);
    setPanel(null);
    const notePart = c.parts.map(id => parts.get(id)).find(p => p?.note);
    if (notePart?.note) playSelected(notePart.note);
  };

  const choosePart = (id: string) => {
    const p = parts.get(id);
    if (!p) return;
    const concept = PIANO.concepts.find(c => c.kind === 'note' && p.note && c.id === `note-${p.note}`)
      ?? {id: p.id, name: p.name, kind: 'part' as const, parts: [id], summary: p.summary, system: p.system};
    setChosen(concept);
    setState(s => ({...s, selected: concept.kind === 'note' ? concept.parts : [id], isolate: false, rotate: false}));
    setDetails(true);
    setPanel(null);
    if (p.note) playSelected(p.note);
  };

  const toggle = (id: SystemId) => {
    setDetails(false);
    setState(s => ({...s, selected: [], isolate: false, visible: s.visible.includes(id) ? s.visible.filter(x => x !== id) : [...s.visible, id]}));
  };

  const reset = () => {
    setState(s => ({...initial, visible: DEFAULT_VISIBLE, reset: s.reset + 1}));
    setChosen(null);
    setDetails(false);
    setPanel(null);
  };

  const openPanel = (next: 'layers' | 'search') => {
    setDetails(false);
    setPanel(p => p === next ? null : next);
  };

  const sourceList = (ids: SourceId[] | undefined) => (ids ?? []).map(id => SOURCES[id]);

  return (
    <main className="studio">
      <PianoScene
        state={{...state, inspectorOpen: details && selectedParts.length > 0}}
        onSelect={choosePart}
        onHover={(id, x, y) => setHover({id, x, y})}
      />
      <div className="vignette" />
      <header className="identity">
        <div className="eyebrow"><span className="status-dot" /> CONCERT GRAND</div>
        <h1>Piano Atlas<Badge variant="outline" className="edition">Model D</Badge></h1>
        <div className="identity-meta">Steinway &amp; Sons · {COUNTS.pieces.toLocaleString()} modeled pieces <span>·</span> 274 cm</div>
      </header>
      <nav className="top-actions" aria-label="Explorer panels">
        <Button variant="ghost" className={panel === 'search' ? 'active' : ''} onClick={() => openPanel('search')} aria-label="Search the piano">
          <Search size={18} /><span>Find a part</span><kbd>/</kbd>
        </Button>
        <Button variant="ghost" className="icon-button" aria-label="About this atlas" onClick={() => { setDetails(false); setPanel(null); setAbout(true); }}>
          <Info size={18} />
        </Button>
      </nav>
      <section className={`layers-panel glass ${panel === 'layers' ? 'mobile-open' : ''}`} aria-label="Piano systems">
        <div className="panel-heading">
          <span>Systems</span>
          <Button variant="ghost" className="mobile-only icon-button" onClick={() => setPanel(null)} aria-label="Close systems"><X size={18} /></Button>
          <Badge variant="secondary" className="desktop-only small-number">{SYSTEMS.length}</Badge>
        </div>
        <div className="layer-presets">
          <Button variant="ghost" aria-pressed={SYSTEMS.every(x => state.visible.includes(x.id))} onClick={() => setState(s => ({...s, selected: [], isolate: false, visible: SYSTEMS.map(x => x.id)}))}>All</Button>
          <Button variant="ghost" aria-pressed={state.visible.length === 1 && state.visible[0] === 'strings'} onClick={() => setState(s => ({...s, selected: [], isolate: false, visible: ['strings']}))}>Scale</Button>
          <Button variant="ghost" aria-pressed={['keyboard', 'action', 'dampers'].every(id => state.visible.includes(id as SystemId)) && state.visible.length === 3} onClick={() => setState(s => ({...s, selected: [], isolate: false, visible: ['keyboard', 'action', 'dampers']}))}>Action</Button>
        </div>
        <div className="system-list">
          {SYSTEMS.map(s => (
            <div className={`system-row ${state.visible.includes(s.id) ? 'enabled' : ''}`} key={s.id}>
              <Button variant="ghost" className="system-name" title={`Show only ${s.name.toLowerCase()}`} onClick={() => setState(v => ({...v, visible: [s.id], isolate: false, selected: []}))}>
                <span className="system-dot" style={{background: s.color}} />
                {s.name}
                <span className="system-count">{counts[s.id]}</span>
              </Button>
              <Switch checked={state.visible.includes(s.id)} onCheckedChange={() => toggle(s.id)} aria-label={`Show ${s.name.toLowerCase()}`} />
            </div>
          ))}
        </div>
        <div className="panel-foot">
          <span>{visibleCount.toLocaleString()} pieces visible</span>
          <Button variant="ghost" onClick={() => setState(s => ({...s, visible: [], selected: [], isolate: false}))}>Hide all</Button>
        </div>
      </section>
      {panel === 'search' && (
        <section className="search-panel glass" aria-label="Find a part">
          <div className="panel-heading">
            <span>Find a part or note</span>
            <Button variant="ghost" className="icon-button" onClick={() => setPanel(null)} aria-label="Close search"><X size={18} /></Button>
          </div>
          <Combobox<Concept>
            items={results}
            value={null}
            onValueChange={value => { if (value) choose(value); }}
            inputValue={query}
            onInputValueChange={setQuery}
            itemToStringLabel={c => c.name}
            filter={null}
            open
            onOpenChange={open => { if (!open) setPanel(null); }}
          >
            <ComboboxInput autoFocus placeholder="Middle C, duplex scale, sostenuto…" aria-label="Search named piano parts and notes" showTrigger={false} />
            <ComboboxContent className="anatomy-search-results">
              <ComboboxEmpty>No parts match your search.</ComboboxEmpty>
              <ComboboxList>
                {(c: Concept) => (
                  <ComboboxItem key={c.id} value={c}>
                    <span className="search-result-name">{c.name}</span>
                    <span className="small-number">{c.parts.length} {c.parts.length === 1 ? 'piece' : 'pieces'}</span>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <p className="search-note">{query ? 'Showing up to 80 matches.' : 'Start with a note, a pedal, or a patented Steinway feature.'}</p>
        </section>
      )}
      <nav className="view-controls glass" aria-label="Camera controls">
        {(['three-quarter', 'front', 'side', 'top'] as View[]).map((v, i) => (
          <Button variant="ghost" key={v} className={state.view === v ? 'active' : ''} aria-pressed={state.view === v} disabled={state.explode > 0.8 && v !== 'front'} onClick={() => setState(s => ({...s, view: v, reset: s.reset + 1, rotate: false}))} title={`${v} view`} aria-label={`${v} view`}>
            <span>{['¾', 'F', 'S', 'T'][i]}</span>
          </Button>
        ))}
        <i />
        <Button variant="ghost" disabled={state.explode >= 0.4} aria-label={state.rotate ? 'Pause rotation' : 'Rotate piano'} title="Auto rotate" className={state.rotate ? 'active' : ''} onClick={() => setState(s => ({...s, rotate: !s.rotate}))}>
          {state.rotate ? <Pause size={17} /> : <RotateCw size={18} />}
        </Button>
        <Button variant="ghost" aria-label="Reset view and layers" title="Reset" onClick={reset}><RotateCcw size={17} /></Button>
      </nav>
      <div className="scene-caption">
        <span className="caption-line" />
        <span>{state.isolate ? (chosen?.name ?? 'SELECTED STRUCTURE') : state.explode > 0.95 ? 'PIECE INVENTORY' : state.explode > 0.05 ? 'SEPARATED SYSTEMS' : 'STEINWAY · MODEL D-274'}</span>
        <span className="caption-line" />
      </div>
      <div className="bottom-dock glass">
        <Button variant="ghost" className="mobile-only dock-layers" onClick={() => openPanel('layers')} aria-label="Open systems">
          <Layers3 size={20} /><span>Systems</span>
        </Button>
        <div className="explode-control">
          <div className="explode-label">
            <label id="explode-label">Explode piano</label>
            <output>{Math.round(state.explode * 100)}<span>%</span></output>
          </div>
          <Slider aria-labelledby="explode-label" min={0} max={100} step={1} value={[state.explode * 100]} onValueChange={v => setState(s => ({...s, explode: (Array.isArray(v) ? v[0] : v) / 100, view: (Array.isArray(v) ? v[0] : v) > 80 ? 'front' : s.view, rotate: false}))} />
          <div className="slider-endpoints"><span>Assembled</span><span>Every piece</span></div>
        </div>
        <Button variant="ghost" className="dock-reset" onClick={reset} aria-label="Assemble and reset">
          <RotateCcw size={18} /><span>Reset</span>
        </Button>
      </div>
      <footer className="studio-footer">
        <span>{state.explode > 0.8 ? 'Drag to pan' : 'Drag to orbit'} <b>·</b> Pinch to zoom <b>·</b> Tap to inspect</span>
        <Button variant="ghost" onClick={() => { setDetails(false); setPanel(null); setAbout(true); }}>Sources &amp; credits <ArrowUpRight size={12} /></Button>
      </footer>
      {!ready && (
        <div className="loading glass" role="status">
          <Volume2 size={18} />
          <div>
            <strong>Preparing the concert grand</strong>
            <span>{COUNTS.pieces.toLocaleString()} pieces · {COUNTS.strings} speaking lengths</span>
          </div>
        </div>
      )}
      {hoverPart && (
        <div className="part-hover" style={{left: Math.max(8, Math.min(hover.x + 14, 900)), top: Math.max(8, hover.y + 18)}}>
          {hoverPart.name}
        </div>
      )}
      <Sheet open={details && selectedParts.length > 0} modal={false} disablePointerDismissal onOpenChange={setDetails}>
        <SheetContent initialFocus={detailTitle} className={`detail-sheet glass ${state.isolate ? 'is-isolated' : ''}`} showCloseButton={true}>
          <div className="detail-header">
            <div className="detail-accent" style={{background: system?.color}} />
            <div className="eyebrow">{system?.name ?? 'PIANO'}</div>
            <SheetTitle ref={detailTitle} tabIndex={-1} className="structure-title">{chosen?.name ?? selected?.name}</SheetTitle>
          </div>
          <div className="detail-scroll" key={`${chosen?.id}-${state.isolate}`}>
            <SheetDescription className="structure-description">{selected?.summary ?? chosen?.summary}</SheetDescription>
            {selected?.modeled && <span className="context-note">{selected.modeled}</span>}
            {selected && (
              <dl className="specs">{selected.specs.map(([a, b]) => <div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl>
            )}
            {selected?.note && (
              <div className="structure-meta">
                <span>Pitch<strong>{NOTES[selected.note - 1].name}</strong></span>
                <span>Frequency<strong>{formatFrequency(NOTES[selected.note - 1].frequency)}</strong></span>
              </div>
            )}
            {chosen && chosen.parts.length > 1 && (
              <div className="member-list">
                <h3>Included structures</h3>
                {chosen.parts.slice(0, 40).map(id => {
                  const p = parts.get(id);
                  return p ? <Button variant="ghost" key={id} onClick={() => choosePart(id)}><span>{p.name}</span><ChevronRight size={14} /></Button> : null;
                })}
                {chosen.parts.length > 40 && <p>And {chosen.parts.length - 40} more modeled pieces.</p>}
              </div>
            )}
            <div className="source-list">
              {sourceList(selected?.sources ?? system?.sources).map(src => (
                <a className="source-link" key={src.id} href={src.url} target="_blank" rel="noreferrer">
                  {src.publisher}: {src.title.replace(/ — .*/, '')} <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          </div>
          <div className="detail-actions">
            {selected?.note && (
              <Button className="primary-action" onClick={() => playSelected(selected.note)}>
                <Play size={18} /> Play {NOTES[selected.note - 1].name}
                <ChevronRight size={16} />
              </Button>
            )}
            <Button className={`primary-action ${state.isolate ? 'active' : ''} ${selected?.note ? 'ghosted' : ''}`} onClick={() => setState(s => ({...s, isolate: !s.isolate, explode: 0}))}>
              <Focus size={18} />{state.isolate ? 'Show surrounding piano' : 'Isolate structure'}<ChevronRight size={16} />
            </Button>
            <Button variant="ghost" className="secondary-action" onClick={() => { setState(s => ({...s, selected: [], isolate: false})); setDetails(false); }}>Clear selection</Button>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={about} onOpenChange={setAbout}>
        <SheetContent className="about-sheet glass">
          <div className="eyebrow">SOURCE &amp; SCOPE</div>
          <SheetTitle className="structure-title">A concert grand, revealed.</SheetTitle>
          <SheetDescription>Explore a cited, piece-by-piece atlas of the Steinway &amp; Sons Model D concert grand.</SheetDescription>
          <div className="about-copy">
            <p><strong>Steinway Model D-274</strong><br />8′ 11¾″ (274 cm) long, 61¾″ (156 cm) wide, 1,064 lb (483 kg). {COUNTS.pieces.toLocaleString()} selectable pieces, including {COUNTS.keys} keys, {COUNTS.hammers} hammers, {COUNTS.strings} speaking lengths and {COUNTS.pins} tuning pins.</p>
            <p>Published specifications (dimensions, materials, tension, patents) come from Steinway &amp; Sons, the Piano Technicians Guild, Wikipedia, and original U.S. patents. Individual speaking lengths, the 8+5+75 unison split, the last damped note and the visual geometry are modeled from those figures — they are not factory measurements. Every panel that uses a modeled value says so.</p>
            <p>This is an independent educational explorer, not a Steinway product, parts catalog, or service manual.</p>
            <h3>Sources</h3>
            {Object.values(SOURCES).map(src => (
              <a key={src.id} href={src.url} target="_blank" rel="noreferrer">{src.title} <ArrowUpRight size={14} /></a>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
