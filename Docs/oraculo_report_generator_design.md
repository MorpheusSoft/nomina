# Arquitectura de Reportes y Generación de Documentos (Oráculo)

Este documento detalla la arquitectura técnica y el plan de implementación para dotar al Oráculo de Nebula Payrolls con capacidades de generación de gráficos, reportes PDF, presentaciones y documentos editables.

---

## Arquitectura General del Sistema

El sistema funcionará bajo el patrón **"AI Function Calling & Structured Output"**. En lugar de que el modelo de lenguaje devuelva solo cadenas de texto, se le entrenará para devolver JSON estructurado cuando detecte intenciones analíticas o de exportación.

### Componentes Clave:
1.  **Oráculo Engine (NestJS + LLM):** El cerebro. Interpreta si el usuario quiere una charla, un gráfico o un documento, y empaqueta la data (datos financieros, variables, textos) en un esquema JSON estricto.
2.  **Dynamic Chat UI (Next.js):** El frontend actual del chat será refactorizado para soportar "Renderizado de Componentes". Si el mensaje es texto, muestra texto. Si el mensaje es tipo `chart`, renderiza un componente de PrimeReact.
3.  **Document Microservice (Puppeteer / Docx):** Un módulo en el backend encargado exclusivamente de tomar el JSON del Oráculo y compilarlo en archivos físicos (PDF, DOCX) o comunicarse con APIs externas.

---

## Plan de Implementación por Fases

### Fase 1: Oráculo Visual (Gráficos en el Chat)
*El objetivo es lograr el efecto "WOW" inmediato, permitiendo que el chat muestre gráficos vivos sin salir de la interfaz.*

*   **Backend:** Actualizar el *System Prompt* de Oráculo para que responda con un JSON cuando se le pidan estadísticas (Ej: `{ type: "chart", chartType: "bar", data: [...] }`).
*   **Frontend:** Crear componentes de React (`ChartWidget`) usando **PrimeReact Charts** o **Recharts**.
*   **Resultado:** Si el usuario pide *"Muéstrame la distribución de salarios"*, el Oráculo responde con un gráfico de torta interactivo dentro de la burbuja de chat.

### Fase 2: Reportes Ejecutivos y Presentaciones (PDF)
*Aprovecharemos la tecnología que ya construimos para los flyers (`nebula-flyer`) para generar documentos inmutables y hermosos.*

*   **Plantillas (Vite/React):** Crear dos nuevas rutas web ocultas:
    *   `/templates/executive-report` (Formato A4/Carta vertical).
    *   `/templates/presentation-slide` (Formato 16:9 horizontal).
*   **Backend:** Construir el `PdfGeneratorService` usando Puppeteer. Oráculo envía la data analizada a estas plantillas, Puppeteer toma la "foto" y genera el PDF.
*   **Resultado:** El usuario pide *"Genera un reporte del impacto de las horas extras"*, y Oráculo responde con un botón: **[📥 Descargar Reporte PDF]**.

### Fase 3: Documentos Editables Corporativos (Word / Excel)
*Para cuando Recursos Humanos o Finanzas necesiten modificar el documento antes de enviarlo a gerencia.*

*   **Backend:** Integración de la librería `docx` (para Word) y `exceljs` (para Excel) en NestJS.
*   **Sistema de Plantillas:** Creación de archivos base `.docx` con el membrete y logo del cliente, usando etiquetas como `{{analisis_de_costos}}` o `{{recomendaciones}}`. Oráculo simplemente inyecta su análisis en esas etiquetas.
*   **Resultado:** Oráculo responde con un archivo `.docx` o `.xlsx` nativo, formateado con los estilos de la empresa, listo para ser editado en Microsoft Office.

### Fase 4: Integración en la Nube (Google Workspace API)
*El nivel más alto de automatización: colaboración en tiempo real.*

*   **Backend:** Configuración de un *Google Cloud Service Account* con permisos de Google Drive, Google Docs y Google Slides.
*   **Flujo:** Oráculo se conecta a las APIs de Google, crea un documento directamente en la cuenta del cliente (o en una carpeta compartida de Nebula), lo formatea con la API y obtiene el enlace.
*   **Resultado:** *"He creado la presentación para la junta directiva. Puedes editarla en tiempo real junto con tu equipo aquí: [Enlace a Google Slides]"*.

### Fase 5: Memoria a Largo Plazo (Vector Database & RAG)
*Para que el Oráculo aprenda de la empresa, recuerde decisiones pasadas y se adapte al estilo de los directivos.*

*   **Arquitectura:** Implementación de una Base de Datos Vectorial (como `Pinecone` o `pgvector` en PostgreSQL) para almacenar fragmentos semánticos de conversaciones y resoluciones previas.
*   **Flujo (RAG - Retrieval-Augmented Generation):** Antes de responder, Oráculo buscará en su banco de memoria el contexto histórico de la empresa y del usuario actual.
*   **Resultado:** *"Como me indicaste el mes pasado que prefieres evitar el impacto en utilidades, he ajustado esta nueva simulación usando bonos de productividad en lugar de salario base."*

---

## Requerimientos Técnicos Próximos
1.  **Librerías a instalar (Fase 1 y 3):** `chart.js` (Frontend), `docx`, `exceljs` (Backend).
2.  **Infraestructura (Fase 2):** Optimizar la gestión de memoria de Puppeteer en el VPS de producción (vmi2995455) para evitar cuellos de botella al generar múltiples PDFs simultáneos.
3.  **Seguridad:** Asegurar que los documentos temporales generados en el servidor se eliminen automáticamente (`CRON jobs`) para no saturar el disco duro.
