# Plan de Acción: Alineación de Conocimiento Legal del Oráculo (CCP)

## 📌 El Problema (Divergencia API vs Web)
Al probar el Prompt Chaining, el Oráculo recordó la ley petrolera pero arrojó un **50% de recargo** en lugar del **52% y 77%** escalonado que te había dado Gemini en su versión web. 

**¿Por qué ocurrió esto?**
1. **Google Search por defecto:** La interfaz web de Gemini tiene la herramienta de búsqueda en internet activada por defecto. Cuando le haces una pregunta legal súper específica (como las cláusulas del CCP de PDVSA), la IA web hace una búsqueda rápida en Google, lee el PDF del contrato de PDVSA y te da el 52% y 77%.
2. **Latent Space vs Web:** Nuestro servidor llama a la API de Gemini "sin internet" para la creación de fórmulas. Al no tener internet, la IA intenta recordar el contrato petrolero desde su "espacio latente" (memoria de entrenamiento) y, al haber tantos contratos colectivos petroleros en el mundo, "alucina" un estándar del 50%.

## 🎯 Solución Arquitectónica (Las 2 Vías)

Para que el motor en tu servidor sea igual de inteligente y preciso que la versión web, proponemos dos soluciones que podemos implementar el jueves:

### Opción 1: Activar "Google Grounding" en la Fase Teórica (Rápida)
De la misma forma que conectamos el Oráculo Analítico a internet para que buscara la Tasa del BCV, podemos encender el switch de `googleSearch` en el **Paso 1 del Prompt Chaining**.
*   **Mecánica:** Cuando preguntes por el CCP, el Oráculo buscará en Google "Cláusula Tiempo de Viaje Contrato Colectivo Petrolero", leerá los foros/PDFs legales en milisegundos, y extraerá la regla del 52% y 77%.
*   **Pro:** Solución automática, sin mantenimiento de tu parte.
*   **Contra:** Depende de lo que encuentre en internet en ese segundo.

### Opción 2: Base de Conocimiento "RAG" Nativa en Nebula (Definitiva y Premium)
Como Nebula es un sistema *SaaS* para múltiples países y clientes, no podemos depender siempre de Google. La mejor práctica de la industria es darle a cada Tenant (Empresa) un espacio para subir sus reglas corporativas.
*   **Mecánica:** En la Consola de Administración (Settings), agregamos una caja de texto grande llamada **"Base de Conocimiento Legal (RAG)"**. Allí tú pegas un resumen de tu convención: *"Reglas de la Empresa: El tiempo de viaje diurno hasta 1.5h se paga al 52%. El exceso se paga al 77%..."*. 
*   **Pro:** El Oráculo **NUNCA** se equivocará, porque leerá primero tus reglas oficiales antes de adivinar o buscar en Google. Esto es vital para "Contratos Colectivos Privados" (empresas de manufactura) que NO están en internet.

## 🛠️ Plan de Ejecución para el Jueves

1.  **Habilitaremos la Opción 1 (Google Grounding)** para el Paso 1 de `oracle.service.ts`, garantizando que la IA lea el contexto legal actualizado de internet antes de hacer fórmulas matemáticas.
2.  **Diseñaremos la Opción 2 (RAG Base)** en el esquema de Prisma (agregar `legal_knowledge_base` a la tabla `Tenants`) y modificaremos la pantalla de *Settings* en el Frontend para que tú puedas inyectar los manuales de nómina privados de tus clientes.
3.  **Ajuste del System Prompt:** Le diremos a la IA: *"1. Lee la base de conocimiento del Tenant. 2. Si la ley no está ahí, búscala en Google. 3. Aplica la matemática estricta."*

Descansa y el jueves decidimos la ruta de acción.
