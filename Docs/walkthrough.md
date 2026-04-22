# Backend Setup & Multi-Tenant Core Scaffold

The fundamental project structure for your **Nómina SaaS** backend has been completed. 

We encountered complications globally installing NestJS / Prisma due to the Linux `root` permission errors, and experienced TypeScript compilation crashes when instantiating the newest Prisma Engine 7 (`PrismaClientConstructorValidationError`).

We bypassed global installation problems by shifting to `npx` locally per project, and reverted Prisma to version 5 to ensure reliable TS typings.

## Changes Made
- Initiated a NestJS Application using `npx @nestjs/cli new backend`.
- Successfully connected to the local running PostgreSQL Server: `postgresql://postgres:Pegaso#26@localhost:5432/nomina`.
- Designed and verified the `schema.prisma` definitions covering Multi-Tenancy based on our initial ERD session.
- Bootstrapped `PrismaService` ensuring PostgreSQL adapter connectivity with proper TypeScript generation formats.
- Created `TenantsModule`, `TenantsService` and `TenantsController` laying out the foundation logic.
- Included validation (`class-validator`) and global path routing prefixed with `/api/v1/`.

## Validation Results
We performed internal container cURL requests against the backend locally:

```bash
curl -X POST http://localhost:3000/api/v1/tenants \
     -H "Content-Type: application/json" \
     -d '{"name": "Pegaso Corporation SaaS", "taxId": "J-88888888-9", "isActive": true}'
```

The database recorded the new information successfully and the server returned the created `UUID` record correctly:

```json
{
  "id":"df50b677-35b4-441a-8fd8-2f0b04c252bc",
  "name":"Pegaso Corporation SaaS",
  "taxId":"J-88888888-9",
  "isActive":true,
  "createdAt":"2026-03-15T02:48:39.194Z",
  "updatedAt":"2026-03-15T02:48:39.194Z"
}
```
The backend is now prepared to act as a proper headless API for your applications extending the rest of the endpoints.

## Phase 3 Execution: Workers & Family Dependents
We generated `WorkersModule` and `FamilyMembersModule` creating the structured DTO relationships mapped strictly to our UUID database schema.
- We tested querying the `POST /api/v1/workers` and `POST /api/v1/family-members` endpoints iteratively ensuring the constraints perform cascades safely.
- All requests responded firmly with `HTTP 201 Created`.

## Frontend Architecture (UX/UI Setup)
We have initialized the frontend application natively using **Next.js (App Router)** working strictly over **TypeScript**.

### Visual Stack
- **TailwindCSS**: For rapid positioning, responsive grids, and global layout dimensions.
- **PrimeReact**: For providing powerful headless logic components, specifically focusing on data tables, ripples, and enterprise-grade input forms in upcoming views.

### Dashboard Core
The core scaffolding is wrapped in `<AppLayout>` establishing a clear and professional SaaS visual layout:
1. **Sidebar Navegación**: Drawer lateral retráctil que soporta navegación contextual a los módulos de Trabajadores, Nómina y Configuraciones.
2. **Topbar**: Panel superior equipado con el manejador dinámico de **Tenant Activo** simulando conmutación rápida entre empresas, junto a notificaciones y perfil de usuario.
3. **Dashboard (Index)**: Plantilla visual de inicio conteniendo Tarjetas (Cards) de métricas dinámicas para resumen rápido (Total Empleados, Costos, Próximos Pagos) y atajos de acción directos a funciones de Nómina.

### Formulario de Registro de Trabajadores
Se construyó el motor de formularios para la creación de Recursos Humanos usando:
- **`react-hook-form`**: Para no recargar el VirtualDOM de React en cada tecleo, haciendo que el alta de empleados sea instantánea.
- **`yup`**: Validador de esquemas atado estrictamente a los requerimientos del Backend (NestJS DTOs), limitando formatos de cédula, strings máximos y selección de campos nulos.
- **PrimeReact & Axios**: Componentes visuales robustos atados directamente a llamadas de red hacia `http://localhost:3000/api/v1/workers`. La tabla general `/workers` auto-consume esta API y expone la nómina actual al iniciar la vista.

### Perfil Central del Trabajador & Carga Familiar
Se construyó una vista transaccional dinámica (`/workers/[id]`) que sirve como expediente único para Recursos Humanos.
- **Cabecera de Perfil**: Extrae la data base del trabajador emulando un expediente físico con acciones rápidas.
- **PrimeReact TabView**: El contenido se estructuró en pestañas sin recargar la página:
    - *Datos Personales*: Una hoja descriptiva de solo-lectura sobre el estado actual.
    - *Carga Familiar*: Una DataTable anidada orientada a administrar (`POST /api/v1/family-members`) dependientes a través de un Modal (`Dialog`), asegurando que la Cédula/Identidad familiar permanezca altamente validada antes de enviarse al backend.

---

## FASE 4: El Cerebro Matemático (Algoritmo de Nómina)

### API: Motor de Fórmulas y Contexto (`Math.js`)
Para no "quemar" (hardcodear) sentencias condicionales `if-else` al calcular nóminas con legislaciones variantes, el Backend de NestJS incorporó un motor **AST (Abstract Syntax Tree)** usando la librería `mathjs`. 
- **Flujo ACID (`Prisma.$transaction`)**: El método `/payroll/calculate` lee el Período inminente, arma hidrataciones (Worker Context = `base_salary`, `dependents_count`, `GLOBAL_VARS`), y ejecuta el catálogo de fórmulas usando secuencias numéricas (10, 20, 30...). El Recibo final precalculado divide los campos bajo el esquema **Transparencia Legal**: `Factor` x `Rata` = `Monto`.

