# Manual Avanzado: Fórmulas Salariales (Powered by Math.js)

El Motor de Fórmulas y Conceptos de Nebula Payrolls utiliza la librería **Math.js** para evaluar las expresiones matemáticas dinámicas escritas por el analista. Este documento lista las funciones más comunes e indispensables para la construcción de fórmulas de nómina.

## 1. Operadores Matemáticos Básicos
La base de cualquier fórmula. Respetan la jerarquía de signos que conocemos universalmente (PEMDAS: Paréntesis, Exponentes, Multiplicación/División, Suma/Resta).

- **Suma (`+`)**: `base_salary + 250`
- **Resta (`-`)**: `base_salary - deduccion_prestamo`
- **Multiplicación (`*`)**: `base_salary * 0.12` (Calcula el 12%)
- **División (`/`)**: `base_salary / 30` (Calcula la rata diaria o salario diario)
- **Módulo o Resto (`%` o `mod(x, y)`)**: `mod(worked_days, 15)` (Obtiene el residuo al dividir los días trabajados entre 15).
- **Paréntesis (`()`)**: Usados para agrupar lógica. Ej: `(base_salary + bono) / 30`.

## 2. Redondeo y Aproximación
En contabilidad es vital saber manejar céntimos para evitar descuadres en matrices financieras (3-Way Matching, etc).

- **`round(x, n)`**: Redondea el valor `x` a `n` decimales de forma comercial (si es .5 sube, si es .4 baja).
  - *Ejemplo*: `round((base_salary / 30) * 1.5, 2)` -> Redondea el resultado a 2 decimales.
- **`ceil(x)` (Techo)**: Fuerza el número decimal al entero Inmediatamente SUPERIOR, ignorando las reglas comerciales.
  - *Ejemplo*: `ceil(14.1)` da como resultado `15`. Útil para redondear días o vacaciones hacia arriba.
- **`floor(x)` (Piso)**: Fuerza el número decimal al entero Inmediatamente INFERIOR.
  - *Ejemplo*: `floor(14.9)` da como resultado `14`. Útil para truncar edades o fraccionar cuotas sin exceso.

## 3. Funciones de Extremos (Evitar topes físicos)
Esquivan el uso excesivo de condicionales (If) y permiten estipular techos salariales o mínimos inmutables.

- **`max(x, y, ...)`**: Retorna el valor más alto de la lista.
  - *Ejemplo en Nómina*: `max(minimum_wage, base_salary)` -> Si el sueldo base cayó por debajo del salario mínimo legal, paga siempre el Legal Mínimo.
- **`min(x, y, ...)`**: Retorna el valor más bajo de la lista.
  - *Ejemplo en Nómina*: `min(lunes_en_mes, 4) * bono_lunes` -> Si la persona trabajó 5 lunes, el bono solo cubre un límite máximo de 4.

## 4. Estructuras Lógicas (Operador Ternario)
Permiten tomar decisiones algorítmicas sin recurrir a lenguajes de programación robustos. Su sintaxis es: `condicion ? valor_si_falso : valor_si_verdadero`.

- *Ejemplo de Antigüedad*: 
  `seniority_years > 3 ? (base_salary * 0.05) : 0`
  *Lectura: Si la antigüedad es mayor a 3 años, otórgale un 5% de bono extra, si no, dale 0 (nada).*

- *Ejemplo de Ausencias*:
  `unjustified_absences > 0 ? 0 : bono_puntualidad_fijo`
  *Lectura: Si las faltas injustificadas superan 0, pierde la totalidad del bono.*

## 5. Otras Funciones Matemáticas Comunes
- **`abs(x)` (Valor Absoluto)**: Convierte cualquier negativo en positivo. Ej: `abs(-150)` = `150`.
- **`sqrt(x)` (Raíz Cuadrada)**: Raramente usado en RRHH, pero soportado lógicamente.
- **`pow(x, y)`**: Potenciación $x^y$. Ej: `pow(1.05, seniority_years)` -> Para interés compuesto aplicable a prestaciones sociales.

---
*Fin del Documento Técnico.*
