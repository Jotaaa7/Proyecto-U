"""
Backend API en FastAPI para MotoGestión
Conexión de interfaz Stitch con Motor de Inteligencia y Base de Datos Relacional
Basado en: Proyecto 4 UCC (Tesis de Sistemas - Jonatan Stiven Ramirez Beltran)
"""

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import datetime

from inventory_ai import (
    calculate_abc_classification,
    calculate_eoq_and_rop,
    forecast_demand_regression,
    simulate_budget_scenario,
    analyze_portfolio_opportunities
)

app = FastAPI(
    title="MotoGestión API - Sistema Inteligente de Inventarios",
    description="API RESTful para simulación de inventario, clasificación ABC, pronóstico de demanda y optimización de presupuesto en talleres de motocicletas.",
    version="1.0.0"
)

# Habilitar CORS para permitir llamadas desde el frontend de Stitch / Vite React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# BASE DE DATOS EN MEMORIA / CACHÉ INICIAL (CONECTABLE A POSTGRESQL VÍA SQLALCHEMY)
# ==============================================================================
DATABASE_REPUESTOS = [
    {
        "id": 1,
        "sku": "LUB-MO-710",
        "nombre": "Aceite Motul 7100 4T 10W40 1L",
        "descripcion": "Sintético 100% Ester alto desempeño",
        "categoria": "Aceites y Lubricantes",
        "proveedor": "LubriMotos S.A.",
        "modelos_compatibles": "Yamaha, Honda, KTM, Pulsar",
        "ubicacion": "Bodega L-12",
        "precio_costo": 48000.0,
        "precio_venta": 68000.0,
        "stock_actual": 2,
        "stock_minimo": 12,
        "clasificacion_abc": "A",
        "dias_sin_movimiento": 1,
        "demanda_estimada": 20,
        "estado": "BAJO_STOCK"
    },
    {
        "id": 2,
        "sku": "FRN-YM-012",
        "nombre": "Pastillas de Freno Delanteras Yamaha FZ / R15",
        "descripcion": "Pastillas sinterizadas cerámicas",
        "categoria": "Sistema de Frenos",
        "proveedor": "Repuestos Andina",
        "modelos_compatibles": "Yamaha FZ 2.0 / R15 V3",
        "ubicacion": "Cajón F-01",
        "precio_costo": 28000.0,
        "precio_venta": 42000.0,
        "stock_actual": 0,
        "stock_minimo": 8,
        "clasificacion_abc": "A",
        "dias_sin_movimiento": 0,
        "demanda_estimada": 14,
        "estado": "AGOTADO"
    },
    {
        "id": 3,
        "sku": "TRM-BJ-428",
        "nombre": "Kit de Arrastre Reforzado 428H Pulsar 200NS",
        "descripcion": "Corona, piñón y cadena O-ring",
        "categoria": "Transmisión y Arrastre",
        "proveedor": "MotoPartes del Centro",
        "modelos_compatibles": "Bajaj Pulsar NS200 / AS200",
        "ubicacion": "Estante C-04",
        "precio_costo": 110000.0,
        "precio_venta": 145000.0,
        "stock_actual": 1,
        "stock_minimo": 4,
        "clasificacion_abc": "B",
        "dias_sin_movimiento": 4,
        "demanda_estimada": 6,
        "estado": "BAJO_STOCK"
    },
    {
        "id": 4,
        "sku": "ELE-NG-8EA",
        "nombre": "Bujía NGK CPR8EA-9",
        "descripcion": "Ajuste universal estándar 125cc-250cc",
        "categoria": "Sistema Eléctrico",
        "proveedor": "Importaciones Japón",
        "modelos_compatibles": "Yamaha / Honda / Hero / Pulsar",
        "ubicacion": "Cajón E-02",
        "precio_costo": 14000.0,
        "precio_venta": 24000.0,
        "stock_actual": 3,
        "stock_minimo": 10,
        "clasificacion_abc": "A",
        "dias_sin_movimiento": 2,
        "demanda_estimada": 25,
        "estado": "BAJO_STOCK"
    },
    {
        "id": 5,
        "sku": "FLT-TVS-125",
        "nombre": "Filtro de Aire TVS Raider 125",
        "descripcion": "Filtro de papel plisado alta captación",
        "categoria": "Aceites y Lubricantes",
        "proveedor": "Repuestos Originales del Valle",
        "modelos_compatibles": "TVS Raider 125cc",
        "ubicacion": "Estante A-2",
        "precio_costo": 16000.0,
        "precio_venta": 28000.0,
        "stock_actual": 14,
        "stock_minimo": 6,
        "clasificacion_abc": "A",
        "dias_sin_movimiento": 3,
        "demanda_estimada": 12,
        "estado": "EN_STOCK"
    },
    {
        "id": 6,
        "sku": "FRN-HD-004",
        "nombre": "Banda de Freno Trasera Honda CB125F",
        "descripcion": "Zapatas libres de asbesto",
        "categoria": "Sistema de Frenos",
        "proveedor": "Frenos y Partes de Colombia",
        "modelos_compatibles": "Honda CB125F / CB110",
        "ubicacion": "Estante B-03",
        "precio_costo": 18000.0,
        "precio_venta": 32000.0,
        "stock_actual": 22,
        "stock_minimo": 5,
        "clasificacion_abc": "B",
        "dias_sin_movimiento": 8,
        "demanda_estimada": 8,
        "estado": "EN_STOCK"
    },
    {
        "id": 7,
        "sku": "GUA-UNV-01",
        "nombre": "Cable de Embrague Universal Reforzado",
        "descripcion": "Acero trenzado con forro antifricción",
        "categoria": "Embrague",
        "proveedor": "Repuestos Originales del Valle",
        "modelos_compatibles": "Yamaha, Suzuki, AKT 125",
        "ubicacion": "Gaveta D-08",
        "precio_costo": 9500.0,
        "precio_venta": 18000.0,
        "stock_actual": 35,
        "stock_minimo": 10,
        "clasificacion_abc": "A",
        "dias_sin_movimiento": 1,
        "demanda_estimada": 40,
        "estado": "EN_STOCK"
    },
    {
        "id": 8,
        "sku": "EMB-KYM-125",
        "nombre": "Corona de Embrague Kymco Agility",
        "descripcion": "Campana clutch scooter",
        "categoria": "Embrague",
        "proveedor": "Repuestos Originales del Valle",
        "modelos_compatibles": "Agility RS / Digital 125",
        "ubicacion": "Estante D-01",
        "precio_costo": 125000.0,
        "precio_venta": 180000.0,
        "stock_actual": 1,
        "stock_minimo": 1,
        "clasificacion_abc": "C",
        "dias_sin_movimiento": 95,
        "demanda_estimada": 1,
        "estado": "EN_STOCK"
    },
    {
        "id": 9,
        "sku": "ILU-SZ-250",
        "nombre": "Faro Delantero Completo Suzuki Gixxer 250",
        "descripcion": "Óptica LED completa original carenada",
        "categoria": "Iluminación",
        "proveedor": "Repuestos Originales del Valle",
        "modelos_compatibles": "Suzuki Gixxer 250 SF",
        "ubicacion": "Vitrina Segura 2",
        "precio_costo": 420000.0,
        "precio_venta": 580000.0,
        "stock_actual": 1,
        "stock_minimo": 1,
        "clasificacion_abc": "C",
        "dias_sin_movimiento": 180,
        "demanda_estimada": 0,
        "estado": "EN_STOCK"
    },
    {
        "id": 10,
        "sku": "SUS-YM-025",
        "nombre": "Amortiguador Trasero Monoshock FZ25",
        "descripcion": "Nitrógeno regulable Yamaha",
        "categoria": "Suspensión",
        "proveedor": "Repuestos Andina",
        "modelos_compatibles": "Yamaha FZ 25",
        "ubicacion": "Estante S-05",
        "precio_costo": 310000.0,
        "precio_venta": 440000.0,
        "stock_actual": 1,
        "stock_minimo": 1,
        "clasificacion_abc": "C",
        "dias_sin_movimiento": 120,
        "demanda_estimada": 0,
        "estado": "EN_STOCK"
    },
    {
        "id": 11,
        "sku": "FRN-AX4-BND",
        "nombre": "Bandas de Freno Traseras AX4",
        "descripcion": "Zapatas frenos Suzuki AX4",
        "categoria": "Sistema de Frenos",
        "proveedor": "Frenos y Partes de Colombia",
        "modelos_compatibles": "Suzuki AX4 100cc",
        "ubicacion": "Estante 3B",
        "precio_costo": 15000.0,
        "precio_venta": 28000.0,
        "stock_actual": 6,
        "stock_minimo": 2,
        "clasificacion_abc": "C",
        "dias_sin_movimiento": 75,
        "demanda_estimada": 0,
        "estado": "EN_STOCK"
    },
    {
        "id": 12,
        "sku": "ESP-VINT-CR",
        "nombre": "Espejos Universales Tipo Vintage (Cromados)",
        "descripcion": "Espejos retrovisores cromados redondos",
        "categoria": "Accesorios",
        "proveedor": "Importaciones Japón",
        "modelos_compatibles": "Custom / Cafe Racer",
        "ubicacion": "Vitrina 1",
        "precio_costo": 35000.0,
        "precio_venta": 65000.0,
        "stock_actual": 1,
        "stock_minimo": 1,
        "clasificacion_abc": "C",
        "dias_sin_movimiento": 90,
        "demanda_estimada": 0,
        "estado": "EN_STOCK"
    }
]

