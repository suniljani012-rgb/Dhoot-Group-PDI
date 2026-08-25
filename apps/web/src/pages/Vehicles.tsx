import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Car, ChevronRight } from 'lucide-react';
import { NewVehicleModal } from '../components/vehicles/NewVehicleModal';

export const VehiclesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock live list for Pune Central branch
  const [vehicles, setVehicles] = useState([
    {
      id: '55555555-5555-5555-5555-555555555551',
      vin: 'MAT612345N1234567',
      model: 'Tata Nexon',
      variant: 'Fearless Plus S DT',
      fuelType: 'PETROL',
      color: 'Daytona Grey',
      status: 'RECEIVED',
      receivedAt: '2026-08-25',
    },
    {
      id: '55555555-5555-5555-5555-555555555552',
      vin: 'MAT612345H7654321',
      model: 'Tata Harrier',
      variant: 'Fearless Plus Dark',
      fuelType: 'DIESEL',
      color: 'Oberon Black',
      status: 'PDI_PENDING',
      receivedAt: '2026-08-24',
    },
    {
      id: '55555555-5555-5555-5555-555555555553',
      vin: 'MAT612345S9988776',
      model: 'Tata Safari',
      variant: 'Accomplished Plus 6S',
      fuelType: 'DIESEL',
      color: 'Cosmic Gold',
      status: 'PDI_IN_PROGRESS',
      receivedAt: '2026-08-24',
    },
    {
      id: '55555555-5555-5555-5555-555555555554',
      vin: 'MAT612345C1122334',
      model: 'Tata Curvv.ev',
      variant: 'Empowered Plus 55',
      fuelType: 'EV',
      color: 'Virtual Sunrise',
      status: 'PDI_APPROVED',
      receivedAt: '2026-08-23',
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      vin: 'MAT612345P4455667',
      model: 'Tata Punch',
      variant: 'Creative Flagship iCNG',
      fuelType: 'CNG',
      color: 'Atomic Orange',
      status: 'DELIVERY_READY',
      receivedAt: '2026-08-22',
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-[#FEF7E8] text-[#92600A] border-[#F5D48E]';
      case 'PDI_PENDING':
        return 'bg-[#EBF3FD] text-[#1565A8] border-[#9DC7F0]';
      case 'PDI_IN_PROGRESS':
        return 'bg-[#EBF3FD] text-[#1A3A6B] border-[#2C5298] font-bold';
      case 'PDI_APPROVED':
      case 'DELIVERY_READY':
        return 'bg-[#EBF7F1] text-[#1A7C4A] border-[#A8DFC0]';
      case 'PDI_FAILED':
        return 'bg-[#FEECEC] text-[#C62828] border-[#F5A8A8]';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filtered = vehicles.filter((v) => {
    const matchesSearch = v.vin.toLowerCase().includes(searchTerm.toLowerCase()) || v.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A2E]">Vehicle Inventory & Queue</h2>
          <p className="text-sm text-[#718096]">Stockyard vehicles and real-time inspection status</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A3A6B] hover:bg-[#2C5298] text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register Vehicle
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#DEE2E8] rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by VIN or Model (e.g. Nexon)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#DEE2E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#718096]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-[#DEE2E8] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]"
          >
            <option value="ALL">All Statuses</option>
            <option value="RECEIVED">Received</option>
            <option value="PDI_PENDING">PDI Pending</option>
            <option value="PDI_IN_PROGRESS">PDI In Progress</option>
            <option value="PDI_APPROVED">PDI Approved</option>
            <option value="DELIVERY_READY">Delivery Ready</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#DEE2E8] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1A1A2E]">
            <thead className="bg-[#F8F9FA] border-b border-[#DEE2E8] text-xs font-semibold text-[#718096] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Vehicle / Model</th>
                <th className="px-6 py-4">VIN Number</th>
                <th className="px-6 py-4">Fuel & Specs</th>
                <th className="px-6 py-4">Color</th>
                <th className="px-6 py-4">PDI Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE2E8]">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#EBF3FD] text-[#1565A8] rounded-lg">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#1A1A2E]">{v.model}</div>
                        <div className="text-xs text-[#718096]">{v.variant}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-xs text-[#1A1A2E]">
                    {v.vin}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-[#F1F3F5] text-[#4A5568] rounded">
                      {v.fuelType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#4A5568]">
                    {v.color}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(v.status)}`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/vehicles/${v.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#1A3A6B] hover:text-[#2C5298]"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(newV) => setVehicles([newV, ...vehicles])}
      />
    </div>
  );
};
