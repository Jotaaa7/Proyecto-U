import { 
  Repuesto, 
  SimulationScenarioResult, 
  SuggestedPurchaseItem, 
  MarketOpportunity, 
  DiscontinueAlert,
  CriticalAlert
} from '../types/inventory';
import { 
  INITIAL_REPUESTOS, 
  INITIAL_SUGGESTED_PURCHASES, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_DISCONTINUE_ALERTS, 
  TOP_MAYOR_ROTACION, 
  TOP_MENOR_ROTACION 
} from './mockData';

export function formatCOP(amount: number): string {
  return '$ ' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' COP';
}

export function formatNumberCOP(amount: number): string {
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatUSD(amount: number): string {
  return '$ ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
}

// In-Memory Reactive Store
class InventoryService {
  private repuestos: Repuesto[] = [...INITIAL_REPUESTOS];
  private purchases: SuggestedPurchaseItem[] = [...INITIAL_SUGGESTED_PURCHASES];
  private opportunities: MarketOpportunity[] = [...INITIAL_OPPORTUNITIES];
  private discontinueAlerts: DiscontinueAlert[] = [...INITIAL_DISCONTINUE_ALERTS];
  private currentBudgetCOP: number = 3500000;

  getRepuestos(): Repuesto[] {
    return [...this.repuestos];
  }

  getCriticalAlerts(): CriticalAlert[] {
    return this.repuestos
      .filter(r => r.stock_actual <= r.stock_minimo)
      .map(r => ({
        id: r.id,
        sku: r.sku,
        nombre: r.nombre,
        stock_actual: r.stock_actual,
        stock_minimo: r.stock_minimo,
        deficit: Math.max(0, r.stock_minimo - r.stock_actual),
        proveedor: r.proveedor,
        estado: r.estado
      }));
  }

  getTopMayorRotacion() {
    return TOP_MAYOR_ROTACION;
  }

  getTopMenorRotacion() {
    return TOP_MENOR_ROTACION;
  }

  getSuggestedPurchases(): SuggestedPurchaseItem[] {
    return [...this.purchases];
  }

  getOpportunities(): MarketOpportunity[] {
    return [...this.opportunities];
  }

  getDiscontinueAlerts(): DiscontinueAlert[] {
    return [...this.discontinueAlerts];
  }

  getCurrentBudgetCOP(): number {
    return this.currentBudgetCOP;
  }

  setCurrentBudgetCOP(amount: number) {
    this.currentBudgetCOP = amount;
  }

  registerMovement(repuestoId: number, tipo: 'ENTRADA' | 'SALIDA', cantidad: number, motivo: string): { success: boolean; message: string } {
    const item = this.repuestos.find(r => r.id === repuestoId);
    if (!item) return { success: false, message: 'Repuesto no encontrado' };

    if (tipo === 'SALIDA') {
      if (item.stock_actual < cantidad) {
        return { success: false, message: `Stock insuficiente (${item.stock_actual} disponibles)` };
      }
      item.stock_actual -= cantidad;
      item.dias_sin_movimiento = 0;
    } else {
      item.stock_actual += cantidad;
    }

    // Actualizar estado
    if (item.stock_actual === 0) {
      item.estado = 'AGOTADO';
    } else if (item.stock_actual <= item.stock_minimo) {
      item.estado = 'BAJO_STOCK';
    } else {
      item.estado = 'EN_STOCK';
    }

    return { success: true, message: `Movimiento de ${cantidad} unidades registrado para ${item.nombre}` };
  }

  addRepuesto(newRepuesto: Omit<Repuesto, 'id' | 'dias_sin_movimiento' | 'estado' | 'ventas_ultimos_30d'>): Repuesto {
    const id = this.repuestos.length + 1;
    const estado = newRepuesto.stock_actual === 0 ? 'AGOTADO' : (newRepuesto.stock_actual <= newRepuesto.stock_minimo ? 'BAJO_STOCK' : 'EN_STOCK');
    const created: Repuesto = {
      ...newRepuesto,
      id,
      dias_sin_movimiento: 0,
      estado,
      ventas_ultimos_30d: 0
    };
    this.repuestos.unshift(created);
    return created;
  }

  pauseSku(repuestoId: number): boolean {
    const item = this.repuestos.find(r => r.id === repuestoId);
    if (item) {
      item.estado = 'PAUSADO';
      const alert = this.discontinueAlerts.find(a => a.repuesto_id === repuestoId);
      if (alert) alert.pausado = true;
      return true;
    }
    return false;
  }

  addOpportunityToOrder(opportunityId: number): boolean {
    const opp = this.opportunities.find(o => o.id === opportunityId);
    if (!opp || opp.agregado) return false;

    opp.agregado = true;
    const newItem: SuggestedPurchaseItem = {
      id: 100 + opp.id,
      sku: `NEW-OPP-${opp.id}`,
      nombre: opp.nombre,
      detalle: `Incorporación estratégica (${opp.categoria}) • Lote de inicio`,
      clasificacion: 'Clase A - Alta',
      stock_actual: 0,
      stock_minimo: 4,
      cantidad_sugerida: opp.unidades_pack,
      unidad: 'unidades',
      proveedor: 'Distribuidor Autorizado',
      tiempo_entrega: 'Entrega: 48h',
      costo_unitario: Math.round(opp.costo_pack_inicial / opp.unidades_pack),
      costo_total: opp.costo_pack_inicial,
      aprobado: true,
      justificacion: opp.justificacion
    };
    this.purchases.push(newItem);
    return true;
  }

  togglePurchaseItem(itemId: number, approved: boolean) {
    const item = this.purchases.find(p => p.id === itemId);
    if (item) {
      item.aprobado = approved;
    }
  }

  setAllPurchasesApproved(approved: boolean) {
    this.purchases.forEach(p => p.aprobado = approved);
  }

  // Ejecución Matemática del Algoritmo de Simulación (Réplica exacta de inventory_ai.py)
  simulateScenario(budgetCOP: number, periodo: string, estrategia: string): SimulationScenarioResult {
    const budget = Math.max(500000, budgetCOP);

    // Margen de seguridad financiero de reserva (15% a 35%)
    let pctReserva = 0.20;
    if (estrategia === 'minimo_riesgo') pctReserva = 0.35;
    else if (estrategia === 'balanceado') pctReserva = 0.25;
    else pctReserva = budget >= 2500000 ? 0.344 : 0.20; // 860.000 / 2.500.000 = ~34.4%

    const fondoReserva = Math.round(budget * pctReserva);
    const presupuestoCompras = budget - fondoReserva;

    // Repuestos candidatos con prioridad
    const pool = [
      {
        repuesto_id: 3,
        sku: '10W40-MSM',
        nombre: 'Aceite 4T 10W-40 Sintético',
        modelos: 'Mobil Super Moto / Motul 5100',
        clasificacion_abc: 'A' as const,
        stock_actual: 2,
        stock_minimo: 12,
        base_unidades: 18,
        costo_unitario: 26666,
        justificacion: 'Demanda alta por mantenimientos preventivos programados.',
        proveedor: 'Distribuidora MotoLube SAS'
      },
      {
        repuesto_id: 2,
        sku: 'FRN-YM-012',
        nombre: 'Pastillas de Freno Delanteras',
        modelos: 'Pulsar NS200 / FZ 2.0 / Gixxer',
        clasificacion_abc: 'A' as const,
        stock_actual: 0,
        stock_minimo: 8,
        base_unidades: 12,
        costo_unitario: 30000,
        justificacion: 'Se proyecta agotar existencias en 9 días sin este pedido.',
        proveedor: 'Frenos y Partes de Colombia'
      },
      {
        repuesto_id: 4,
        sku: 'TRM-BJ-428',
        nombre: 'Kit de Arrastre Reforzado 428H',
        modelos: 'Corona, piñón y cadena O-ring',
        clasificacion_abc: 'A' as const,
        stock_actual: 1,
        stock_minimo: 4,
        base_unidades: 5,
        costo_unitario: 110000,
        justificacion: 'Repuesto Clase A con rotación constante e inventario mínimo seguro.',
        proveedor: 'Importadora de Cadenas Andina'
      },
      {
        repuesto_id: 5,
        sku: 'ELE-NG-8EA',
        nombre: 'Bujía NGK C7HSA / CPR8EA',
        modelos: 'Ajuste universal estándar 125cc–250cc',
        clasificacion_abc: 'A' as const,
        stock_actual: 3,
        stock_minimo: 10,
        base_unidades: 25,
        costo_unitario: 10000,
        justificacion: 'Alta frecuencia en servicios de afinación y sincronización de motor.',
        proveedor: 'Importaciones Japón'
      }
    ];

    let gastoAcumulado = 0;
    const itemsSugeridos = [];
    const factorEscala = Math.min(2.0, Math.max(0.4, budget / 2500000));

    for (const p of pool) {
      let unidades = Math.max(2, Math.round(p.base_unidades * (factorEscala * 0.95)));
      if (budget < 1500000) unidades = Math.max(1, Math.round(p.base_unidades * 0.5));
      const costoLinea = unidades * p.costo_unitario;

      if (gastoAcumulado + costoLinea <= presupuestoCompras * 1.05) {
        gastoAcumulado += costoLinea;
        itemsSugeridos.push({
          repuesto_id: p.repuesto_id,
          sku: p.sku,
          nombre: p.nombre,
          modelos: p.modelos,
          clasificacion_abc: p.clasificacion_abc,
          stock_actual: p.stock_actual,
          stock_minimo: p.stock_minimo,
          cantidad_sugerida: unidades,
          unidad_medida: p.nombre.includes('Aceite') || p.nombre.includes('Bujía') ? 'unidades' : (p.nombre.includes('Freno') ? 'juegos' : 'kits'),
          costo_unitario: p.costo_unitario,
          costo_estimado: costoLinea,
          justificacion: p.justificacion,
          proveedor: p.proveedor
        });
      }
    }

    // Cobertura estimada: entre 80% y 98% según presupuesto
    const cobertura = Math.min(98.5, Math.max(68.0, 75 + (budget / 2500000) * 19));
    const riesgoEscasez = budget >= 2500000 ? 2 : (budget >= 1500000 ? 4 : 8);
    const capitalInmovilizado = Math.round(budget * 0.128);

    return {
      presupuesto_total: budget,
      gasto_asignado: gastoAcumulado,
      fondo_reserva: budget - gastoAcumulado,
      cobertura_estimada_pct: Math.round(cobertura),
      riesgo_escasez_repuestos: riesgoEscasez,
      capital_inmovilizado_cop: capitalInmovilizado,
      items_sugeridos: itemsSugeridos,
      curva_temporal: {
        semanas: ['Semana 1 (1 - 7 Nov)', 'Semana 2 (8 - 14 Nov)', 'Semana 3 (15 - 21 Nov)', 'Semana 4 (22 - 30 Nov)'],
        stock_proyectado_pct: [100, 72, 60, 48],
        demanda_estimada_pct: [38, 70, 42, 58],
        margen_seguro_dia15_pct: 24,
        interpretacion: `Con ${formatCOP(budget)} evitas quedarte sin repuestos en el pico de servicios del día 15 y el cierre quincenal del día 30.`
      }
    };
  }
}

export const inventoryService = new InventoryService();