CURRENT_BUDGET = {
    "periodo": "Noviembre 2024",
    "disponible_cop": 3500000.0,
    "consumo_asignado_pct": 83.4,
    "costo_sugerido_cop": 2920000.0,
    "margen_seguridad_cop": 580000.0,
    "ahorro_lote_cop": 240000.0
}


# ==============================================================================
# MODELOS PYDANTIC PARA VALIDACIÓN DE ENTRADAS Y SALIDAS
# ==============================================================================
class SimulationRequest(BaseModel):
    presupuesto_cop: float = Field(..., example=2500000.0, description="Monto total del presupuesto en COP")
    periodo: str = Field("next_month", example="next_month", description="next_month | 45_days | next_quarter")
    estrategia: str = Field("clase_a", example="clase_a", description="clase_a | balanceado | minimo_riesgo")

class MovementRequest(BaseModel):
    repuesto_id: int
    tipo: str = Field(..., example="SALIDA", description="ENTRADA o SALIDA")
    cantidad: int = Field(..., gt=0)
    motivo: str = Field(..., example="Mantenimiento preventivo orden #1204")
    orden_servicio_id: Optional[str] = "OT-2024-88"

class PauseSkuRequest(BaseModel):
    repuesto_id: int
    accion: str = "PAUSAR"


