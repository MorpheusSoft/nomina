# Arquitectura de Seguridad y Auditoría del Oráculo Analítico (Nebula)

El asistente de Inteligencia Artificial de Nebula (Oráculo) cuenta con un aislamiento criptográfico y estructural de **Tres Capas** para garantizar que la generación de código y lectura de datos se ejecuten manteniendo estricto cumplimiento corporativo.

---

## Capa 1: Restricción de Extremos (Access Control)
El Frontend y el Backend rechazarán las solicitudes antes de conectarse a los servidores del LLM (Large Language Model) si el agente o la empresa no cumplen las condiciones de acceso corporativo.

1.  **Exclusión Maestra de la Empresa (Tenant):** Indistintamente de los permisos del usuario final que intente hacer la consulta, si el Perfil Global de la Empresa tiene el servicio apagado en su licencia (`hasOracleAccess: false`), la consulta será interceptada instantáneamente arrojando una `ForbiddenException`.
2.  **Permisología Restringida:** Únicamente los usuarios que posean dentro de sus cuentas los permisos administrativos `ALL_ACCESS` o el permiso específico `USE_ORACLE` pueden entablar diálogos. Un oficinista estándar no podrá ni ver ni interactuar con el módulo.

---

## Capa 2: Aislamiento Estructural de la Memoria y Código
Todo el diálogo ocurre bajo un "Diccionario de Datos Blanco", y protege rigurosamente la propiedad intelectual de MopheusSoft, previniendo fuga de esquemas (`DLP`).

1.  **Revocación de Catálogos (PostgreSQL):** El Rol de base de datos intermedio que la IA utiliza para conectarse de manera local y ejecutar sus algoritmos (`oracle_readonly`) fue revocado deliberadamente del privilegio estándar de lectura a los esquemas maestros del sistema (`information_schema` y `pg_catalog`). Resultando en que ni con instrucciones precisas de ingeniería la IA podría listar, descubrir ni revelar nombres reales de metadatos o código fuente arquitectónico.
2.  **Barreras de Inyección Limitadas a SELECT:** El Rol intermedio no posee permisos de Inserción, Modificación o Borrado. Todas las proyecciones estadísticas ocurren pre-limitadas a operaciones puras de Extracción.
3.  **Filtrado por Instrucciones del Sistema (Prompt Validation):** Se condiciona la personalidad sintética del Oráculo para rechazar interrogatorios sobre algoritmos y estructuras con la declarativa: *"Alerta de Seguridad: No estoy autorizado para divulgar información de arquitectura"*.

---

## Capa 3: Privacidad Contextual Dinámica RLS (Row Level Security)
En lugar de depender exclusivamente de comandos del Backend, la Base de Datos subyacente implementa **Políticas de Aislamiento a Nivel de Fila** (`RLS`) que manipulan la existencia misma de la información previo al momento de cálculo de la IA.

1.  **Aislamiento Obligatorio por Contrato (Tenant Isolation):** En toda ejecución empírica de operaciones, el oráculo emite el comando temporal `SET LOCAL app.current_tenant_id`. Las políticas en PostgreSQL aseguran bajo contrato estricto que toda respuesta solo involucre registros donde el `tenant_id` coincida con la sesión de origen. Una organización no puede extraer analíticas cruzadas de otra.
2.  **Confidencialidad Dinámica Activa (El Silenciador):** Aquellos trabajadores marcados bajo perfil estratégico / nómina mayor (`is_confidential: true` en su Contrato), son censurados de ser analizados si el usuario humano solicitante NO posee autorización nativa de revisarlos.
    *   **Mecanismo:** El Gateway verifica si el humano tiene el rol especial `VIEW_CONFIDENTIAL`. Si esto falla, emite temporalmente a la Base de Datos la directriz `app.has_confidential = false`.
    *   **Resultado Operativo:** La política de Base de datos hace desaparecer criptográficamente cualquier dato relativo a este personal ejecutivo de todas las agregaciones de los tabuladores, forzando a la Inteligencia Artificial a calcular "Sueldos más Altos" o "Asistencias Reales" como si este personal ejecutivo no existiera en absoluto dentro de la nómina regular. No distorsionan los promedios ni conteos estándar.
