# Plan Detallado Fase 4: Motor de Fórmulas y Ejecución de Nómina

Esta fase representa el núcleo técnico de la plataforma SaaS. Diseñaremos un motor capaz de procesar cientos de empleados aplicando reglas algebraicas dinámicas en fracciones de segundo.

## 1. Estructura de Datos (Esquema de Prisma)

¡Tienes absoluta razón! Los datos de contratación (fecha de ingreso, retiro, cargo, contrato) **ya los habíamos estructurado en nuestra base de datos** bajo las tablas `EmploymentRecord` y `SalaryHistory` creadas ocultamente en la Fase 3, pero nos faltaba un eslabón vital que acabas de mencionar: **Los Convenios (Grupos de Nómina)**.

Para separar Empleados, Directivos y Obreros con total aislamiento, introduciremos la siguiente arquitectura:

### A. Entidades de Contratación e Históricos
*   **`EmploymentRecord` (Ficha de Contrato Real)**
    *   Guarda `startDate` (Fecha Ingeso), `endDate` (Egreso/Retiro temporal o final), `position` (Cargo).
    *   **[UPDATE]** Le agregaremos la relación a `PayrollGroup` (El Convenio al que pertenece la persona).
*   **`SalaryHistory` (Histórico de Sueldos Intocable)**
    *   Guarda los aumentos en una línea de tiempo (`validFrom`, `validTo`). Si le subes el sueldo hoy, la nómina del mes pasado recalculará intacta mirando su historial pasado.

### B. Reglas de Negocio para Contratos y Salarios [NEW]
*   **Unicidad de Contrato Activo:** Un trabajador solo puede tener **UN (1) contrato vigente** a la vez. Al registrar un nuevo contrato (ej. ascenso o cambio de cargo), el sistema automáticamente tomará el contrato que estaba "Vigente", lo marcará como "Inactivo", registrará su `endDate` como el día anterior, y el nuevo contrato nacerá como "Vigente" sin fecha de egreso (`endDate: null`).
*   **Multimoneda Salarial:** El historial de salarios (`SalaryHistory`) permite definir explícitamente la moneda (`currency`) del sueldo base (Ej: `USD` o `VES`). El motor de nómina leerá esta etiqueta y, de ser necesario, aplicará la tasa de cambio vigente (almacenada en las Variables Globales) para homologar los cálculos al momento de emitir el recibo de pago en la moneda contable deseada.

### C. Entidades del Motor y Convenios

*   **`PayrollGroup` (Convenio / Grupo de Nómina) [UPDATED]**
    *   Identificador maestro: "Obreros", "Empleados", "Directiva", "Sindicato de Transporte".
    *   *Nota Arquitectónica*: Un convenio **NO define la frecuencia de pago** (semanal/quincenal), ya que bajo un mismo contrato colectivo pueden existir obreros semanales y empleados quincenales, o calcularse nóminas especiales (vacaciones/utilidades) que no tienen frecuencia regular. El convenio se dedica exclusivamente a agrupar **Conceptos Salariales** y **Variables Legales**.

*   **`Concept` (Catálogo de Conceptos Salariales) [NEW]**
    *   `type`: Asignación, Deducción o Aporte Patronal.
    *   `formula`: Texto matemático en crudo (ej. `base_salary * (worked_days / 30)` o `base_salary * 0.04`).

*   **`PayrollGroupConcept` (Asignación Concepto <> Convenio) [NEW]**
    *   Tabla puente importantísima. Permite que el "Bono de Riesgo" exista solo para el *Convenio Obreros*, y el "Bono Directivo" solo para el *Convenio Directivos*.

*   **`PayrollPeriod` (Período / Recibo General) [NEW]**
    *   `id`: UUID
    *   `payrollGroupId`: Define a qué Convenio se le está corriendo la nómina.
    *   `startDate` & `endDate`: Fechas numéricas de corte (ej. 1 de Enero al 15 de Enero).
    *   `status`: Borrador, Calculado, Cerrado (Pagado/Inmutable).

