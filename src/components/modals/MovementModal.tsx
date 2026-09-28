import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check, AlertCircle, Search, PackageCheck } from 'lucide-react';
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
  const [repuestos, setRepuestos] = useState(() => inventoryService.getRepuestos());
  const [repuestoId, setRepuestoId] = useState<number>(selectedRepuestoId || repuestos[0]?.id || 1);
  const [tipo, setTipo] = useState<'SALIDA' | 'ENTRADA'>('SALIDA');
  const [cantidad, setCantidad] = useState<number>(1);
  const [motivo, setMotivo] = useState<string>('Mantenimiento preventivo orden #1204');
  const [error, setError] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState('');

  // Sync state when modal opens or selectedRepuestoId changes
  useEffect(() => {
    if (isOpen) {
      const currentList = inventoryService.getRepuestos();
      setRepuestos(currentList);
      if (selectedRepuestoId) {
        setRepuestoId(selectedRepuestoId);
      } else if (currentList.length > 0 && !currentList.find(r => r.id === repuestoId)) {
        setRepuestoId(currentList[0].id);
      }
      setError(null);
    }
  }, [isOpen, selectedRepuestoId]);

  if (!isOpen) return null;

  const currentItem = repuestos.find(r => r.id === repuestoId) || repuestos[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentItem) {
      setError('Debes seleccionar un repuesto válido.');
      return;
    }

    const result = inventoryService.registerMovement(currentItem.id, tipo, cantidad, motivo);
    if (result.success) {
      onSuccess(result.message);
      onClose();
    } else {
      setError(result.message);
    }
  };

  const filteredRepuestos = repuestos.filter(r => 
    r.nombre.toLowerCase().includes(productFilter.toLowerCase()) ||
    r.sku.toLowerCase().includes(productFilter.toLowerCase())
  );

  const projectedStock = currentItem 
    ? (tipo === 'ENTRADA' ? currentItem.stock_actual + cantidad : currentItem.stock_actual - cantidad)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-[#e5eeff] relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#707881] hover:text-[#0b1c30] p-1.5 rounded-lg hover:bg-[#eff4ff] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#006194] shrink-0 shadow-xs">
            {tipo === 'ENTRADA' ? <ArrowDownRight className="w-5 h-5 text-[#00855b]" /> : <ArrowUpRight className="w-5 h-5 text-[#ba1a1a]" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">Registrar Movimiento de Inventario</h2>
            <span className="text-xs text-[#515f74]">Entrada por compras o salida por orden de trabajo</span>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#fef2f2] text-[#991b1b] text-xs flex items-center gap-2 border border-[#fecaca] animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Movement Type Toggle */}
          <div className="flex p-1 bg-[#eff4ff] rounded-xl gap-1 border border-[#dce9ff]/60">
            <button
              type="button"
              onClick={() => setTipo('SALIDA')}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                tipo === 'SALIDA' ? 'bg-[#ba1a1a] text-white shadow-xs' : 'text-[#515f74] hover:text-[#0b1c30]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Salida de Taller (Gasto / Venta)</span>
            </button>
            <button
              type="button"
              onClick={() => setTipo('ENTRADA')}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                tipo === 'ENTRADA' ? 'bg-[#00855b] text-white shadow-xs' : 'text-[#515f74] hover:text-[#0b1c30]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Entrada (Compra / Recepción)</span>
            </button>
          </div>

          {/* Product Select with Quick Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-[#515f74]">Repuesto a Afectar:</label>
            <div className="relative">
              <select
                value={currentItem?.id || repuestoId}
                onChange={(e) => setRepuestoId(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-semibold text-xs border border-[#dce9ff] outline-none cursor-pointer focus:bg-white focus:border-[#93ccff]"
              >
                {repuestos.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} (SKU: {r.sku} • Stock actual: {r.stock_actual} unid)
                  </option>
                ))}
              </select>
            </div>

            {/* Current Item Status Summary Card */}
            {currentItem && (
              <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] flex items-center justify-between mt-1">
                <div className="flex flex-col">
                  <span className="font-bold text-[#0b1c30] text-xs">{currentItem.nombre}</span>
                  <span className="text-[11px] text-[#515f74]">
                    Ubicación: <strong className="text-[#0b1c30]">{currentItem.ubicacion}</strong> • Clase <strong className="text-[#006194]">{currentItem.clasificacion_abc}</strong>
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-[#707881]">Stock actual:</span>
                  <span className="text-sm font-black text-[#0b1c30]">{currentItem.stock_actual} unid</span>
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Quick Presets */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#515f74]">Cantidad de unidades:</label>
              <div className="flex items-center gap-1">
                {[1, 2, 5, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCantidad(n)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                      cantidad === n ? 'bg-[#006194] text-white' : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff]'
                    }`}
                  >
                    +{n}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
              className="h-11 px-3.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-black text-base border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none"
              required
            />
          </div>

          {/* Stock Resulting Preview */}
          {currentItem && (
            <div className="p-2.5 rounded-xl bg-[#eff4ff]/60 border border-[#dce9ff] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#006194]" />
                <span className="text-[#515f74]">Stock resultante tras movimiento:</span>
              </div>
              <span className={`font-bold ${
                projectedStock < 0 
                  ? 'text-[#ba1a1a]' 
                  : (projectedStock <= currentItem.stock_minimo ? 'text-[#f59e0b]' : 'text-[#00855b]')
              }`}>
                {projectedStock} unidades {projectedStock < 0 && '(¡Insuficiente!)'}
              </span>
            </div>
          )}

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-[#515f74]">Motivo / Orden de Trabajo / Factura:</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Mantenimiento preventivo orden #1204 / Factura Proveedor 402"
              className="h-10 px-3.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0f4fa]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#515f74] hover:bg-[#eff4ff] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={tipo === 'SALIDA' && currentItem && currentItem.stock_actual < cantidad}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-white shadow-xs transition-all ${
                tipo === 'ENTRADA' ? 'bg-[#00855b] hover:bg-[#00704d]' : 'bg-[#006194] hover:bg-[#007bb9]'
              } ${tipo === 'SALIDA' && currentItem && currentItem.stock_actual < cantidad ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Movimiento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
