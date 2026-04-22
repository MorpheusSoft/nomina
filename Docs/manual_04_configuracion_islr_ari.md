# Manual Normativo y Operativo: Configuración del ISLR / AR-I

Para Nebula Payrolls, el **Impuesto Sobre La Renta (ISLR)** opera fuera del tradicional concepto de fórmulas automáticas, debido a que su cobro es un tributo fluctuante exigido por la ley que requiere intervención mensual o trimestral.

## 1. El Pilar del ISLR: La Unidad Tributaria (U.T.)
El porcentaje gravable del trabajador depende íntimamente del valor decretado por la Gaceta Oficial de la U.T. Si esto no está configurado, el motor detendrá el cálculo del impuesto garantizando que a nadie se le cobre falsos montos.

1. Navegue a **Sistema > Variables Globales**.
2. Verifique la existencia de la variable reservada de código `VALOR_UT`.
3. Ingrese el costo actual de la Unidad Tributaria (ej. *9.00*). Modificarla aquí impactará en cadena los porcentajes de todos los AR-I instantáneamente.

## 2. Completando la Planilla AR-I (Formulario Inicial)
Los trabajadores deben completar la Forma AR-I al inicio del año (Enero). Tienen dos vías:
- **Vía Portal:** El trabajador se conecta al módulo de autoservicio desde su casa y llena su ingreso estimado y desgravámenes sin utilizar tiempo del personal de Recursos Humanos.
- **Vía RRHH:** Usted localiza al trabajador en la ruta **RRHH > Retenciones ISLR** y completa manualmente el formulario en presencia del empleado.

## 3. Validador Automático del Piso Salarial 
El sistema es inteligente. Cuando el trabajador intente enviar la primera planilla, el motor analizará y cruzará su "Ingreso Estimado" aportado, contra el historial formal de **Sueldo Base, Utilidades Estipuladas Contractuales y Bonos Vacacionales** que usted parametrizó en `Empleado -> Cargo y Grupo Contable`.

Si el trabajador es engañoso e intenta declarar un "Ingreso Estimado Anual" inferir a lo mínimo garantizado que ganará según la ley durante el año en la compañía, el sistema **rechazará la planilla AR-I automáticamente** marcándola de Inválida. 

## 4. Retención De Oficio (Carga Mágica de Enero)
Si finalizó el mes estipulado por el SENIAT y sus empleados ignoraron el completado del AR-I, el sistema acatará el artículo 5 de las regulaciones.

1. Ingrese a **RRHH > Retenciones ISLR**.
2. Presione **Generar "De Oficio"**.
3. El sistema buscará a todos los trabajadores rebeldes o lentos que no llenaron la planilla, proyectará sus salarios al suelo base general, y obligará matemáticamente un Desgravamen "ÚNICO", negándoles las rebajas por Familia. Les inyectará una tarifa de porcentaje punitiva de forma automática blindando a la empresa contra fiscalizaciones.

## 5. Variaciones Trimestrales (Cambios de Sueldo)
Si la compañía decide darle un ascenso o aumento de nómina considerable a "Juan" en Abril... el Ingreso Estimado de Juan en el AR-I que llenó en Enero será erróneo. 
La ley obliga a que actualice el formato. Esto se llama **Variación AR-I**.
1. En Marzo, Junio, Septiembre o Diciembre, debe enviar una actualización del formulario.
2. Nebula interceptará que se trata de un nuevo trimestre y ajustará legalmente el Porcentaje de este empleado restando el dinero que usted ya le haya extraído del bolsillo los meses anteriores.
