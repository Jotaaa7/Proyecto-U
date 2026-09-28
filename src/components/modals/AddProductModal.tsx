import React, { useState } from 'react';
import { X, Plus, Check, AlertCircle, Sparkles } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { AbcClassification } from '../../types/inventory';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [sku, setSku] = useState('');
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Aceites y Lubricantes');
  const [modelos, setModelos] = useState('Universal / Multimarca');
  const [proveedor, setProveedor] = useState('Distribuidora MotoLube SAS');
  const [ubicacion, setUbicacion] = useState('Estante A-1');
  const [precioCosto, setPrecioCosto] = useState<number>(25000);
  const [precioVenta, setPrecioVenta] = useState<number>(38000);
  const [stockActual, setStockActual] = useState<number>(10);
  const [stockMinimo, setStockMinimo] = useState<number>(5);
  const [clasificacionAbc, setClasificacionAbc] = useState<AbcClassification>('A');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCostoChange = (cost: number) => {
    setPrecioCosto(cost);
    // Margen sugerido del 40%
    setPrecioVenta(Math.round(cost * 1.4 / 1000) * 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!sku.trim() || !nombre.trim()) {
      setFormError('Por favor completa el SKU y el nombre del repuesto.');
      return;
    }

    inventoryService.addRepuesto({
      sku: sku.trim().toUpperCase(),
      nombre: nombre.trim(),
      descripcion: `Repuesto nuevo para ${modelos}`,
      categoria,
      proveedor,
      modelos_compatibles: modelos,
      ubicacion,
      precio_costo: precioCosto,
      precio_venta: precioVenta,
      stock_actual: stockActual,
      stock_minimo: stockMinimo,
      clasificacion_abc: clasificacionAbc,
      demanda_estimada: stockMinimo * 2
    });

    onSuccess(`Repuesto "${nombre}" añadido con éxito al catálogo.`);
    
    // Reset form
    setSku('');
    setNombre('');
    setModelos('Universal / Multimarca');
    setPrecioCosto(25000);
    setPrecioVenta(38000);
    setStockActual(10);
    setStockMinimo(5);
    setFormError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-[#e5eeff] relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#707881] hover:text-[#0b1c30] p-1.5 rounded-lg hover:bg-[#eff4ff] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#006194] shadow-xs">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">Agregar Nuevo Repuesto al Inventario</h2>
            <span className="text-xs text-[#515f74]">Registro catalogado con ubicación, política ABC y reorden</span>
          </div>
        </div>

        {formError && (
          <div className="p-3 mb-4 rounded-xl bg-[#fef2f2] text-[#991b1b] text-xs flex items-center gap-2 border border-[#fecaca] animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Código SKU:</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ej: LUB-MOT-5100"
                className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-mono font-semibold border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Categoría:</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-semibold border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none cursor-pointer"
              >
                <option value="Aceites y Lubricantes">Aceites y Lubricantes</option>
                <option value="Sistema de Frenos">Sistema de Frenos</option>
                <option value="Transmisión y Arrastre">Transmisión y Arrastre</option>
                <option value="Sistema Eléctrico">Sistema Eléctrico</option>
                <option value="Embrague">Embrague</option>
                <option value="Iluminación">Iluminación</option>
                <option value="Suspensión">Suspensión</option>
                <option value="Accesorios">Accesorios</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#515f74]">Nombre del Repuesto:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Aceite Motul 5100 4T 15W50 Semisintético"
              className="h-10 px-3.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-semibold border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Modelos Compatibles:</label>
              <input
                type="text"
                value={modelos}
                onChange={(e) => setModelos(e.target.value)}
                placeholder="Ej: Pulsar NS200 / FZ25"
                className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Proveedor Habitual:</label>
              <input
                type="text"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Ej: Frenos y Partes de Colombia"
                className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Ubicación Física:</label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: Estante A-2, Cajón 4"
                className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Clasificación ABC:</label>
              <select
                value={clasificacionAbc}
                onChange={(e) => setClasificacionAbc(e.target.value as AbcClassification)}
                className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-bold border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none cursor-pointer"
              >
                <option value="A">Clase A (Alta Rotación • 70% valor)</option>
                <option value="B">Clase B (Media Rotación • 20% valor)</option>
                <option value="C">Clase C (Baja Rotación • 10% valor)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Precio de Costo (COP):</label>
              <input
                type="number"
                min="0"
                step="500"
                value={precioCosto}
                onChange={(e) => handleCostoChange(Math.max(0, Number(e.target.value)))}
                className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-bold border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Precio de Venta (COP):</label>
              <input
                type="number"
                min="0"
                step="500"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(Math.max(0, Number(e.target.value)))}
                className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-bold border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Stock Inicial en Bodega:</label>
              <input
                type="number"
                min="0"
                value={stockActual}
                onChange={(e) => setStockActual(Math.max(0, Number(e.target.value)))}
                className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-bold border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Stock Mínimo (Punto Reorden):</label>
              <input
                type="number"
                min="1"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(Math.max(1, Number(e.target.value)))}
                className="h-10 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-bold border border-[#dce9ff] focus:border-[#93ccff] focus:bg-white outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0f4fa] mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#515f74] hover:bg-[#eff4ff] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold bg-[#006194] hover:bg-[#007bb9] active:scale-95 text-white shadow-xs transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Guardar en Catálogo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
