# Manual de Conceptos y Motor Contable

Nebula Payrolls procesa todo a través de un "Motor de Fórmulas". Para que a un trabajador se le abone un monto o se le deduzca un préstamo, el sistema necesita comprender matemáticamente por qué lo hace empleando *Conceptos de Nómina*.

## ¿Qué es un Concepto?
Es un cajón que define de qué se trata el movimiento de dinero (Ej: *Sueldo Quincenal*, *Bono de Alimentación*, *Seguro Social*). Todo recibo de nómina es una suma matemática de conceptos. 

### Pasos para crear un Nuevo Concepto
1. Vaya a **Gestión de Fórmulas > Conceptos**.
2. Presione el botón **Nuevo Concepto**.
3. Elija la **Naturaleza del Concepto**:
   - **Asignación (Ganancia):** Suma dinero al neto del empleado.
   - **Deducción (Descuento):** Resta dinero al neto del empleado.
   - **Aporte Patronal:** No afecta el recibo visible, pero calcula cuánto debe pagar la empresa al estado.
   - **Provisión:** Reserva presupuestaria empresarial (como Antigüedad o Vacaciones a largo plazo).
4. **Impacto Financiero:** Seleccione si el dinero que se está pagando afecta e incide de forma directa sobre el cálculo legal de vacaciones o liquidaciones (Salarial vs No-Salarial).
5. Defina el método evaluador: **Automático** (El motor aplicará una fórmula en cada trabajador cada semana) o **Manual** (Se inyecta temporalmente a mano como una novedad mensual, ej. *Bono por buen desempeño puntual*).

## Modificando Fórmulas Matemáticas
Dentro de un Concepto Automático, verá una sección llamada "Expresión" o "Código".

- Puede mezclar allí Variables Globales (ej. Salario Mínimo o Valor de U.T.) y utilizar operaciones básicas `+ - * /`.
- **Condicionalidad:** Opcionalmente puede incluir requisitos. Ejemplo: El concepto "Bono de Nocturnidad" solo aplicará si el turno del empleado es igual a "Mixto o Nocturno". Si alguien con turno Diurno pasa por el motor, simplemente se salta el concepto evitando que cobre de más.

## Variables Globales
Si usted paga un bono ligado al equivalente en dólares, no debe actualizar dicho bono trabajador por trabajador.
1. Vaya a **Sistema > Variables Globales**.
2. Abra la variable `CAMBIO_BCV`.
3. Actualice su monto y asigne una Fecha de Utilidad.
4. Cualquier concepto que utilice la etiqueta o ID de esa variable (ej. `SALARIO * [CAMBIO_BCV]`), arrastrará automáticamente el último valor de cambio para las nóminas nuevas generadas de ese día en adelante.
