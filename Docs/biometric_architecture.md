# Arquitectura Omnicanal de Control de Asistencia (SaaS)
*Diseño Conceptual Unificado | Tech Stack: Node.js (NestJS) + PostgreSQL*

Has planteado un punto crítico de arquitectura. Un sistema ERP/Nómina robusto no puede depender exclusivamente del hardware biométrico. Debe ser "Omnicanal". Algunos clientes usarán ZKTeco, otros simplemente cargarán un Excel, y otros querrán digitar las excepciones a mano.

El diseño debe evolucionar el módulo de Asistencia convirtiéndolo en un **Embudo Centralizado**, donde sin importar el origen de los datos, todo recaiga en la pantalla de resumen que ya tienes construida.

---

## 1. ¿Qué pasará con la Página Actual de Asistencia?

Tu pantalla actual (`/payroll/attendance`) que captura "Días trabajados, Feriados, Descanso Trabajado, HE Diurnas/Nocturnas" **NO se elimina**, sino que **Evoluciona**.

*   **Paso de Modo "Carga Ciega" a "Modo Aprobación Inteligente":** Actualmente RRHH tiene que teclear esos números a mano o calcularlos mentalmente. 
*   **En la nueva arquitectura:** Esta pantalla será el final del embudo. Cuando RRHH la abra, los campos de horas extras, ausencias y feriados aparecerán **Pre-Cargados y Auto-Calculados** por el sistema basándose en las marcas (vengan de biométricos o de Excels). RRHH solo usará esta pantalla para revisar, corregir alguna excepción, y darle check de *"Aprobado para la Nómina"*.

---

## 2. Orígenes de Datos (El Embudo "Omnicanal")

Cualquier marca de tiempo generada entrará a una tabla maestra llamada `AttendancePunch`. Cada registro tendrá un campo `source_type` (Origen) para saber de dónde vino:

1.  **Origen Biométrico (Hardware):** Carga automatizada vía API/SDK desde los relojes físicos.
2.  **Origen Importación Masiva (Excel/CSV):** Carga manual de un archivo desde la UI del SaaS. Ideal para empresas de construcción o seguridad donde el supervisor envía un Excel con formato: `[Cédula | Fecha | Hora Entrada | Hora Salida]`.
3.  **Origen Manual (UI Supervisor):** Edición manual directa en caso de que un trabajador olvidó marcar o el sistema falló.
4.  **Origen Fichaje Web/Móvil (Futuro):** Si se decide hacer una app para que trabajadores remotos hagan check-in con GPS.

---

## 3. Funcionalidades a Implementar (Fases Conceptuales)

Para materializar esto, nuestro roadmap dividirá el desarrollo en 4 sub-módulos o funcionalidades lógicas:

### Funcionalidad A: Módulo de Importación y Recepción (Ingesta Cruda)
Es la puerta de entrada. 
*   **A.1 Lector de Biométricos:** Microservicio en Node.js que procesa la trama de datos de los relojes en tiempo real o por lotes (CRON).
*   **A.2 Importador Excel:** Interfaz en React donde el cliente descarga una plantilla `.xlsx`, la llena, y la sube. El backend la valida y empuja las filas a la misma tabla `AttendancePunch`.

### Funcionalidad B: Motor Calculador de Horas (Time Attribution Engine)
Este será el "cerebro" en el backend de NestJS. 
*   Procesa las horas de "Entrada" y "Salida" (sin importar su origen) y las enfrenta contra el Horario Técnico (`ShiftTemplate`) asignado al empleado.
*   Determina matemáticamente: ¿Llegó tarde? ¿La hora extra fue diurna o nocturna? ¿El día que vino era su día de descanso (Descanso Trabajado)? ¿Era feriado calendario?
*   Genera un consolidado en la tabla `DailyAttendance`.

### Funcionalidad C: Bandeja de Excepciones y Regularización
*   Una pantalla previa al cierre donde RRHH ve alertas rojas: *"Carlos no tiene marca de salida el Martes"*, *"A María le faltan 2 horas"*.
*   Permite a los supervisores aceptar justificaciones (ej. Constancia Médica) y "cerrar" el caso.

### Funcionalidad D: Pantalla de Consolidación (Tu Pantalla Actual Mejorada)
*   El motor matemático sumariza todos los días del mes y envía el total a esta pantalla.
*   Aquí RRHH contempla el tablero final: *"20 días hábiles, 2 HE Nocturnas, 1 Feriado"*. 
*   Si RRHH está de acuerdo, presiona el botón "Enviar a Nómina".
*   Las variables viajan al motor algebraico AST (Tus Conceptos) y se transforman en dinero automáticamente de forma exacta y auditable en el recibo.

---

## 4. Estructura Híbrida de Bases de Datos

Para soportar esto sin perder rendimiento en PostgreSQL:
- `AttendancePunch`: `workerId`, `timestamp`, `type` (IN/OUT), `source` (BIOMETRIC/CSV/MANUAL), `deviceId` (opcional).
- `DailyAttendance`: `workerId`, `date`, `calculatedRegularHours`, `calculatedOvertime`, `lateMinutes`, `status`.
- `PayrollPeriodAttendance` (Tu tabla actual adaptada): `workerId`, `payrollPeriodId`, `totalWorkedDays`, `totalDiurnalOT`, `totalNocturnalOT`...
