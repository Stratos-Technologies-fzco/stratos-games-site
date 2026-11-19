import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { farm } from './game/controller';
import './styles.css';
import './phase3.css';
import './phase4.css';
import './phase5.css';
import './dock.css';

// Load the saved farm first, then draw the UI and start the game.
farm.init().then(() => createRoot(document.getElementById('root')!).render(<App />));
