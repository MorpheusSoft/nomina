# Plan de Implementación: Motor de Variación Trimestral AR-I

Este documento establece la estrategia técnica para implementar el soporte de variaciones trimestrales de las declaraciones AR-I en los meses estipulados por el SENIAT (Marzo, Junio, Septiembre y Diciembre).

## User Review Required

> [!IMPORTANT]
> **Aprobación de la Metodología Matemática**
> Según el Artículo 10 y subsiguientes de la normativa del ISLR, cuando un trabajador experimenta una variación en su estimación durante el año, el cálculo del porcentaje de retención no se hace sobre el total sin más; **se debe restar lo que ya ha percibido y lo que ya se le ha retenido en los meses anteriores**.
> 
> La fórmula a implementar será:
> `Porcentaje = ((Impuesto Estimado Total - Impuestos Retenidos Acumulados) / (Remuneración Estimada Total - Remuneraciones Pagadas Acumuladas)) * 100`

## Proposed Changes

### Capa de Servicios Backend (NestJS)

#### `backend/src/ari-forms/ari-forms.service.ts`
Implementaremos tres bloques principales para dar vida al motor:

1. **Lectura Histórica de Acumulados (YTD)**:
   - Crear el sub-método `getAccumulatedRemuneration(employmentRecordId, fiscalYear)`: Ingresará a la tabla `PayrollReceipt` y sumará todas las ganancias base (`totalSalaryEarnings`) pagadas al usuario desde Enero hasta el mes de la variación.
   - Crear el sub-método `getAccumulatedTaxesWithheld(employmentRecordId, fiscalYear)`: Ingresará a `PayrollReceiptDetail` y sumará todos los descuentos asociados a la retención de ISLR, traduciéndolos a U.T. o manteniendo su valor en Bolívares.

2. **Nuevo Motor de Fórmula (`simulateVariationMath`)**:
   - Refactorizar las reglas matemáticas para que en variaciones (mes > 1) se reestructure la estimación usando la fórmula SENIAT para variaciones. Si `accumulatedTaxesWithheld` es mayor o igual al tributo a pagar, el porcentaje final puede resultar en `0%` o mínimo residual.

3. **Inyección Dinámica de Variante (`submitVoluntaryForm` a.k.a Registro de AR-I)**:
   - Detectar si la inserción actual ocurre en los trimestres (mes 3, 6, 9 o 12).
   - Llamar en caliente a los históricos de nómina mencionados para ajustar automáticamente el porcentaje validado para la variación.

### Capa de Controlador (API)

#### `backend/src/ari-forms/ari-forms.controller.ts`
- Actualizar el endpoint de `/simulate` para que también tome en consideración los históricos acumulados antes de arrojar una respuesta, esto para que la pantalla del Portal del Trabajador no mienta y le muestre exactamente el porcentaje final post-variación.

## Open Questions

> [!WARNING]
> **Históricos de Retención (ISLR Concept)**
> Para leer "Lo que ya se le retuvo de ISLR en el año" desde la base de datos de nómina, se deben buscar los detalles del recibo (`PayrollReceiptDetail`) donde el concepto sea deducción por "ISLR" o tenga algún flag identificable. (Pendiente definir el `code` a usar para filtrar el ISLR).
