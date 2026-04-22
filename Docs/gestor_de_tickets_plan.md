# Plan de Implementación: Sistema "Help Desk" de Recursos Humanos 🚀

¡Excelente reflexión arquitectónica! Me alegra que estemos en la misma sintonía.

Respondiendo a tu duda: **SÍ, llevar las Solicitudes de Permisos a este mismo Gestor de Tickets es el camino maestro.** Al hacer esto, logramos una arquitectura denominada **"Desacoplamiento Estricto"**.

¿Qué significa esto?
Significa que el Portal del Trabajador pasará a ser **100% una herramienta de comunicación y notificaciones** y dejará de ensuciar las tablas transaccionales de la empresa. Absolutamente ningún trabajador podrá "inyectar" un dato en pre-estado en las rutinas de Nebula. Toda la responsabilidad de la carga de base de datos ("El cómo sea el proceso") recaerá en el Analista.

## Arquitectura Final del Ecosistema

### 1. El Portal de Empleados (Emisor de Tickets)
El trabajador usará su plataforma para abrir requerimientos. Actualizaremos la tabla `WorkerTicket` para abarcar todas las ramas operativas:

```prisma
enum TicketType {
  ABSENCE_OR_LEAVE  // "Permisos / Reposos" (Sustituye el portal/absences actual)
  VACATION          // "Vacaciones"
  TRUST_ADVANCE     // "Adelanto de Fideicomiso"
  PAYROLL_CLAIM     // "Reclamos: Pagos o Nóminas"
  DOCUMENT_REQUEST  // "Solicitud de Constancias VIP"
  EXPENSE_REIMBURSEMENT // "Reembolsos de Viáticos / Gastos"
}

// ... El resto del modelo WorkerTicket (status, description, json_metadata, hr_notes)
```

### 2. Back-Office del Analista (Nebula - Sistema de Nómina y RRHH)
1. **La Bandeja Única Central:** El analista de RRHH solo tendrá que revisar una pantalla al día: `/workers/hr/tickets`. Allí caerá todo, ordenado por fecha y estatus.
2. **Atención por Separado (El Proceso real):**
   - **Flujo de un Permiso:** Llega un ticket `"Reposo de 3 días por gripe"`. El analista dice: *"Ok, es válido"*. Se va a la ficha del trabajador en Nebula de manera normal, registra el Ausentismo (`WorkerAbsence`) cargando las características reales, y se devuelve al Ticket para marcarlo como `APPROVED` y decirle al empleado: *"Registrado. Recupérate"*. 
   - **Flujo de Vacaciones / Adelantos:** Pasa exactamente igual. El analista aprueba verbalmente/en texto el ticket y ejecuta la acción en los sistemas correspondientes del back-office de Nómina.

### Beneficios Colosales de esta Aproximación
* **Cero Basura en Base de Datos:** Si el analista rechaza un permiso, se queda un Ticket como "Rechazado". Actualmente, la tabla física de tu asistencia se estaba llenando de cosas "Pendientes" que rompían la normalización. 
* **Trazabilidad Total:** En futuras auditorías se puede descargar el listado de Tickets y ver el "Servicio al Empleado".
* **Escalabilidad Infinita:** Si el día de mañana la empresa inventa un *"Ticket de Pedido de Uniformes"*, no hay que crear migraciones de Base de Datos. Solo se añade la opción al `<select>` del Portal FrontEnd y listo.

## Fases Técnicas ("Manos a la obra")
1. **Paso 1:** Crear el Prisma Model de `WorkerTicket` y levantar las rutas del API `tickets.controller.ts`.
2. **Paso 2:** Modificar el Portal del Empleado (Actualizar `/portal/dashboard`, transformar `/portal/absences` en `/portal/mis-requerimientos`).
3. **Paso 3:** Deprecar en el Frontend del Analista la ruta vieja de aprobaciones (`/hr/absences`) y sustituirla por la super interfaz de **"Taquilla de Atención al Trabajador"** (`/hr/tickets`).
