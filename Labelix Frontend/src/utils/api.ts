// Labelix Frontend/src/utils/api.ts

export async function fetchDashboardMetrics() {
  try {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/scans', { headers });
    if (!res.ok) throw new Error('Failed to load scans');
    
    const scans = await res.json();
    
    // Calculate live numbers from DB records
    const totalScans = scans.length;
    const compliantScans = scans.filter((s: any) => s.status === 'compliant' || !s.recapture_needed).length;
    const flagRate = totalScans > 0 ? Math.round(((totalScans - compliantScans) / totalScans) * 100) : 0;
    
    return {
      totalScans,
      flagRate: `${flagRate}%`,
      recentScans: scans.slice(0, 5)
    };
  } catch (err) {
    // Fallback if backend has 0 records yet
    return {
      totalScans: 0,
      flagRate: '0%',
      recentScans: []
    };
  }
}