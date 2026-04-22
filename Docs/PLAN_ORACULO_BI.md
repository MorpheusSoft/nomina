# Oráculo Nivel 2: Consultoría Analítica y Business Intelligence (BI)

## Objetivo
Expandir las capacidades del Oráculo para que no solo genere fórmulas matemáticas, sino que pueda leer la base de datos de la empresa y hacer analítica de datos en lenguaje natural (Ej: "cumpleañeros del mes", "departamentos con más horas extras", "reclamos más frecuentes").

> [!CAUTION] Riesgo Multi-Tenant
> En una arquitectura SaaS Multi-Tenant (donde los datos de muchas empresas viven en la misma BD), permitir que una Inteligencia Artificial genere consultas arbitrarias de lectura es muy riesgoso si la IA "olvida" aislar el Tenant. Existen dos soluciones propuestas.

---

## Opción 1: Function Calling (Herramientas Estrictas y Seguras) - *Recomendada para Velocidad*
Le damos a Gemini un set de "Herramientas Mágicas" pre-programadas por nosotros en NestJS. Cuando el usuario pregunta algo, la IA no busca en la base de datos; sino que *decide* cuál de nuestras herramientas llamar.

**Flujo:**
1. Usuario: "Dime los cumpleañeros de este mes"
2. La IA detecta la intención y manda a ejecutar nuestra función segura `getWorkersBirthdays(mes)`.
3. Nuestro backend (NestJS) recibe la petición, inyecta **obligatoriamente** el `tenantId` por detrás por seguridad, hace la búsqueda y se la devuelve a la IA.
4. La IA lee la data pura y redacta el informe al cliente.

*   **Pros:** 100% invulnerable a fugas de datos. Fácil y rápido de implementar (Días, no meses).
*   **Contras:** La IA solo puede responder preguntas para las cuales nosotros hayamos construido una función específica (Limitado a herramientas como cumpleaños, horas extras por departamento, etc).

---

## Opción 2: NL-to-SQL con RLS (Analítica Total sin Límites) - *Poder Absoluto*
La IA escribe libremente lenguaje SQL basado en tu esquema de base de datos (`schema.prisma`) para responder cualquier fantasía analítica del usuario, bajo una capa de seguridad estricta en la propia base de datos (PostgreSQL RLS).

**Flujo:**
1. Le enseñamos el esquema de tablas del sistema a la IA.
2. Inyectamos a nivel del motor de base de datos PostgreSQL un paradigma llamado **RLS (Row Level Security)** que sella las filas a las que puede acceder cada empresa.
3. Así, cuando la IA genera una consulta cruda conectándose al servidor, nuestro motor la ejecuta en un túnel sellado, imposibilitando que husmee otras empresas.

*   **Pros:** Libertad analítica absoluta. El usuario crea reportes infinitos de forma conversacional.
*   **Contras:** Requiere semanas de trabajo arquitectónico modificando a bajo nivel el motor de PosgreSQL y Prisma.

---
*Documento congelado o en Stand-By para futuras fases (Roadmap v2.0)*
