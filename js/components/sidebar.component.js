export function getCurrentPage() {
  const file = window.location.pathname.split('/').pop() || 'index.html';
  if (file === '' || file === 'index.html') return 'dashboard';
  if (file === 'games.html') return 'games';
  if (file === 'game-detail.html') return 'games';
  if (file === 'edit-game.html') return 'games';
  return 'dashboard';
}

export function createSidebar(activePage) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: 'index.html' },
    { id: 'games',     label: 'Archivo',   href: 'games.html' },
  ];

  const navLinks = navItems
    .map(({ id, label, href }) => {
      const active = id === activePage ? ' sidebar__nav-link--active' : '';
      return `<a href="${href}" class="sidebar__nav-link${active}">${label}</a>`;
    })
    .join('');

  return `
    <div class="sidebar__brand">
      <div>
        <div class="sidebar__brand-name">RESIDENT EVIL<br>FRANCHISE TRACKER</div>
        <div class="sidebar__brand-sub">UMBRELLA RECORDS TERMINAL</div>
      </div>
    </div>
    <nav class="sidebar__nav" aria-label="Menú principal">
      <div class="sidebar__nav-group">
        <span class="sidebar__nav-group-label">Navegación</span>
        ${navLinks}
      </div>
      <div class="sidebar__nav-group">
        <span class="sidebar__nav-group-label">Sistema</span>
        <span class="sidebar__nav-link">Estado local</span>
      </div>
    </nav>
    <div class="sidebar__footer">
      <div>ARCHIVE TERMINAL</div>
      <div>SISTEMA ACTIVO</div>
    </div>
  `;
}

export function mountSidebar({ rootId = 'sidebar-root', activePage } = {}) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const page = activePage ?? getCurrentPage();
  root.innerHTML = createSidebar(page);
}
