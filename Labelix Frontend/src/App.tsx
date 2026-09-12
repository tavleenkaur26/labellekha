import { useState } from "react";
import type { Page } from "./types";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AppShell from "./components/AppShell";
import Dashboard from "./pages/Dashboard";
import NewScan from "./pages/NewScan";
import Processing from "./pages/Processing";
import InspectionResult from "./pages/InspectionResult";
import ConsumerResult from "./pages/ConsumerResult";
import ProducerPreCheck from "./pages/ProducerPreCheck";
import AIAssistant from "./pages/AIAssistant";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const APP_PAGES: Page[] = [
  "dashboard",
  "new-scan",
  "processing",
  "inspection-result",
  "consumer-result",
  "producer-precheck",
  "ai-assistant",
  "products",
  "reports",
  "settings",
];

export default function App() {
  const [page, setPage] = useState<Page>("landing");

  const navigate = (p: Page) => setPage(p);

  if (page === "landing") return <Landing navigate={navigate} />;
  if (page === "login") return <Login navigate={navigate} />;

  if (APP_PAGES.includes(page)) {
    return (
      <AppShell page={page} navigate={navigate}>
        {page === "dashboard" && <Dashboard navigate={navigate} />}
        {page === "new-scan" && <NewScan navigate={navigate} />}
        {page === "processing" && <Processing navigate={navigate} />}
        {page === "inspection-result" && <InspectionResult navigate={navigate} />}
        {page === "consumer-result" && <ConsumerResult navigate={navigate} />}
        {page === "producer-precheck" && <ProducerPreCheck navigate={navigate} />}
        {page === "ai-assistant" && <AIAssistant navigate={navigate} />}
        {page === "products" && <Products navigate={navigate} />}
        {page === "reports" && <Reports navigate={navigate} />}
        {page === "settings" && <Settings navigate={navigate} />}
      </AppShell>
    );
  }

  return <Landing navigate={navigate} />;
}
