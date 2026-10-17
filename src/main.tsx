import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/registerServiceWorker';

// Enregistrement du Service Worker pour la mise en cache critique (CSS, JS, images, données)
// et la consultation hors-ligne à Port-au-Prince
registerServiceWorker(() => {
  window.dispatchEvent(new CustomEvent('cin:sw-update-available'));
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

