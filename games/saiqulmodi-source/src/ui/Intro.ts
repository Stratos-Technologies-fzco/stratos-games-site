// The opening presentation: only the logo (animated), a play icon and a help icon, over the live showcase of
// the game. No write-up. The controls table (the start-screen layout from Phase 1) opens from the help icon.
import { CLOSE_ICON, HELP_ICON, LOGO_SVG, PLAY_ICON } from './Logo';

const DOCK_AFTER_MS = 3600; // the logo plays its opening, then moves to the top so the showcase shows

export class Intro {
  private root: HTMLDivElement;
  private logo: HTMLDivElement;
  private help: HTMLDivElement;
  private dockTimer = 0;

  constructor(onStart: () => void) {
    this.root = document.getElementById('start') as HTMLDivElement;
    this.logo = document.getElementById('intro-logo') as HTMLDivElement;
    this.help = document.getElementById('help') as HTMLDivElement;
    this.logo.innerHTML = LOGO_SVG;
    const play = document.getElementById('start-btn') as HTMLButtonElement;
    const helpBtn = document.getElementById('help-btn') as HTMLButtonElement;
    const close = document.getElementById('help-close') as HTMLButtonElement;
    play.innerHTML = PLAY_ICON;
    helpBtn.innerHTML = HELP_ICON;
    close.innerHTML = CLOSE_ICON;

    // a tap or click anywhere on the presentation starts, except on the help icon
    this.root.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('#help-btn')) return;
      onStart();
    });
    helpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.help.style.display = 'flex';
    });
    close.addEventListener('click', () => (this.help.style.display = 'none'));
    this.help.addEventListener('click', (e) => {
      if (e.target === this.help) this.help.style.display = 'none';
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') this.help.style.display = 'none';
    });
    this.show();
  }

  show(): void {
    this.root.style.display = 'flex';
    this.logo.classList.remove('docked');
    // restart the logo's opening animation
    this.logo.innerHTML = LOGO_SVG;
    window.clearTimeout(this.dockTimer);
    this.dockTimer = window.setTimeout(() => this.logo.classList.add('docked'), DOCK_AFTER_MS);
  }

  hide(): void {
    this.root.style.display = 'none';
    this.help.style.display = 'none';
    window.clearTimeout(this.dockTimer);
  }
}