*   **`PayrollReceipt` y `PayrollReceiptDetail` [NEW]**
    *   Representan el recibo de pago por trabajador y sus renglones exactos (una "foto" inmutable en el tiempo con los montos reales depositados para contabilidad).

---

## 2. La Magia del Motor de Ejecución (NestJS)

El sistema **NUNCA** usará sentencias `if-else` en el código para calcular una nómina. En su lugar, usará un "Intérprete Matemático" (AST) alimentado por el Convenio.

### A. Herencia de Variables (Jerarquía)
Las variables utilizadas dentro de las fórmulas matemáticas seguirán un orden jerárquico estricto. Si una fórmula dice `porc_util / 100`, el interpretador buscará el valor así:
1. ¿Existe una variable definida a nivel de **Convenio de Nómina** específica para ese trabajador? (Tabla propuesta `PayrollGroupVariable`). Si sí, úsala.
2. Si no existe, ¿Existe una **Variable Global** a nivel de la Empresa? (Tabla `GlobalVariable`). Si sí, úsala.
3. Si no existe en ningún lado, arriesga arrojar un error de cálculo o asumir Cero `0`.

### B. Referencias Cruzadas a Conceptos Previos (Cálculos en Cadena)
Tal cual solicitaste, es crítico que un concepto inferior pueda alimentarse de resultados calculados anteriormente. 

*   **Secuencia de Ejecución:** Los Conceptos se procesarán estrictamente basados en su campo `executionSequence` (de menor a mayor).
*   **Inyección en Tiempo de Ejecución (RAM):** Cada vez que un concepto (Ej: `BONO_NOCTURNO`) termina de calcularse, sus resultados se inyectarán **dinámicamente** en la memoria RAM del AST usando 3 prefijos estándar:
    *   `fact_BONO_NOCTURNO`
    *   `rata_BONO_NOCTURNO`
    *   `monto_BONO_NOCTURNO`
*   **Referencia Posterior:** Así, si el Concepto de Deducción `SSO` se calcula después, su fórmula matemática sencillamente podrá escribir explícitamente `(monto_SUELDO + monto_BONO_NOCTURNO) * 0.04`.

### C. El Flujo Algorítmico cuando presionas "Calcular Nómina"

1.  **Selección de Contexto:** El usuario indica organizar e iniciar el período "1era Quincena Ene-2026" para el Convenio **"Empleados"**.
2.  **Carga de Herencia:** Se cargan las Variables Globales y luego se "sobreescriben/mezclan" con las Variables exclusivas del Convenio "Empleados".
3.  **Hydration (Carga de Realidad Temporal):**
    Por cada trabajador activo bajo el Convenio "Empleados", Node.js lee su fecha de ingreso y su sueldo de esa quincena basándose en el historial, inyectando variables base a la RAM:
    ```javascript
    const context = {
        base_salary: 400.00,        // Traído de su SalaryHistory exacto.
        worked_days: 15,            // Generado por el periodo y ajustado por horas/reposos.
        seniority_years: 1.5,       // Años de servicio autocalculados de startDate.
        dependents_count: 3         // Contando sus "FamilyMembers".
        // + Aquí ya vendrán inyectadas cosas como "porc_util: 15.0"
    };
    ```
3.  **Filtrado de Conceptos:** El sistema lee la tabla `PayrollGroupConcept` y trae _sólo_ las fórmulas legales de los "Empleados".
4.  **Matemática Segura:** Evalúa algebraicamente las fórmulas guardadas y arroja los montos por renglón sin afectar al servidor.
5.  **Persistencia (Grabar Borrador):** Los recibos se escriben en la base de datos PostgreSQL, listos para imprimir en la pantalla de revisión.

---

## Próximos Pasos Técnicos (Roadmap Ejecutable)

