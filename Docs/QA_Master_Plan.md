# Plan Maestro de Pruebas de Calidad (QA) - Nebula ERP

Este documento consolida los escenarios de prueba funcionales e integrales para los tres grandes módulos desarrollados recientemente en el ecosistema Nebula.

---

## PARTE 1: Configuración Bancaria, Feriados y Nómina TXT (Interfaz Visual)

### 1. Bancos y Cuentas Emisoras (Desde `/settings/banks`)
*   **QA-BNK-01:** Ingresar a "Bancos y Cuentas" > Pestaña "Catálogo de Bancos". Agregar, listar y eliminar un banco de prueba (Ej: Banesco - 0134).
*   **QA-CBA-01:** Ingresar a la pestaña "Cuentas de Empresa". Crear una cuenta emisora asociándola al banco recién creado, marcando el tipo (CORRIENTE/AHORRO) y estableciéndola como Principal (Primary).

### 2. Feriados y Calendarios (Desde `/settings/holidays`)
*   **QA-HOL-01 al 03:** En la pantalla de Feriados, verificar la creación de feriados Nacionales (aplica a todos) vs. Regionales (asignación excluyente a múltiples Centros de Costo).

### 3. Generador de Plantillas TXT (Desde `/settings/banks`)
*   **QA-TPL-01:** Ingresar a la pestaña "Plantillas TXT". Crear una plantilla vinculada al banco, seleccionando formato TXT y definiendo las columnas usando el validador JSON incluido.
*   **QA-TXT-01 al 04:** (Backend Test) Intentar generar el TXT con una nómina Abierta (Debe fallar). Luego, cerrar la nómina y generarlo (Debe crear archivo TXT estructurado).

---

## PARTE 2: Módulo ATS (Sistema de Reclutamiento y Selección)

### 1. Vacantes y Portal Público
*   **QA-ATS-01:** Crear una Vacante en el Tablero de RRHH y obtener el Link Público.
*   **QA-ATS-02:** Entrar al Link Público en Modo Incógnito, llenar el formulario como candidato y enviarlo.
*   **QA-ATS-03:** Validar que el candidato aparece en el Tablero de RRHH bajo la vacante correcta.

### 2. Motor de Exámenes (Focus Mode)
*   **QA-EXM-01:** RRHH crea una Plantilla de Examen manualmente con al menos 2 preguntas y 4 opciones cada una.
*   **QA-EXM-02:** RRHH envía el examen al candidato. El candidato abre el Link Mágico (`/exam/[token]`).
*   **QA-EXM-03:** Verificar que el portal del candidato exija "Pantalla Completa" (Focus Mode) para evitar trampas. Completar el examen y validar que la nota aparezca en el Tablero de RRHH.

### 3. Oráculo IA en Selección
*   **QA-AIA-01:** En el Constructor de Exámenes, usar "Autogenerar con IA". Pedir "Examen de SQL Básico, 3 preguntas". Validar que se autocomplete el formulario solo.
*   **QA-AIA-02:** Al completar el candidato su examen, abrir la tarjeta del candidato en RRHH y dar clic en "Ver Análisis IA". Verificar que se muestra el Resumen Ejecutivo generado por Gemini (Puntos fuertes y débiles de sus respuestas).

---

## PARTE 3: Módulo de Evaluación de Desempeño 360 (Reciente)

### 1. Constructor y Campañas
*   **QA-EVL-01:** RRHH crea una plantilla de evaluación (Ej. Evaluación Anual).
*   **QA-EVL-02:** RRHH lanza una "Campaña" seleccionando un Departamento. Se debe validar el selector de personal y la asignación del Supervisor/Jefe correspondiente a cada trabajador.
*   **QA-EVL-03:** Guardar como BORRADOR (no emite links) y luego cambiar a ACTIVA.

### 2. Portal de Calificación
*   **QA-EVP-01:** Entrar al Tablero de la Campaña (`/hr/evaluations/campaigns/[id]`). Copiar el enlace de la **Autoevaluación** (SELF) del trabajador y responderlo en Incógnito usando las estrellas (Rating).
*   **QA-EVP-02:** Copiar el enlace del **Supervisor** y responderlo de forma distinta para generar discrepancias (Brechas).

### 3. Reporte de Consenso IA
*   **QA-EVR-01:** En el Dashboard de la Campaña, verificar que el estado global del evaluado cambió a `COMPLETED`.
*   **QA-EVR-02:** Dar clic en "Ver Reporte". Validar que se muestre:
    *   Gráfico de Radar comparando Self vs. Supervisor.
    *   Puntuación Global (Ej. 4.2 / 5.0).
    *   Resumen ejecutivo, Fortalezas, Áreas de mejora y Recomendaciones de capacitación generadas por IA.
