export type AbcClassification = 'A' | 'B' | 'C';
export type StockStatus = 'EN_STOCK' | 'BAJO_STOCK' | 'AGOTADO' | 'PAUSADO';

export interface Repuesto {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  proveedor: string;
  modelos_compatibles: string;
  ubicacion: string;
  precio_costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  stock_seguridad?: number;
  clasificacion_abc: AbcClassification;
  dias_sin_movimiento: number;
  demanda_estimada: number;
  estado: StockStatus;
  ventas_ultimos_30d?: number;
}

export interface CriticalAlert {
  id: number;
  sku: string;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  deficit: number;
  proveedor: string;
  estado: StockStatus;
}

export interface HighRotationItem {
  id: number;
  nombre: string;
  unidades: number;
  objetivo_rotacion_pct: number;
  etiqueta: string;
}

export interface LowRotationItem {
  id: number;
  nombre: string;
  dias: number;
  capital_inmovilizado_cop: number;
  capital_usd: number;
  sugerencia: string;
}

export interface SuggestedPurchaseItem {
  id: number;
  sku: string;
  nombre: string;
  detalle: string;
  clasificacion: string;
  stock_actual: number;
  stock_minimo: number;
  cantidad_sugerida: number;
  unidad: string;
  proveedor: string;
  tiempo_entrega: string;
  costo_unitario: number;
  costo_total: number;
  justificacion?: string;
  aprobado: boolean;
}

export interface MarketOpportunity {
  id: number;
  nombre: string;
  demanda_tendencia: string;
  justificacion: string;
  costo_pack_inicial: number;
  unidades_pack: number;
  categoria: string;
  agregado?: boolean;
}

export interface DiscontinueAlert {
  repuesto_id: number;
  sku: string;
  nombre: string;
  clasificacion_abc: AbcClassification;
  stock_inmovilizado: number;
  ubicacion: string;
  capital_congelado_cop: number;
  dias_sin_movimiento: number;
  motivo: string;
  sugerencia_accion: string;
  pausado?: boolean;
}

export interface SimulationScenarioResult {
  presupuesto_total: number;
  gasto_asignado: number;
  fondo_reserva: number;
  cobertura_estimada_pct: number;
  riesgo_escasez_repuestos: number;
  capital_inmovilizado_cop: number;
  items_sugeridos: {
    repuesto_id: number;
    sku: string;
    nombre: string;
    modelos: string;
    clasificacion_abc: AbcClassification;
    stock_actual: number;
    stock_minimo: number;
    cantidad_sugerida: number;
    unidad_medida: string;
    costo_unitario: number;
    costo_estimado: number;
    justificacion: string;
    proveedor: string;
  }[];
  curva_temporal: {
    semanas: string[];
    stock_proyectado_pct: number[];
    demanda_estimada_pct: number[];
    margen_seguro_dia15_pct: number;
    interpretacion: string;
  };
}
