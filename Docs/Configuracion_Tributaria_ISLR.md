# Guía de Configuración Obligatoria: Módulo Tributario (ISLR y AR-I)

Para garantizar que el motor de planillas AR-I y retenciones de Impuesto Sobre La Renta opere con estricto apego a las leyes fiscales (Reglamento ISLR y Decreto N° 1.808), es **obligatorio** que el Área de Recursos Humanos estructure las siguientes variables dentro del sistema *Nebula Payrolls*.

## 1. Variables Globales (Factores Macroeconómicos)

Estas variables afectan a **todos los trabajadores de la empresa** por igual. Dictan los parámetros de conversión oficial.

**Ruta en el Sistema:** `Menú Principal > Configuración > Variables Globales`

| Código de Variable | Nombre Sugerido | Descripción | Origen / Quién la define |
| :--- | :--- | :--- | :--- |
| **`VALOR_UT`** | Valor Unidad Tributaria | Monto en Bolívares de la Unidad Tributaria Actual. | SENIAT (Gaceta Oficial). |
| **`TASA_BCV`** | Tasa del Banco Central | Precio del Dólar oficial para converger nóminas dolarizadas (Si el empleado cobra en USD).| BCV (Se actualiza periódico). |

---

## 2. Variables de Grupo de Nómina (Factores de Contratación)

Estas variables deben configurarse específicamente por cada **tipo de contrato** o **convenio** colectivo, de manera que el sistema pueda proyectar con exactitud cuánto va a ganar esa persona a fin de año para su AR-I.

**Ruta en el Sistema:** `Menú Principal > Configuración > Grupos de Nómina (Seleccione un grupo) > Pestaña 'Variables'`

| Código de Variable | Nombre Sugerido | Descripción Estándar de Ley |
| :--- | :--- | :--- |
| **`DIAS_UTILIDADES`** | Días de Utilidades Anuales | Número de días que se pagan por concepto de aguinaldo. Mínimo legal en la LOTTT (Art. 131) = 30 días, aunque administrativamente puede llegar hasta 120 días. |
| **`DIAS_BONO_VACACIONAL`** | Días de Bono Vacacional | Días remunerados según el Art. 192 de la LOTTT. Comienza en 15 días + 1 por año de servicio, o lo que dicte su Contrato Colectivo. |

---

## 3. Prerrequisitos del Archivo del Trabajador (Ficha Personal)

### Sueldo Activo
Si un trabajador **no tiene sueldo** registrado, o su histórico salarial está desactualizado, el Asistente Tributario asumirá una base proyectada de *Cero (0 Bs.)*. 
*   **Inspección:** Navega a `Directorio > Perfil del Empleado > Contratos y Salarios > Histórico Salarial`. 
*   Asegúrate de que posean un **Sueldo Base Activo**. Si el sueldo fue registrado en Divisas (USD), el motor internamente buscará la `TASA_BCV` para traducir ese salario y declararlo en Bolívares.

### Carga Familiar
Para que las "Rebajas de Impuesto" (10 U.T. por familiar) se apliquen legalmente, los familiares ascendientes y descendientes (hijos menores o incapacitados) deben estar debidamente consolidados en la base de datos de RRHH en su Ficha de Empleado (Pestaña Carga Familiar).

> *Desarrollado y mantenido por Equipo Nebula ERP*