# ==============================================================================
# ENDPOINTS REST DE LA APLICACIÓN
# ==============================================================================

@app.get("/")
def read_root():
    return {
        "sistema": "MotoGestión - Prototipo Inteligente de Inventarios y Presupuesto",
        "version": "1.0.0",
        "institucion": "Universidad Cooperativa de Colombia (UCC)",
        "autor": "Jonatan Stiven Ramirez Beltran",
        "endpoints": [
            "/api/dashboard/stats",
            "/api/inventory",
            "/api/simulate",
            "/api/purchases/plan",
            "/api/market/opportunities"
        ]
    }


@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    """
    Retorna los KPIs principales para la pantalla 1 de Stitch (Dashboard):
    - Presupuesto Disponible
    - Valor total inventario
    - Conteo de referencias (Total, OK, Mínimos, Agotados)
    - Alertas de stock crítico
    - Top 5 Mayor Rotación
    - Top 5 Menor Rotación (dormidos) y capital inmovilizado
    """
    total_refs = len(DATABASE_REPUESTOS) + 336  # Contexto Stitch de 348 referencias
    agotados = sum(1 for p in DATABASE_REPUESTOS if p["stock_actual"] == 0)
    bajos = sum(1 for p in DATABASE_REPUESTOS if 0 < p["stock_actual"] <= p["stock_minimo"])
    ok = total_refs - (agotados + bajos)

    # Valor total en stock
    valor_total_cop = sum(p["stock_actual"] * p["precio_costo"] for p in DATABASE_REPUESTOS) + 52000000.0

    # Top 5 mayor rotación
    top_mayor_rotacion = [
        {"nombre": "Aceite Semi-sintético Yamalube 4T", "unidades": 84, "objetivo_rotacion_pct": 95, "etiqueta": "Alta demanda"},
        {"nombre": "Filtro de Aceite Genérico Honda/Yamaha", "unidades": 62, "objetivo_rotacion_pct": 80, "etiqueta": "Frecuencia constante"},
        {"nombre": "Guaya / Cable de Embrague Universal", "unidades": 48, "objetivo_rotacion_pct": 65, "etiqueta": "Reemplazo habitual"},
        {"nombre": "Pastillas de Freno Traseras Pulsar", "unidades": 41, "objetivo_rotacion_pct": 55, "etiqueta": "Servicio de frenos"},
        {"nombre": "Cámara / Neumático Rin 17 (2.75–17)", "unidades": 37, "objetivo_rotacion_pct": 48, "etiqueta": "Rotación estable"}
    ]

    # Top 5 menor rotación (capital inmovilizado)
    top_menor_rotacion = [
        {"nombre": "Faro Delantero Completo Suzuki Gixxer 250", "dias": 180, "capital_inmovilizado_cop": 420000.0, "capital_usd": 145.0, "sugerencia": "Devolución o promo"},
        {"nombre": "CDI Racing Universal 12V", "dias": 145, "capital_inmovilizado_cop": 180000.0, "capital_usd": 60.0, "sugerencia": "Baja compatibilidad local"},
        {"nombre": "Amortiguador Trasero Monoshock FZ25", "dias": 120, "capital_inmovilizado_cop": 310000.0, "capital_usd": 110.0, "sugerencia": "Alto costo unitario"},
        {"nombre": "Llanta Pistera 140/70–17 Michelin Pilot", "dias": 110, "capital_inmovilizado_cop": 270000.0, "capital_usd": 95.0, "sugerencia": "Ofrecer en paquete de cambio"},
        {"nombre": "Corona de Embrague Kymco Agility", "dias": 95, "capital_inmovilizado_cop": 125000.0, "capital_usd": 45.0, "sugerencia": "Lote sobrante anterior"}
    ]

    # Alertas críticas
    alertas_criticas = [
        {
            "sku": p["sku"],
            "nombre": p["nombre"],
            "stock_actual": p["stock_actual"],
            "stock_minimo": p["stock_minimo"],
            "deficit": max(0, p["stock_minimo"] - p["stock_actual"]),
            "proveedor": p["proveedor"],
            "estado": p["estado"]
        }
        for p in DATABASE_REPUESTOS if p["stock_actual"] <= p["stock_minimo"]
    ][:4]

    return {
        "presupuesto_disponible_usd": 4850.00,
        "presupuesto_disponible_cop": 19400000.00,
        "valor_total_inventario_usd": 18920.00,
        "valor_total_inventario_cop": valor_total_cop,
        "referencias_activas": {
            "total": total_refs,
            "ok": ok,
            "minimos": bajos + 20,
            "agotados": agotados + 10
        },
        "alertas_criticas": alertas_criticas,
        "top_mayor_rotacion": top_mayor_rotacion,
        "top_menor_rotacion": top_menor_rotacion,
        "capital_inmovilizado_top5_usd": 455.00,
        "capital_inmovilizado_top5_cop": 1305000.00,
        "consejo_inteligente": "Tienes capital en repuestos estancados por más de 90 días. Crear un paquete de servicio de mantenimiento preventivo podría recuperar este capital este mes."
    }


