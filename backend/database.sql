-- ============================================================================
-- PROYECTO: MotoGestión - Sistema Inteligente de Inventarios y Presupuesto
-- BASADO EN: Proyecto 4 UCC - Centros de Servicio Técnico Multimarca para Motos
-- AUTOR: Jonatan Stiven Ramirez Beltran / Jonatan Stiven
-- MOTOR RECOMENDADO: PostgreSQL 14+ / MySQL 8.0+ / SQLite 3
-- ============================================================================

-- Eliminar tablas en orden si ya existen (para entornos de pruebas)
DROP TABLE IF EXISTS ordenes_compra_items CASCADE;
DROP TABLE IF EXISTS ordenes_compra CASCADE;
DROP TABLE IF EXISTS alertas_inventario CASCADE;
DROP TABLE IF EXISTS oportunidades_mercado CASCADE;
DROP TABLE IF EXISTS historial_movimientos CASCADE;
DROP TABLE IF EXISTS presupuestos CASCADE;
DROP TABLE IF EXISTS repuestos CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS talleres CASCADE;

-- ----------------------------------------------------------------------------
-- 1. TABLA: TALLERES (Configuración del Taller)
-- ----------------------------------------------------------------------------
CREATE TABLE talleres (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL DEFAULT 'Taller Central - Box 1',
    nit_rut VARCHAR(30) UNIQUE,
    ciudad VARCHAR(60) DEFAULT 'Bogotá',
    direccion VARCHAR(180),
    telefono VARCHAR(30),
    moneda_defecto VARCHAR(10) DEFAULT 'COP',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. TABLA: CATEGORIAS DE REPUESTOS
-- ----------------------------------------------------------------------------
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT
);

-- ----------------------------------------------------------------------------
-- 3. TABLA: PROVEEDORES HABITUALES
-- ----------------------------------------------------------------------------
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    contacto VARCHAR(80),
    telefono VARCHAR(30),
    email VARCHAR(100),
    lead_time_dias INT DEFAULT 2, -- Tiempo promedio de entrega en días (L)
    descuento_volumen_pct NUMERIC(5, 2) DEFAULT 0.00,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. TABLA: REPUESTOS (Catálogo, Stock, Ubicación física y Clasificación ABC)
