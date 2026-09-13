import type { NavigateFn, Page, UserSession } from '../types';

// Nav item ids/routes are unchanged from before the redesign — only label
// copy and icon glyphs are cosmetic. Exported so AppShell's top bar can
// look up the current page's label without duplicating this list.
export const navItems: Array<{ id: Page; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'new-scan', label: 'New scan', icon: '＋' },
  { id: 'products', label: 'Search & history', icon: '⌕' },
  { id: 'reports', label: 'Reports', icon: '▤' },
  { id: 'producer-precheck', label: 'Producer pre-check', icon: '✓' },
  { id: 'ai-assistant', label: 'Assistant', icon: '◌' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

function BrandMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4 14C4 8 8 3.5 14.5 3.5C14.5 10 10.5 14 4 14Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M4 14C7 11.5 10 9 13.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar({ page, navigate, session }: { page: Page; navigate: NavigateFn; session: UserSession | null }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => navigate('dashboard')}><span className="brand-mark"><BrandMark /></span><span><strong>LabelLekha</strong><small>Legal Metrology</small></span></button>
    <nav><div className="nav-label">Workspace</div>{navItems.map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav>
    <div className="sidebar-footer"><div className="user-mini"><span className="avatar">{(session?.name || 'U').slice(0,1).toUpperCase()}</span><div><strong>{session?.name || 'Signed in user'}</strong><small>{session?.role || 'user'}</small></div></div><button className="logout" onClick={() => { localStorage.removeItem('labelix_token'); localStorage.removeItem('labelix_user'); window.location.reload(); }}>Sign out</button></div>
  </aside>;
}
