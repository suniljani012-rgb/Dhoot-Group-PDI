import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getVehiclesForBrand, getBookingsForBrand, getChallansForBrand } from '../data/seedData';

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

  const calculateCounts = () => {
    try {
      const vehicles = getVehiclesForBrand(currentBrand?.code || 'DHOOT-ALL');
      const bookings = getBookingsForBrand(currentBrand?.code || 'DHOOT-ALL');

      let receivingPending = 0;
      let inYard = 0;
      let pdiPending = 0;
      let pdiDone = 0;
      let totalAllotedStock = 0;
      let inRepair = 0;
      let qaPending = 0;

      vehicles.forEach((v: any) => {
        const status = (v.status || v.vehicle_status || '').toUpperCase();
        const isAllocated = !!v.customer_name || status === 'ALLOCATED';

        if (status === 'YARD_RECEIVING_PENDING' || status === 'GATE_INWARD_PENDING' || status === 'IN_TRANSIT') {
          receivingPending++;
        } else {
          inYard++;
          if (status === 'PDI_PENDING' || status === 'RECEIVED') pdiPending++;
          if (status === 'PDI_APPROVED' || status === 'DELIVERY_READY') pdiDone++;
          if (status === 'REPAIR_IN_PROGRESS' || status === 'REPAIR_PENDING' || status === 'REPAIRS') inRepair++;
          if (status === 'QA_PENDING' || status === 'QA_IN_PROGRESS') qaPending++;
        }

        if (isAllocated) {
          totalAllotedStock++;
        }
      });

      const totalPhysicalStock = inYard;
      const totalFreeVehicle = Math.max(0, totalPhysicalStock - totalAllotedStock);
      const totalBookings = bookings.length;
      const pbnaBookings = bookings.filter(b => !b.allocated_vin_no && b.status !== 'DELIVERED');
      const totalPbnaVehicle = pbnaBookings.length;

      setCounts({
        totalStock: vehicles.length,
        totalBookings,
        totalPhysicalStock,
        totalAllotedStock,
        totalFreeVehicle,
        totalPbnaVehicle,
        orderRequired: Math.max(0, totalPbnaVehicle - totalFreeVehicle),
        receivingPending,
        inYard,
        pdiPending,
        pdiDone,
        allocatedVehicles: totalAllotedStock,
        inRepair,
        qaPending,
        loading: false,
      });
    } catch (e) {
      console.warn('Count calculation error:', e);
      setCounts(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    calculateCounts();

    const handleUpdate = () => {
      calculateCounts();
    };

    window.addEventListener('stock-updated', handleUpdate);
    window.addEventListener('bookings-updated', handleUpdate);
    window.addEventListener('challans-updated', handleUpdate);

    return () => {
      window.removeEventListener('stock-updated', handleUpdate);
      window.removeEventListener('bookings-updated', handleUpdate);
      window.removeEventListener('challans-updated', handleUpdate);
    };
  }, [currentBrand?.code]);

  return counts;
};
