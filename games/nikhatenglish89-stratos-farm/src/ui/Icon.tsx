import { frameUrl } from '../game/assets';
import { ITEM_BY_ID } from '../services/data';

/** An icon cut from an atlas frame. Renders nothing until the atlases are loaded. The picture keeps its shape inside the square. */
export function Icon({ name, atlas = 'atlas_icons', size = 32, className = '' }: { name: string; atlas?: string; size?: number; className?: string }) {
  const src = frameUrl(atlas, name);
  if (!src) return <span style={{ width: size, height: size, display: 'inline-block' }} />;
  return <img className={className} src={src} width={size} height={size} style={{ objectFit: 'contain' }} alt="" draggable={false} />;
}

/** The icon of an item: from the icon atlas, or its own art (wood and stone use the log pile and rock pictures). */
export function ItemIcon({ id, size = 32, className = '' }: { id: string; size?: number; className?: string }) {
  const own = ITEM_BY_ID.get(id)?.icon;
  return own ? <Icon atlas={own.atlas} name={own.frame} size={size} className={className} /> : <Icon name={`item_${id}`} size={size} className={className} />;
}
