import * as THREE from 'three';
import type { Body, Box } from '../core/collision';
import type { Armour, GunSlot, Inventory, Item, Rarity, WeaponId } from '../core/rules';
import type { Character, AnimState } from '../render/character';

export type Mode = 'solo' | 'training';
export type Phase = 'menu' | 'flight' | 'playing' | 'ended';

export interface Actor {
  id: number; name: string; isBot: boolean; isPlayer: boolean; alive: boolean;
  body: Body; yaw: number; pitch: number; hp: number; armour: Armour; inv: Inventory; slot: number; // 0,1 main; 2 pistol; 3 machete
  char: Character; anim: AnimState; mode: 'plane' | 'skydive' | 'glide' | 'ground';
  fireCd: number; reloadT: number; reloadMax: number; healT: number; healItem: string; swingT: number; kickT: number; shots: number; lastShot: number; recoilPitch: number;
  kills: number; damage: number; headshots: number; tokensEarned: number; hitFlash: number; placement: number; killer: string; diedAt: number; hidden: boolean;
  lastHitBy: Actor | null; lastHitAt: number; speedNow: number; vx: number; vz: number; fireHeld: boolean; coyote: number; jumpBuf: number; fallStartY: number; survivor: string; bot?: import('./bots').BotBrain;
}

export interface GroundItem { id: number; x: number; y: number; z: number; items: Item[]; rarity: Rarity; mesh: THREE.Object3D; ring: THREE.Mesh | null; crate: boolean; spin: number; beam?: THREE.Object3D; taken: boolean }
export interface Dummy { id: number; x: number; y: number; z: number; hp: number; mesh: THREE.Object3D; reset: number }
export interface Projectile { pos: THREE.Vector3; vel: THREE.Vector3; owner: Actor; weapon: WeaponId; rarity: Rarity; life: number; mesh: THREE.Mesh }
export interface Grenade { pos: THREE.Vector3; vel: THREE.Vector3; fuse: number; owner: Actor; smoke: boolean; mesh: THREE.Object3D }
export interface SmokeCloud { x: number; y: number; z: number; r: number; t: number; mesh: THREE.Mesh }
export interface BarrierObj { box: Box; mesh: THREE.Object3D; state: import('../core/rules').BarrierState; x: number; z: number }

export interface FeedRow { id: number; text: string; t: number; mine: boolean }
export interface Hud {
  phase: Phase; mode: Mode; hp: number; vest: number; vestMax: number; helmet: number; alive: number; kills: number; tokens: number; ammoMag: number; ammoReserve: number; weaponName: string;
  slots: { label: string; id: string; mag: number; active: boolean; rarity: number }[]; heals: { bandage: number; medkit: number; repair: number; barriers: number; frag: number; smoke: number };
  prompt: { text: string; color: string } | null; feed: FeedRow[]; banner: { text: string; t: number } | null; zone: { phase: number; stage: string; timeLeft: number; cx: number; cz: number; r: number; nx: number; nz: number; nr: number } | null;
  px: number; pz: number; yaw: number; alt: number; hitT: number; hitHead: boolean; dmgArc: { a: number; t: number }[]; reloading: number; healing: number; scope: number; aim: boolean; spread: number; fps: number;
  numbers: { id: number; x: number; y: number; v: number; head: boolean }[]; shots: { x: number; z: number; t: number }[]; marker: { x: number; z: number } | null;
  planeX: number; planeZ: number; planeDir: [number, number]; canJump: boolean; autoJumpIn: number; kioskNear: boolean; kioskOpen: boolean; inventoryOpen: boolean; mapOpen: boolean; stack: { id: string; qty: number }[]; capacity: number; chat: string;
  demo: { step: number; total: number; text: string } | null; elim: { text: string; t: number } | null; dropCard: { id: number; key: string; name: string } | null; weaponClass: string; zoneWarn: { dist: number; dps: number } | null; result: Result | null; quality: string; shake: number; inBush: boolean; inZoneDanger: boolean; spectating: string | null;
}
export interface Result { win: boolean; placement: number; total: number; kills: number; damage: number; time: number; headshots: number; tokens: number; xp: number; killer: string; outcome?: import('../progress').MatchOutcome }
