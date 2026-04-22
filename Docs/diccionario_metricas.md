# Diccionario de Métricas del Sistema

Este documento mantiene un registro centralizado de todas las métricas y KPIs calculados por el backend (motor analítico) y su respectiva ubicación/visibilidad en el frontend.

## Dashboard General (`GET /api/v1/dashboard/summary`)

| Métrica | Descripción | Fórmula / Cálculo | Visibilidad |
|---------|-------------|-------------------|-------------|
| **Trabajadores Activos (Headcount)** | Empleados actualmente activos en la empresa | Conteo de `Worker` no eliminados (`deletedAt` is null) con al menos un `EmploymentRecord` en estatus `ACTIVE`. | 🟢 **Visible** (Top Grid) |
| **Ejecución Presupuestaria** | Consumo de la nómina frente al presupuesto mensual | **(Nómina Consumida / Total Presupuestado)*100**. Presupuesto es la suma de `monthlyBudget` de `Department`. Consumido es suma de `totalEarnings` + `employerContributions` de `PayrollReceipt` del mes corriente. | 🟢 **Visible** (Top Grid) |
| **Contratos por Vencer** | Alerta operativa sobre contratos a plazo fijo por terminar | Conteo de `EmploymentRecord` activos cuyo `endDate` (fin de contrato) sea dentro de los próximos 60 días. | 🟢 **Visible** (Top Grid) |
| **Índice de Ausentismo** | Métrica de productividad basada en incidencias | Días perdidos (`restDays`, `holidays`) sobre `daysWorked` en los resúmenes de asistencia del período actual. | 🟢 **Visible** (Top Grid) |
| **Deuda Pasivos (Fideicomiso)** | Obligaciones acumuladas a largo plazo con trabajadores | Sumatoria de la columna `totalAccumulated` en la tabla `ContractTrust`. | 🔴 **Oculta** (Acceso Gerencial Reservado) |

---
*Nota: Este documento debe ser actualizado cada vez que se modifique o se agregue una nueva métrica al motor de análisis.*
