import React from 'react';
import { X, CheckCircle, ShoppingBag, FileText, Download } from 'lucide-react';
import { SuggestedPurchaseItem } from '../../types/inventory';
import { formatCOP } from '../../services/inventoryService';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCOP: number;
  items: SuggestedPurchaseItem[];
  onConfirm: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  totalCOP,
  items,
  onConfirm
}) => {
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

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#00855b]">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">Aprobar Plan de Compras</h2>
            <span className="text-xs text-[#515f74]">Generación de órdenes a distribuidores autorizados</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          <div className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff]/60 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#515f74]">Monto Total de la Orden:</span>
              <span className="text-xl font-black text-[#006194]">{formatCOP(totalCOP)}</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-white text-[#0b1c30] font-bold text-xs border border-[#dce9ff]">
              {items.length} repuestos incluidos
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <span className="font-bold text-[#515f74]">Detalle de pedidos a emitir:</span>
            {items.map((i) => (
              <div key={i.id} className="p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-bold text-[#0b1c30]">{i.nombre}</span>
                  <span className="text-[10px] text-[#707881]">{i.cantidad_sugerida} {i.unidad} • {i.proveedor}</span>
                </div>
                <span className="font-bold text-xs text-[#0b1c30]">{formatCOP(i.costo_total)}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#f8f9ff] rounded-xl text-[11px] text-[#515f74] border border-[#e5eeff]">
            Esta acción comprometerá el presupuesto del mes de <strong>Noviembre 2024</strong> e insertará los registros correspondientes en la tabla <code>ordenes_compra</code> de la base de datos relacional.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f4fa]">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-[#515f74] hover:bg-[#eff4ff]"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold bg-[#006194] hover:bg-[#007bb9] text-white shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Emitir Orden Formal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
