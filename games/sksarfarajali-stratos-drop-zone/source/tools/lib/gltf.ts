// Small helpers for reading the Quaternius packs: the gltf files reference textures we do not use (we repaint the body into our own atlas), so they are dropped on load.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';

export async function readGltfNoTextures(file: string): Promise<Document> {
  const json = JSON.parse(readFileSync(file, 'utf8'));
  delete json.images; delete json.textures; delete json.samplers;
  for (const m of json.materials ?? []) { const p = m.pbrMetallicRoughness; if (p) delete p.baseColorTexture; delete m.normalTexture; delete m.occlusionTexture; delete m.emissiveTexture; if (p) delete p.metallicRoughnessTexture; }
  const resources: Record<string, Uint8Array> = {};
  for (const b of json.buffers ?? []) if (b.uri && !b.uri.startsWith('data:')) resources[b.uri] = readFileSync(join(dirname(file), b.uri));
  return new NodeIO().readJSON({ json, resources });
}
export async function readGlb(file: string): Promise<Document> { return new NodeIO().read(file); }
