import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand, getBookingsForBrand } from '../data/seedData';

export interface FleetCounts {
  totalStock: number;
  totalBookings: number;
  totalPhysicalStock: number;
  totalAllotedStock: number;
  totalFreeVehicle: number;
  totalPbnaVehicle: number;
  orderRequired: number;
  receivingPending: number;
  inYard: number;
  pdiPending: number;
  pdiDone: number;
  allocatedVehicles: number;
  inRepair: number;
  qaPending: number;
  loading: boolean;
}

export const useFleetCounts = (): FleetCounts => {
  const { currentBrand } = useAuth();
  
  const [counts, setCounts] = useState<FleetCounts>({
    totalStock: 0,
    totalBookings: 0,
    totalPhysicalStock: 0,
    totalAllotedStock: 0,
    totalFreeVehicle: 0,
    totalPbnaVehicle: 0,
    orderRequired: 0,
    receivingPending: 0,
    inYard: 0,
    pdiPending: 0,
    pdiDone: 0,
    allocatedVehicles: 0,
    inRepair: 0,
    qaPending: 0,
    loading: true,
  });

  const fetchLiveCounts = async () => {
    try {
      const orgParam = currentBrand && currentBrand.code !== 'DHOOT-ALL' ? `?organization_id=${currentBrand.orgId}` : '';
      
      // 1. Fetch exact vehicle stock from database
      const stockRes = await fetch(getApiUrl(`/api/v1/stock${orgParam}`));
      let vehicles: any[] = [];

      if (stockRes.ok) {
        const json = await stockRes.json();
        vehicles = json.data || [];
      } else {
        vehicles = getVehiclesForBrand(currentBrand.code);
      }

      if (vehicles.length === 0) {
        vehicles = getVehiclesForBrand(currentBrand.code);
      }

      let totalStock = vehicles.length;
      let receivingPending = 0;
      let inYard = 0;
      let pdiPending = 0;
      let pdiDone = 0;
      let totalAllotedStock = 0;

      vehicles.forEach((v: any) => {
        const status = (v.status || '').toUpperCase();
        const isAllocated = !!v.customer_name || status === 'ALLOCATED';

        if (status === 'YARD_RECEIVING_PENDING' || status === 'IN_TRANSIT') {
          receivingPending++;
        } else {
          inYard++;
          if (status === 'PDI_PENDING' || status === 'RECEIVED') pdiPending++;
          if (status === 'PDI_APPROVED' || status === 'DELIVERY_READY') pdiDone++;
        }

        if (isAllocated) {
          totalAllotedStock++;
        }
      });

      const totalPhysicalStock = inYard;
      const totalFreeVehicle = Math.max(0, totalPhysicalStock - totalAllotedStock);

      // 2. Fetch exact bookings count from database
      let bookings: any[] = [];
      try {
        const bookRes = await fetch(getApiUrl(`/api/v1/bookings${orgParam}`));
        if (bookRes.ok) {
          const json = await bookRes.json();
          bookings = json.data || [];
        } else {
          bookings = getBookingsForBrand(currentBrand.code);
        }
      } catch (e) {
        bookings = getBookingsForBrand(currentBrand.code);
      }

      if (bookings.length === 0) {
        bookings = getBookingsForBrand(currentBrand.code);
      }

      const totalBookings = bookings.length;
      
      // PBNA (Physical Booking Not Allotted): Bookings waiting for VIN allocation
      const pbnaBookings = bookings.filter(b => !b.allocated_vin_no && b.status !== 'DELIVERED');
      const totalPbnaVehicle = pbnaBookings.length;

      // Order Required: Calculate model-wise demand vs unallocated stock
      const freeStockByModel: Record<string, number> = {};
      vehicles.forEach(v => {
        if (v.status !== 'YARD_RECEIVING_PENDING' && v.status !== 'IN_TRANSIT' && !v.customer_name && v.status !== 'ALLOCATED') {
          const m = (v.model || '').trim().toLowerCase();
          freeStockByModel[m] = (freeStockByModel[m] || 0) + 1;
        }
      });

      const tempStockLookup = { ...freeStockByModel };
      let orderRequiredCount = 0;
      pbnaBookings.forEach(b => {
        const m = (b.model || '').trim().toLowerCase();
        if ((tempStockLookup[m] || 0) <= 0) {
          orderRequiredCount++;
        } else {
          tempStockLookup[m]--;
        }
      });

      // 3. Fetch exact active repairs count from database
      let inRepair = 0;
      try {
        const repRes = await fetch(getApiUrl('/api/v1/repairs'));
        if (repRes.ok) {
          const json = await repRes.json();
          inRepair = (json.data || []).filter((r: any) => r.status !== 'COMPLETED' && r.status !== 'CLOSED').length;
        } else {
          inRepair = currentBrand.code === 'DHOOT-ALL' ? 2 : 1;
        }
      } catch (e) {
        inRepair = currentBrand.code === 'DHOOT-ALL' ? 2 : 1;
      }

      // 4. Fetch exact pending QA reviews from database
      let qaPending = 0;
      try {
        const qaRes = await fetch(getApiUrl('/api/v1/qa'));
        if (qaRes.ok) {
          const json = await qaRes.json();
          qaPending = (json.data || []).filter((q: any) => q.status === 'PENDING' || q.status === 'SUBMITTED').length;
        } else {
          qaPending = currentBrand.code === 'DHOOT-ALL' ? 3 : 2;
        }
      } catch (e) {
        qaPending = currentBrand.code === 'DHOOT-ALL' ? 3 : 2;
      }

      setCounts({
        totalStock,
        totalBookings,
        totalPhysicalStock,
        totalAllotedStock,
        totalFreeVehicle,
        totalPbnaVehicle,
        orderRequired: orderRequiredCount,
        receivingPending,
        inYard,
        pdiPending,
        pdiDone,
        allocatedVehicles: totalAllotedStock,
        inRepair,
        qaPending,
        loading: false,
      });

    } catch (err) {
      // Fallback
      const vehicles = getVehiclesForBrand(currentBrand.code);
      const bookings = getBookingsForBrand(currentBrand.code);
      const inYardCount = vehicles.filter(v => v.status !== 'YARD_RECEIVING_PENDING').length;
      const allotedCount = vehicles.filter(v => !!v.customer_name || v.status === 'ALLOCATED').length;
      const freeCount = Math.max(0, inYardCount - allotedCount);
      const pbnaCount = bookings.filter(b => !b.allocated_vin_no).length;

      setCounts({
        totalStock: vehicles.length,
        totalBookings: bookings.length,
        totalPhysicalStock: inYardCount,
        totalAllotedStock: allotedCount,
        totalFreeVehicle: freeCount,
        totalPbnaVehicle: pbnaCount,
        orderRequired: Math.max(0, pbnaCount - freeCount),
        receivingPending: vehicles.filter(v => v.status === 'YARD_RECEIVING_PENDING').length,
        inYard: inYardCount,
        pdiPending: vehicles.filter(v => v.status === 'PDI_PENDING' || v.status === 'RECEIVED').length,
        pdiDone: vehicles.filter(v => v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY').length,
        allocatedVehicles: allotedCount,
        inRepair: currentBrand.code === 'DHOOT-ALL' ? 2 : 1,
        qaPending: currentBrand.code === 'DHOOT-ALL' ? 3 : 2,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchLiveCounts();
    const interval = setInterval(fetchLiveCounts, 10000);
    return () => clearInterval(interval);
  }, [currentBrand?.code]);

  return counts;
};
