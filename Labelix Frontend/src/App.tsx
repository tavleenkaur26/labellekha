import { useEffect, useState } from 'react';
import type { NavigateFn, Page, UserSession } from './types';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import Processing from './pages/Processing';
import InspectionResult from './pages/InspectionResult';
import ConsumerResult from './pages/ConsumerResult';
import ProducerPreCheck from './pages/ProducerPreCheck';
import AIAssistant from './pages/AIAssistant';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  const [page, setPage] = useState<Page>(() => localStorage.getItem('labelix_token') ? 'dashboard' : 'login');
  const [session, setSession] = useState<UserSession | null>(() => JSON.parse(localStorage.getItem('labelix_user') || 'null'));
  const navigate: NavigateFn = (next) => setPage(next);

  useEffect(() => {
    if (!localStorage.getItem('labelix_token') && page !== 'login') setPage('login');
  }, [page]);

  if (page === 'login' || !localStorage.getItem('labelix_token')) return <Login onSuccess={(user) => { setSession(user); setPage('dashboard'); }} />;

  const content = {
    dashboard: <Dashboard navigate={navigate} session={session} />,
    'new-scan': <NewScan navigate={navigate} />,
    processing: <Processing navigate={navigate} />,
    'inspection-result': <InspectionResult navigate={navigate} />,
    'consumer-result': <ConsumerResult navigate={navigate} />,
    'producer-precheck': <ProducerPreCheck navigate={navigate} />,
    'ai-assistant': <AIAssistant navigate={navigate} />,
    products: <Products navigate={navigate} />,
    reports: <Reports navigate={navigate} />,
    settings: <Settings navigate={navigate} session={session} setSession={setSession} />,
  }[page] || <Dashboard navigate={navigate} session={session} />;

  return <AppShell page={page} navigate={navigate} session={session}>{content}</AppShell>;
}
