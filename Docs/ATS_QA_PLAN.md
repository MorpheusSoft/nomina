# Plan de Pruebas de Calidad (QA) - Módulo ATS Nebula

Este documento detalla los escenarios de prueba para validar la funcionalidad completa del Sistema de Seguimiento de Candidatos (ATS), abarcando la creación de vacantes, postulación de candidatos, motor de exámenes y la evaluación con Inteligencia Artificial.

---

## 1. Módulo de Vacantes y Postulación (Fase 1.5)

### Prueba 1.1: Creación de Vacante
- **Actor:** Analista RRHH
- **Pasos:**
  1. Ingresar al Tablero de Reclutamiento (`/hr/recruitment`).
  2. Hacer clic en "Nueva Vacante".
  3. Ingresar un título (Ej. "Desarrollador Frontend React").
  4. Guardar.
- **Resultado Esperado:** La vacante se agrega a la lista lateral. Al seleccionarla, muestra el tablero vacío de candidatos y un enlace único de postulación en la cabecera.

### Prueba 1.2: Postulación de Candidato sin Sesión
- **Actor:** Candidato Externo
- **Pasos:**
  1. Copiar el enlace único generado en la Prueba 1.1 y abrirlo en una ventana de incógnito.
  2. Llenar el formulario con datos de prueba (Nombre, Email, Habilidades, etc.).
  3. Enviar postulación.
- **Resultado Esperado:** Mensaje de éxito al candidato.

### Prueba 1.3: Visualización en el Tablero HR
- **Actor:** Analista RRHH
- **Pasos:**
  1. Volver al Tablero de Reclutamiento (`/hr/recruitment`) y seleccionar la vacante de la Prueba 1.1.
- **Resultado Esperado:** El candidato postulado aparece como una tarjeta con sus habilidades, años de experiencia y la opción de marcarlo con "Estrellita" (Preselección).

---

## 2. Motor de Exámenes (Fase 2)

### Prueba 2.1: Creación Manual de Plantilla de Examen
- **Actor:** Analista RRHH
- **Pasos:**
  1. Ingresar al Constructor de Exámenes (`/hr/recruitment/exams`).
  2. Hacer clic en "Crear Plantilla".
  3. Añadir título, descripción y crear manualmente 2 preguntas.
  4. Marcar la opción correcta en cada pregunta.
  5. Guardar.
- **Resultado Esperado:** La plantilla se guarda y aparece en la galería de plantillas disponibles.

### Prueba 2.2: Generación de Examen a Candidato
- **Actor:** Analista RRHH
- **Pasos:**
  1. Ir al Tablero de Reclutamiento (`/hr/recruitment`).
  2. Hacer clic en "Enviar Examen" en el candidato de la Prueba 1.3.
  3. Seleccionar la plantilla creada en la Prueba 2.1.
  4. Hacer clic en "Generar Enlace".
- **Resultado Esperado:** Se muestra en pantalla un enlace único (`/exam/[token]`) seguro y anónimo para el candidato.

### Prueba 2.3: Focus Mode y Ejecución del Examen
- **Actor:** Candidato Externo
- **Pasos:**
  1. Abrir el enlace generado en la Prueba 2.2 en modo incógnito.
  2. Leer las instrucciones y presionar "Comenzar Examen".
  3. Verificar que el navegador solicite Modo Pantalla Completa.
  4. Responder las preguntas (una bien y una mal, por ejemplo).
  5. Hacer clic en "Finalizar y Enviar".
- **Resultado Esperado:** Pantalla de éxito mostrando la puntuación obtenida (Ej. 50%). El examen no permite reenvíos.

---

## 3. Inteligencia Artificial: El Oráculo (Fase 3)

### Prueba 3.1: Autogeneración Mágica de Examen
- **Actor:** Analista RRHH
- **Pasos:**
  1. Ingresar al Constructor de Exámenes (`/hr/recruitment/exams`).
  2. Hacer clic en "Crear Plantilla" y luego en "✨ Autogenerar con IA".
  3. Ingresar: "Examen de conocimientos básicos de SQL para analista de datos Junior".
  4. Seleccionar "3 Preguntas" y presionar "Generar Examen".
- **Resultado Esperado:** Después de unos segundos, el formulario se autocompleta con 3 preguntas coherentes sobre SQL, con sus respectivas 4 opciones y la respuesta correcta premarcada.

### Prueba 3.2: Evaluación y Resumen Ejecutivo Automático
- **Actor:** Oráculo IA (Fondo)
- **Pasos:**
  1. Repetir la Prueba 2.2 y 2.3 enviándole el examen de SQL (generado por IA) a un candidato de prueba.
  2. El candidato responde el examen mezclando aciertos y errores.
  3. Volver al Tablero de RRHH como Analista.
- **Resultado Esperado:** En la tarjeta del candidato, en lugar del botón "Enviar Examen", se debe visualizar la **Nota de Examen** en verde (Ej. 66%) y un botón "✨ Ver Análisis IA".
- **Prueba Final:** Al hacer clic en "✨ Ver Análisis IA", debe aparecer un modal con un resumen ejecutivo generado por Gemini evaluando el contexto de lo que el candidato acertó y en lo que se equivocó.
