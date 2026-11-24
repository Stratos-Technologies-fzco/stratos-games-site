import { useState } from 'react';
import { useFarm } from '../state/store';
import { farm } from '../game/controller';
import { bus } from '../game/eventBus';
import { farmLayout as L, isLot, landBox, landState, lotTouchesOwned, obstacleList, placedAt, terrainFrameAt } from '../game/layout';
import { ANIMAL_BY_ID, BUILDING_BY_ID, ORDERS, RECIPES } from '../services/data';
import { cropStage } from '../services/types';
import { social } from '../services/social';
import { cardData, shareVillage } from '../game/farmCard';
import { frameUrl } from '../game/assets';
import { Icon } from './Icon';
import { PanelShell } from './PanelShell';

const MAP_PX = 336;
const CELL = Math.floor(MAP_PX / farmLayoutSize());
function farmLayoutSize() { return L.cols; }
const COLORS: Record<string, string> = {
  grass: '#86d062', path: '#cfc7b4', water: '#6fb8ea', locked: '#a8996f', field: '#9a6a43', fieldGrow: '#7cae4a', fieldReady: '#f2c230',
  sea: '#6fb8ea', habitat: '#f08a3c', factory: '#8f6fd8', house: '#d9503a', barn: '#a5472d', silo: '#b9c3cc', tree: '#3f9a3a',
};

function tileColor(frame: string): string {
  if (frame.startsWith('water')) return COLORS.water;
  if (frame.startsWith('path')) return COLORS.path;
  if (frame === 'locked_land') return COLORS.locked;
  if (frame.startsWith('field') || frame === 'dirt') return COLORS.field;
  return COLORS.grass;
}

