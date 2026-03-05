# Estrategia de Pricing: Cadena de Tiendas para Mascotas (Uruguay)

## Perfil del Cliente

| Concepto | Detalle |
|----------|---------|
| **Tipo de empresa** | Cadena de tiendas para mascotas |
| **Sucursales** | 6+ |
| **Volumen mensual** | 200+ facturas/mes |
| **Sistema contable** | Memory Siigo (sin API, sin ingreso por lotes) |
| **Integración requerida** | RPA totalmente personalizada |
| **Personalización extra** | Mapeo de productos uno a uno (nombres distintos entre facturas y sistema contable) |
| **País** | Uruguay |

---

## Analisis de Complejidad

### Por que este caso es de alta complejidad

1. **Memory Siigo sin API**: A diferencia de sistemas con API REST, Memory Siigo solo permite ingreso manual por interfaz grafica. Esto obliga a una solucion RPA pura (Playwright) que es inherentemente mas fragil y costosa de mantener.

2. **Sin ingreso por lotes**: No hay forma de importar facturas en batch via CSV/XML, lo que significa que cada factura debe ser ingresada una por una mediante automatizacion del navegador.

3. **Mapeo de productos personalizado**: Los productos en las facturas de proveedores tienen nombres distintos a los registrados en Memory Siigo. Esto requiere:
   - Relevamiento inicial del catalogo completo del cliente en Memory Siigo
   - Creacion de una tabla de equivalencias producto por producto
   - Logica de matching fuzzy + tabla de mapeo exacto
   - Mantenimiento continuo cuando se agreguen productos nuevos

4. **6+ sucursales**: Multiplica la complejidad del RPA (posibles variaciones por sucursal, diferentes proveedores, diferentes catalogos de productos).

5. **200+ facturas/mes**: Volumen que justifica la automatizacion pero que tambien genera carga significativa en el RPA.

---

## Desglose de Horas de Implementacion

### Fase 1: Setup y Configuracion Base (40-50 horas)

| Tarea | Horas |
|-------|-------|
| Despliegue de plataforma BlueBlinq para el cliente | 8 |
| Configuracion multi-sucursal (6 empresas/sucursales) | 6 |
| Configuracion de usuarios y roles por sucursal | 4 |
| Entrenamiento del modelo de extraccion para facturas de mascotas | 10 |
| Fine-tuning de clasificacion IVA para productos de mascotas | 8 |
| Testing y QA de extraccion | 6 |
| **Subtotal** | **42 horas** |

### Fase 2: RPA Memory Siigo (80-100 horas)

| Tarea | Horas |
|-------|-------|
| Analisis de la interfaz de Memory Siigo del cliente | 8 |
| Desarrollo del flujo de login y navegacion | 12 |
| Desarrollo del ingreso de factura (cabezal) | 16 |
| Desarrollo del ingreso de lineas de factura (detalle) | 20 |
| Manejo de errores, reintentos y validaciones | 12 |
| Screenshots y logging para auditoria | 8 |
| Testing con facturas reales en ambiente de prueba | 16 |
| **Subtotal** | **92 horas** |

### Fase 3: Mapeo de Productos Personalizado (30-50 horas)

| Tarea | Horas |
|-------|-------|
| Relevamiento del catalogo de productos en Memory Siigo | 8 |
| Creacion de tabla de equivalencias (estimando 300-500 productos) | 16 |
| Desarrollo de logica de matching (exacto + fuzzy) | 10 |
| Interfaz para que el cliente gestione mapeos nuevos | 8 |
| Testing y validacion con facturas reales | 6 |
| **Subtotal** | **48 horas** |

### Fase 4: Capacitacion y Puesta en Marcha (15-20 horas)

| Tarea | Horas |
|-------|-------|
| Capacitacion a contadores/administrativos | 6 |
| Periodo de acompanamiento (2 semanas en paralelo) | 8 |
| Documentacion operativa para el cliente | 4 |
| **Subtotal** | **18 horas** |

### Total Implementacion: 180-210 horas

---

## Pricing Recomendado

### Opcion A: Proyecto Llave en Mano + Mantenimiento Mensual (RECOMENDADA)

#### Implementacion (pago unico)

| Concepto | USD |
|----------|-----|
| Implementacion completa (Fases 1-4) | **$8,500 - $10,500** |
| Margen de contingencia (15%) | $1,275 - $1,575 |
| **Total implementacion** | **$9,775 - $12,075** |

> **Precio sugerido de venta: USD $10,000 - $12,000**

Justificacion:
- ~200 horas a USD $50/hora promedio (tarifa competitiva para Uruguay)
- Incluye contingencia porque Memory Siigo sin API es impredecible
- Comparable a lo que cobraria un integrador de ERP en Uruguay

#### Mantenimiento Mensual

