import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check, AlertCircle } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRepuestoId?: number;
  onSuccess: (msg: string) => void;
}

export const MovementModal: React.FC<MovementModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedRepuestoId,
  onSuccess 
}) => {
  const repuestos = inventoryService.getRepuestos();
  const [repuestoId, setRepuestoId] = useState<number>(selectedRepuestoId || repuestos[0]?.id || 1);
  const [tipo, setTipo] = useState<'SALIDA' | 'ENTRADA'>('SALIDA');
  const [cantidad, setCantidad] = useState<number>(1);
  const [motivo, setMotivo] = useState<string>('Mantenimiento preventivo orden #1204');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = inventoryService.registerMovement(repuestoId, tipo, cantidad, motivo);
    if (result.success) {
      onSuccess(result.message);
      onClose();
    } else {
      setError(result.message);
    }
  };

  const currentItem = repuestos.find(r => r.id === repuestoId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#e5eeff] relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#707881] hover:text-[#0b1c30] p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#006194]">
            {tipo === 'ENTRADA' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">Registrar Movimiento de Inventario</h2>
            <span className="text-xs text-[#515f74]">Actualiza stock físico y recalcula tasa de rotación</span>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#fef2f2] text-[#991b1b] text-xs flex items-center gap-2 border border-[#fecaca]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Movement Type Toggle */}
          <div className="flex p-1 bg-[#eff4ff] rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setTipo('SALIDA')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                tipo === 'SALIDA' ? 'bg-[#ba1a1a] text-white shadow-xs' : 'text-[#515f74]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Salida de Taller (Gasto / Venta)</span>
            </button>
            <button
              type="button"
              onClick={() => setTipo('ENTRADA')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                tipo === 'ENTRADA' ? 'bg-[#00855b] text-white shadow-xs' : 'text-[#515f74]'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Entrada (Compra / Recepción)</span>
            </button>
          </div>

          {/* Product Select */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#515f74]">Repuesto:</label>
            <select
              value={repuestoId}
              onChange={(e) => setRepuestoId(Number(e.target.value))}
              className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-semibold border-0 outline-none cursor-pointer"
            >
              {repuestos.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nombre} (Stock actual: {r.stock_actual} u.)
                </option>
              ))}
            </select>
            {currentItem && (
              <span className="text-[11px] text-[#707881] mt-0.5">
                Ubicación: {currentItem.ubicacion} • Clase {currentItem.clasificacion_abc}
              </span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#515f74]">Cantidad de unidades:</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
              className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-bold text-sm"
              required
            />
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#515f74]">Motivo / Orden de Trabajo:</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Mantenimiento preventivo orden #1204"
              className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30]"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f4fa]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-[#515f74] hover:bg-[#eff4ff]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold bg-[#006194] hover:bg-[#007bb9] text-white shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar Movimiento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
