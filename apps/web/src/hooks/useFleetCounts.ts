import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getVehiclesForBrand, getBookingsForBrand } from '../data/seedData';

export interface FleetCounts {
  totalStock: number;
  totalBookings: number;
  totalPhysicalStock: number;
  totalAllotedStock: number;
  totalFreeVehicle: number;
  totalPbnaVehicle: number;
  totalVnaVehicle: number;
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

const norm = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const useFleetCounts = (): FleetCounts => {
  const { currentBrand } = useAuth();
  
  const [counts, setCounts] = useState<FleetCounts>({
    totalStock: 0,
    totalBookings: 0,
    totalPhysicalStock: 0,
    totalAllotedStock: 0,
    totalFreeVehicle: 0,
    totalPbnaVehicle: 0,
    totalVnaVehicle: 0,
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

        if (status === 'YARD_RECEIVING_PENDING' || status === 'GATE_INWARD_PENDING' || status === 'IN_TRANSIT' || v.location === 'In Transit') {
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
      
      // Calculate PBNA vs VNA based on matching Model + Variant + Colour in free stock
      const unallocatedBookings = bookings.filter(b => !b.allocated_vin_no && (b.status || '').toUpperCase() !== 'DELIVERED');
      const freeVehicles = vehicles.filter(v => 
        !v.customer_name && 
        v.status !== 'ALLOCATED' && 
        v.status !== 'YARD_RECEIVING_PENDING' && 
        v.location !== 'In Transit'
      );

      const matchedVinSet = new Set<string>();
      let totalPbnaVehicle = 0; // Booking pending, matching vehicle IS in stock
      let totalVnaVehicle = 0;  // Booking pending, matching vehicle IS NOT in stock

      unallocatedBookings.forEach(b => {
        const bModel = norm(b.model);
        const bVariant = norm(b.variant);
        const bColor = norm(b.colour);

        const matchingVeh = freeVehicles.find(v => {
          if (matchedVinSet.has(v.vin)) return false;
          const vModel = norm(v.model);
          const vVariant = norm(v.variant);
          const vColor = norm(v.color || v.colour);

          if (vModel === bModel && vVariant === bVariant && vColor === bColor) return true;
          if (vModel === bModel && vVariant === bVariant) return true;
          if (vModel === bModel && (!vVariant || !bVariant)) return true;
          return false;
        });

        if (matchingVeh) {
          matchedVinSet.add(matchingVeh.vin);
          totalPbnaVehicle++;
        } else {
          totalVnaVehicle++;
        }
      });

      setCounts({
        totalStock: vehicles.length,
        totalBookings,
        totalPhysicalStock,
        totalAllotedStock,
        totalFreeVehicle,
        totalPbnaVehicle,
        totalVnaVehicle,
        orderRequired: totalVnaVehicle,
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
