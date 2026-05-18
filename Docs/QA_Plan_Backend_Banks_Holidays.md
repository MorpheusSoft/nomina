# Plan de Aseguramiento de Calidad (QA) - Feriados, Bancos y TXT

Este documento detalla los escenarios de prueba funcionales y técnicos para validar las nuevas implementaciones en el Backend del sistema Nebula Payrolls.

## 1. Módulo de Catálogo de Bancos (`/banks`)

**Objetivo:** Validar la creación, lectura y eliminación de bancos a nivel de Tenant.

| ID Prueba | Descripción | Datos de Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **QA-BNK-01** | Crear Banco | POST `/banks` <br> `{"name": "Banesco", "code": "0134"}` | Código 201. El banco se crea y asocia al `tenantId` del usuario autenticado. |
| **QA-BNK-02** | Listar Bancos | GET `/banks` | Código 200. Retorna lista de bancos ordenados alfabéticamente. |
| **QA-BNK-03** | Eliminar Banco | DELETE `/banks/:id` | Código 200. El banco es eliminado. |
| **QA-BNK-04** | Eliminación Inválida | DELETE `/banks/:id` (ID que no pertenece al tenant) | Código 404. "Banco no encontrado". |

---

## 2. Módulo de Cuentas Bancarias de Empresa (`/company-bank-accounts`)

**Objetivo:** Validar la gestión de cuentas emisoras de la empresa.

| ID Prueba | Descripción | Datos de Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **QA-CBA-01** | Crear Cuenta Empresa | POST `/company-bank-accounts` <br> `{"bankId": "<uuid>", "accountNumber": "0134...", "accountType": "CORRIENTE"}` | Código 201. Retorna la cuenta creada incluyendo el objeto `bank`. |
| **QA-CBA-02** | Editar Cuenta Empresa | PUT `/company-bank-accounts/:id` <br> `{"isActive": false}` | Código 200. La cuenta se inactiva correctamente. |

---

## 3. Feriados Regionales (`/holidays`)

**Objetivo:** Validar que los feriados pueden relacionarse de manera excluyente a múltiples Centros de Costo.

| ID Prueba | Descripción | Datos de Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **QA-HOL-01** | Crear Feriado Nacional | POST `/holidays` <br> `{"name": "Día Feriado", "date": "...", "costCenterIds": []}` | Se crea el feriado. `costCenterHolidays` queda vacío (aplica a todos). |
| **QA-HOL-02** | Crear Feriado Regional | POST `/holidays` <br> `{"name": "Día Regional", "date": "...", "costCenterIds": ["<id1>", "<id2>"]}` | Se crea el feriado. En base de datos se generan 2 registros en la tabla pivote `cost_center_holidays`. |
| **QA-HOL-03** | Actualizar Feriado | PUT `/holidays/:id` <br> Cambiar lista de `costCenterIds`. | El backend borra las relaciones anteriores y recrea las nuevas (o deja vacío si se envió array vacío). |

---

## 4. Plantillas Bancarias y Generador TXT

**Objetivo:** Validar la definición de JSONs y la restricción de generación de TXT de nómina.

### 4.1 CRUD de Plantillas (`/bank-file-templates`)
| ID Prueba | Descripción | Datos de Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **QA-TPL-01** | Crear Plantilla TXT | POST `/bank-file-templates` <br> `{"bankId": "<uuid>", "name": "TXT Banesco", "configJson": {"detail": [{"field":"worker.identification", "length":10}]}}` | Se guarda exitosamente preservando la estructura JSON. |

### 4.2 Motor Generador (`/payroll-periods/:id/generate-txt`)
| ID Prueba | Descripción | Escenario Previo | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **QA-TXT-01** | Nómina No Cerrada | Período en estado `DRAFT` o `APPROVED`. Petición de generar TXT. | Código 400. "La nómina debe estar CERRADA para generar el archivo...". |
| **QA-TXT-02** | Primera Generación | Período `CLOSED`, `txtGeneratedAt` nulo. Petición POST. | Se genera el string TXT con las reglas posicionales. Se marca fecha de generación en el período. |
| **QA-TXT-03** | Regeneración (Rol Normal) | Período `CLOSED`, `txtGeneratedAt` NO nulo. Usuario sin rol ADMIN o APPROVER. | Código 400. "El archivo TXT ya fue generado...". |
| **QA-TXT-04** | Regeneración (Aprobador) | Igual al anterior, pero usuario autenticado es `APPROVER`. | Se regenera el string TXT exitosamente, actualizando el `txtGeneratedAt`. |