### UI: Diseñador de Software Transaccional (`/settings`)
Se le dio al Cliente el poder de manipular directamente la Base de Datos desde una Interfaz amigable en el menú `Configuración`.
- **[Variables Globales](file:///home/lzambrano/Desarrollo/nomina/frontend/src/app/settings/global-variables/page.tsx)**: Panel CRUD para inyectar sueldos mínimos, tickets, unidades tributarias.
  - **[Catálogo de Conceptos](file:///home/lzambrano/Desarrollo/nomina/frontend/src/app/settings/concepts/page.tsx)**: Un Modal Maestro inmenso (`Dialog`) donde el Analista construye la regla matemática. Se añadieron switches UI para incidencias salariales (`isSalaryIncidence`), y un enrutador Contable (`Cta Mayor + Debe/Haber`) garantizando automatización con sistemas financieros.

### V2: Modificadores Sindicales (Convenios / Grupos)
Para soportar el hecho de que Obreros y Empleados no ganan los mismos beneficios de Ley (Ej: Días de Vacaciones o % Utilidades distintos), se implementó el módulo de Convenios.
1. **Asignación Múltiple**: El Creador de Conceptos permite atar Fórmulas únicamente a los Convenios que apliquen.
2. **Variables Exclusivas ("Constantes Legales")**: En `/settings/payroll-groups`, el analista puede atar Variables a un Convenio Específico. Cuando el motor recalcule la nómina de un trabajador, las Constantes Locales del Sindicato sobrescribirán temporalmente las Variables Globales con el mismo nombre y las inyectarán en la memoria RAM del AST.
![Convenio Variables Config](/home/lzambrano/.gemini/antigravity/brain/499a6f38-fba9-4e3c-9de1-fd85e33d7b88/convenio_variables_config_1773690753.png)

### V2: Cálculos en Cascada (El poder de la Evaluación Secuencial)
En nóminas reales, la Retención del SSO necesita el **Monto Total Calculado** de las asignaciones previas como Sueldo Base + Bonos.
El UI del **Diccionario Mágico** ahora escanea automáticamente el orden de Secuencia (`executionSequence`) y expone los Conceptos Previos como Constantes inyectadas dinámicamente usando 3 prefijos estándar:
*   `fact_X` (Factor)
*   `rata_X` (Rata)
*   `monto_X` (Monto Final de Respaldo)
![Diccionario Mágico con Encadenamiento Previos](/home/lzambrano/.gemini/antigravity/brain/499a6f38-fba9-4e3c-9de1-fd85e33d7b88/dictionary_magic_prev_concepts_1773690329142.png)

## 5. Árbol de Ejecución de Conceptos (Phase 5)

Para dotar al motor de la capacidad de ejecutar solo aquellos conceptos pertinentes para la nómina solicitada, hemos rediseñado la orquestación en la base de datos dividiéndola en **Nodos Maestros** y **Sub-Conceptos**:

### Asignación de Nodos Maestros por Tipo de Nómina (Convenios)
Para los "Convenios", la pantalla ahora requiere parametrizar explícitamente qué **Concepto Raíz** se va a instanciar de acuerdo con la nómina que se desee ejecutar:
- Nómina Regular -> Concepto Raíz Regular
- Vacaciones -> Concepto Raíz Vacaciones
- Utilidades -> Concepto Raíz Utilidades
- Liquidaciones -> Concepto Raíz Liquidaciones

![Nodos Maestros en Convenios](/home/lzambrano/.gemini/antigravity/brain/499a6f38-fba9-4e3c-9de1-fd85e33d7b88/master_concept_dropdowns_1773703110424.png)

### Secuencia Interna y Árbol de Conceptos Hijos (Dependencias)
Luego, el Concepto Raíz (o cualquier otro concepto intermedio) puede anidar a n-cantidad de "Sub-Conceptos" en la pantalla de *Conceptos*. 

Por ejemplo, si el Convenio de Obreros solicita una Nómina Regular y su Concepto Maestro es "INICIO_REG", internamente "INICIO_REG" dispararía en un orden estricto los conceptos vinculados (`SUELDO_BASE`, `DEDUCION_SSO`, etc).

![Grilla de Dependencias de Sub-Conceptos](/home/lzambrano/.gemini/antigravity/brain/499a6f38-fba9-4e3c-9de1-fd85e33d7b88/child_concept_grid_1773704671889.png)

#### Pruebas del Creador Dinámico del Árbol (Browser Subagent)
Adjunto aquí el resultado de las rutinas automatizadas de navegador donde certificamos que el Formulario de Conceptos inyecta y borra a la tabla `concept_dependencies` exitosamente:

![Validación de Árbol de Conceptos (Grabación 1)](/home/lzambrano/.gemini/antigravity/brain/499a6f38-fba9-4e3c-9de1-fd85e33d7b88/concept_tree_features_part4_1773704216751.webp)
![Validación de Hilos del Formulario (Grabación 2)](/home/lzambrano/.gemini/antigravity/brain/499a6f38-fba9-4e3c-9de1-fd85e33d7b88/concept_tree_features_1773703089592.webp)

> [!NOTE]
> La orquestación recursiva de Ejecución en Backend dentro del Motor de Nóminas (`PayrollPeriods`) formará parte de las tareas del próximo flujo, tomando en consideración las relaciones recientemente trazadas.
