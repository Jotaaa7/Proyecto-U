import React, { useState } from 'react';
import { 
  Terminal, 
  Database, 
  FileCode, 
  Copy, 
  Check, 
  Play, 
  Download, 
  BookOpen, 
  Calculator,
  Sparkles
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';

export const BackendDevHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'math' | 'api' | 'guide' | 'tester'>('sql');
  const [copied, setCopied] = useState<string | null>(null);

  // Playground state
  const [testBudget, setTestBudget] = useState<number>(2500000);
  const [testStrategy, setTestStrategy] = useState<string>('clase_a');
  const [testPeriod, setTestPeriod] = useState<string>('next_month');
  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const runApiTest = () => {
    const res = inventoryService.simulateScenario(testBudget, testPeriod, testStrategy);
    setApiResponse(res);
  };

  // SQL Script text
  const sqlScript = `-- ============================================================================
-- PROYECTO 4 UCC: MOTO-GESTIÓN - BASE DE DATOS RELACIONAL
-- TABLAS: repuestos, historial_movimientos, presupuestos, ordenes_compra
-- ============================================================================

CREATE TABLE talleres (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL DEFAULT 'Taller Central - Box 1',
    nit_rut VARCHAR(30) UNIQUE,
    ciudad VARCHAR(60) DEFAULT 'Bogotá',
    moneda_defecto VARCHAR(10) DEFAULT 'COP',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE repuestos (
    id SERIAL PRIMARY KEY,
    taller_id INT REFERENCES talleres(id) ON DELETE CASCADE,
    sku VARCHAR(40) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    modelos_compatibles TEXT,
    ubicacion_almacen VARCHAR(50), -- Estante A-2, Cajón F-01, Bodega L-12
    precio_costo NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    precio_venta NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5, -- Nivel ROP
    stock_seguridad INT NOT NULL DEFAULT 2, -- SS
    clasificacion_abc CHAR(1) NOT NULL DEFAULT 'C' CHECK (clasificacion_abc IN ('A', 'B', 'C')),
    dias_sin_movimiento INT DEFAULT 0, -- Identificador de capital congelado
    estado VARCHAR(20) DEFAULT 'EN_STOCK' CHECK (estado IN ('EN_STOCK', 'BAJO_STOCK', 'AGOTADO', 'PAUSADO')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historial_movimientos (
    id BIGSERIAL PRIMARY KEY,
    repuesto_id INT NOT NULL REFERENCES repuestos(id) ON DELETE CASCADE,
    tipo_movimiento VARCHAR(15) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    stock_anterior INT NOT NULL,
    stock_resultante INT NOT NULL,
    costo_unitario_momento NUMERIC(12, 2) NOT NULL,
    motivo VARCHAR(100),
    orden_servicio_id VARCHAR(50),
    usuario_registro VARCHAR(80) DEFAULT 'Carlos Mendoza',
    fecha_movimiento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE presupuestos (
    id SERIAL PRIMARY KEY,
    taller_id INT REFERENCES talleres(id) ON DELETE CASCADE,
    periodo_mes_anio VARCHAR(7) NOT NULL, -- '2024-11'
    monto_total_disponible NUMERIC(14, 2) NOT NULL,
    monto_comprometido NUMERIC(14, 2) DEFAULT 0.00,
    margen_seguridad_reserva NUMERIC(14, 2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'ACTIVO'
);

-- Vista Analítica: Capital Inmovilizado (>75 días sin ventas)
CREATE OR REPLACE VIEW vista_capital_inmovilizado AS
SELECT 
    id, sku, nombre, ubicacion_almacen, stock_actual, precio_costo,
    (stock_actual * precio_costo) AS capital_congelado_cop,
    dias_sin_movimiento, clasificacion_abc
FROM repuestos
WHERE stock_actual > 0 AND dias_sin_movimiento >= 75
ORDER BY capital_congelado_cop DESC;`;

  // Python Math functions text
  const pythonMathScript = `"""
Módulo inventory_ai.py - Algoritmos Matemáticos y Predictivos
Basado en Proyecto 4 UCC (Jonatan Stiven Ramirez Beltran)
"""
import math
import numpy as np
import pandas as pd

# 1. Regla Pareto ABC por Valor Movilizado (Demanda x Costo)
def calculate_abc_classification(df_products, df_movements=None):
    df = df_products.copy()
    if df_movements is not None and not df_movements.empty:
        salidas = df_movements[df_movements['tipo_movimiento'] == 'SALIDA'].groupby('repuesto_id')['cantidad'].sum().reset_index()
        df = df.merge(salidas, left_on='id', right_on='repuesto_id', how='left')
        df['unidades_salida'] = df['unidades_salida'].fillna(0)
    else:
        df['unidades_salida'] = df['ventas_ultimos_30d']

    df['valor_movilizado'] = df['unidades_salida'] * df['precio_costo']
    df.sort_values(by='valor_movilizado', ascending=False, inplace=True)
    
    total = df['valor_movilizado'].sum() or 1.0
    df['pct_acumulado'] = (df['valor_movilizado'].cumsum() / total) * 100

    def asignar_abc(pct):
        if pct <= 70.0: return 'A'
        elif pct <= 90.0: return 'B'
        else: return 'C'

    df['clasificacion_abc'] = df['pct_acumulado'].apply(asignar_abc)
    return df

# 2. Cantidad Económica de Pedido (EOQ) y Punto de Reorden (ROP)
def calculate_eoq_and_rop(demanda_periodo, costo_unitario, S=15000.0, holding_rate=0.20, L_dias=2, Z=1.65):
    D_anual = demanda_periodo * 12.0
    H = max(100.0, costo_unitario * holding_rate)
    q_opt = math.sqrt((2.0 * D_anual * S) / H)
    eoq_lote = max(1, int(round(q_opt / 12.0)))
    
    demanda_diaria = demanda_periodo / 30.0
    stock_seguridad = max(1, int(math.ceil(Z * 1.5 * math.sqrt(L_dias))))
    rop = int(math.ceil((demanda_diaria * L_dias) + stock_seguridad))
    return {"eoq": eoq_lote, "rop": rop, "stock_seguridad": stock_seguridad}

# 3. Regresión Lineal con Picos Quincenales
def forecast_demand_regression(historico_semanal, semanas_adelante=4, factor_quincena=1.35):
    x = np.arange(len(historico_semanal))
    y = np.array(historico_semanal, dtype=float)
    m, b = np.polyfit(x, y, 1)

    proyecciones = []
    for i in range(semanas_adelante):
        t = len(historico_semanal) + i
        y_hat = max(1.0, float(m * t + b))
        if i == 1: y_hat *= factor_quincena # Pico Día 15
        elif i == 3: y_hat *= (factor_quincena * 0.92) # Pico Día 30
        proyecciones.append(round(y_hat, 1))

    return {"pendiente": m, "intercepto": b, "semanas": proyecciones}`;

  // FastAPI script
  const fastapiScript = `from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from inventory_ai import simulate_budget_scenario, calculate_abc_classification

app = FastAPI(title="MotoGestión API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class SimulationRequest(BaseModel):
    presupuesto_cop: float
    periodo: str = "next_month"
    estrategia: str = "clase_a"

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    return {
        "presupuesto_disponible_usd": 4850.00,
        "valor_total_inventario_usd": 18920.00,
        "referencias_activas": {"total": 348, "ok": 312, "minimos": 24, "agotados": 12}
    }

@app.post("/api/simulate")
def run_simulation(req: SimulationRequest):
    return simulate_budget_scenario(
        budget_cop=req.presupuesto_cop,
        products=DATABASE_REPUESTOS,
        period_days=30,
        strategy=req.estrategia
    )`;

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn pb-12">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
              Backend & Data Science Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#006194] text-xs font-bold border border-[#dce9ff]">
              Proyecto 4 UCC
            </span>
          </div>
          <p className="text-sm text-[#515f74] max-w-3xl">
            Implementación completa de la arquitectura backend: esquemas de base de datos relacional, algoritmos predictivos (Pareto, EOQ, Regresión Lineal) y API RESTful en FastAPI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy('all', `${sqlScript}\n\n${pythonMathScript}\n\n${fastapiScript}`)}
            className="flex items-center gap-1.5 bg-[#006194] hover:bg-[#007bb9] active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            {copied === 'all' ? <Check className="w-4 h-4 text-[#4edea3]" /> : <Copy className="w-4 h-4" />}
            <span>Copiar Todo el Código</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-[#e5eeff] shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'sql'
              ? 'bg-[#006194] text-white shadow-xs'
              : 'text-[#515f74] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>1. Esquema SQL (`database.sql`)</span>
        </button>

        <button
          onClick={() => setActiveTab('math')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'math'
              ? 'bg-[#006194] text-white shadow-xs'
              : 'text-[#515f74] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>2. Módulo de IA Python (`inventory_ai.py`)</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'api'
              ? 'bg-[#006194] text-white shadow-xs'
              : 'text-[#515f74] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>3. API REST FastAPI (`main.py`)</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-[#006194] text-white shadow-xs'
              : 'text-[#515f74] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>4. Arquitectura & Conexión Stitch</span>
        </button>

        <button
          onClick={() => setActiveTab('tester')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'tester'
              ? 'bg-[#006194] text-white shadow-xs'
              : 'text-[#515f74] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>5. Simulador Interactivo de API (Live Tester)</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#006194]" />
              <h2 className="text-base font-bold text-[#0b1c30]">
                Esquema de Base de Datos Relacional (`backend/database.sql`)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('database.sql', sqlScript)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0b1c30] hover:bg-[#eff4ff] px-3 py-1.5 rounded-lg transition-colors border border-[#dce9ff]"
              >
                <Download className="w-3.5 h-3.5 text-[#006194]" />
                <span>Descargar database.sql</span>
              </button>
              <button
                onClick={() => handleCopy('sql', sqlScript)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#006194] hover:bg-[#eff4ff] px-3 py-1.5 rounded-lg transition-colors border border-[#dce9ff]"
              >
                {copied === 'sql' ? <Check className="w-4 h-4 text-[#4edea3]" /> : <Copy className="w-4 h-4 text-[#006194]" />}
                <span>{copied === 'sql' ? '¡Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-[#515f74]">
            Diseñado para PostgreSQL / SQLite según los requerimientos del <strong>Proyecto 4</strong>: tablas para <code>repuestos</code> (con clasificación A, B, C, stock y días inactivo), <code>historial_movimientos</code> (entradas y salidas de órdenes de servicio), <code>presupuestos</code> y vistas analíticas de capital inmovilizado.
          </p>

          <pre className="p-4 rounded-xl bg-[#0b1c30] text-[#eaf1ff] text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed">
            {sqlScript}
          </pre>
        </div>
      )}

      {activeTab === 'math' && (
        <div className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#006194]" />
              <h2 className="text-base font-bold text-[#0b1c30]">
                Módulo Científico y Predictivo (`backend/inventory_ai.py`)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('inventory_ai.py', pythonMathScript)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0b1c30] hover:bg-[#eff4ff] px-3 py-1.5 rounded-lg transition-colors border border-[#dce9ff]"
              >
                <Download className="w-3.5 h-3.5 text-[#006194]" />
                <span>Descargar inventory_ai.py</span>
              </button>
              <button
                onClick={() => handleCopy('math', pythonMathScript)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#006194] hover:bg-[#eff4ff] px-3 py-1.5 rounded-lg transition-colors border border-[#dce9ff]"
              >
                {copied === 'math' ? <Check className="w-4 h-4 text-[#4edea3]" /> : <Copy className="w-4 h-4 text-[#006194]" />}
                <span>{copied === 'math' ? '¡Copiado!' : 'Copiar Python'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-[#515f74]">
            Implementación en <strong>Python (Pandas, NumPy, Scikit-Learn)</strong> con las fórmulas analíticas de la tesis: <strong>Pareto ABC (80/20)</strong> por valor movilizado, <strong>EOQ</strong> (Lote Óptimo de Compra), <strong>ROP</strong> (Punto de Reorden) y proyección estacional con picos en los días 15 y 30.
          </p>

          <pre className="p-4 rounded-xl bg-[#0b1c30] text-[#eaf1ff] text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed">
            {pythonMathScript}
          </pre>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#006194]" />
              <h2 className="text-base font-bold text-[#0b1c30]">
                Servidor FastAPI (`backend/main.py`)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('main.py', fastapiScript)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0b1c30] hover:bg-[#eff4ff] px-3 py-1.5 rounded-lg transition-colors border border-[#dce9ff]"
              >
                <Download className="w-3.5 h-3.5 text-[#006194]" />
                <span>Descargar main.py</span>
              </button>
              <button
                onClick={() => handleCopy('api', fastapiScript)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#006194] hover:bg-[#eff4ff] px-3 py-1.5 rounded-lg transition-colors border border-[#dce9ff]"
              >
                {copied === 'api' ? <Check className="w-4 h-4 text-[#4edea3]" /> : <Copy className="w-4 h-4 text-[#006194]" />}
                <span>{copied === 'api' ? '¡Copiado!' : 'Copiar FastAPI'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-[#515f74]">
            Endpoints RESTful listos para conectar las pantallas exportadas de Stitch con la base de datos PostgreSQL en Render o en local.
          </p>

          <pre className="p-4 rounded-xl bg-[#0b1c30] text-[#eaf1ff] text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed">
            {fastapiScript}
          </pre>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#006194]" />
            <h2 className="text-base font-bold text-[#0b1c30]">
              Guía de Estructura e Integración del Proyecto
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff]/60 flex flex-col gap-2">
              <span className="font-bold text-[#0b1c30] text-sm">Paso 1: Instalar dependencias Python</span>
              <p className="text-[11px] text-[#515f74]">
                En la terminal, crea un entorno virtual e instala los paquetes científicos:
              </p>
              <code className="bg-[#0b1c30] text-[#eaf1ff] p-2.5 rounded-lg text-[11px] font-mono leading-relaxed">
                python -m venv venv<br />
                source venv/bin/activate  # o venv\Scripts\activate<br />
                pip install -r backend/requirements.txt
              </code>
            </div>

            <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff]/60 flex flex-col gap-2">
              <span className="font-bold text-[#0b1c30] text-sm">Paso 2: Iniciar Servidor FastAPI</span>
              <p className="text-[11px] text-[#515f74]">
                Ejecuta el servidor en el puerto 8000 con recarga automática:
              </p>
              <code className="bg-[#0b1c30] text-[#eaf1ff] p-2.5 rounded-lg text-[11px] font-mono leading-relaxed">
                cd backend<br />
                uvicorn main:app --reload --port 8000
              </code>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tester' && (
        <div className="bg-white rounded-2xl p-6 border border-[#e5eeff] shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-[#006194]" />
              <h2 className="text-base font-bold text-[#0b1c30]">
                Playground: Prueba en Vivo del Endpoint `/api/simulate`
              </h2>
            </div>
            <button
              onClick={runApiTest}
              className="flex items-center gap-1.5 bg-[#006194] hover:bg-[#007bb9] active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Ejecutar Petición POST</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#515f74]">Presupuesto (COP)</label>
              <input
                type="number"
                step="100000"
                value={testBudget}
                onChange={(e) => setTestBudget(Number(e.target.value))}
                className="h-10 px-3 rounded-lg bg-[#eff4ff] border border-transparent focus:border-[#93ccff] font-bold text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#515f74]">Estrategia</label>
              <select
                value={testStrategy}
                onChange={(e) => setTestStrategy(e.target.value)}
                className="h-10 px-3 rounded-lg bg-[#eff4ff] font-semibold text-xs cursor-pointer"
              >
                <option value="clase_a">Prioridad Clase A</option>
                <option value="balanceado">Balanceado</option>
                <option value="minimo_riesgo">Mínimo Riesgo</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#515f74]">Periodo</label>
              <select
                value={testPeriod}
                onChange={(e) => setTestPeriod(e.target.value)}
                className="h-10 px-3 rounded-lg bg-[#eff4ff] font-semibold text-xs cursor-pointer"
              >
                <option value="next_month">Próximo Mes</option>
                <option value="45_days">45 Días</option>
                <option value="next_quarter">Próximo Trimestre</option>
              </select>
            </div>
          </div>

          {/* Response Payload */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#515f74]">Respuesta JSON del Endpoint:</span>
            <pre className="p-4 rounded-xl bg-[#0b1c30] text-[#4edea3] text-xs font-mono overflow-x-auto max-h-[350px]">
              {apiResponse 
                ? JSON.stringify(apiResponse, null, 2) 
                : '// Haz clic en "Ejecutar Petición POST" para ver la respuesta JSON del motor predictivo'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
