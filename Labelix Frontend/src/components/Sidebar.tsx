import type { NavigateFn, Page, UserSession } from '../types';

const items: Array<{ id: Page; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'new-scan', label: 'New scan', icon: '＋' },
  { id: 'products', label: 'Search & history', icon: '⌕' },
  { id: 'reports', label: 'Reports', icon: '▤' },
  { id: 'producer-precheck', label: 'Producer pre-check', icon: '✓' },
  { id: 'ai-assistant', label: 'Assistant', icon: '◌' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar({ page, navigate, session }: { page: Page; navigate: NavigateFn; session: UserSession | null }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => navigate('dashboard')}><span className="brand-mark">LL</span><span><strong>LabelLekha</strong><small>Label compliance</small></span></button>
    <nav><div className="nav-label">Workspace</div>{items.map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav>
    <div className="sidebar-footer"><div className="user-mini"><span className="avatar">{(session?.name || 'U').slice(0,1).toUpperCase()}</span><div><strong>{session?.name || 'Signed in user'}</strong><small>{session?.role || 'user'}</small></div></div><button className="logout" onClick={() => { localStorage.removeItem('labelix_token'); localStorage.removeItem('labelix_user'); window.location.reload(); }}>Sign out</button></div>
  </aside>;
}
