import React from 'react';
import { 
  Download, 
  PlusCircle, 
  Wallet, 
  Warehouse, 
  Boxes, 
  ShoppingCart, 
  ArrowUpRight, 
  Flame, 
  Snowflake, 
  Lightbulb, 
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles
} from 'lucide-react';
import { inventoryService, formatUSD, formatCOP } from '../services/inventoryService';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenMovementModal: () => void;
  onOpenPromoModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onNavigate, 
  onOpenMovementModal,
  onOpenPromoModal
}) => {
  const topMayor = inventoryService.getTopMayorRotacion();
  const topMenor = inventoryService.getTopMenorRotacion();
  const criticalAlerts = inventoryService.getCriticalAlerts();

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn pb-12">
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
              ¡Buen día, Carlos! 👋
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] text-xs font-semibold border border-[#a7f3d0]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              Taller Operativo
            </span>
          </div>
          <p className="text-sm text-[#515f74]">
            Aquí tienes el estado operativo de tu inventario y presupuestos para hoy.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => alert('Generando informe ejecutivo del taller en PDF...')}
            className="flex items-center gap-2 bg-white hover:bg-[#eff4ff] text-[#515f74] hover:text-[#0b1c30] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#e5eeff] shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#707881]" />
            <span>Descargar Resumen (PDF)</span>
          </button>
          <button
            onClick={onOpenMovementModal}
            className="flex items-center gap-2 bg-[#006194] hover:bg-[#007bb9] active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm shadow-[#006194]/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Registrar Movimiento</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono ml-0.5">F2</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Bento Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Presupuesto Disponible */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between hover:border-[#93ccff] transition-all">
          <div className="flex items-center justify-between text-[#515f74]">
            <span className="text-xs font-bold tracking-wider uppercase text-[#707881]">Presupuesto Disponible</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#006194]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1 text-[#0b1c30]">
              <span className="text-3xl font-extrabold tracking-tight">$ 4,850.00</span>
              <span className="text-xs font-bold text-[#515f74]">USD</span>
            </div>
            <div className="text-[11px] text-[#515f74] mt-0.5 font-medium">
              ≈ $ 19.400.000 COP asignados al mes
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#f0f4fa] text-xs">
            <span className="inline-flex items-center text-[#006947] font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12.4% vs mes anterior
            </span>
            <span className="text-[#707881] font-medium">65% de $7,500</span>
          </div>
        </div>

        {/* Card 2: Valor Total de Inventario */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between hover:border-[#93ccff] transition-all">
          <div className="flex items-center justify-between text-[#515f74]">
            <span className="text-xs font-bold tracking-wider uppercase text-[#707881]">Valor Total de Inventario</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#006194]">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1 text-[#0b1c30]">
              <span className="text-3xl font-extrabold tracking-tight">$ 18,920.00</span>
              <span className="text-xs font-bold text-[#515f74]">USD</span>
            </div>
            <div className="text-[11px] text-[#515f74] mt-0.5 font-medium">
              Costo de compra en bodega: $ 75.680.000 COP
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#f0f4fa] text-xs text-[#707881]">
            <span className="truncate">Costo de compra (1,432 piezas)</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#006194]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006194]" /> Auditado hace 2d
            </span>
          </div>
        </div>

        {/* Card 3: Referencias Activas */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between hover:border-[#93ccff] transition-all">
          <div className="flex items-center justify-between text-[#515f74]">
            <span className="text-xs font-bold tracking-wider uppercase text-[#707881]">Referencias Activas</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#006194]">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1 text-[#0b1c30]">
              <span className="text-3xl font-extrabold tracking-tight">348</span>
              <span className="text-xs font-medium text-[#515f74]">repuestos</span>
            </div>
            <div className="text-[11px] text-[#515f74] mt-0.5 font-medium">
              Capacidad de bodega: 84% de ocupación
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-[#f0f4fa] text-xs font-semibold">
            <span className="text-[#006947] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006947]" /> 312 OK
            </span>
            <span className="text-[#f59e0b] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> 24 mínimos
            </span>
            <span className="text-[#ba1a1a] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" /> 12 agotados
            </span>
          </div>
        </div>
      </div>

      {/* 3. Alertas de Stock Crítico */}
      <div className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
            <h2 className="text-base font-bold text-[#0b1c30]">Alertas de Stock Crítico</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-xs font-bold">
              {criticalAlerts.length} críticas hoy
            </span>
          </div>
          <button 
            onClick={() => onNavigate('inventario')}
            className="text-xs font-bold text-[#006194] hover:text-[#004b73] flex items-center gap-1 group"
          >
            <span>Ver todas en Inventario</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {criticalAlerts.slice(0, 4).map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-xl bg-[#eff4ff]/60 border border-[#dce9ff] flex flex-col justify-between gap-3 hover:bg-[#eff4ff] transition-colors"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    alert.stock_actual === 0 
                      ? 'bg-[#ffdad6] text-[#93000a]' 
                      : 'bg-[#fffbeb] text-[#92400e]'
                  }`}>
                    {alert.stock_actual === 0 ? 'Agotado (0 unid)' : `${alert.stock_actual} unid disponibles`}
                  </span>
                  <span className="text-[11px] font-bold text-[#ba1a1a]">
                    Déficit: -{alert.deficit} u.
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#0b1c30] line-clamp-1 mt-1" title={alert.nombre}>
                  {alert.nombre}
                </h3>
                <span className="text-[11px] text-[#515f74]">
                  SKU: {alert.sku} • Mín: {alert.stock_minimo} u.
                </span>
                <span className="text-[10px] text-[#707881] truncate">
                  Proveedor: {alert.proveedor}
                </span>
              </div>

              <button
                onClick={() => onNavigate('compras-presupuesto')}
                className="w-full flex items-center justify-center gap-1.5 bg-[#006194] hover:bg-[#007bb9] text-white py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <ShoppingCart className="w-3 h-3" />
                <span>Pedir al proveedor</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Two Columns: Top 5 Mayor Rotación vs Top 5 Menor Rotación (Dormidos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top 5 Mayor Rotación */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-base font-bold text-[#0b1c30]">Top 5 Mayor Rotación</h2>
              </div>
              <span className="text-xs font-medium text-[#515f74] bg-[#f8f9ff] px-2.5 py-1 rounded-lg border border-[#e5eeff]">
                Últimos 30 días
              </span>
            </div>
            <p className="text-xs text-[#515f74] mb-4">
              Repuestos más demandados en servicios mecánicos y ventas de mostrador.
            </p>

            <div className="space-y-3.5">
              {topMayor.map((item, idx) => (
                <div key={item.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0b1c30]">
                      {idx + 1}. {item.nombre}
                    </span>
                    <span className="font-bold text-[#006194]">{item.unidades} unids</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#515f74]">
                    <span>{item.objetivo_rotacion_pct}% rotación objetivo</span>
                    <span className="text-[#006947] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006947]" /> {item.etiqueta}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#eff4ff] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#006194] to-[#00855b] rounded-full"
                      style={{ width: `${item.objetivo_rotacion_pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#f0f4fa] flex items-center justify-between text-xs font-semibold text-[#515f74]">
            <span>Volumen total de piezas instaladas este mes:</span>
            <span className="text-sm font-bold text-[#0b1c30]">272 piezas</span>
          </div>
        </div>

        {/* Right: Top 5 Menor Rotación (Repuestos dormidos) */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-[#006194]" />
                <h2 className="text-base font-bold text-[#0b1c30]">Top 5 Menor Rotación</h2>
              </div>
              <span className="text-xs font-bold text-[#991b1b] bg-[#fef2f2] px-2.5 py-1 rounded-lg border border-[#fecaca]">
                Repuestos dormidos
              </span>
            </div>
            <p className="text-xs text-[#515f74] mb-4">
              Capital inmovilizado en bodega sin movimiento en los últimos meses.
            </p>

            <div className="space-y-3">
              {topMenor.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#eff4ff]/40 hover:bg-[#eff4ff] border border-[#dce9ff]/60 transition-colors"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-semibold text-[#0b1c30] truncate">
                      {item.nombre}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-[#ba1a1a] mt-0.5">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3" /> {item.dias} días
                      </span>
                      <span className="text-[#515f74]">• {item.sugerencia}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-bold text-[#0b1c30]">
                      {formatUSD(item.capital_usd)}
                    </span>
                    <span className="text-[10px] text-[#707881]">inmovilizado</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#f0f4fa] flex items-center justify-between">
            <span className="text-xs font-bold text-[#515f74]">Total capital inmovilizado top 5:</span>
            <div className="text-right">
              <span className="text-sm font-extrabold text-[#ba1a1a]">$ 455.00 USD</span>
              <span className="text-[10px] text-[#707881] block">≈ $ 1.820.000 COP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Smart Tip Card */}
      <div className="bg-gradient-to-r from-[#eff4ff] via-white to-[#eff4ff] rounded-2xl p-5 border border-[#cce5ff] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#cce5ff] text-[#006194] flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006194]">
              Consejo Inteligente de MotoGestión
            </span>
            <p className="text-xs text-[#0b1c30] mt-0.5">
              Tienes <strong className="text-[#ba1a1a] font-bold">$ 455 USD ($ 1.820.000 COP)</strong> en repuestos estancados por más de 90 días. Crear un paquete de servicio de mantenimiento preventivo podría recuperar este capital este mes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => alert('Notificación pospuesta por 7 días.')}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold text-[#515f74] hover:bg-white hover:text-[#0b1c30] transition-colors"
          >
            Ignorar por ahora
          </button>
          <button
            onClick={onOpenPromoModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#006194] hover:bg-[#007bb9] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear Paquete Promo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
