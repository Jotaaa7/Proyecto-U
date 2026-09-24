# MotoGestión - Backend & Módulo de Inteligencia de Inventarios

Sistema inteligente para la gestión, pronóstico y simulación de inventarios con control presupuestal en talleres pequeños de motocicletas. Basado en la investigación aplicada de **Jonatan Stiven Ramirez Beltran** (Universidad Cooperativa de Colombia - 2026).

---

## 1. Estructura de Carpetas del Proyecto

```text
motogestion/
├── backend/
│   ├── database.sql           # Script DDL completo de base de datos relacional y datos semilla
│   ├── inventory_ai.py        # Módulo científico (ABC Pareto, EOQ, Regresión, Simulación Montecarlo)
│   ├── main.py                # Servidor FastAPI con los endpoints REST requeridos por Stitch
│   ├── requirements.txt       # Dependencias de Python (FastAPI, Pandas, NumPy, Scikit-learn)
│   └── README.md              # Documentación de instalación y endpoints
├── frontend/                  # Interfaz exportada de Stitch adaptada a React / Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardView.tsx
│   │   │   ├── InventoryView.tsx
│   │   │   ├── SimulationView.tsx
│   │   │   ├── PurchasesBudgetView.tsx
│   │   │   └── BackendDevHubView.tsx
│   │   ├── services/
│   │   │   └── api.ts         # Cliente Axios / Fetch que consume los endpoints
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
```

---

## 2. Instalación y Puesta en Marcha del Backend

### Paso 1: Crear y activar un entorno virtual de Python
```bash
cd backend
python -m venv venv

# En Linux / macOS:
source venv/bin/activate

# En Windows:
venv\Scripts\activate
```

### Paso 2: Instalar las dependencias
```bash
pip install -r requirements.txt
```

### Paso 3: Configurar la Base de Datos Relacional
Si utilizas **PostgreSQL**:
```bash
# Crear base de datos
createdb -U postgres motogestion_db

# Ejecutar el script SQL con tablas, vistas e índices
psql -U postgres -d motogestion_db -f database.sql
```

### Paso 4: Iniciar el servidor FastAPI
```bash
uvicorn main:app --reload --port 8000
```
La documentación interactiva Swagger estará disponible inmediatamente en:
`http://localhost:8000/docs`

---

## 3. Conexión del Frontend de Stitch con el Backend

En el frontend, configura la variable de entorno en tu archivo `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Mapeo de Endpoints con Pantallas de Stitch:
1. **Pantalla 1: Dashboard (`/dashboard`)**
   - `GET /api/dashboard/stats` → Carga presupuesto, valor del inventario, alertas de stock crítico y Top 5 mayor/menor rotación con capital dormido.
2. **Pantalla 2: Inventario (`/inventario`)**
   - `GET /api/inventory?search=...&clasificacion_abc=...&estado=...` → Carga listado con paginación y distribución ABC.
   - `POST /api/inventory/movement` → Registra entradas/salidas (modal `+ Entrada / Salida`).
3. **Pantalla 3: Simulación / Pronósticos (`/simulacion-pronosticos`)**
   - `POST /api/simulate` → Envía `{ presupuesto_cop: 2500000, periodo: "next_month", estrategia: "clase_a" }` y recibe la cobertura esperada (94%), riesgo de escasez (2 repuestos), capital inmovilizado y serie temporal de 4 semanas.
4. **Pantalla 4: Compras / Presupuesto (`/compras-presupuesto`)**
   - `GET /api/purchases/plan` → Trae sugerencias de compras calculadas por rotación, oportunidades de mercado y repuestos a descontinuar.
   - `POST /api/products/pause-sku` → Pausa repuestos inmovilizados sin rotación.
