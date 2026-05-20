# Bitácora de Desarrollo - Nebula Payrolls (Actualizada)

**Fecha de última actualización:** 18 de Mayo de 2026
**Módulos Principales:** Reclutamiento (ATS) y Evaluación de Desempeño 360°

---

## 1. Módulo ATS (Reclutamiento Inteligente)
*   **Backend & Base de Datos:** Se implementó la estructura en la base de datos (PostgreSQL/Prisma) para manejar Vacantes, Candidatos y el Embudo de Contratación.
*   **Inteligencia Artificial:** Se integró la extracción de habilidades y experiencia mediante IA directamente desde el CV del postulante.
*   **Onboarding:** Se habilitó el pase de candidato a la nómina activa en 1 solo clic.

## 2. Módulo de Evaluación de Desempeño 360°
*   **Estructura y Formularios:** Se crearon las campañas de evaluación (Evaluation Campaigns) y las plantillas asociadas a los cargos laborales.
*   **Workflows de Consenso:** Implementación del flujo de revisión entre el supervisor y el empleado.
*   **Eliminación Segura:** Se agregó la regla de negocio que permite borrar campañas *únicamente* si no están completadas y no tienen participantes asignados (con su respectiva actualización dinámica en el Frontend mediante la función `loadData()`).

## 3. Marketing y Presentación Comercial
*   **Generador de Flyers PDF:** Se construyó una herramienta automatizada (Puppeteer + React) en el proyecto `nebula-flyer` para exportar flyers de alta calidad gráfica (ATS y Evaluación) evitando diseños que parezcan generados por IA genérica. Se diseñaron en formato interactivo y listos para imprenta.
*   **Landing Page (`page.tsx`):** Se integraron ambos módulos en la sección de funcionalidades de la página principal.
*   **Presentación Interactiva (`Presentacion_Comercial.html`):**
    *   Se insertaron las Láminas 9 (ATS) y 10 (Evaluación) con diseños conceptuales (Mockup Embudo y Matriz 9-Box).
    *   Se rediseñó la sección "El Desafío" (Lámina 2) transformándola a un grid 2x2 para incluir los problemas de Contratación Lenta y Evaluaciones Subjetivas.
    *   Se rediseñó la sección "La Solución" (Lámina 3) en una moderna cuadrícula 3x2, exponiendo los 6 módulos clave de Nebula.
    *   Se creó un cierre de altísimo impacto visual (Lámina 11) con el eslogan: *"Nebula no es un gasto. Es una inversión estratégica"*, libre de signos de puntuación y enfocado en el ecosistema 100% automatizado.

## 4. Despliegue en Producción (VPS)
*   **Resolución de Conflictos Prisma:** Se resolvió de forma segura un conflicto del historial de migraciones de abril (`npx prisma migrate resolve --applied...`) que estaba chocando con el `db push` histórico del servidor.
*   **Sincronización:** Se ejecutó `npx prisma db push` para subir las nuevas entidades sin pérdida de datos.
*   **Frontend Typescript Fix:** Se resolvieron estrictas alertas de tipado (`loadCampaigns -> loadData` y `null vs undefined` en el InputNumber del Oráculo) que impedían la compilación en el servidor productivo.
*   **Levantamiento:** Ambos servicios fueron recompilados (`npm run build`) y reiniciados exitosamente mediante `pm2 restart`.

---
*Nota: Todos los servicios de desarrollo locales fueron detenidos correctamente para liberar memoria tras confirmar el éxito en producción.*