/** A top-down map of the whole village. Tap a building to fly there, tap locked land to clear it. */
function MiniMap({ onPick }: { onPick: (kind: 'static' | 'building' | 'expansion', id: string, gx: number, gy: number) => void }) {
  const buildings = useFarm((s) => s.buildings);
  const expanded = useFarm((s) => s.expanded);
  const plots = useFarm((s) => s.plots);
  const moved = useFarm((s) => s.moved);   // the map shows things where they stand now
  useFarm((s) => s.tick);
  const now = farm.now();
  const tiles: JSX.Element[] = [];
  const box = landBox(L, expanded, true);
  const cols = box.maxGx + 1, rows = box.maxGy + 1;
  for (let gx = 0; gx < cols; gx++) for (let gy = 0; gy < rows; gy++) {
    if (landState(L, gx, gy, expanded) === 'sea') continue; // open sea: just the blue background
    tiles.push(<rect key={`t${gx},${gy}`} x={gx * CELL} y={gy * CELL} width={CELL} height={CELL} fill={tileColor(terrainFrameAt(L, gx, gy, expanded, moved).frame)} stroke="#0001" />);
  }
  const plotRects = plots.map((p) => {
    const stage = cropStage(p, now);
    return <rect key={`p${p.id}`} x={p.gx * CELL + 1} y={p.gy * CELL + 1} width={CELL - 2} height={CELL - 2} rx={3}
      fill={stage === null ? COLORS.field : stage === 3 ? COLORS.fieldReady : COLORS.fieldGrow} />;
  });
  const statics = L.objects.filter((o) => o.kind === 'building').map((o) => placedAt(o, moved));
  const cleared = useFarm((s) => s.clearedObstacles);
  const standing = obstacleList(L).filter((o) => !cleared.includes(o.id) && (!o.lot || expanded.includes(o.lot))).map((o) => placedAt(o, moved));
  return (
    <svg className="minimap" viewBox={`0 0 ${cols * CELL} ${rows * CELL}`} role="group" aria-label="Village map" data-testid="minimap">
      {tiles}
      {plotRects}
      {L.expansions.filter((e) => !expanded.includes(e.id) && (!isLot(e.id) || lotTouchesOwned(L, e, expanded))).map((e) => (
        <g key={e.id} role="button" tabIndex={0} aria-label={`${e.name}, locked land`} data-testid={`map-expansion-${e.id}`} className="map-hit"
          onClick={() => onPick('expansion', e.id, e.rect[0], e.rect[1])} onKeyDown={(k) => { if (k.key === 'Enter') onPick('expansion', e.id, e.rect[0], e.rect[1]); }}>
          <rect x={e.rect[0] * CELL} y={e.rect[1] * CELL} width={e.rect[2] * CELL} height={e.rect[3] * CELL} fill="#0000" />
          <image href={frameUrl('atlas_icons', 'lock')} x={(e.rect[0] + e.rect[2] / 2) * CELL - CELL * 0.6} y={(e.rect[1] + e.rect[3] / 2) * CELL - CELL * 0.6} width={CELL * 1.2} height={CELL * 1.2} />
        </g>
      ))}
      {standing.map((o) => (
        <circle key={o.id} cx={(o.gx + 0.5) * CELL} cy={(o.gy + 0.5) * CELL} r={CELL * 0.34} fill={o.type.startsWith('rock') ? '#8e9aa5' : COLORS.tree} stroke="#0003" />
      ))}
      {statics.map((o) => (
        <g key={o.id} role="button" tabIndex={0} aria-label={o.id} data-testid={`map-${o.id}`} className="map-hit"
          onClick={() => onPick('static', o.id, o.gx, o.gy)} onKeyDown={(k) => { if (k.key === 'Enter') onPick('static', o.id, o.gx, o.gy); }}>
          <rect x={o.gx * CELL + 1} y={o.gy * CELL + 1} width={o.w * CELL - 2} height={o.h * CELL - 2} rx={4}
            fill={o.id === 'farmhouse' ? COLORS.house : o.id === 'barn' ? COLORS.barn : COLORS.silo} stroke="#3b2a1e" strokeWidth={1.5} />
          <text x={(o.gx + o.w / 2) * CELL} y={(o.gy + o.h / 2) * CELL + 4} textAnchor="middle" fontSize={Math.max(7, CELL * 0.46)} fontWeight="800" fill="#fff">{o.id === 'farmhouse' ? 'Home' : o.id === 'barn' ? 'Barn' : 'Silo'}</text>
        </g>
      ))}
      {buildings.map((b) => {
        const def = BUILDING_BY_ID.get(b.type)!;
        const ready = farm.buildingReady(b.id) > 0;
        return (
          <g key={b.id} role="button" tabIndex={0} aria-label={`${def.name}${ready ? ', something is ready' : ''}`} data-testid={`map-${b.id}`} className="map-hit"
            onClick={() => onPick('building', b.id, b.gx, b.gy)} onKeyDown={(k) => { if (k.key === 'Enter') onPick('building', b.id, b.gx, b.gy); }}>
            <rect x={b.gx * CELL + 1} y={b.gy * CELL + 1} width={def.w * CELL - 2} height={def.h * CELL - 2} rx={4}
              fill={def.kind === 'habitat' ? COLORS.habitat : def.kind === 'decor' ? '#a8e28a' : COLORS.factory} stroke="#3b2a1e" strokeWidth={1.5} />
            <image href={def.kind === 'decor' ? frameUrl(def.atlas, def.frames[0]) : frameUrl('atlas_icons', `item_${def.animal ? ANIMAL_BY_ID.get(def.animal)!.product : RECIPES.find((r) => r.building === def.id)!.output}`)}
              x={(b.gx + def.w / 2) * CELL - CELL * def.w * 0.4} y={(b.gy + def.h / 2) * CELL - CELL * def.w * 0.4} width={CELL * def.w * 0.8} height={CELL * def.w * 0.8} />
            {ready && <circle cx={(b.gx + def.w) * CELL - 4} cy={b.gy * CELL + 6} r={6} fill="#33c24d" stroke="#fff" strokeWidth={2} />}
          </g>
        );
      })}
    </svg>
  );
}

