import { mountSidebar } from '../components/sidebar.component.js';
import { mountStatusStrip } from '../components/status-strip.component.js';

mountSidebar({ activePage: 'dashboard' });
mountStatusStrip({ pageLabel: 'DASHBOARD' });

const root = document.getElementById('dashboard-root');
if (root) {
  root.innerHTML = `
    <div class="panel panel--tech">
      <div class="panel__header">
        <span class="panel__title">MÓDULO EN ESPERA — DASHBOARD</span>
      </div>
      <div class="panel__body">
        <p>La conexión de datos se implementará en una tarea posterior.</p>
      </div>
    </div>
  `;
}
