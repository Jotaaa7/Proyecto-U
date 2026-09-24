import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  Search, 
  Filter, 
  Boxes, 
  MapPin, 
  MoreVertical, 
  Edit3, 
  History, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Repuesto, AbcClassification, StockStatus } from '../types/inventory';
import { inventoryService, formatCOP } from '../services/inventoryService';

interface InventoryViewProps {
  onOpenAddModal: () => void;
  onOpenMovementModal: (repuestoId?: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  onOpenAddModal, 
  onOpenMovementModal 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [abcFilter, setAbcFilter] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [currentPage, setCurrentPage] = useState(1);

  const repuestos = inventoryService.getRepuestos();

  // Filtrado
  const filtered = repuestos.filter((item) => {
    const matchesSearch = 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modelos_compatibles.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAbc = abcFilter === 'Todas' || item.clasificacion_abc === abcFilter;
    const matchesStatus = statusFilter === 'Todos' || item.estado === statusFilter;
    const matchesCategory = categoryFilter === 'Todas' || item.categoria === categoryFilter;

    return matchesSearch && matchesAbc && matchesStatus && matchesCategory;
  });

  const exportCSV = () => {
    const headers = ['SKU', 'Nombre', 'Categoria', 'Ubicacion', 'Stock Actual', 'Stock Minimo', 'Precio Costo', 'Precio Venta', 'Clasificacion ABC', 'Estado'];
    const rows = filtered.map(r => [
      r.sku,
      `"${r.nombre}"`,
      `"${r.categoria}"`,
      `"${r.ubicacion}"`,
      r.stock_actual,
      r.stock_minimo,
      r.precio_costo,
      r.precio_venta,
      r.clasificacion_abc,
      r.estado
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_motogestion_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn pb-12">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-[#515f74]">
            <span>Inventario general</span>
            <span>&gt;</span>
            <span className="font-semibold text-[#0b1c30]">Catálogo de repuestos</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
              Gestión de Inventario
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#006194] text-xs font-semibold border border-[#dce9ff]">
              348 repuestos registrados
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white hover:bg-[#eff4ff] text-[#515f74] hover:text-[#0b1c30] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#e5eeff] shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#707881]" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-[#006194] hover:bg-[#007bb9] active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm shadow-[#006194]/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar Repuesto</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Valorización y Pareto ABC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Valorización Stock */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#707881] text-xs font-bold uppercase tracking-wider">
            <span>Valorización Stock</span>
            <Boxes className="w-4 h-4 text-[#006194]" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#0b1c30] tracking-tight">
              $ 72.850.000
            </div>
            <span className="text-xs font-semibold text-[#515f74]">COP</span>
          </div>
          <div className="text-[11px] text-[#006947] font-semibold flex items-center gap-1 pt-1 border-t border-[#f0f4fa]">
            <ArrowUpRight className="w-3.5 h-3.5" /> +4.2% frente al mes anterior
          </div>
        </div>

        {/* Card 2: Clasificación A */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#0b1c30] uppercase tracking-wider">Clasificación A (Alta Rotación)</span>
            <span className="bg-[#ecfdf5] text-[#065f46] px-2 py-0.5 rounded-full text-[10px] font-bold">
              20% Catálogo
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#0b1c30]">68</span>
            <span className="text-xs text-[#515f74] font-medium">referencias</span>
          </div>
          <div className="text-[11px] text-[#515f74] pt-1 border-t border-[#f0f4fa]">
            Representa 70% del valor total movilizado
          </div>
        </div>

        {/* Card 3: Clasificación B */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#0b1c30] uppercase tracking-wider">Clasificación B (Media Rotación)</span>
            <span className="bg-[#fffbeb] text-[#92400e] px-2 py-0.5 rounded-full text-[10px] font-bold">
              30% Catálogo
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#0b1c30]">104</span>
            <span className="text-xs text-[#515f74] font-medium">referencias</span>
          </div>
          <div className="text-[11px] text-[#515f74] pt-1 border-t border-[#f0f4fa]">
            Representa 20% del valor total movilizado
          </div>
        </div>

        {/* Card 4: Clasificación C */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#0b1c30] uppercase tracking-wider">Clasificación C (Baja Rotación)</span>
            <span className="bg-[#eff4ff] text-[#006194] px-2 py-0.5 rounded-full text-[10px] font-bold">
              50% Catálogo
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#0b1c30]">176</span>
            <span className="text-xs text-[#515f74] font-medium">referencias</span>
          </div>
          <div className="text-[11px] text-[#515f74] pt-1 border-t border-[#f0f4fa]">
            10% del valor total en repuestos técnicos
          </div>
        </div>
      </div>

      {/* 3. Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#e5eeff] shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-96 flex items-center">
          <Search className="w-4 h-4 text-[#707881] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, referencia, SKU o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-16 bg-[#eff4ff] rounded-xl text-xs text-[#0b1c30] placeholder-[#707881] border border-transparent focus:border-[#93ccff] focus:bg-white focus:outline-none transition-all"
          />
          <kbd className="absolute right-2.5 text-[10px] font-bold text-[#515f74] bg-white px-1.5 py-0.5 rounded shadow-xs border border-[#e5eeff] pointer-events-none">
            Ctrl + K
          </kbd>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Clasificación ABC Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#515f74]">
            <span className="font-semibold text-[#707881]">Clasificación ABC:</span>
            <select
              value={abcFilter}
              onChange={(e) => setAbcFilter(e.target.value)}
              className="bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] font-semibold text-xs px-2.5 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-[#93ccff] outline-none cursor-pointer"
            >
              <option value="Todas">Todas</option>
              <option value="A">Clase A (Alta)</option>
              <option value="B">Clase B (Media)</option>
              <option value="C">Clase C (Baja)</option>
            </select>
          </div>

          {/* Estado Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#515f74]">
            <span className="font-semibold text-[#707881]">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] font-semibold text-xs px-2.5 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-[#93ccff] outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="EN_STOCK">En stock</option>
              <option value="BAJO_STOCK">Bajo stock</option>
              <option value="AGOTADO">Agotado</option>
              <option value="PAUSADO">Pausado</option>
            </select>
          </div>

          {/* Categoría Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#515f74]">
            <span className="font-semibold text-[#707881]">Categoría:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] font-semibold text-xs px-2.5 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-[#93ccff] outline-none cursor-pointer"
            >
              <option value="Todas">Todas</option>
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
      </div>

      {/* 4. Repuestos Table */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#eff4ff]/70 text-[#515f74] uppercase text-[10px] font-bold tracking-wider border-b border-[#e5eeff]">
              <tr>
                <th className="py-3 px-4">Repuesto & Referencia</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4 text-center">Stock Actual</th>
                <th className="py-3 px-4 text-right">Precio Venta</th>
                <th className="py-3 px-4 text-center">Clasificación ABC</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4fa]">
              {filtered.map((r) => {
                const isOutOfStock = r.stock_actual === 0;
                const isLowStock = r.stock_actual > 0 && r.stock_actual <= r.stock_minimo;

                return (
                  <tr key={r.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    {/* Name & Reference */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0b1c30] text-xs">
                          {r.nombre}
                        </span>
                        <span className="text-[11px] text-[#515f74] mt-0.5">
                          SKU: {r.sku} • {r.modelos_compatibles}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-[11px] font-semibold border border-[#dce9ff]/60">
                        <MapPin className="w-3 h-3 text-[#006194]" />
                        {r.ubicacion}
                      </span>
                    </td>

                    {/* Stock Actual vs Minimum */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className={`font-bold text-sm ${
                          isOutOfStock ? 'text-[#ba1a1a]' : (isLowStock ? 'text-[#f59e0b]' : 'text-[#0b1c30]')
                        }`}>
                          {r.stock_actual}
                        </span>
                        <span className="text-[10px] text-[#707881]">
                          Mínimo: {r.stock_minimo}
                        </span>
                      </div>
                    </td>

                    {/* Sale Price */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-xs text-[#0b1c30]">
                          $ {r.precio_venta.toLocaleString('es-CO')}
                        </span>
                        <span className="text-[10px] text-[#707881]">COP</span>
                      </div>
                    </td>

                    {/* ABC Classification Pill */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {r.clasificacion_abc === 'A' && (
                        <span className="inline-flex items-center gap-1 bg-[#ecfdf5] text-[#065f46] px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-[#a7f3d0]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                          A • Alta Rotación
                        </span>
                      )}
                      {r.clasificacion_abc === 'B' && (
                        <span className="inline-flex items-center gap-1 bg-[#fffbeb] text-[#92400e] px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-[#fde68a]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                          B • Media Rotación
                        </span>
                      )}
                      {r.clasificacion_abc === 'C' && (
                        <span className="inline-flex items-center gap-1 bg-[#eff4ff] text-[#006194] px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-[#bfdbfe]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006194]" />
                          C • Baja Rotación
                        </span>
                      )}
                    </td>

                    {/* Stock Status Pill */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {r.estado === 'EN_STOCK' && (
                        <span className="inline-flex items-center gap-1 text-[#006947] font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006947]" />
                          En stock
                        </span>
                      )}
                      {r.estado === 'BAJO_STOCK' && (
                        <span className="inline-flex items-center gap-1 text-[#f59e0b] font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                          Bajo stock
                        </span>
                      )}
                      {r.estado === 'AGOTADO' && (
                        <span className="inline-flex items-center gap-1 text-[#ba1a1a] font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                          Agotado
                        </span>
                      )}
                      {r.estado === 'PAUSADO' && (
                        <span className="inline-flex items-center gap-1 text-[#515f74] font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#707881]" />
                          Pausado
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenMovementModal(r.id)}
                          title="Registrar Movimiento"
                          className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#515f74] hover:text-[#006194] transition-colors"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => alert(`Editando repuesto: ${r.nombre} (SKU: ${r.sku})`)}
                          title="Editar Ficha"
                          className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#515f74] hover:text-[#006194] transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar */}
        <div className="p-4 bg-[#eff4ff]/40 border-t border-[#e5eeff] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#515f74]">
          <div className="flex items-center gap-2">
            <span>Mostrando 1 - {filtered.length} de 348 referencias registradas</span>
            <span className="hidden sm:inline">•</span>
            <div className="hidden sm:flex items-center gap-1">
              <span>Filas:</span>
              <select className="bg-white border border-[#e5eeff] rounded px-1.5 py-0.5 text-xs text-[#0b1c30] outline-none">
                <option>10 por página</option>
                <option>25 por página</option>
                <option>50 por página</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#515f74] hover:bg-white transition-colors">
              Anterior
            </button>
            <button className="w-7 h-7 rounded-lg bg-[#006194] text-white font-bold text-xs flex items-center justify-center">
              1
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-white text-[#515f74] font-semibold text-xs flex items-center justify-center">
              2
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-white text-[#515f74] font-semibold text-xs flex items-center justify-center">
              3
            </button>
            <span className="px-1 text-[#707881]">...</span>
            <button className="w-7 h-7 rounded-lg hover:bg-white text-[#515f74] font-semibold text-xs flex items-center justify-center">
              35
            </button>
            <button className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#006194] hover:bg-white transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