/** The Map: a village map, village stats, neighbours and sharing. */
export function MapPanel() {
  const open = useFarm((s) => s.mapOpen);
  const setOpen = useFarm((s) => s.setMapOpen);
  const stats = useFarm((s) => s.stats);
  const level = useFarm((s) => s.player.level);
  const buildings = useFarm((s) => s.buildings);
  const animals = useFarm((s) => s.animals);
  const expanded = useFarm((s) => s.expanded);
  const [shared, setShared] = useState('');
  const [tab, setTab] = useState<'map' | 'village' | 'neighbours'>('map');
  if (!open) return null;

  const pick = (kind: 'static' | 'building' | 'expansion', id: string, gx: number, gy: number) => {
    setOpen(false);
    bus.emit('camera:focus', { gx, gy });
    if (kind === 'building') farm.onBuildingTapped(id);
    else if (kind === 'expansion') farm.onExpansionTapped(id);
    else useFarm.getState().setOpenPanel(id);
  };

  const share = async () => {
    const r = await shareVillage(cardData({ level, buildings, animals, stats }));
    setShared(r === 'shared' ? 'Shared!' : r === 'downloaded' ? 'Picture saved to your downloads' : r === 'copied' ? 'Picture saved and message copied' : 'Could not share, please try again');
  };

  return (
    <PanelShell title="Village map" testId="map-panel" onClose={() => setOpen(false)} wide>
      <div className="tabs" role="tablist">
        <button className={tab === 'map' ? 'on' : ''} onClick={() => setTab('map')} data-testid="maptab-map">Map</button>
        <button className={tab === 'village' ? 'on' : ''} onClick={() => setTab('village')} data-testid="maptab-village">Village</button>
        <button className={tab === 'neighbours' ? 'on' : ''} onClick={() => setTab('neighbours')} data-testid="maptab-neighbours">Neighbours</button>
      </div>
      {tab === 'map' && (
        <>
          <MiniMap onPick={pick} />
          <p className="legend">
            <span><i style={{ background: COLORS.habitat }} /> Animal homes</span>
            <span><i style={{ background: COLORS.factory }} /> Factories</span>
            <span><i style={{ background: COLORS.fieldReady }} /> Ready crops</span>
            <span><i style={{ background: COLORS.locked }} /> Locked land</span>
          </p>
        </>
      )}
      {tab === 'village' && (
      <section className="doc">
        <h4>Your village</h4>
        <ul className="facts" data-testid="village-facts">
          <li><b>{level}</b> level</li>
          <li><b>{buildings.length}</b> buildings</li>
          <li><b>{animals.length}</b> animals</li>
          <li><b>{expanded.length}/{L.expansions.length}</b> land cleared</li>
          <li><b>{stats.harvest ?? 0}</b> harvests</li>
          <li><b>{stats.order ?? 0}</b> orders delivered</li>
        </ul>
        <div className="panel-actions"><button className="btn small" onClick={share} data-testid="share-village">Share my village</button></div>
        {shared && <p className="meta" role="status" data-testid="share-result">{shared}</p>}
      </section>
      )}
      {tab === 'neighbours' && (
      <>
      <section className="doc">
        <h4>Your neighbours</h4>
        <ul className="rows">
          {ORDERS.npcs.map((n) => {
            const count = stats[`order:${n.id}`] ?? 0;
            return (
              <li key={n.id}>
                <div className="row" data-testid={`neighbour-${n.id}`}>
                  <Icon atlas="atlas_characters" name={`${n.id}_portrait`} size={40} className="npc" />
                  <span className="grow"><b>{n.name}</b><small>{count === 0 ? 'Has not met you yet. Deliver an order!' : `${count} order${count === 1 ? '' : 's'} delivered, ${count >= 10 ? 'a close friend' : count >= 3 ? 'a good neighbour' : 'getting to know you'}`}</small></span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="doc">
        <h4>Friends and leaderboards</h4>
        <p className="meta" data-testid="social-note">{social.reason}</p>
      </section>
      </>
      )}
    </PanelShell>
  );
}
