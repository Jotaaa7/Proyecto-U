import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Download, 
  Search, 
  Boxes, 
  MapPin, 
  Edit3, 
  History, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpRight,
  PlusCircle,
  MinusCircle,
  RotateCcw
} from 'lucide-react';
import { Repuesto } from '../types/inventory';
import { inventoryService, formatCOP } from '../services/inventoryService';

interface InventoryViewProps {
  onOpenAddModal: () => void;
  onOpenMovementModal: (repuestoId?: number) => void;
  onEditRepuesto: (repuesto: Repuesto) => void;
  initialSearch?: string;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  onOpenAddModal, 
  onOpenMovementModal,
  onEditRepuesto,
  initialSearch = ''
}) => {
  const [repuestos, setRepuestos] = useState<Repuesto[]>(() => inventoryService.getRepuestos());
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [abcFilter, setAbcFilter] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Sync with initialSearch if header updates it
  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  // Subscribe to reactive inventory updates
  useEffect(() => {
    const unsubscribe = inventoryService.subscribe(() => {
      setRepuestos(inventoryService.getRepuestos());
    });
    return unsubscribe;
  }, []);

  const triggerFeedback = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleQuickAdd = (id: number) => {
    const res = inventoryService.registerMovement(id, 'ENTRADA', 1, 'Entrada rápida de mostrador (+1)');
    if (res.success) triggerFeedback(res.message);
  };

  const handleQuickSubtract = (id: number) => {
    const res = inventoryService.registerMovement(id, 'SALIDA', 1, 'Salida rápida de servicio (-1)');
    if (res.success) triggerFeedback(res.message);
  };

  // Dynamic calculations from actual live repuestos state
  const totalValuationCOP = inventoryService.getValuationCOP();
  const abcCounts = inventoryService.getAbcCounts();
  const totalCount = repuestos.length;

  const pctA = totalCount > 0 ? Math.round((abcCounts.A / totalCount) * 100) : 0;
  const pctB = totalCount > 0 ? Math.round((abcCounts.B / totalCount) * 100) : 0;
  const pctC = totalCount > 0 ? Math.round((abcCounts.C / totalCount) * 100) : 0;

  // Filtering
  const filtered = repuestos.filter((item) => {
    const matchesSearch = 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modelos_compatibles.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAbc = abcFilter === 'Todas' || item.clasificacion_abc === abcFilter;
    const matchesStatus = statusFilter === 'Todos' || item.estado === statusFilter;
    const matchesCategory = categoryFilter === 'Todas' || item.categoria === categoryFilter;

    return matchesSearch && matchesAbc && matchesStatus && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = filtered.slice((validCurrentPage - 1) * pageSize, validCurrentPage * pageSize);

  const exportCSV = () => {
    const headers = ['SKU', 'Nombre', 'Categoria', 'Proveedor', 'Ubicacion', 'Stock Actual', 'Stock Minimo', 'Precio Costo (COP)', 'Precio Venta (COP)', 'Clasificacion ABC', 'Estado'];
    const rows = filtered.map(r => [
      r.sku,
      `"${r.nombre.replace(/"/g, '""')}"`,
      `"${r.categoria}"`,
      `"${r.proveedor}"`,
      `"${r.ubicacion}"`,
      r.stock_actual,
      r.stock_minimo,
      r.precio_costo,
      r.precio_venta,
      r.clasificacion_abc,
      r.estado
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_motogestion_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerFeedback('Catálogo exportado exitosamente en formato CSV.');
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer el catálogo a los datos semilla iniciales? Se perderán las modificaciones de prueba.')) {
      inventoryService.resetToDefaults();
      triggerFeedback('Catálogo restablecido a valores iniciales.');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn pb-12">
      {/* Mini notification toast */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#0b1c30] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-[#3f4850] flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#4edea3]" />
          <span>{feedbackToast}</span>
        </div>
      )}

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
              {totalCount} repuestos registrados
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetData}
            title="Restablecer a datos de fábrica"
            className="flex items-center gap-1.5 bg-white hover:bg-[#eff4ff] text-[#707881] hover:text-[#0b1c30] px-3 py-2 rounded-xl text-xs font-semibold border border-[#e5eeff] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
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

      {/* 2. Top Summary KPI Cards (Valorización Dinámica y Pareto ABC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Valorización Stock */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#707881] text-xs font-bold uppercase tracking-wider">
            <span>Valorización Stock Físico</span>
            <Boxes className="w-4 h-4 text-[#006194]" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#0b1c30] tracking-tight">
              {formatCOP(totalValuationCOP)}
            </div>
            <span className="text-[11px] text-[#515f74] font-medium">Costo total acumulado en bodega</span>
          </div>
          <div className="text-[11px] text-[#006947] font-semibold flex items-center gap-1 pt-1 border-t border-[#f0f4fa]">
            <ArrowUpRight className="w-3.5 h-3.5" /> Calculado en tiempo real
          </div>
        </div>

        {/* Card 2: Clasificación A */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#0b1c30] uppercase tracking-wider">Clase A (Alta Rotación)</span>
            <span className="bg-[#ecfdf5] text-[#065f46] px-2 py-0.5 rounded-full text-[10px] font-bold">
              {pctA}% Catálogo
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#0b1c30]">{abcCounts.A}</span>
            <span className="text-xs text-[#515f74] font-medium">referencias</span>
          </div>
          <div className="text-[11px] text-[#515f74] pt-1 border-t border-[#f0f4fa]">
            Concentra ~70% de las salidas operativas
          </div>
        </div>

        {/* Card 3: Clasificación B */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#0b1c30] uppercase tracking-wider">Clase B (Media Rotación)</span>
            <span className="bg-[#fffbeb] text-[#92400e] px-2 py-0.5 rounded-full text-[10px] font-bold">
              {pctB}% Catálogo
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#0b1c30]">{abcCounts.B}</span>
            <span className="text-xs text-[#515f74] font-medium">referencias</span>
          </div>
          <div className="text-[11px] text-[#515f74] pt-1 border-t border-[#f0f4fa]">
            Representa ~20% del valor movilizado
          </div>
        </div>

        {/* Card 4: Clasificación C */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#0b1c30] uppercase tracking-wider">Clase C (Baja Rotación)</span>
            <span className="bg-[#eff4ff] text-[#006194] px-2 py-0.5 rounded-full text-[10px] font-bold">
              {pctC}% Catálogo
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#0b1c30]">{abcCounts.C}</span>
            <span className="text-xs text-[#515f74] font-medium">referencias</span>
          </div>
          <div className="text-[11px] text-[#515f74] pt-1 border-t border-[#f0f4fa]">
            Piezas técnicas y reposición ocasional
          </div>
        </div>
      </div>

      {/* 3. Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#e5eeff] shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-96 flex items-center">
          <Search className="w-4 h-4 text-[#707881] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU, modelo o categoría..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-10 pr-16 bg-[#eff4ff] rounded-xl text-xs text-[#0b1c30] placeholder-[#707881] border border-transparent focus:border-[#93ccff] focus:bg-white focus:outline-none transition-all"
          />
          <kbd className="absolute right-2.5 text-[10px] font-bold text-[#515f74] bg-white px-1.5 py-0.5 rounded shadow-xs border border-[#e5eeff] pointer-events-none">
            Ctrl + K
          </kbd>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Clasificación ABC Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#515f74]">
            <span className="font-semibold text-[#707881]">Clase ABC:</span>
            <select
              value={abcFilter}
              onChange={(e) => {
                setAbcFilter(e.target.value);
                setCurrentPage(1);
              }}
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
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
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
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
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
                <th className="py-3 px-4 text-center">Ajuste Rápido</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4fa]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#707881]">
                    No se encontraron repuestos que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((r) => {
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
                          <span className={`font-black text-sm ${
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

                      {/* Quick Adjust Buttons (+1 / -1) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg">
                          <button
                            onClick={() => handleQuickSubtract(r.id)}
                            disabled={r.stock_actual <= 0}
                            title="Salida rápida de 1 unidad"
                            className="p-1 rounded text-[#ba1a1a] hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <span className="text-[10px] font-bold text-[#515f74] px-1">1 u.</span>
                          <button
                            onClick={() => handleQuickAdd(r.id)}
                            title="Entrada rápida de 1 unidad"
                            className="p-1 rounded text-[#00855b] hover:bg-white transition-colors"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenMovementModal(r.id)}
                            title="Registrar Movimiento Detallado"
                            className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#515f74] hover:text-[#006194] transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditRepuesto(r)}
                            title="Editar Ficha"
                            className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#515f74] hover:text-[#006194] transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar */}
        <div className="p-4 bg-[#eff4ff]/40 border-t border-[#e5eeff] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#515f74]">
          <div className="flex items-center gap-2">
            <span>
              Mostrando {filtered.length === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1} - {Math.min(filtered.length, validCurrentPage * pageSize)} de {filtered.length} referencias
            </span>
            <span className="hidden sm:inline">•</span>
            <div className="hidden sm:flex items-center gap-1">
              <span>Por página:</span>
              <select 
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#e5eeff] rounded px-1.5 py-0.5 text-xs text-[#0b1c30] outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button 
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                validCurrentPage <= 1 ? 'opacity-40 cursor-not-allowed text-[#707881]' : 'text-[#515f74] hover:bg-white'
              }`}
            >
              Anterior
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                  validCurrentPage === pg
                    ? 'bg-[#006194] text-white'
                    : 'hover:bg-white text-[#515f74]'
                }`}
              >
                {pg}
              </button>
            ))}

            <button 
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                validCurrentPage >= totalPages ? 'opacity-40 cursor-not-allowed text-[#707881]' : 'text-[#006194] hover:bg-white'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