1.  **Adición de Variables de Convenio (Vía B):** Refactorizar el backend para soportar un nuevo modelo `PayrollGroupVariable` dentro de `prisma.schema` permitiendo configurar indicadores legales exclusivos (como utilidades/vacaciones) por convenio.
2.  **Panel de Mapeo en UI:** Actualizar la vista del "Diccionario Mágico" para que reconozca los prefijos dinámicos `fact_`, `rata_` y `monto_` seguidos del código del concepto para fomentar su uso en encadenamiento.
3.  **Tablas de Filtrado Visual:** Modificar la vista Frontend `/settings/payroll-groups` permitiendo desplegar de manera reactiva qué Conceptos le pertenecen a cada Convenio y cuáles son las Variables customizadas de ese Contrato Colectivo.
4.  **Generación de Períodos de Nómina (Payroll Periods):** Implementar maestro de períodos.

---

## 3. Fase 5: Gestión de Períodos de Nómina (El Árbol de Ejecución)

Luego del excelente análisis arquitectónico provisto, el diseño del Motor de Ejecución abandona la naturaleza "plana" (ejecutar todo lo del convenio de golpe) y adopta el estándar Enterprise ERP: **El Árbol de Ejecución Jerárquico**.

### La Nueva Regla de Negocio (Conceptos Maestros)
En una empresa real, un mismo Convenio (Ej: *Obreros*) contiene todos los conceptos matemáticos (Sueldos, Utilidades, Vacaciones, Préstamos y Liquidaciones). Ejecutarlos todos en un día normal causaría pagos duplicados masivos. 

Para controlar esto con precisión quirúrgica, **el Convenio indicará explícitamente el Concepto Principal (Raíz) a disparar según el tipo de nómina**, y ese concepto podrá "llamar" o "encadenar" sub-conceptos de forma recursiva.

### A. Cambios en Base de Datos (Prisma)
1. **Convenios con Puntos de Entrada (`PayrollGroup`)**: 
   Añadiremos campos opcionales al Convenio que mapean directamente al Concepto Principal que arranca el motor:
   - `rootRegularConceptId`
   - `rootVacationConceptId`
   - `rootBonusConceptId`
   - `rootLiquidationConceptId`

2. **Árbol de Sub-Conceptos (`ConceptDependency`)**: 
   Crearemos una nueva tabla que permite que un Concepto llame a otros. Si la "Nómina Regular" (Concepto Principal) necesita cobrar retenciones, este concepto padre tendrá dependencias hacia "SSO", "FAOV" y "Sueldo Base".
   - `id`
   - `parentConceptId` (La Raíz)
   - `childConceptId` (El que será invocado)
   - `executionSequence` (El orden exacto en el que el Padre llamará al Hijo).

### B. El Flujo de "Crear una Nómina"
Cuando entremos a `/payroll/periods` y hagamos clic en **"Aperturar Nómina"**:
1. Se nos pedirá: Convenio (Ej: Obreros), Fechas de Pago, y Tipo (Regular, Vacaciones, Liquidación).
2. Si seleccionamos "Vacaciones", el sistema revisará internamente el Convenio de Obreros y buscará su `rootVacationConceptId`.
3. Al momento de generar los cálculos, el AST de Node.js iniciará en ese `rootVacationConceptId`.
4. Mirará la tabla `ConceptDependency`. Si ese concepto maestro "llama" a 4 conceptos más (Sueldo Días Vacaciones, Bono Vacacional, Deducción SSO Vacacional), los irá evaluando en **cascada estricta** respetando el `executionSequence`.

### C. Ajustes en el Interfaz Visual (Frontend)
- **`settings/payroll-groups`**: Añadiremos un apartado para asignar cuáles son los "Conceptos Maestros" (Raíces) para cada tipo de pago en ese contrato colectivo particular.
- **`settings/concepts`**: Actualizaremos la vista del Concepto para añadir una pestaña llamada **"Sub-Conceptos Llamados"**, donde el Usuario puede enlazar qué Conceptos adicionales deben ejecutarse si este concepto se dispara.
