import React from 'react';
import { X, Sparkles, Check, Package, ArrowRight } from 'lucide-react';
import { formatCOP, formatUSD } from '../../services/inventoryService';

interface PromoPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export const PromoPackageModal: React.FC<PromoPackageModalProps> = ({ isOpen, onClose, onApply }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-[#e5eeff] relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#707881] hover:text-[#0b1c30] p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#006194]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">Paquete Promocional de Desestancamiento</h2>
            <span className="text-xs text-[#515f74]">Recuperación de $ 455 USD ($ 1.820.000 COP) en repuestos dormidos</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          <div className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff]/60">
            <span className="font-bold text-[#006194] text-xs block mb-1">
              Combo Sugerido: "Servicio Mayor de Sincronización + Cambio de Tracción"
            </span>
            <p className="text-[11px] text-[#515f74] leading-relaxed">
              Al empaquetar repuestos de baja rotación (Amortiguador FZ25, Faro Gixxer o Corona Agility) con mano de obra y cambio de aceite de alta rotación (Yamalube), se liquida el capital inmovilizado en menos de 21 días.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-[#515f74]">Repuestos incluidos en la promoción:</span>
            <div className="p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] flex justify-between items-center">
              <span>Amortiguador Monoshock FZ25 (120 días inactivo)</span>
              <span className="font-bold text-[#ba1a1a]">$ 110.00 USD</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] flex justify-between items-center">
              <span>Llanta Pistera 140/70-17 Michelin Pilot (110 días)</span>
              <span className="font-bold text-[#ba1a1a]">$ 95.00 USD</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] flex justify-between items-center">
              <span>Faro Delantero Suzuki Gixxer 250 (180 días)</span>
              <span className="font-bold text-[#ba1a1a]">$ 145.00 USD</span>
            </div>
          </div>

          <div className="p-3 bg-[#ecfdf5] rounded-xl border border-[#a7f3d0] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#065f46] block">Descuento de liquidación sugerido:</span>
              <span className="text-[11px] text-[#047857]">15% sobre el precio de lista al cliente</span>
            </div>
            <span className="text-sm font-extrabold text-[#065f46]">Retorno: +85% Liquidez</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f4fa]">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-[#515f74] hover:bg-[#eff4ff]"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold bg-[#006194] hover:bg-[#007bb9] text-white shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Publicar Combo en Mostrador de Taller</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
