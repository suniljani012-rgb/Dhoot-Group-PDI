import React, { useState } from 'react';
import { X, Car } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (vehicle: any) => void;
}

export const NewVehicleModal: React.FC<NewVehicleModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { currentBrand } = useAuth();
  const [vin, setVin] = useState('');
  const [model, setModel] = useState(currentBrand.models[0] || 'Car');
  const [variant, setVariant] = useState('Top Spec');
  const [fuelType, setFuelType] = useState('PETROL');
  const [color, setColor] = useState('White');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: crypto.randomUUID(),
      vin: vin.toUpperCase(),
      model,
      variant,
      fuelType,
      color,
      status: 'RECEIVED',
      receivedAt: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DEE2E8]">
        <div className="flex items-center justify-between pb-4 border-b border-[#DEE2E8]">
          <div className="flex items-center gap-2">
            <div style={{ backgroundColor: currentBrand.primaryColor }} className="p-2 text-white rounded-lg">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1A1A2E]">Register New {currentBrand.shortName} Vehicle</h3>
              <span className="text-[11px] text-[#718096]">{currentBrand.name} Inventory</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#718096] hover:text-[#1A1A2E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#1A1A2E] uppercase">VIN / Chassis (17 Chars)</label>
            <input
              type="text"
              required
              maxLength={17}
              placeholder={currentBrand.code === 'DHOOT-TATA' ? 'e.g. MAT612345N9988776' : 'e.g. MALC12345C8877665'}
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[#DEE2E8] rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#1A3A6B] uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A2E] uppercase">{currentBrand.shortName} Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#DEE2E8] rounded-lg text-sm"
              >
                {currentBrand.models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A2E] uppercase">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#DEE2E8] rounded-lg text-sm"
              >
                <option value="PETROL">PETROL</option>
                <option value="DIESEL">DIESEL</option>
                <option value="CNG">CNG</option>
                <option value="EV">EV</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A2E] uppercase">Variant</label>
            <input
              type="text"
              required
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[#DEE2E8] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A2E] uppercase">Color</label>
            <input
              type="text"
              required
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[#DEE2E8] rounded-lg text-sm"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#DEE2E8] rounded-lg text-sm font-medium text-[#4A5568] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ backgroundColor: currentBrand.primaryColor }}
              className="flex-1 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all"
            >
              Save Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};