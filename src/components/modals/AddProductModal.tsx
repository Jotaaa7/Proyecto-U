import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
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
  const [ubicacion, setUbicacion] = useState('Estante A-1');
  const [precioCosto, setPrecioCosto] = useState<number>(25000);
  const [precioVenta, setPrecioVenta] = useState<number>(38000);
  const [stockActual, setStockActual] = useState<number>(10);
  const [stockMinimo, setStockMinimo] = useState<number>(5);
  const [clasificacionAbc, setClasificacionAbc] = useState<AbcClassification>('A');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !nombre) {
      alert('Por favor completa el SKU y el nombre del repuesto');
      return;
    }

    inventoryService.addRepuesto({
      sku: sku.toUpperCase(),
      nombre,
      descripcion: `Repuesto nuevo para ${modelos}`,
      categoria,
      proveedor: 'Distribuidor Principal',
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
    onClose();
  };

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
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">Agregar Nuevo Repuesto al Inventario</h2>
            <span className="text-xs text-[#515f74]">Registro catalogado con ubicación y política ABC</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Código SKU:</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ej: LUB-MOT-5100"
                className="h-9 px-3 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-mono font-semibold"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Categoría:</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="h-9 px-3 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-semibold cursor-pointer"
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
              placeholder="Ej: Aceite Motul 5100 4T 15W50"
              className="h-9 px-3 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-semibold"
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
                className="h-9 px-3 rounded-lg bg-[#eff4ff] text-[#0b1c30]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Ubicación Física:</label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: Estante B-04 / Cajón 2"
                className="h-9 px-3 rounded-lg bg-[#eff4ff] text-[#0b1c30]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Precio Costo (COP):</label>
              <input
                type="number"
                value={precioCosto}
                onChange={(e) => setPrecioCosto(Number(e.target.value))}
                className="h-9 px-3 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-bold"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Precio Venta (COP):</label>
              <input
                type="number"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(Number(e.target.value))}
                className="h-9 px-3 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Stock Inicial:</label>
              <input
                type="number"
                value={stockActual}
                onChange={(e) => setStockActual(Number(e.target.value))}
                className="h-9 px-3 rounded-lg bg-[#eff4ff] text-[#0b1c30]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Stock Mínimo (ROP):</label>
              <input
                type="number"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(Number(e.target.value))}
                className="h-9 px-3 rounded-lg bg-[#eff4ff] text-[#0b1c30]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#515f74]">Clase ABC:</label>
              <select
                value={clasificacionAbc}
                onChange={(e) => setClasificacionAbc(e.target.value as AbcClassification)}
                className="h-9 px-2 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-bold cursor-pointer"
              >
                <option value="A">Clase A (Alta)</option>
                <option value="B">Clase B (Media)</option>
                <option value="C">Clase C (Baja)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0f4fa]">
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
              <span>Guardar Repuesto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
