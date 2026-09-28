import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  PiggyBank, 
  CheckCircle, 
  PauseCircle, 
  ShoppingCart, 
  Sparkles, 
  Info, 
  BookmarkCheck, 
  Sliders, 
  Check, 
  Calendar,
  Filter,
  Truck,
  Download,
  Search,
  X
} from 'lucide-react';
import { inventoryService, formatCOP } from '../services/inventoryService';
import { SuggestedPurchaseItem } from '../types/inventory';

interface PurchasesBudgetViewProps {
  onOpenApproveModal: (totalCOP: number, items: SuggestedPurchaseItem[]) => void;
}

export const PurchasesBudgetView: React.FC<PurchasesBudgetViewProps> = ({ onOpenApproveModal }) => {
  const [purchases, setPurchases] = useState<SuggestedPurchaseItem[]>(() => inventoryService.getSuggestedPurchases());
  const [opportunities, setOpportunities] = useState(() => inventoryService.getOpportunities());
  const [discontinueAlerts, setDiscontinueAlerts] = useState(() => inventoryService.getDiscontinueAlerts());
  const [budgetLimit, setBudgetLimit] = useState<number>(() => inventoryService.getCurrentBudgetCOP());
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudgetInput, setTempBudgetInput] = useState<number>(() => inventoryService.getCurrentBudgetCOP());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [rotationFilter, setRotationFilter] = useState<string>('Todas');
  const [supplierFilter, setSupplierFilter] = useState<string>('Todos');
  const [searchTable, setSearchTable] = useState<string>('');

  // Subscribe to changes
  useEffect(() => {
    const unsubscribe = inventoryService.subscribe(() => {
      setPurchases(inventoryService.getSuggestedPurchases());
      setOpportunities(inventoryService.getOpportunities());
      setDiscontinueAlerts(inventoryService.getDiscontinueAlerts());
      setBudgetLimit(inventoryService.getCurrentBudgetCOP());
    });
    return unsubscribe;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleItem = (id: number) => {
    const item = purchases.find(p => p.id === id);
    if (item) {
      inventoryService.togglePurchaseItem(id, !item.aprobado);
    }
  };

  const handleToggleAll = (checked: boolean) => {
    inventoryService.setAllPurchasesApproved(checked);
  };

  const handleAddOpportunity = (oppId: number) => {
    const success = inventoryService.addOpportunityToOrder(oppId);
    if (success) {
      showToast('Oportunidad de nuevo producto agregada al plan de compras sugerido.');
    }
  };

  const handlePauseSku = (repuestoId: number) => {
    const success = inventoryService.pauseSku(repuestoId);
    if (success) {
      showToast('SKU pausado preventivamente. No se generarán órdenes de compra automáticas.');
    }
  };

  // Extract unique suppliers for filter
  const suppliers = Array.from(new Set(purchases.map(p => p.proveedor)));

  // Filtered purchases
  const filteredPurchases = purchases.filter(p => {
    const matchesRotation = 
      rotationFilter === 'Todas' ||
      (rotationFilter === 'Clase A' && p.clasificacion.includes('Clase A')) ||
      (rotationFilter === 'Clase B' && p.clasificacion.includes('Clase B'));

    const matchesSupplier = 
      supplierFilter === 'Todos' || p.proveedor === supplierFilter;

    const matchesSearch = 
      p.nombre.toLowerCase().includes(searchTable.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTable.toLowerCase()) ||
      p.proveedor.toLowerCase().includes(searchTable.toLowerCase());

    return matchesRotation && matchesSupplier && matchesSearch;
  });

  const selectedItems = purchases.filter(p => p.aprobado);
  const totalCostoSugerido = selectedItems.reduce((acc, curr) => acc + curr.costo_total, 0);
  const margenSeguridad = Math.max(0, budgetLimit - totalCostoSugerido);
  const consumoPct = budgetLimit > 0 ? Math.min(100, Math.round((totalCostoSugerido / budgetLimit) * 1000) / 10) : 0;
  const allSelected = purchases.length > 0 && selectedItems.length === purchases.length;

  const exportPurchasesCSV = () => {
    const headers = ['SKU', 'Repuesto', 'Detalle', 'Clasificacion', 'Stock Actual', 'Stock Minimo', 'Cantidad Sugerida', 'Unidad', 'Proveedor', 'Tiempo Entrega', 'Costo Unitario (COP)', 'Costo Total (COP)', 'Aprobado'];
    const rows = selectedItems.map(p => [
      p.sku,
      `"${p.nombre.replace(/"/g, '""')}"`,
      `"${p.detalle}"`,
      p.clasificacion,
      p.stock_actual,
      p.stock_minimo,
      p.cantidad_sugerida,
      p.unidad,
      `"${p.proveedor}"`,
      `"${p.tiempo_entrega}"`,
      p.costo_unitario,
      p.costo_total,
      p.aprobado ? 'SI' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `Orden_Compras_MotoGestion_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Plan de compras exportado a CSV para cotizar con proveedores.');
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn pb-32">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0b1c30] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-[#3f4850] flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[#4edea3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-[#515f74]">
            <Wallet className="w-3.5 h-3.5 text-[#006194]" />
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#707881]">
              Control Operativo y Financiero
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
            Gestión Presupuestal y Órdenes de Compra
          </h1>
          <p className="text-sm text-[#515f74] max-w-3xl">
            Vincula tu presupuesto asignado con compras inteligentes calculadas por la rotación del taller para no descapitalizarte.
          </p>
        </div>

        {/* Cycle Selector & Action */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
          <div className="flex items-center gap-2 bg-[#eff4ff] px-3.5 py-2 rounded-xl text-xs font-bold text-[#0b1c30] border border-[#dce9ff]/60 shadow-xs">
            <Calendar className="w-4 h-4 text-[#006194]" />
            <span>Presupuesto Mensual Activo</span>
          </div>
          <button
            onClick={() => {
              setTempBudgetInput(budgetLimit);
              setIsEditingBudget(true);
            }}
            className="flex items-center gap-1.5 bg-white hover:bg-[#eff4ff] text-[#515f74] hover:text-[#0b1c30] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#e5eeff] shadow-xs transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Ajustar límite</span>
          </button>
        </div>
      </header>

      {/* 2. Top Financial Summary Cards (Bento Metric Layout) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Presupuesto Disponible */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#707881] text-xs font-bold uppercase tracking-wider">
            <span>Presupuesto Disponible</span>
            <Wallet className="w-4 h-4 text-[#006194]" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#0b1c30] tracking-tight">
              {formatCOP(budgetLimit)}
            </div>
            <p className="text-[11px] text-[#515f74] mt-1">Asignado para reposición de este mes</p>
          </div>
        </div>

        {/* Card 2: Costo Total Sugerido */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#707881] uppercase tracking-wider">Costo Total Sugerido</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              totalCostoSugerido <= budgetLimit ? 'bg-[#ecfdf5] text-[#065f46]' : 'bg-[#fef2f2] text-[#991b1b]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${totalCostoSugerido <= budgetLimit ? 'bg-[#10b981]' : 'bg-[#ba1a1a]'}`} />
              {totalCostoSugerido <= budgetLimit ? 'Dentro de margen' : 'Excede presupuesto'}
            </span>
          </div>
          <div className="my-2">
            <div className={`text-2xl font-black tracking-tight ${totalCostoSugerido <= budgetLimit ? 'text-[#006194]' : 'text-[#ba1a1a]'}`}>
              {formatCOP(totalCostoSugerido)}
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-[#515f74]">Consumo asignado</span>
                <span className="font-bold text-[#006194]">{consumoPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#eff4ff] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${totalCostoSugerido <= budgetLimit ? 'bg-[#006194]' : 'bg-[#ba1a1a]'}`}
                  style={{ width: `${Math.min(100, consumoPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Margen de Seguridad */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#707881] text-xs font-bold uppercase tracking-wider">
            <span>Margen de Seguridad</span>
            <ShieldCheck className="w-4 h-4 text-[#006947]" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#006947] tracking-tight">
              {formatCOP(margenSeguridad)}
            </div>
            <p className="text-[11px] text-[#515f74] mt-1">Fondo para emergencias o pedidos urgentes</p>
          </div>
        </div>

        {/* Card 4: Ahorro Estimado por Lote */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#707881] text-xs font-bold uppercase tracking-wider">
            <span>Ahorro Estimado por Lote</span>
            <PiggyBank className="w-4 h-4 text-[#006194]" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#006947] tracking-tight">
              $ 240.000 COP
            </div>
            <p className="text-[11px] text-[#515f74] mt-1">Descuentos negociados por volumen y prontitud</p>
          </div>
        </div>
      </section>

      {/* 3. Automated Purchase List Section */}
      <section className="bg-white rounded-2xl border border-[#e5eeff] shadow-xs overflow-hidden">
        {/* Table Header / Selection Controls */}
        <div className="p-4 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#e5eeff]">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => handleToggleAll(e.target.checked)}
                className="w-4 h-4 rounded text-[#006194] accent-[#006194] cursor-pointer"
              />
              <span className="text-xs font-bold text-[#0b1c30]">
                Seleccionar todos ({selectedItems.length} de {purchases.length} repuestos marcados)
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap text-xs text-[#515f74]">
            {/* Search */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#707881] absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar sugerencia..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="h-8 pl-8 pr-3 rounded-lg bg-[#eff4ff] text-xs text-[#0b1c30] placeholder-[#707881] outline-none border border-transparent focus:border-[#93ccff]"
              />
            </div>

            {/* Rotación Interactive Select */}
            <div className="flex items-center gap-1.5 bg-[#eff4ff] px-2.5 py-1 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-[#006194]" />
              <span className="font-semibold text-[#707881]">Rotación:</span>
              <select
                value={rotationFilter}
                onChange={(e) => setRotationFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#0b1c30] outline-none cursor-pointer"
              >
                <option value="Todas">Todas</option>
                <option value="Clase A">Clase A (Alta)</option>
                <option value="Clase B">Clase B (Media)</option>
              </select>
            </div>

            {/* Proveedor Interactive Select */}
            <div className="flex items-center gap-1.5 bg-[#eff4ff] px-2.5 py-1 rounded-lg">
              <Truck className="w-3.5 h-3.5 text-[#006194]" />
              <span className="font-semibold text-[#707881]">Proveedor:</span>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#0b1c30] outline-none cursor-pointer max-w-[150px] truncate"
              >
                <option value="Todos">Todos</option>
                {suppliers.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              onClick={exportPurchasesCSV}
              className="flex items-center gap-1.5 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#006194] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#dce9ff] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#eff4ff]/70 text-[#515f74] text-[10px] font-bold uppercase tracking-wider border-b border-[#e5eeff]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Sel.</th>
                <th className="py-3 px-4">Repuesto y Referencia</th>
                <th className="py-3 px-4">Rotación / Clase</th>
                <th className="py-3 px-4">Stock vs Mínimo</th>
                <th className="py-3 px-4">Cantidad Sugerida</th>
                <th className="py-3 px-4">Proveedor Habitual</th>
                <th className="py-3 px-4 text-right">Costo Estimado</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4fa]">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#707881]">
                    No hay sugerencias de compra para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-[#eff4ff]/50 transition-colors ${
                      !item.aprobado ? 'opacity-60 bg-[#f8f9ff]' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={item.aprobado}
                        onChange={() => handleToggleItem(item.id)}
                        className="w-4 h-4 rounded text-[#006194] accent-[#006194] cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#0b1c30]">
                          {item.nombre}
                        </span>
                        <span className="text-[11px] text-[#515f74] mt-0.5">
                          {item.detalle}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.clasificacion.includes('Clase A') ? (
                        <span className="inline-flex items-center gap-1 bg-[#ecfdf5] text-[#065f46] px-2 py-0.5 rounded-full text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                          Clase A - Alta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-[#fffbeb] text-[#92400e] px-2 py-0.5 rounded-full text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                          Clase B - Media
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-[#ba1a1a] font-bold">{item.stock_actual} {item.unidad.slice(0, 3)}.</span>
                        <span className="text-[#707881]">/ Mín {item.stock_minimo} {item.unidad.slice(0, 3)}.</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-[#0b1c30] bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#dce9ff]/60">
                        {item.cantidad_sugerida} {item.unidad}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-[#0b1c30]">{item.proveedor}</span>
                        <span className="text-[10px] text-[#707881]">{item.tiempo_entrega}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-xs text-[#0b1c30]">
                          {formatCOP(item.costo_total)}
                        </span>
                        <span className="text-[10px] text-[#707881]">
                          ({formatCOP(item.costo_unitario)} / {item.unidad.slice(0, -1)})
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.aprobado ? (
                        <span className="inline-flex items-center gap-1 bg-[#eff4ff] text-[#006194] px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-[#bfdbfe]">
                          <CheckCircle className="w-3 h-3" />
                          Aprobado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-[#f1f5f9] text-[#64748b] px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          Descartado
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Subtotal Banner */}
        <div className="p-4 bg-[#eff4ff] flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e5eeff]">
          <div className="flex items-center gap-2 text-xs text-[#515f74]">
            <Sparkles className="w-4 h-4 text-[#006194]" />
            <span>Cálculo optimizado por algoritmo de consumo promedio semanal y lead-time de despacho.</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-[#515f74]">Subtotal Lista Sugerida:</span>
            <span className="text-lg font-black text-[#0b1c30]">
              {formatCOP(totalCostoSugerido)}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Strategic Market Intelligence Panel (2 Columns) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Oportunidades de Nuevos Productos */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#f0f4fa]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#006194]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0b1c30]">Oportunidades de Nuevos Productos</h2>
                <span className="text-[11px] text-[#707881]">Piezas de alta demanda para incorporar al taller</span>
              </div>
            </div>
            <span className="bg-[#ecfdf5] text-[#065f46] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {opportunities.filter(o => !o.agregado).length} Hallazgos
            </span>
          </div>

          <div className="space-y-3.5 flex-1">
            {opportunities.map((opp) => (
              <div 
                key={opp.id} 
                className="bg-[#eff4ff]/60 p-4 rounded-xl flex flex-col gap-2.5 border border-[#dce9ff]/60 hover:bg-[#eff4ff] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#0b1c30]">{opp.nombre}</span>
                      <span className="px-1.5 py-0.2 bg-[#ecfdf5] text-[#065f46] rounded text-[10px] font-bold">
                        {opp.demanda_tendencia}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#515f74] mt-1">
                      {opp.justificacion}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#dce9ff]/50">
                  <div className="flex items-baseline gap-1 text-xs">
                    <span className="text-[#707881]">Costo pack inicial:</span>
                    <span className="font-bold text-[#0b1c30]">{formatCOP(opp.costo_pack_inicial)}</span>
                  </div>

                  {opp.agregado ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006947]">
                      <Check className="w-3.5 h-3.5" /> Agregado al pedido
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddOpportunity(opp.id)}
                      className="flex items-center gap-1 bg-white hover:bg-[#006194] hover:text-white text-[#006194] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#dce9ff] shadow-xs transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Agregar al pedido (+ {formatCOP(opp.costo_pack_inicial)})</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Descontinuar o Pausar Repuestos */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#f0f4fa]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#fef2f2] flex items-center justify-center text-[#ba1a1a]">
                <PauseCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0b1c30]">Descontinuar o Pausar Repuestos</h2>
                <span className="text-[11px] text-[#707881]">Alertas preventivas de capital inmovilizado en taller</span>
              </div>
            </div>
            <span className="bg-[#fef2f2] text-[#991b1b] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {discontinueAlerts.filter(d => !d.pausado).length} En Alerta
            </span>
          </div>

          <div className="space-y-3.5 flex-1">
            {discontinueAlerts.map((item) => (
              <div
                key={item.repuesto_id}
                className="bg-[#eff4ff]/60 p-4 rounded-xl flex flex-col gap-2.5 border border-[#dce9ff]/60 hover:bg-[#eff4ff] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#0b1c30]">{item.nombre}</span>
                      <span className="px-1.5 py-0.2 bg-[#fef2f2] text-[#991b1b] rounded text-[10px] font-bold">
                        {item.motivo.split('.')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#515f74] mt-1">
                      Stock actual: {item.stock_inmovilizado} unidades inmovilizadas en {item.ubicacion} (
                      <strong className="text-[#ba1a1a]">{formatCOP(item.capital_congelado_cop)}</strong> congelados).
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 bg-white/70 px-2.5 py-1.5 rounded-lg text-xs">
                  <span className="text-[11px] text-[#92400e] flex items-center gap-1">
                    <Info className="w-3 h-3 shrink-0" />
                    <span>Sugerencia: {item.sugerencia_accion}</span>
                  </span>

                  {item.pausado ? (
                    <span className="text-[11px] font-bold text-[#515f74]">SKU Pausado</span>
                  ) : (
                    <button
                      onClick={() => handlePauseSku(item.repuesto_id)}
                      className="text-xs font-bold text-[#ba1a1a] hover:underline"
                    >
                      Pausar SKU
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Sticky Bottom Execution Bar (Properly anchored and responsive) */}
      <aside className="fixed bottom-4 left-4 lg:left-80 right-4 lg:right-8 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#cce5ff] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#006194] shrink-0">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-[#0b1c30]">
                {selectedItems.length} de {purchases.length} sugerencias seleccionadas
              </span>
              <span className="text-[#707881]">•</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[#515f74]">Total a ordenar:</span>
                <span className="text-base font-black text-[#006194]">
                  {formatCOP(totalCostoSugerido)}
                </span>
              </div>
            </div>
            <span className="text-xs text-[#515f74]">
              Te quedan <strong className="text-[#006947] font-bold">{formatCOP(margenSeguridad)}</strong> de tu presupuesto mensual disponible.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => showToast('Borrador del plan de compras guardado exitosamente.')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#0b1c30] bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors border border-[#dce9ff]/60"
          >
            Guardar Borrador
          </button>
          <button
            onClick={() => onOpenApproveModal(totalCostoSugerido, selectedItems)}
            className="flex items-center justify-center gap-1.5 bg-[#006194] hover:bg-[#007bb9] active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#006194]/25 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Aprobar Plan de Compras</span>
          </button>
        </div>
      </aside>

      {/* In-App Budget Limit Editor Modal */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-[#e5eeff] relative">
            <button
              onClick={() => setIsEditingBudget(false)}
              className="absolute right-4 top-4 text-[#707881] hover:text-[#0b1c30] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#006194]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30]">Ajustar Límite Presupuestal</h3>
                <span className="text-[11px] text-[#515f74]">Monto mensual para compras</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#707881]">$</span>
                <input
                  type="number"
                  step="100000"
                  value={tempBudgetInput}
                  onChange={(e) => setTempBudgetInput(Math.max(100000, Number(e.target.value)))}
                  className="w-full h-10 pl-8 pr-12 rounded-xl bg-[#eff4ff] text-sm font-bold text-[#0b1c30] outline-none border border-transparent focus:border-[#93ccff]"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#515f74]">COP</span>
              </div>

              {/* Preset buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTempBudgetInput(2500000)}
                  className="px-2 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[11px] font-semibold text-[#0b1c30]"
                >
                  $ 2.500.000
                </button>
                <button
                  type="button"
                  onClick={() => setTempBudgetInput(3500000)}
                  className="px-2 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[11px] font-semibold text-[#0b1c30]"
                >
                  $ 3.500.000
                </button>
                <button
                  type="button"
                  onClick={() => setTempBudgetInput(5000000)}
                  className="px-2 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[11px] font-semibold text-[#0b1c30]"
                >
                  $ 5.000.000
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f4fa] mt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingBudget(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#515f74] hover:bg-[#eff4ff]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    inventoryService.setCurrentBudgetCOP(tempBudgetInput);
                    setBudgetLimit(tempBudgetInput);
                    setIsEditingBudget(false);
                    showToast(`Presupuesto disponible actualizado a ${formatCOP(tempBudgetInput)}`);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#006194] hover:bg-[#007bb9] text-white shadow-xs"
                >
                  Guardar Límite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
