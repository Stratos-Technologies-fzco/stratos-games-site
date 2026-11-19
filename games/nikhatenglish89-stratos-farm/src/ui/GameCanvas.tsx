import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from '../game/BootScene';
import { FarmScene } from '../game/FarmScene';
import { bus } from '../game/eventBus';
import { useFarm } from '../state/store';
import { farm } from '../game/controller';

/** Mounts the Phaser game and bridges world events into the Zustand store. No game logic here. */
export function GameCanvas() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current!,
      backgroundColor: '#7ec8ee',
      scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
      render: { antialias: true, roundPixels: false },
      input: { activePointers: 2 },
      scene: [BootScene, FarmScene],
    });
    const store = useFarm.getState();
    const offs = [
      bus.on('tile:selected', (t) => { store.selectTile(t); store.setOpenPanel(null); store.setSeedPlot(null); }),
      bus.on('plot:tapped', ({ plotId }) => farm.onPlotTapped(plotId)),
      bus.on('expansion:tapped', ({ id }) => farm.onExpansionTapped(id)),
      bus.on('obstacle:tapped', ({ id }) => farm.onObstacleTapped(id)),
      bus.on('object:tapped', ({ id }) => farm.onObjectTapped(id)),
      bus.on('building:tapped', ({ id }) => farm.onBuildingTapped(id)),
      bus.on('place:moved', ({ gx, gy, valid, reason }) => farm.onPlaceMoved(gx, gy, valid, reason)),
      bus.on('object:selected', ({ id }) => store.setOpenPanel(id)),
      bus.on('selection:cleared', () => { store.selectTile(null); store.setOpenPanel(null); store.setSeedPlot(null); }),
    ];
    return () => { offs.forEach((o) => o()); game.destroy(true); };
  }, []);

  return <div ref={host} className="game-host" data-testid="game-host" />;
}