| Concepto | USD/mes |
|----------|---------|
| Hosting e infraestructura (Neon DB, Vercel/VPS) | $50 - $80 |
| Costo de OpenAI (200 facturas x GPT-4o Vision) | $30 - $50 |
| Soporte tecnico (8 horas/mes incluidas) | $200 |
| Mantenimiento RPA (actualizaciones Memory Siigo) | $150 |
| Actualizacion de mapeo de productos (nuevos productos) | $70 |
| **Total mantenimiento** | **$500 - $550/mes** |

> **Precio sugerido de mantenimiento: USD $550 - $650/mes**

Justificacion:
- El RPA se rompe cada vez que Memory Siigo actualiza su interfaz (esto es CRITICO)
- Los productos nuevos requieren mapeo continuo
- 200 facturas/mes generan costo real de AI
- Soporte tecnico es esencial para una operacion de 6 sucursales

---

### Opcion B: SaaS Mensual Todo Incluido

| Concepto | USD/mes |
|----------|---------|
| Setup inicial (amortizado a 12 meses) | $900 |
| Plataforma + AI + RPA + soporte | $550 |
| **Total mensual (primeros 12 meses)** | **$1,450/mes** |
| **Total mensual (a partir del mes 13)** | **$650/mes** |

> Esta opcion es atractiva si el cliente prefiere no pagar un monto grande inicial.
> Compromiso minimo recomendado: **12 meses**

---

### Opcion C: Por Factura Procesada

| Volumen | Precio por factura |
|---------|--------------------|
| Setup inicial (unico) | **$6,000** |
| Primeras 200 facturas/mes | USD $3.50 por factura |
| Facturas adicionales | USD $2.50 por factura |
| **Estimado mensual (200 facturas)** | **$700/mes** |

> Esta opcion alinea el costo con el volumen real del cliente.
> Incluye un techo mensual para proteger al cliente.

---

## Comparacion con Alternativas del Mercado

| Alternativa | Costo estimado | Desventajas |
|-------------|----------------|-------------|
| Empleado dedicado a ingreso manual | USD $800-1,200/mes (salario Uruguay) | Error humano, no escala, rotacion de personal |
| Integrador de ERP generico | USD $15,000-25,000 implementacion | No especializado en facturacion, tiempos largos |
| Desarrollo a medida desde cero | USD $20,000-40,000 | Riesgo tecnico alto, sin plataforma probada |
| **BlueBlinq (tu solucion)** | **USD $10,000 + $600/mes** | Ya existe la base, se personaliza |

### Argumento de venta clave

> "Con 200 facturas mensuales ingresadas manualmente, un empleado dedica aproximadamente **40-60 horas/mes** solo a tipear facturas. A un costo laboral de USD $8-10/hora en Uruguay, eso son **USD $400-600/mes solo en mano de obra**, sin contar errores, re-trabajo, y el costo de oportunidad. BlueBlinq elimina eso por un costo comparable, con **cero errores de tipeo** y **trazabilidad completa**."

---

## Recomendacion Final

### Para este cliente especifico, recomiendo la **Opcion A**:

| | |
|--|--|
| **Implementacion** | **USD $10,000** (pago unico, puede ser en 2-3 cuotas) |
| **Mantenimiento mensual** | **USD $600/mes** (contrato minimo 12 meses) |
| **Ingreso anual total** | **USD $10,000 + $7,200 = $17,200 primer ano** |
| **Ingreso anual recurrente** | **$7,200/ano (a partir del segundo ano)** |

### Condiciones sugeridas

1. **Contrato minimo**: 12 meses de mantenimiento
2. **Forma de pago implementacion**: 50% al inicio, 25% al entregar RPA funcional, 25% al go-live
3. **SLA de soporte**: Respuesta en 4 horas habiles, resolucion en 24 horas
4. **Limite de facturas incluidas**: 300/mes (factura adicional a USD $2.50)
5. **Mapeo de productos nuevos**: Hasta 20 productos nuevos/mes incluidos, adicionales a USD $5 c/u
6. **Clausula de ajuste**: Revision de precio anual indexada a IPC Uruguay

### Consideraciones importantes

- **El RPA con Memory Siigo es el componente mas riesgoso**: Cualquier actualizacion de Memory Siigo puede romper la automatizacion. Esto DEBE estar claro en el contrato y justifica el mantenimiento mensual.
- **El mapeo de productos es trabajo continuo**: Nuevos proveedores = nuevos productos = nuevos mapeos. Incluir un cupo mensual y cobrar excedentes.
- **Periodo de estabilizacion**: Las primeras 4-6 semanas post go-live seran intensivas. Planificar soporte dedicado.
- **Backup manual**: Siempre mantener la opcion de exportar CSV como plan B si el RPA falla.
