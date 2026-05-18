# Arquitectura de Gestión de Normativa y Fallback para el Oráculo

## 1. Visión general
- Un **repositorio centralizado** para normativa nacional (LOTT, SSO, INCE, FAOVE, etc.).
- **Documentos por convenio** para reglas contractuales específicas.
- **Fallback a fuentes externas** (Google/Bing) solo cuando la normativa no está disponible en los PDFs.

## 2. Modelo de datos
| Tabla | Campos clave | Comentario |
|-------|--------------|------------|
| `regulations` | `id, name, scope (national|convention), country, version, effective_from, effective_to, file_path` | Almacena cada PDF una sola vez. |
| `tenant_regulations` | `tenant_id, regulation_id` | Relación many‑to‑many entre cliente y normativa. |
| `convention_regulations` | `convention_id, regulation_id` | Documentos asociados a un convenio de nómina. |
| `fallback_events` | `id, tenant_id, query, url, timestamp, note` | Registro de búsquedas externas para auditoría. |

## 3. Flujo de consulta
1. **Solicitud**: cliente envía `prompt` al endpoint `/api/v1/oracle/generate-concept`.
2. **Resolución de documentos**:
   - Se consultan `tenant_regulations` → se obtienen IDs de normativa nacional + de convenios asociados.
   - Se carga el contenido de los PDFs (truncado a ~130 kB) y se concatena en `ragContext`.
3. **Detección de ausencia**:
   - Si el modelo responde *"no encontramos regla"* o el texto de `ragContext` es insuficiente, se activa el fallback.
4. **Fallback externo**:
   - Se ejecuta una búsqueda controlada en Google Custom Search (whitelisted `.gov.ve`, `*.gob.ve`).
   - Se extrae el fragmento más relevante (máx 5 KB) y se añade al `ragContext`.
   - Se marca la respuesta con `note: "Formula generada a partir de fuentes externas; validar con normativa oficial"`.
5. **Generación de fórmula**:
   - El modelo devuelve JSON con `formulaFactor`, `formulaRate`, `formulaAmount` y la nota correspondiente.
6. **Auditoría**:
   - Cada uso del fallback se inserta en `fallback_events`.

## 4. Componentes técnicos
- **Backend**: NestJS (TypeScript).
  - Nuevo módulo `RegulationsModule` con endpoints CRUD y asociación a convenios.
  - Servicio `RegulationService` para obtener documentos relevantes.
  - Servicio `ExternalSearchService` que envuelve la API de Google/Bing.
- **Frontend**: Next.js.
  - UI de administración para subir PDFs y asignarlos a convenios.
  - Toggle `allowFallback` en la llamada al Oráculo.
- **Almacenamiento**: S3 o sistema de archivos (`/var/www/nebulapayrolls/storage/regulations/`).
- **Cache**: Redis para resultados de búsquedas externas (TTL 24 h).
- **Seguridad**: PDFs en bucket privado, acceso mediante URLs firmadas de corta duración.

## 5. Prioridad y roadmap (2 semanas)
| Sprint | Objetivo |
|--------|----------|
| **Sprint 1** (3 días) | Migraciones DB, endpoints admin para subir normativa nacional, UI básica. |
| **Sprint 2** (4 días) | Implementar `RegulationService.getRelevantDocs`, integración con `oracle.service.ts`. |
| **Sprint 3** (3 días) | Integrar búsqueda externa, cache, y campo `note` en la respuesta. |
| **Sprint 4** (2 días) | Pruebas E2E con varios tenants, documentación y monitoreo. |

## 6. Beneficios
- **Reducción de duplicación**: la LOTT se sube una sola vez y se reutiliza por todos los clientes.
- **Flexibilidad**: cada cliente puede añadir solo los documentos de convenio que le apliquen.
- **Cobertura**: el fallback garantiza que siempre se devuelva una fórmula (aunque sea estimada).
- **Auditoría y cumplimiento**: rastreo de cuándo y dónde se usaron fuentes externas.

## 7. Riesgos y mitigaciones
| Riesgo | Mitigación |
|--------|------------|
| Documentos desactualizados | Versionado + `effective_from`/`effective_to`. |
| Latencia por búsquedas externas | Cache de resultados, límite de 2 resultados, timeout < 10 s. |
| Información confidencial en PDFs | Almacén cifrado, URLs firmadas, acceso restringido a backend. |
| Conflictos entre normativa nacional y convenio | Prioridad: convenio > nacional, regla explícita en `systemPrompt`. |

---
**Próximos pasos**
1. Revisar este documento con el equipo legal y de producto.
2. Definir los metadatos obligatorios de cada regulación (nombre, área, versión).
3. Aprobar el roadmap y asignar recursos.
