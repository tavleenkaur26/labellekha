import { useState } from 'react';
import Sidebar from './Sidebar';
import type { NavigateFn, Page, UserSession } from '../types';

export default function AppShell({ page, navigate, children, session }: { page: Page; navigate: NavigateFn; children: React.ReactNode; session: UserSession | null }) {
  const [open, setOpen] = useState(false);
  return <div className="app-shell">
    <div className={`mobile-drawer ${open ? 'open' : ''}`}><div className="drawer-backdrop" onClick={() => setOpen(false)} /><Sidebar page={page} navigate={(p) => { navigate(p); setOpen(false); }} session={session} /></div>
    <aside className="desktop-sidebar"><Sidebar page={page} navigate={navigate} session={session} /></aside>
    <section className="main-area">
      <header className="mobile-header"><button className="icon-button" onClick={() => setOpen(true)} aria-label="Open navigation">☰</button><strong>LabelLekha</strong></header>
      <main className="page-scroll">{children}</main>
    </section>
  </div>;
}
