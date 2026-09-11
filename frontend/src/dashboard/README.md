# Role 5: Dashboard & Analytics Component Module
## Integration Guide for Person 3 (Main Frontend)

This module encapsulates all Legal Metrology compliance dashboard analytics, charts, filter toolbars, and inspector verification queues for Role 5. It is self-contained and ready to plug into the main application.

---

### 1. Directory Layout

```
dashboard/
├── index.js                     # Main barrel export file
├── pages/
│   └── DashboardPage.jsx        # Complete Inspector Dashboard View
├── components/
│   ├── KpiCards.jsx             # 6 KPI metric cards (Total, Compliant, Rate, etc.)
│   ├── ComplianceOverview.jsx   # Doughnut chart (Compliant vs Non-Compliant vs Recapture)
│   ├── ViolationAnalytics.jsx   # 7-Rule Bar Chart & Detailed Matrix Table (Rule 7 separated)
│   ├── RegionAnalytics.jsx      # Coarse-Location Jurisdiction Analytics & Bar Chart
│   ├── BrandCategoryAnalytics.jsx # Cross-Commodity Brand and Category Tables
│   ├── HumanReviewQueue.jsx     # Adaptive Evidence-Driven Human Review Queue
│   ├── PriorityQueue.jsx        # Explainable Priority Queue (CRITICAL/HIGH/MEDIUM/LOW)
│   ├── DashboardFilters.jsx     # Active multi-attribute filter toolbar
│   └── ScanDetailsModal.jsx     # Scan detail modal with label image & evidence snippets
├── services/
│   ├── apiConfig.js             # API base URL configuration and JWT Bearer client
│   ├── dashboardService.js      # Calls /dashboard/stats, /reviews, /priority-queue, /filter-options
│   └── scanService.js           # Calls /scans, /scans/{id}, /scans/{id}/image
├── hooks/
│   └── useDashboardData.js      # Custom React hook managing dashboard state and filters
└── utils/
    ├── constants.js             # 7 Legal Metrology rules definitions & priority levels
    └── formatters.js            # Indian number, date, percentage, and badge style helpers
```

---

### 2. How to Mount in the Main Frontend

In your router (e.g. `react-router-dom`), import `DashboardPage` and mount it to the `/dashboard` route:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardPage } from './dashboard'; // or from '@/dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Person 3: Your Scan / Upload Routes */}
        <Route path="/" element={<HomeOrScanFlow />} />
        <Route path="/scan" element={<CameraUploadFlow />} />

        {/* Person 5: Inspector Dashboard Route */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### 3. Authentication Integration

The dashboard expects an authenticated user with `role="inspector"`.

- Token Storage: The dashboard retrieves the JWT Bearer token from:
  ```javascript
  localStorage.getItem('labellekha_auth_token');
  ```
- When your login screen authenticates an inspector, save the token:
  ```javascript
  localStorage.setItem('labellekha_auth_token', token);
  ```
  *(Or call `setAuthToken(token)` imported from `./dashboard`).*

---

### 4. Backend Configuration

- Set the `VITE_API_BASE_URL` environment variable if your backend is hosted separately:
  ```env
  VITE_API_BASE_URL=http://localhost:8000
  ```
- If frontend and backend are served on the same host or proxied via Vite, `VITE_API_BASE_URL` can be left empty.

---

### 5. Backend Endpoints Consumed

All endpoints are inspector-only and filter by user consent (`consent_given == True`):

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/dashboard/stats` | `GET` | Main KPIs, 7-rule violation breakdown, regional and brand statistics |
| `/dashboard/reviews` | `GET` | Flagged scans under Adaptive Evidence-Driven Inspection |
| `/dashboard/priority-queue` | `GET` | Explainable inspection priority ranking (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) |
| `/dashboard/filter-options` | `GET` | Available dropdown filter values from consented scans |
| `/scans/{id}` | `GET` | Detailed clause-by-clause verification evidence |
| `/scans/{id}/image` | `GET` | Original scanned packaging image |