-- ----------------------------------------------------------------------------
CREATE TABLE repuestos (
    id SERIAL PRIMARY KEY,
    taller_id INT REFERENCES talleres(id) ON DELETE CASCADE,
    categoria_id INT REFERENCES categorias(id),
    proveedor_id INT REFERENCES proveedores(id),
    sku VARCHAR(40) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    modelos_compatibles TEXT, -- Ej: Pulsar NS200, Yamaha FZ16, Gixxer 250
    ubicacion_almacen VARCHAR(50), -- Ej: Estante A-2, Cajón F-01, Bodega L-12
    precio_costo NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    precio_venta NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5, -- Nivel mínimo de reorden (ROP)
    stock_seguridad INT NOT NULL DEFAULT 2, -- Stock de protección ante varianza (SS)
    stock_maximo INT NOT NULL DEFAULT 30,
    clasificacion_abc CHAR(1) NOT NULL DEFAULT 'C' CHECK (clasificacion_abc IN ('A', 'B', 'C')),
    tasa_rotacion_mensual NUMERIC(6, 2) DEFAULT 0.00, -- Índice de rotación
    dias_sin_movimiento INT DEFAULT 0, -- Identificador de capital inmovilizado
    costo_pedido_fijo NUMERIC(10, 2) DEFAULT 15000.00, -- Costo de ordenar S para EOQ
    costo_mantenimiento_pct NUMERIC(5, 2) DEFAULT 0.20, -- Tasa de posesión H (20% anual)
    estado VARCHAR(20) DEFAULT 'EN_STOCK' CHECK (estado IN ('EN_STOCK', 'BAJO_STOCK', 'AGOTADO', 'PAUSADO')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices estratégicos para búsquedas rápidas y cálculo de Pareto ABC
CREATE INDEX idx_repuestos_sku ON repuestos(sku);
CREATE INDEX idx_repuestos_abc ON repuestos(clasificacion_abc);
CREATE INDEX idx_repuestos_estado ON repuestos(estado);
CREATE INDEX idx_repuestos_dias_inactivo ON repuestos(dias_sin_movimiento);

-- ----------------------------------------------------------------------------
-- 5. TABLA: HISTORIAL_MOVIMIENTOS (Entradas, Salidas de taller y Ajustes)
-- ----------------------------------------------------------------------------
CREATE TABLE historial_movimientos (
    id BIGSERIAL PRIMARY KEY,
    repuesto_id INT NOT NULL REFERENCES repuestos(id) ON DELETE CASCADE,
    tipo_movimiento VARCHAR(15) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO')),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    stock_anterior INT NOT NULL,
    stock_resultante INT NOT NULL,
    costo_unitario_momento NUMERIC(12, 2) NOT NULL,
    precio_venta_momento NUMERIC(12, 2) DEFAULT 0.00,
    motivo VARCHAR(100), -- Ej: 'Mantenimiento Preventivo', 'Venta mostrador', 'Compra factura #104'
    orden_servicio_id VARCHAR(50), -- Código de orden de trabajo mecánica
    usuario_registro VARCHAR(80) DEFAULT 'Carlos Mendoza',
    fecha_movimiento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_movimientos_repuesto_fecha ON historial_movimientos(repuesto_id, fecha_movimiento);
CREATE INDEX idx_movimientos_tipo ON historial_movimientos(tipo_movimiento);

-- ----------------------------------------------------------------------------
-- 6. TABLA: PRESUPUESTOS (Control presupuestal mensual y límites de compra)
-- ----------------------------------------------------------------------------
CREATE TABLE presupuestos (
    id SERIAL PRIMARY KEY,
    taller_id INT REFERENCES talleres(id) ON DELETE CASCADE,
    periodo_mes_anio VARCHAR(7) NOT NULL, -- Formato: '2024-11'
    monto_total_disponible NUMERIC(14, 2) NOT NULL,
    monto_comprometido NUMERIC(14, 2) DEFAULT 0.00,
    margen_seguridad_reserva NUMERIC(14, 2) DEFAULT 0.00,
    porcentaje_consumido NUMERIC(5, 2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'CERRADO', 'EXCEDIDO')),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 7. TABLA: ORDENES_COMPRA Y DETALLES (Sugeridas por IA vs Aprobadas)
-- ----------------------------------------------------------------------------
CREATE TABLE ordenes_compra (
    id SERIAL PRIMARY KEY,
    taller_id INT REFERENCES talleres(id),
    presupuesto_id INT REFERENCES presupuestos(id),
    codigo_orden VARCHAR(30) UNIQUE NOT NULL,
    monto_total NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    ahorro_estimado_lote NUMERIC(12, 2) DEFAULT 0.00,
    cobertura_demanda_pct NUMERIC(5, 2) DEFAULT 0.00,
    estado VARCHAR(25) DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'APROBADA', 'EN_TRANSITO', 'RECIBIDA', 'CANCELADA')),
    observaciones TEXT,
    creado_por VARCHAR(80) DEFAULT 'Algoritmo Sugerido MotoGestión',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ordenes_compra_items (
    id BIGSERIAL PRIMARY KEY,
    orden_compra_id INT NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    repuesto_id INT NOT NULL REFERENCES repuestos(id),
    cantidad_sugerida INT NOT NULL,
    cantidad_aprobada INT NOT NULL,
    costo_unitario NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL,
    clasificacion_abc_momento CHAR(1) NOT NULL,
    justificacion_modelo TEXT,
    seleccionado BOOLEAN DEFAULT TRUE
);

-- ----------------------------------------------------------------------------
-- 8. TABLA: OPORTUNIDADES_MERCADO (Nuevos productos & Descontinuar/Pausar)
-- ----------------------------------------------------------------------------
CREATE TABLE oportunidades_mercado (
    id SERIAL PRIMARY KEY,
    taller_id INT REFERENCES talleres(id),
    tipo_oportunidad VARCHAR(25) NOT NULL CHECK (tipo_oportunidad IN ('NUEVO_PRODUCTO', 'DESCONTINUAR_PAUSAR', 'OFERTA_LIQUIDACION')),
    titulo VARCHAR(120) NOT NULL,
    descripcion TEXT NOT NULL,
    repuesto_relacionado_id INT REFERENCES repuestos(id) ON DELETE SET NULL,
    demanda_observada_tendencia VARCHAR(50), -- Ej: '+38% demanda', '0 salidas / 75 días'
    capital_inmovilizado_afectado NUMERIC(12, 2) DEFAULT 0.00,
    costo_pack_sugerido NUMERIC(12, 2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'AGREGADO_PEDIDO', 'SKU_PAUSADO', 'DESCARTADO')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VISTAS ANALÍTICAS PARA TOMA DE DECISIONES BASADA EN DATOS
-- ============================================================================

-- Vista: Resumen de Rotación y Clasificación de Repuestos (Últimos 90 días)
CREATE OR REPLACE VIEW vista_rotacion_repuestos AS
SELECT 
    r.id AS repuesto_id,
    r.sku,
    r.nombre,
    r.ubicacion_almacen,
    r.stock_actual,
    r.stock_minimo,
    r.precio_costo,
    r.precio_venta,
    (r.stock_actual * r.precio_costo) AS valor_stock_costo,
    COALESCE(SUM(CASE WHEN hm.tipo_movimiento = 'SALIDA' THEN hm.cantidad ELSE 0 END), 0) AS unidades_vendidas_90d,
    COALESCE(SUM(CASE WHEN hm.tipo_movimiento = 'SALIDA' THEN hm.cantidad * hm.costo_unitario_momento ELSE 0 END), 0) AS costo_mercancia_salida_90d,
    r.clasificacion_abc,
    r.dias_sin_movimiento,
    CASE 
        WHEN r.stock_actual = 0 THEN 'AGOTADO'
        WHEN r.stock_actual <= r.stock_minimo THEN 'BAJO_STOCK'
        ELSE 'EN_STOCK'
    END AS estado_operativo
FROM repuestos r
LEFT JOIN historial_movimientos hm ON r.id = hm.repuesto_id 
    AND hm.fecha_movimiento >= CURRENT_TIMESTAMP - INTERVAL '90 days'
GROUP BY r.id, r.sku, r.nombre, r.ubicacion_almacen, r.stock_actual, r.stock_minimo, r.precio_costo, r.precio_venta, r.clasificacion_abc, r.dias_sin_movimiento;

-- Vista: Capital Inmovilizado Crítico (>75 días sin ventas)
CREATE OR REPLACE VIEW vista_capital_inmovilizado AS
SELECT 
    r.id,
    r.sku,
    r.nombre,
    r.ubicacion_almacen,
    r.stock_actual,
    r.precio_costo,
    (r.stock_actual * r.precio_costo) AS capital_congelado_cop,
    r.dias_sin_movimiento,
    r.clasificacion_abc
FROM repuestos r
WHERE r.stock_actual > 0 AND r.dias_sin_movimiento >= 75
ORDER BY capital_congelado_cop DESC;

-- ============================================================================
-- DATOS SEMILLA (SEED DATA) BASADOS EN EL CONTEXTO DEL PROYECTO 4 UCC
-- ============================================================================
INSERT INTO talleres (id, nombre, nit_rut, ciudad) 
VALUES (1, 'Taller Central - Box 1 (MotoGestión)', '901.458.912-3', 'Bogotá');

INSERT INTO categorias (id, codigo, nombre, descripcion) VALUES
(1, 'LUB', 'Aceites y Lubricantes', 'Aceites 4T minerales, semisintéticos y 100% sintéticos'),
(2, 'FRN', 'Sistema de Frenos', 'Pastillas, bandas, bombas, mordazas y discos'),
(3, 'TRM', 'Transmisión y Arrastre', 'Cadenas, piñones, coronas y kits reforzados 428H/520'),
(4, 'ELE', 'Sistema Eléctrico y Encendido', 'Bujías, bobinas, CDI, reguladores y bombillos'),
(5, 'EMB', 'Embrague y Cables', 'Discos de clutch, guayas y coronas'),
(6, 'ILU', 'Iluminación y Carenajes', 'Farolas, stops, direccionales y tapas'),
(7, 'SUS', 'Suspensión y Llantas', 'Monoshocks, barras, retenedores y llantas');

INSERT INTO proveedores (id, nombre, contacto, telefono, lead_time_dias, descuento_volumen_pct) VALUES
(1, 'Distribuidora MotoLube SAS', 'Andrés Suárez', '3104567890', 1, 5.0),
(2, 'Frenos y Partes de Colombia', 'Claudia Morales', '3157891234', 2, 4.5),
(3, 'Importadora de Cadenas Andina', 'Guillermo Peña', '3209876543', 1, 6.0),
(4, 'Repuestos Originales del Valle', 'Rodrigo Díaz', '3123456789', 1, 3.5),
(5, 'Importaciones Japón MotoParts', 'Kenji Takahashi', '3116543210', 3, 5.0);

-- Inserción de Repuestos Clave con clasificación ABC y Ubicaciones de Stitch
INSERT INTO repuestos (id, taller_id, categoria_id, proveedor_id, sku, nombre, descripcion, modelos_compatibles, ubicacion_almacen, precio_costo, precio_venta, stock_actual, stock_minimo, stock_seguridad, clasificacion_abc, dias_sin_movimiento, estado) VALUES
-- CLASE A: ALTA ROTACIÓN
(1, 1, 1, 1, 'LUB-MO-710', 'Aceite Motul 7100 4T 10W40 1L', 'Sintético 100% Ester alto desempeño', 'Yamaha, Honda, KTM, Pulsar', 'Bodega L-12', 48000.00, 68000.00, 2, 12, 4, 'A', 1, 'BAJO_STOCK'),
(2, 1, 2, 2, 'FRN-YM-012', 'Pastillas de Freno Delanteras Yamaha FZ / R15', 'Pastillas sinterizadas cerámicas de alta durabilidad', 'Yamaha FZ 2.0 / R15 V3', 'Cajón F-01', 28000.00, 42000.00, 0, 8, 3, 'A', 0, 'AGOTADO'),
(3, 1, 4, 5, 'ELE-NG-8EA', 'Bujía NGK CPR8EA-9', 'Bujía estándar cobre rosca corta universal', 'Universal Yamaha / Honda / Hero / Pulsar', 'Cajón E-02', 14000.00, 24000.00, 3, 10, 4, 'A', 2, 'BAJO_STOCK'),
(4, 1, 1, 1, 'LUB-10W40-MSM', 'Aceite Semisintético Yamalube / Mobil 4T 10W-40', 'Garrafa 1L para mantenimiento periódico', 'Yamaha Crypton, FZ, Pulsar 180', 'Bodega L-10', 26666.00, 38000.00, 4, 15, 5, 'A', 0, 'BAJO_STOCK'),
(5, 1, 1, 4, 'FLT-OEM-16510', 'Filtro de Aceite Original Sellado Gixxer', 'OEM 16510-05240 cartucho metálico', 'Suzuki Gixxer 150 / 250 / GSX', 'Estante B-01', 12000.00, 22000.00, 3, 10, 3, 'A', 1, 'BAJO_STOCK'),
(6, 1, 5, 4, 'GUA-UNV-01', 'Cable de Embrague Universal Reforzado', 'Acero trenzado con forro antifricción', 'Yamaha, Suzuki, AKT 125, Pulsar', 'Gaveta D-08', 9500.00, 18000.00, 35, 10, 3, 'A', 1, 'EN_STOCK'),
(7, 1, 1, 4, 'FLT-TVS-125', 'Filtro de Aire TVS Raider 125', 'Filtro de papel plisado alta captación', 'TVS Raider 125cc', 'Estante A-2', 16000.00, 28000.00, 14, 6, 2, 'A', 3, 'EN_STOCK'),

-- CLASE B: MEDIA ROTACIÓN
(8, 1, 3, 3, 'TRM-BJ-428', 'Kit de Arrastre Reforzado 428H Pulsar 200NS', 'Corona, piñón y cadena O-ring dorada KMC', 'Bajaj Pulsar NS200 / AS200', 'Estante C-04', 110000.00, 145000.00, 1, 4, 1, 'B', 4, 'BAJO_STOCK'),
(9, 1, 2, 2, 'FRN-HD-004', 'Banda de Freno Trasera Honda CB125F', 'Zapatas libres de asbesto', 'Honda CB125F / CB110', 'Estante B-03', 18000.00, 32000.00, 22, 5, 2, 'B', 8, 'EN_STOCK'),
(10, 1, 2, 2, 'FRN-PUL-PST', 'Pastillas de Freno Traseras Pulsar', 'Compuesto semi-metálico', 'Pulsar 180 / 200 / 220', 'Cajón F-04', 16000.00, 29000.00, 12, 5, 2, 'B', 5, 'EN_STOCK'),
(11, 1, 7, 3, 'CAM-RIN17-275', 'Cámara / Neumático Rin 17 (2.75-17)', 'Caucho butilo sellado reforzado', 'Universal Rin 17', 'Bodega P-02', 14000.00, 26000.00, 18, 6, 2, 'B', 6, 'EN_STOCK'),

-- CLASE C: BAJA ROTACIÓN O CAPITAL INMOVILIZADO (>75 DÍAS)
(12, 1, 6, 4, 'ILU-SZ-250', 'Faro Delantero Completo Suzuki Gixxer 250', 'Óptica LED completa original carenada', 'Suzuki Gixxer 250 SF', 'Vitrina Segura 2', 420000.00, 580000.00, 1, 1, 0, 'C', 180, 'EN_STOCK'),
(13, 1, 4, 5, 'ELE-CDI-RACE', 'CDI Racing Universal 12V con Mapeo Variable', 'Módulo de encendido deportivo', 'Motos 125-200cc chinas/indias', 'Estante E-05', 180000.00, 260000.00, 1, 1, 0, 'C', 145, 'EN_STOCK'),
(14, 1, 7, 4, 'SUS-YM-025', 'Amortiguador Trasero Monoshock FZ25', 'Nitrógeno regulable gas Yamaha', 'Yamaha FZ 25', 'Estante S-05', 310000.00, 440000.00, 1, 1, 0, 'C', 120, 'EN_STOCK'),
(15, 1, 7, 1, 'LLT-MICH-140', 'Llanta Pistera 140/70-17 Michelin Pilot', 'Compuesto doble sílice deportivo', 'Yamaha R3 / MT03 / Gixxer 250', 'Bodega Llantas', 270000.00, 395000.00, 1, 1, 0, 'C', 110, 'EN_STOCK'),
(16, 1, 5, 4, 'EMB-KYM-125', 'Corona de Embrague Kymco Agility', 'Campana clutch scooter', 'Agility RS / Digital 125', 'Estante D-01', 125000.00, 180000.00, 1, 1, 0, 'C', 95, 'EN_STOCK'),
(17, 1, 2, 2, 'FRN-AX4-BND', 'Bandas de Freno Traseras Suzuki AX4', 'Zapatas mecánicas pequeñas', 'Suzuki AX4 100cc', 'Estante 3B', 15000.00, 28000.00, 6, 2, 0, 'C', 75, 'EN_STOCK'),
(18, 1, 6, 5, 'ESP-VINT-CR', 'Espejos Universales Tipo Vintage Cromados', 'Par espejos redondos retro 10mm', 'Custom / Cafe Racer', 'Vitrina 1', 35000.00, 65000.00, 1, 1, 0, 'C', 90, 'EN_STOCK');

-- Presupuesto Semilla Noviembre 2024
INSERT INTO presupuestos (id, taller_id, periodo_mes_anio, monto_total_disponible, monto_comprometido, margen_seguridad_reserva, porcentaje_consumido, estado)
VALUES (1, 1, '2024-11', 3500000.00, 2920000.00, 580000.00, 83.43, 'ACTIVO');

-- Oportunidades de Mercado Semilla
INSERT INTO oportunidades_mercado (taller_id, tipo_oportunidad, titulo, descripcion, demanda_observada_tendencia, capital_inmovilizado_afectado, costo_pack_sugerido, estado) VALUES
(1, 'NUEVO_PRODUCTO', 'Líquido de Frenos DOT 4 Racing (250ml)', 'Alta solicitud en los últimos 28 mantenimientos de frenos. Proyección de margen neto 45% frente a convencional.', '+38% demanda', 0, 95000.00, 'PENDIENTE'),
(1, 'NUEVO_PRODUCTO', 'Bombillos LED H4 Alta Potencia (Canbus)', '7 de cada 10 motociclistas urbanos consultan por actualización de farola delantera. Rotación estimada en 14 días.', 'Tendencia urbana', 0, 140000.00, 'PENDIENTE'),
(1, 'DESCONTINUAR_PAUSAR', 'Bandas de Freno Traseras AX4', 'Stock actual: 6 unidades inmovilizadas en estante 3B ($ 90.000 COP congelados). Modelo desfasado en parque activo.', '0 salidas / 75 días', 90000.00, 0, 'PENDIENTE'),
(1, 'DESCONTINUAR_PAUSAR', 'Espejos Universales Tipo Vintage (Cromados)', 'Solo 1 unidad vendida en 90 días. Riesgo de rayones y deterioro de empaque en vitrina de taller.', 'Clase C - Muy Baja', 35000.00, 0, 'PENDIENTE');