@app.get("/api/inventory")
def get_inventory(
    search: Optional[str] = Query(None, description="Búsqueda por texto o SKU"),
    clasificacion_abc: Optional[str] = Query(None, description="A | B | C"),
    estado: Optional[str] = Query(None, description="EN_STOCK | BAJO_STOCK | AGOTADO"),
    categoria: Optional[str] = None
):
    """
    Retorna el catálogo de repuestos con sus clasificaciones ABC y ubicaciones.
    Soporta los filtros de la pantalla 2 de Stitch.
    """
    items = DATABASE_REPUESTOS.copy()

    if search:
        s = search.lower()
        items = [i for i in items if s in i["nombre"].lower() or s in i["sku"].lower() or s in i["modelos_compatibles"].lower()]

    if clasificacion_abc and clasificacion_abc != "Todas":
        items = [i for i in items if i["clasificacion_abc"] == clasificacion_abc]

    if estado and estado != "Todos":
        items = [i for i in items if i["estado"] == estado]

    return {
        "valorizacion_stock_cop": 72850000.0,
        "total_referencias": 348,
        "resumen_abc": {
            "clase_a": {"porcentaje_catalogo": "20%", "referencias": 68, "porcentaje_valor": "70% del valor total movilizado"},
            "clase_b": {"porcentaje_catalogo": "30%", "referencias": 104, "porcentaje_valor": "20% del valor total movilizado"},
            "clase_c": {"porcentaje_catalogo": "50%", "referencias": 176, "porcentaje_valor": "10% del valor total en repuestos técnicos"}
        },
        "repuestos": items
    }


@app.post("/api/simulate")
def run_simulation(req: SimulationRequest):
    """
    Ejecuta el motor de simulación predictiva (Pantalla 3 de Stitch):
    Calcula cobertura, riesgo de escasez, capital inmovilizado proyectado,
    curva temporal de 4 semanas con picos de quincena y el plan de compras.
    """
    res = simulate_budget_scenario(
        budget_cop=req.presupuesto_cop,
        products=DATABASE_REPUESTOS,
        period_days=30 if req.periodo == "next_month" else (45 if req.periodo == "45_days" else 90),
        strategy=req.estrategia
    )
    return res


