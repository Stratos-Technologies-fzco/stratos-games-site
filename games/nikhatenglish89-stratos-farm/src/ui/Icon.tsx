import { frameUrl } from '../game/assets';

/** An icon cut from an atlas frame. Renders nothing until the atlases are loaded. */
export function Icon({ name, atlas = 'atlas_icons', size = 32, className = '' }: { name: string; atlas?: string; size?: number; className?: string }) {
  const src = frameUrl(atlas, name);
  if (!src) return <span style={{ width: size, height: size, display: 'inline-block' }} />;
  return <img className={className} src={src} width={size} height={size} alt="" draggable={false} />;
}
