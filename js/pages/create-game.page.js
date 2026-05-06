import { mountSidebar } from '../components/sidebar.component.js';
import { mountStatusStrip } from '../components/status-strip.component.js';

mountSidebar({ activePage: 'create' });
mountStatusStrip({ pageLabel: 'NUEVO REGISTRO' });

const root = document.getElementById('create-game-root');
if (root) {
  root.innerHTML = `
    <div class="panel panel--tech">
      <div class="panel__header">
        <span class="panel__title">MÓDULO EN ESPERA — NUEVO REGISTRO</span>
      </div>
      <div class="panel__body">
        <p>La conexión de datos se implementará en una tarea posterior.</p>
      </div>
    </div>
  `;
}