@app.get("/api/purchases/plan")
def get_purchases_plan():
    """
    Retorna los datos para la Pantalla 4 de Stitch (Gestión Presupuestal y Órdenes de Compra):
    - 4 métricas financieras
    - Lista sugerida de compras por rotación
    - Oportunidades de nuevos productos
    - Repuestos a descontinuar o pausar
    """
    ops = analyze_portfolio_opportunities(DATABASE_REPUESTOS)
    return {
        "metricas_financieras": CURRENT_BUDGET,
        "repuestos_sugeridos": [
            {
                "id": 1,
                "sku": "10W40-MSM",
                "nombre": "Aceite Semisintético 4T 10W-40",
                "detalle": "Mobil Super Moto • Garrafa 1L • Ref: 10W40-MSM",
                "clasificacion": "Clase A - Alta",
                "stock_actual": 2,
                "stock_minimo": 8,
                "cantidad_sugerida": 18,
                "unidad": "unidades",
                "proveedor": "Distribuidora MotoLube SAS",
                "tiempo_entrega": "24h",
                "costo_unitario": 26666.0,
                "costo_total": 480000.0,
                "aprobado": True
            },
            {
                "id": 2,
                "sku": "FRN-YM-CER",
                "nombre": "Pastillas de Freno Delanteras Cerámicas",
                "detalle": "Yamaha FZ 16 / Pulsar NS200 • Ichimax Racing",
                "clasificacion": "Clase A - Alta",
                "stock_actual": 1,
                "stock_minimo": 6,
                "cantidad_sugerida": 12,
                "unidad": "juegos",
                "proveedor": "Frenos y Partes de Colombia",
                "tiempo_entrega": "48h",
                "costo_unitario": 30000.0,
                "costo_total": 360000.0,
                "aprobado": True
            },
            {
                "id": 3,
                "sku": "TRM-BJ-428",
                "nombre": "Kit de Arrastre Reforzado 428H",
                "detalle": "KMC / Piñón y Corona Acero 1045 • Universal 125-150cc",
                "clasificacion": "Clase B - Media",
                "stock_actual": 0,
                "stock_minimo": 4,
                "cantidad_sugerida": 5,
                "unidad": "kits",
                "proveedor": "Importadora de Cadenas Andina",
                "tiempo_entrega": "Inmediata",
                "costo_unitario": 110000.0,
                "costo_total": 550000.0,
                "aprobado": True
            },
            {
                "id": 4,
                "sku": "FLT-OEM-GIX",
                "nombre": "Filtro de Aceite Original Sellado",
                "detalle": "Suzuki Gixxer 150 / 250 / GSX • OEM 16510-05240",
                "clasificacion": "Clase A - Alta",
                "stock_actual": 3,
                "stock_minimo": 10,
                "cantidad_sugerida": 15,
                "unidad": "unidades",
                "proveedor": "Repuestos Originales del Valle",
                "tiempo_entrega": "24h",
                "costo_unitario": 12000.0,
                "costo_total": 180000.0,
                "aprobado": True
            }
        ],
        "oportunidades": ops["nuevas_oportunidades"],
        "descontinuar": ops["productos_descontinuar"]
    }


@app.post("/api/inventory/movement")
def register_movement(req: MovementRequest):
    """
    Registra entrada o salida física de inventario para actualizar stock y rotación.
    """
    for p in DATABASE_REPUESTOS:
        if p["id"] == req.repuesto_id:
            if req.tipo == "SALIDA":
                if p["stock_actual"] < req.cantidad:
                    raise HTTPException(status_code=400, detail=f"Stock insuficiente ({p['stock_actual']} u.) para salida de {req.cantidad} u.")
                p["stock_actual"] -= req.cantidad
                p["dias_sin_movimiento"] = 0
            else:
                p["stock_actual"] += req.cantidad

            # Actualizar estado de stock
            if p["stock_actual"] == 0:
                p["estado"] = "AGOTADO"
            elif p["stock_actual"] <= p["stock_minimo"]:
                p["estado"] = "BAJO_STOCK"
            else:
                p["estado"] = "EN_STOCK"

            return {
                "mensaje": "Movimiento registrado exitosamente",
                "repuesto": p["nombre"],
                "nuevo_stock": p["stock_actual"],
                "estado": p["estado"]
            }

    raise HTTPException(status_code=404, detail="Repuesto no encontrado")


@app.post("/api/products/pause-sku")
def pause_sku(req: PauseSkuRequest):
    """
    Pausa un SKU descontinuado para evitar órdenes automáticas de compra.
    """
    for p in DATABASE_REPUESTOS:
        if p["id"] == req.repuesto_id:
            p["estado"] = "PAUSADO"
            return {"mensaje": f"SKU {p['sku']} pausado correctamente.", "repuesto": p["nombre"]}
    raise HTTPException(status_code=404, detail="Repuesto no encontrado")
