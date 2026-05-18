# Diccionario de Datos: Módulo de Reclutamiento (ATS) - Fase 1

Este diccionario de datos describe las entidades implementadas para la Bolsa de Talento Global de Nebula.

## 1. Tabla `candidates` (Talento Global)
Almacena la información principal de un candidato, independientemente de la empresa a la que aplique.

| Campo | Tipo de Dato | Llave | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Sí | Identificador único del candidato. |
| `first_name` | VARCHAR(100) | | Sí | Nombre(s) del candidato. |
| `last_name` | VARCHAR(100) | | Sí | Apellido(s) del candidato. |
| `email` | VARCHAR(150) | UNIQUE | Sí | Correo electrónico de contacto. |
| `phone` | VARCHAR(50) | | No | Número telefónico de contacto. |
| `resume_url` | VARCHAR(255) | | No | URL pública o interna donde se almacena el currículum en PDF/Word. |
| `experience_years`| INT | | Sí (Default: 0)| Años totales de experiencia laboral. |
| `skills` | JSON | | Sí (Default: [])| Arreglo o estructura JSON con las habilidades técnicas/blandas. |
| `created_at` | DATETIME | | Sí | Fecha y hora de registro en la bolsa global. |
| `updated_at` | DATETIME | | Sí | Fecha y hora de la última actualización del perfil. |

---

## 2. Tabla `recruitment_processes` (Vacantes / Procesos)
Esta entidad representa una vacante específica abierta por un Tenant (Ej. "Personal de Farmacia"). Todos los candidatos aplicarán a un proceso en particular.

| Campo | Tipo de Dato | Llave | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Sí | Identificador único del proceso. |
| `tenant_id` | UUID | FK | Sí | Empresa dueña del proceso. |
| `title` | VARCHAR(255) | | Sí | Título de la vacante. |
| `status` | VARCHAR(30) | | Sí (Default: 'OPEN') | Estado del proceso (OPEN, CLOSED). |

---

## 3. Tabla `job_applications` (Aplicaciones / Embudo)
Tabla pivote que relaciona a un candidato con un `RecruitmentProcess`. Representa la entrada del candidato al embudo de esa vacante.

| Campo | Tipo de Dato | Llave | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Sí | Identificador único de la aplicación. |
| `candidate_id` | UUID | FK | Sí | Referencia a `candidates.id`. |
| `recruitment_process_id`| UUID | FK | Sí | Referencia a `recruitment_processes.id`. |
| `status` | VARCHAR(30) | | Sí (Default: 'APPLIED') | Estado actual (APPLIED, SHORTLISTED, EXAMINED, HIRED). |
| `is_starred` | BOOLEAN | | Sí (Default: false) | Indica si el analista preseleccionó al candidato. |

*Nota: Tiene un UNIQUE(candidate_id, recruitment_process_id) para evitar dobles aplicaciones a la misma vacante.*

---

## 4. Tabla `exam_templates` y `exam_questions` (Motor de Exámenes)
Almacena las plantillas de exámenes creadas por el Tenant.
- `exam_templates`: Contiene `id`, `tenant_id`, `name`, `description`.
- `exam_questions`: Contiene `id`, `exam_template_id`, `question_text`, `image_url` (opcional), `options` (JSON array con las 4 opciones e indicador de cuál es la correcta), y `competency` (competencia evaluada).

---

## 5. Tabla `candidate_exams` (Evaluaciones Tomadas)
Registra el intento de un candidato al tomar un examen para una vacante específica.

| Campo | Tipo de Dato | Llave | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Sí | Identificador único del examen tomado. |
| `job_application_id` | UUID | FK | Sí | Relaciona el examen con la vacante a la que aplicó. |
| `exam_template_id` | UUID | FK | Sí | Plantilla del examen que debe resolver. |
| `token` | VARCHAR(255) | UNIQUE| Sí | Token público único para que el candidato acceda al "Focus Mode". |
| `status` | VARCHAR(30) | | Sí | PENDING o COMPLETED. |
| `score` | DECIMAL(5,2)| | No | Calificación calculada automáticamente. |
| `ai_feedback` | TEXT | | No | Análisis de fortalezas/debilidades generado por el Oráculo IA. |
