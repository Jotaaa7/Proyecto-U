import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  FileText, 
  TrendingUp, 
  Calendar, 
  ChevronDown,
  Fuel,
  Disc,
  Cog,
  Zap,
  Info
} from 'lucide-react';
import { inventoryService, formatCOP, formatNumberCOP } from '../services/inventoryService';
import { SimulationScenarioResult } from '../types/inventory';

interface SimulationViewProps {
  onNavigateToPurchases: () => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ onNavigateToPurchases }) => {
  const [budgetInput, setBudgetInput] = useState<number>(2500000);
  const [period, setPeriod] = useState<string>('next_month');
  const [strategy, setStrategy] = useState<string>('clase_a');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationScenarioResult>(() => 
    inventoryService.simulateScenario(2500000, 'next_month', 'clase_a')
  );

  const handleAdjustBudget = (delta: number) => {
    const updated = Math.max(500000, budgetInput + delta);
    setBudgetInput(updated);
    setSimulationResult(inventoryService.simulateScenario(updated, period, strategy));
  };

  const handleSetBudget = (amount: number) => {
    setBudgetInput(amount);
    setSimulationResult(inventoryService.simulateScenario(amount, period, strategy));
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = inventoryService.simulateScenario(budgetInput, period, strategy);
      setSimulationResult(res);
      setIsSimulating(false);
    }, 250);
  };

  const getIconForProduct = (name: string) => {
    if (name.includes('Aceite')) return <Fuel className="w-5 h-5 text-[#006194]" />;
    if (name.includes('Freno')) return <Disc className="w-5 h-5 text-[#006194]" />;
    if (name.includes('Kit') || name.includes('Arrastre')) return <Cog className="w-5 h-5 text-[#006194]" />;
    return <Zap className="w-5 h-5 text-[#006194]" />;
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn pb-12">
      {/* 1. Page Header */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
            Simulador de Compras y Pronóstico de Demanda
          </h1>
          <p className="text-sm text-[#515f74] max-w-3xl">
            Calcula cómo rendirá tu dinero el próximo mes antes de hacer pedidos a proveedores con base en repuestos de alta rotación.
          </p>
        </div>

        <div className="flex items-center self-start md:self-auto gap-2 px-3.5 py-2 bg-white rounded-xl border border-[#e5eeff] shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00855b] animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#00855b] tracking-wider uppercase">
              Modelo Calibrado
            </span>
            <span className="text-xs text-[#515f74]">
              Historial de 6 meses de órdenes
            </span>
          </div>
        </div>
      </section>

      {/* 2. Configuration Panel */}
      <section className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-[#707881]">
              Parámetros de Entrada
            </span>
            <span className="text-lg font-bold text-[#0b1c30]">
              Configura tu escenario de compra
            </span>
          </div>

          {/* Time Period Selector */}
          <div className="inline-flex p-1 bg-[#eff4ff] rounded-xl gap-1 border border-[#dce9ff]/60">
            <button
              type="button"
              onClick={() => { setPeriod('next_month'); handleRunSimulation(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === 'next_month'
                  ? 'bg-white text-[#006194] shadow-xs'
                  : 'text-[#515f74] hover:text-[#0b1c30]'
              }`}
            >
              Próximo mes (Noviembre 2024)
            </button>
            <button
              type="button"
              onClick={() => { setPeriod('45_days'); handleRunSimulation(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === '45_days'
                  ? 'bg-white text-[#006194] shadow-xs'
                  : 'text-[#515f74] hover:text-[#0b1c30]'
              }`}
            >
              Próximos 45 días
            </button>
            <button
              type="button"
              onClick={() => { setPeriod('next_quarter'); handleRunSimulation(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === 'next_quarter'
                  ? 'bg-white text-[#006194] shadow-xs'
                  : 'text-[#515f74] hover:text-[#0b1c30]'
              }`}
            >
              Próximo trimestre
            </button>
          </div>
        </div>

        {/* Main Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Budget Input & Quick Adjusters */}
          <div className="lg:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#515f74]">
              Presupuesto a Simular
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold text-[#707881] select-none">$</span>
              <input
                type="text"
                value={formatNumberCOP(budgetInput)}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                  setBudgetInput(val);
                }}
                className="w-full h-14 pl-10 pr-20 bg-[#eff4ff] rounded-xl text-2xl font-black text-[#0b1c30] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#93ccff] transition-all"
              />
              <span className="absolute right-4 text-xs font-bold text-[#515f74] uppercase">COP</span>
            </div>

            {/* Quick adjust buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleAdjustBudget(500000)}
                className="px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-xs font-semibold transition-colors"
              >
                + $ 500.000 COP
              </button>
              <button
                type="button"
                onClick={() => handleAdjustBudget(1000000)}
                className="px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-xs font-semibold transition-colors"
              >
                + $ 1.000.000 COP
              </button>
              <button
                type="button"
                onClick={() => handleSetBudget(2500000)}
                className="px-2.5 py-1 rounded-lg bg-[#d5e3fd] hover:bg-[#b9c7e0] text-[#0d1c2f] text-xs font-bold transition-colors"
              >
                Usar presupuesto sugerido
              </button>
            </div>
          </div>

          {/* Allocation Strategy */}
          <div className="lg:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#515f74]">
              Estrategia de Asignación
            </label>
            <div className="relative">
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full h-14 px-4 bg-[#eff4ff] text-[#0b1c30] font-semibold text-xs rounded-xl appearance-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#93ccff] transition-all cursor-pointer pr-10"
              >
                <option value="clase_a">Prioridad: Repuestos de Alta Rotación (Clase A)</option>
                <option value="balanceado">Balanceado: Rotación y margen bruto</option>
                <option value="minimo_riesgo">Mínimo riesgo: Solo stock de seguridad crítico</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#515f74]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[11px] text-[#707881]">Protege primero aceites, filtros y frenos.</span>
          </div>

          {/* Run Action Button */}
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className={`w-full h-14 bg-[#006194] hover:bg-[#007bb9] active:scale-95 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#006194]/25 transition-all ${
                isSimulating ? 'opacity-80 scale-98' : ''
              }`}
            >
              <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
              <span>{isSimulating ? 'Calculando Escenario...' : 'Ejecutar Simulación'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Results KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Cobertura */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#707881]">
              Nivel de Cobertura Estimado
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] text-xs font-bold border border-[#a7f3d0]">
              Excelente protección
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-[#0b1c30]">
              {simulationResult.cobertura_estimada_pct}%
            </div>
            <p className="text-xs text-[#515f74] mt-1">
              Cubrirás el {simulationResult.cobertura_estimada_pct}% de la demanda esperada en repuestos de alta rotación (Clase A).
            </p>
          </div>
          <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#00855b] h-full rounded-full transition-all duration-700"
              style={{ width: `${simulationResult.cobertura_estimada_pct}%` }}
            />
          </div>
        </div>

        {/* Riesgo de Escasez */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#707881]">
              Riesgo de Escasez
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#d5e3fd] text-[#0d1c2f] text-xs font-bold">
              Riesgo controlado
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-[#0b1c30]">
              {simulationResult.riesgo_escasez_repuestos} repuestos
            </div>
            <p className="text-xs text-[#515f74] mt-1">
              Solo {simulationResult.riesgo_escasez_repuestos} referencias críticas quedarían con stock justo al día 22 del mes.
            </p>
          </div>
          <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#006194] h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, simulationResult.riesgo_escasez_repuestos * 12)}%` }}
            />
          </div>
        </div>

        {/* Capital Inmovilizado Proyectado */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#707881]">
              Capital Inmovilizado Proyectado
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#006194] text-xs font-bold border border-[#dce9ff]">
              Eficiencia alta
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-[#0b1c30]">
              {formatCOP(simulationResult.capital_inmovilizado_cop)}
            </div>
            <p className="text-xs text-[#515f74] mt-1">
              Bajo riesgo de sobrestock. El 87% del presupuesto se convertirá en repuestos vendidos en 30 días.
            </p>
          </div>
          <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#515f74] h-full rounded-full transition-all duration-700"
              style={{ width: '12%' }}
            />
          </div>
        </div>
      </section>

      {/* 4. Chart: Demanda Esperada vs Stock Proyectado en 4 semanas */}
      <section className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-[#707881]">
              Proyección Temporal
            </span>
            <h2 className="text-lg font-bold text-[#0b1c30]">
              Demanda Esperada vs. Stock Proyectado (Próximas 4 Semanas)
            </h2>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#006194] inline-block" />
              <span className="font-semibold text-[#0b1c30]">Stock proyectado con presupuesto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-[#515f74] inline-block" />
              <span className="text-[#515f74]">Consumo estimado de clientes</span>
            </div>
          </div>
        </div>

        {/* SVG Curve Component with High Fidelity */}
        <div className="relative w-full bg-[#eff4ff]/60 rounded-xl p-4 overflow-hidden border border-[#dce9ff]/60">
          <svg className="w-full h-auto text-[#006194]" fill="none" viewBox="0 0 960 280" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="stockAreaGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#007bb9" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#007bb9" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="peakHighlight" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#00855b" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#00855b" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            <line stroke="#d5e3fd" strokeDasharray="4 4" strokeWidth="1" x1="60" x2="920" y1="40" y2="40" />
            <line stroke="#d5e3fd" strokeDasharray="4 4" strokeWidth="1" x1="60" x2="920" y1="100" y2="100" />
            <line stroke="#d5e3fd" strokeDasharray="4 4" strokeWidth="1" x1="60" x2="920" y1="160" y2="160" />
            <line stroke="#d5e3fd" strokeWidth="1" x1="60" x2="920" y1="220" y2="220" />

            {/* Y-Axis Labels */}
            <text fill="#515f74" fontFamily="Plus Jakarta Sans" fontSize="11" textAnchor="end" x="45" y="44">100%</text>
            <text fill="#515f74" fontFamily="Plus Jakarta Sans" fontSize="11" textAnchor="end" x="45" y="104">75%</text>
            <text fill="#515f74" fontFamily="Plus Jakarta Sans" fontSize="11" textAnchor="end" x="45" y="164">50%</text>
            <text fill="#515f74" fontFamily="Plus Jakarta Sans" fontSize="11" textAnchor="end" x="45" y="224">0%</text>

            {/* Shaded highlight for Pico Quincena (Semana 2 - Día 15) */}
            <rect fill="url(#peakHighlight)" height="180" rx="8" width="130" x="415" y="40" />
            <text fill="#006947" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" textAnchor="middle" x="480" y="58">
              Pico Quincena (Día 15)
            </text>

            {/* Stock Area Gradient */}
            <path
              d="M 120 70 C 220 80, 320 95, 420 115 C 520 135, 620 145, 720 150 C 780 155, 840 160, 880 165 L 880 220 L 120 220 Z"
              fill="url(#stockAreaGrad)"
            />

            {/* Estimated Consumption Line (Dashed) */}
            <path
              d="M 120 185 C 200 170, 320 155, 420 85 C 500 130, 620 160, 720 110 C 780 120, 840 145, 880 155"
              fill="none"
              stroke="#515f74"
              strokeDasharray="6 6"
              strokeWidth="2.5"
            />

            {/* Projected Stock Line (Blue Solid) */}
            <path
              d="M 120 70 C 220 80, 320 95, 420 115 C 520 135, 620 145, 720 150 C 780 155, 840 160, 880 165"
              fill="none"
              stroke="#006194"
              strokeLinecap="round"
              strokeWidth="3.5"
            />

            {/* Nodes */}
            <circle cx="120" cy="70" fill="#006194" r="5" stroke="#ffffff" strokeWidth="2" />
            <circle cx="420" cy="115" fill="#00855b" r="6" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="880" cy="165" fill="#006194" r="5" stroke="#ffffff" strokeWidth="2" />

            {/* Interactive Tooltip on Day 15 */}
            <g transform="translate(435, 95)">
              <rect fill="#0b1c30" height="44" rx="8" width="165" x="0" y="0" />
              <text fill="#ffffff" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" x="12" y="19">
                Día 15: Stock suficiente
              </text>
              <text fill="#93ccff" fontFamily="Plus Jakarta Sans" fontSize="10" fontWeight="600" x="12" y="34">
                Margen seguro: +24% unidades
              </text>
            </g>

            {/* X-Axis Week Labels */}
            <text fill="#0b1c30" fontFamily="Plus Jakarta Sans" fontSize="12" fontWeight="700" textAnchor="middle" x="120" y="246">Semana 1</text>
            <text fill="#515f74" fontFamily="Plus Jakarta Sans" fontSize="10" textAnchor="middle" x="120" y="260">1 - 7 Nov</text>

            <text fill="#0b1c30" fontFamily="Plus Jakarta Sans" fontSize="12" fontWeight="700" textAnchor="middle" x="380" y="246">Semana 2</text>
            <text fill="#515f74" fontFamily="Plus Jakarta Sans" fontSize="10" textAnchor="middle" x="380" y="260">8 - 14 Nov</text>

            <text fill="#0b1c30" fontFamily="Plus Jakarta Sans" fontSize="12" fontWeight="700" textAnchor="middle" x="640" y="246">Semana 3</text>
            <text fill="#515f74" fontFamily="Plus Jakarta Sans" fontSize="10" textAnchor="middle" x="640" y="260">15 - 21 Nov</text>

            <text fill="#0b1c30" fontFamily="Plus Jakarta Sans" fontSize="12" fontWeight="700" textAnchor="middle" x="880" y="246">Semana 4</text>
            <text fill="#515f74" fontFamily="Plus Jakarta Sans" fontSize="10" textAnchor="middle" x="880" y="260">22 - 30 Nov</text>
          </svg>
        </div>

        {/* Dynamic Contextual Feedback */}
        <div className="flex items-center gap-2.5 p-3.5 bg-[#e5eeff] rounded-xl text-[#0b1c30] text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#006194] shrink-0" />
          <p>
            {simulationResult.curva_temporal.interpretacion}
          </p>
        </div>
      </section>

      {/* 5. Suggested Purchase Plan Panel */}
      <section className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-[#707881]">
              Plan de Compras Sugerido
            </span>
            <h2 className="text-lg font-bold text-[#0b1c30]">
              Repuestos prioritarios según demanda prevista
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-[#515f74] text-xs font-semibold bg-[#eff4ff] px-3.5 py-1.5 rounded-lg border border-[#dce9ff]/60">
            <span>{simulationResult.items_sugeridos.length} referencias Clase A prioritarias</span>
          </div>
        </div>

        {/* Suggested Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#515f74] font-bold uppercase text-[10px] tracking-wider bg-[#eff4ff]/60 rounded-xl">
                <th className="py-3 px-4 rounded-l-xl">Repuesto / Referencia</th>
                <th className="py-3 px-4">Sugerencia de Pedido</th>
                <th className="py-3 px-4 text-right">Costo Estimado</th>
                <th className="py-3 px-4 rounded-r-xl">Justificación del Modelo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4fa]">
              {simulationResult.items_sugeridos.map((item) => (
                <tr key={item.repuesto_id} className="hover:bg-[#eff4ff]/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#dce9ff] flex items-center justify-center">
                        {getIconForProduct(item.nombre)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#0b1c30]">
                          {item.nombre}
                        </span>
                        <span className="text-[11px] text-[#515f74]">
                          {item.modelos}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-xs text-[#0b1c30]">
                    Comprar {item.cantidad_sugerida} {item.unidad_medida}
                  </td>

                  <td className="py-4 px-4 text-right font-black text-sm text-[#0b1c30] whitespace-nowrap">
                    {formatCOP(item.costo_estimado)}
                  </td>

                  <td className="py-4 px-4 text-xs text-[#515f74]">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        item.justificacion.includes('agotar') ? 'bg-[#ba1a1a]' : 'bg-[#00855b]'
                      }`} />
                      <span className={item.justificacion.includes('agotar') ? 'text-[#ba1a1a] font-semibold' : ''}>
                        {item.justificacion}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Budget Distribution Bar */}
        <div className="p-4 bg-[#eff4ff] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#dce9ff]/60">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#515f74]">
              Distribución de tu presupuesto sugerido:
            </span>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#006194] inline-block" />
                <span className="text-[#0b1c30]">
                  <strong className="font-bold">{formatCOP(simulationResult.gasto_asignado)}</strong> en repuestos críticos
                </span>
              </div>
              <span className="text-[#707881]">+</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#d5e3fd] border border-[#006194] inline-block" />
                <span className="text-[#0b1c30]">
                  <strong className="font-bold">{formatCOP(simulationResult.fondo_reserva)}</strong> en reserva de seguridad
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs font-bold text-[#515f74] uppercase">Total Asignado:</span>
            <span className="text-lg font-black text-[#0b1c30] whitespace-nowrap">
              {formatCOP(simulationResult.presupuesto_total)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => alert('Lista de compras exportada en formato Excel / PDF para proveedores.')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] flex items-center justify-center gap-2 transition-colors border border-[#dce9ff]/60"
          >
            <Download className="w-4 h-4 text-[#707881]" />
            <span>Exportar lista de compras para proveedores</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToPurchases}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#006194] hover:bg-[#007bb9] active:scale-95 text-white shadow-sm shadow-[#006194]/25 flex items-center justify-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Crear orden borrador</span>
          </button>
        </div>
      </section>
    </div>
  );
};
