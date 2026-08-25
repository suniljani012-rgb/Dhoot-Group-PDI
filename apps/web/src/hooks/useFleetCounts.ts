import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export interface FleetCounts {
  totalStock: number;
  receivingPending: number;
  inYard: number;
  pdiPending: number;
  pdiDone: number;
  totalBookings: number;
  allocatedVehicles: number;
  inRepair: number;
  qaPending: number;
  loading: boolean;
}

export const useFleetCounts = (): FleetCounts => {
  const { currentBrand } = useAuth();
  
  // Strict 0 baseline — strictly 100% actual real database counts
  const [counts, setCounts] = useState<FleetCounts>({
    totalStock: 0,
    receivingPending: 0,
    inYard: 0,
    pdiPending: 0,
    pdiDone: 0,
    totalBookings: 0,
    allocatedVehicles: 0,
    inRepair: 0,
    qaPending: 0,
    loading: true,
  });

  const fetchLiveCounts = async () => {
    try {
      const orgParam = currentBrand && currentBrand.code !== 'DHOOT-ALL' ? `?organization_id=${currentBrand.orgId}` : '';
      
      // 1. Fetch exact vehicle stock from database
      const stockRes = await fetch(`http://localhost:8787/api/v1/stock${orgParam}`);
      let totalStock = 0;
      let receivingPending = 0;
      let inYard = 0;
      let pdiPending = 0;
      let pdiDone = 0;
      let allocated = 0;

      if (stockRes.ok) {
        const json = await stockRes.json();
        const rows = json.data || [];
        totalStock = rows.length;

        rows.forEach((v: any) => {
          const status = (v.status || '').toUpperCase();
          if (status === 'YARD_RECEIVING_PENDING' || status === 'IN_TRANSIT') {
            receivingPending++;
          } else {
            inYard++;
            if (status === 'PDI_PENDING' || status === 'RECEIVED') pdiPending++;
            if (status === 'PDI_APPROVED' || status === 'DELIVERY_READY') pdiDone++;
            if (status === 'ALLOCATED') allocated++;
          }
        });
      }

      // 2. Fetch exact bookings count from database
      const bookRes = await fetch(`http://localhost:8787/api/v1/bookings${orgParam}`);
      let totalBookings = 0;
      if (bookRes.ok) {
        const json = await bookRes.json();
        totalBookings = (json.data || []).length;
      }

      // 3. Fetch exact active repairs count from database
      const repRes = await fetch('http://localhost:8787/api/v1/repairs');
      let inRepair = 0;
      if (repRes.ok) {
        const json = await repRes.json();
        inRepair = (json.data || []).filter((r: any) => r.status !== 'COMPLETED' && r.status !== 'CLOSED').length;
      }

      // 4. Fetch exact pending QA reviews from database
      const qaRes = await fetch('http://localhost:8787/api/v1/qa');
      let qaPending = 0;
      if (qaRes.ok) {
        const json = await qaRes.json();
        qaPending = (json.data || []).filter((q: any) => q.status === 'PENDING' || q.status === 'SUBMITTED').length;
      }

      setCounts({
        totalStock,
        receivingPending,
        inYard,
        pdiPending,
        pdiDone,
        totalBookings,
        allocatedVehicles: allocated,
        inRepair,
        qaPending,
        loading: false,
      });

    } catch (err) {
      console.warn('Live count fetch note:', err);
      setCounts(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchLiveCounts();
    const interval = setInterval(fetchLiveCounts, 10000); // 10s polling for live updates
    return () => clearInterval(interval);
  }, [currentBrand?.code]);

  return counts;
};
